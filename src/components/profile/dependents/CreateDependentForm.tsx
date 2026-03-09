"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "../../ui/Button"
import { Input } from "../../ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/Select"
import { X, Loader2 } from "lucide-react"
import { IDependent, IPassengerType, CreateDependentDto } from "@/models"
import BirthDatePicker from "../../ui/BirthDatePicker"
import { parseISO, isValid, differenceInYears } from "date-fns"
import Combobox from "../../ui/Combobox"
import CountryCodeSelector, { CountryData } from "../../ui/CountryCodeSelector"
import { defaultCountries, parseCountry } from "react-international-phone"
import NationalitySelector from "../../ui/NationalitySelector"
import { Checkbox } from "../../ui/Checkbox"
import { useAuth } from "@/contexts/AuthContexts"
import { createDependents, updateDependent } from "@/services"
import { getPassengerTypes } from "@/services/user/passenger-type.service"

interface DependentFormProps {
    userId: string;
    dependent?: IDependent;
    onSuccess: (dependent: IDependent) => void;
    onCancel: () => void;
    isEditing?: boolean;
}

const relationshipOptions = [
    "Spouse",
    "Son",
    "Daughter",
    "Mother",
    "Father",
    "Sibling",
    "Grandparent",
    "Grandchild",
    "Relative",
    "Other"
];


export default function DependentForm({ 
    userId,
    dependent, 
    onSuccess, 
    onCancel, 
    isEditing = false
}: DependentFormProps) {
    const { loggedInAccount } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [useAccountContact, setUseAccountContact] = useState(false);
    const [passengerTypes, setPassengerTypes] = useState<IPassengerType[]>([]);

    useEffect(() => {
        getPassengerTypes().then(types => {
            if (types) {
                setPassengerTypes(types);
                // Also trigger auto-detection if birthday exists
                if (formData.birthday) {
                    autoSelectByBirthday(formData.birthday, types);
                }
            }
        });
    }, []);
    
    const [formData, setFormData] = useState<CreateDependentDto>({
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix_name: "",
        birthday: "",
        sex: "Female",
        relationship: "Relative",
        nationality: "Filipino",
        address: "",
        phone: "",
        email: "",
        category: "",
        passenger_code: "",
    });

    const ph = defaultCountries.find(c => parseCountry(c).iso2 === 'ph') || defaultCountries[0];
    const defaultCountry = parseCountry(ph);

    const [selectedRelationship, setSelectedRelationship] = useState("Relative");
    const [customRelationship, setCustomRelationship] = useState("");
    const [countryCode, setCountryCode] = useState(defaultCountry.iso2);
    const [phoneDigits, setPhoneDigits] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [initialState, setInitialState] = useState<any>(null);

    useEffect(() => {
        if (dependent) {
            // 1. Prepare all values first
            const rawCategory = (dependent.category || "").toString().trim();
            // Match by name (case-insensitive), fall back to raw value
            const matchedType = passengerTypes.find(t => t.name.toLowerCase() === rawCategory.toLowerCase());
            const validCategory = matchedType ? matchedType.name : (passengerTypes[0]?.name || rawCategory);

            const rawRel = (dependent.relationship || "Son").toString().trim();
            const foundRel = relationshipOptions.find(opt => opt.toLowerCase() === rawRel.toLowerCase());
            
            let initialRel = "";
            let initialCustomRel = "";
            if (foundRel && foundRel !== "Other") {
                initialRel = foundRel;
            } else {
                initialRel = "Other";
                initialCustomRel = rawRel;
            }

            const data: CreateDependentDto = {
                first_name: dependent.first_name || "",
                middle_name: dependent.middle_name || "",
                last_name: dependent.last_name || "",
                suffix_name: dependent.suffix_name || "",
                birthday: dependent.birthday ? dependent.birthday.split('T')[0] : "",
                sex: dependent.sex || "Female",
                relationship: initialRel === "Other" ? initialCustomRel : initialRel,
                nationality: dependent.nationality || "Filipino",
                address: dependent.address || "",
                phone: dependent.phone || "",
                email: dependent.email || "",
                category: validCategory,
                passenger_code: matchedType?.code || ""
            };

            // If no matched category but we HAVE a birthday, try auto-suggesting
            if (!matchedType && data.birthday && passengerTypes.length) {
                const age = differenceInYears(new Date(), parseISO(data.birthday));
                const ageRelatedTypes = passengerTypes.filter(t => t.age_min !== null || (t.age_max !== null && t.age_max < 999));
                const autoMatch = ageRelatedTypes.find(t => {
                    const minOk = t.age_min === null || age >= t.age_min;
                    const maxOk = t.age_max === null || t.age_max >= 999 || age <= t.age_max;
                    return minOk && maxOk;
                });
                if (autoMatch) {
                    data.category = autoMatch.name;
                    data.passenger_code = autoMatch.code;
                }
            }

            if (dependent.phone) {
                const match = defaultCountries.find(c => {
                    const parsed = parseCountry(c);
                    const dialCode = parsed.dialCode;
                    return dependent.phone?.startsWith(dialCode) || dependent.phone?.startsWith('+' + dialCode);
                });
                if (match) {
                    const parsed = parseCountry(match);
                    const dialCode = parsed.dialCode;
                    setCountryCode(parsed.iso2);
                    const digits = dependent.phone.startsWith('+')
                        ? dependent.phone.slice(dialCode.length + 1).replace(/\D/g, '')
                        : dependent.phone.slice(dialCode.length).replace(/\D/g, '');
                    setPhoneDigits(digits);
                } else {
                    setCountryCode(defaultCountry.iso2);
                    setPhoneDigits(dependent.phone.replace(/\D/g, ''));
                }
            } else {
                setCountryCode(defaultCountry.iso2);
                setPhoneDigits("");
            }

            // 2. Apply all updates together
            setSelectedRelationship(initialRel);
            setCustomRelationship(initialCustomRel);
            setFormData(data);
            setInitialState({
                formData: { ...data },
                selectedRelationship: initialRel,
                customRelationship: initialCustomRel
            });
        }
    }, [dependent, passengerTypes.length]);

    const handleChange = (field: keyof CreateDependentDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhoneChange = (value: string) => {
        const match = defaultCountries.find(c => parseCountry(c).iso2 === countryCode) || defaultCountries[0];
        const parsed = parseCountry(match);
        const formatStr = typeof parsed.format === 'string' ? parsed.format : '';
        const dotMatches = formatStr.match(/\./g);
        const maxLength = dotMatches ? dotMatches.length : 10;
        
        const digitsOnly = value.replace(/\D/g, '').slice(0, maxLength);
        setPhoneDigits(digitsOnly);
        setFormData(prev => ({ ...prev, phone: '+' + parsed.dialCode + digitsOnly }));
    };

    const handleAccountContactToggle = (checked: boolean) => {
        setUseAccountContact(checked);
        if (checked && loggedInAccount) {
            const passenger = loggedInAccount.passenger;
            const updatedPhone = passenger?.phone || "";
            
            // Sync phone digits and country code
            if (updatedPhone) {
                const match = defaultCountries.find(c => {
                    const parsed = parseCountry(c);
                    const dialCode = parsed.dialCode;
                    return updatedPhone.startsWith(dialCode) || updatedPhone.startsWith('+' + dialCode);
                });
                if (match) {
                    const parsed = parseCountry(match);
                    const dialCode = parsed.dialCode;
                    setCountryCode(parsed.iso2);
                    const digits = updatedPhone.startsWith('+')
                        ? updatedPhone.slice(dialCode.length + 1).replace(/\D/g, '')
                        : updatedPhone.slice(dialCode.length).replace(/\D/g, '');
                    setPhoneDigits(digits);
                } else {
                    setCountryCode(defaultCountry.iso2);
                    setPhoneDigits(updatedPhone.replace(/\D/g, ''));
                }
            } else {
                setCountryCode(defaultCountry.iso2);
                setPhoneDigits("");
            }

            setFormData(prev => ({
                ...prev,
                address: passenger?.address || prev.address,
                phone: updatedPhone || prev.phone,
                email: loggedInAccount.email || prev.email,
            }));
        }
    };

    const handleRelationshipChange = (value: string) => {
        setSelectedRelationship(value);
        if (value !== "Other") {
            handleChange("relationship", value);
            setCustomRelationship("");
        } else {
            handleChange("relationship", customRelationship);
        }
    };

    const handleCustomRelationshipChange = (value: string) => {
        setCustomRelationship(value);
        handleChange("relationship", value);
    };

    const autoSelectByBirthday = (birthdayIso: string, typesOverride?: IPassengerType[]) => {
        const typesToUse = typesOverride || passengerTypes;
        if (!typesToUse.length || !birthdayIso) return;
        
        const age = differenceInYears(new Date(), parseISO(birthdayIso));
        
        // Filter for types that actually have age limits defined
        const ageRelatedTypes = typesToUse.filter(t => t.age_min !== null || (t.age_max !== null && t.age_max < 999));
        
        const match = ageRelatedTypes.find(t => {
            const minOk = t.age_min === null || age >= t.age_min;
            const maxOk = t.age_max === null || t.age_max >= 999 || age <= t.age_max;
            return minOk && maxOk;
        });

        if (match) {
            setFormData(prev => ({ ...prev, category: match.name, passenger_code: match.code }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.phone) {
            const match = defaultCountries.find(c => parseCountry(c).iso2 === countryCode) || defaultCountries[0];
            const parsed = parseCountry(match);
            const formatStr = typeof parsed.format === 'string' ? parsed.format : '';
            const dotMatches = formatStr.match(/\./g);
            const maxLength = dotMatches ? dotMatches.length : 10;

            if (phoneDigits.length < maxLength) {
                setError(`Phone number must be ${maxLength} digits.`);
                return;
            }
        }

        const finalForm = {
            ...formData,
            passenger_code: passengerTypes.find(t => t.name === formData.category)?.code || ""
        }

        // Age range validation against selected passenger type
        if (formData.category && formData.birthday) {
            const selected = passengerTypes.find(t => t.name === formData.category);
            if (selected) {
                const age = differenceInYears(new Date(), parseISO(formData.birthday));
                if (selected.age_min !== null && age < selected.age_min) {
                    setError(`Age (${age}) is below the minimum of ${selected.age_min} for the "${selected.name}" category.`);
                    return;
                }
                if (selected.age_max !== null && age > selected.age_max) {
                    setError(`Age (${age}) exceeds the maximum of ${selected.age_max} for the "${selected.name}" category.`);
                    return;
                }
            }
        }

        setIsSubmitting(true);
        try {
            if (isEditing && dependent) {
                const updated = await updateDependent(dependent.id, finalForm);
                if (updated) onSuccess(updated);
            } else {
                const created = await createDependents(userId, [finalForm]);
                if (created && created.length > 0) onSuccess(created[0]);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to save dependent.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const validationChecks = {
        first_name: Boolean(formData.first_name?.trim()),
        middle_name: true, // Optional
        last_name: Boolean(formData.last_name?.trim()),
        suffix_name: true, // Optional
        birthday: Boolean(formData.birthday),
        sex: Boolean(formData.sex),
        relationship: Boolean(selectedRelationship === "Other" ? customRelationship?.trim() : selectedRelationship),
        nationality: Boolean(formData.nationality),
        address: Boolean(formData.address?.trim()),
        phone: Boolean(formData.phone),
        category: Boolean(formData.category),
    };
    
    const isFormValid = Object.values(validationChecks).every(check => check === true);
    
    const isDirty = !isEditing || !initialState || JSON.stringify({
        formData,
        selectedRelationship,
        customRelationship
    }) !== JSON.stringify(initialState);
    

    return (
        <div className="bg-white relative">
            {isSubmitting && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 rounded-xl">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm font-medium text-slate-600">
                            {isEditing ? 'Updating dependent...' : 'Saving dependent...'}
                        </span>
                    </div>
                </div>
            )}
            <div className="p-6 py-3 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">{isEditing ? "Edit Dependent" : "Add Dependent"}</h2>
                    <p className="text-sm text-slate-500 mt-1">{isEditing ? "Update the info." : "Add a companion."}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onCancel} disabled={isSubmitting} className="h-10 w-10 !text-black"><X className="h-6 w-6" /></Button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-2">
                {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">First Name *</label>
                        <Input value={formData.first_name} onChange={(e) => handleChange("first_name", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Middle Name</label>
                        <Input value={formData.middle_name} onChange={(e) => handleChange("middle_name", e.target.value)} placeholder="Optional" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Last Name *</label>
                        <Input value={formData.last_name} onChange={(e) => handleChange("last_name", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">suffixName</label>
                        <Input value={formData.suffix_name} onChange={(e) => handleChange("suffix_name", e.target.value)} placeholder="Jr., Sr., etc. (Optional)" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Birth Date *</label>
                        <BirthDatePicker
                            date={formData.birthday ? parseISO(formData.birthday) : undefined}
                            setDate={(dateAction) => {
                                    const current = formData.birthday ? parseISO(formData.birthday) : undefined;
                                    const newDate = typeof dateAction === 'function' ? dateAction(current) : dateAction;
                                    if (newDate && isValid(newDate)) {
                                        const iso = newDate.toISOString();
                                        handleChange('birthday', iso);
                                        autoSelectByBirthday(iso);
                                    }
                                }}
                            validationErrors={{}}
                            allowMinors={true}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sex *</label>
                        <Select 
                            value={formData.sex} 
                            onValueChange={(v) => {
                                if (!v) return;
                                handleChange("sex", v);
                            }}
                        >
                            <SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nationality *</label>
                        <NationalitySelector
                            value={formData.nationality}
                            onChange={(v) => handleChange("nationality", v)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Relationship *</label>
                        <div className="flex gap-3">
                            <Select 
                                value={selectedRelationship} 
                                onValueChange={(v) => {
                                    if (!v) return;
                                    handleRelationshipChange(v);
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                                <SelectContent>
                                    {relationshipOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {selectedRelationship === "Other" && (
                                <Input placeholder="Specify..." value={customRelationship} onChange={(e) => handleCustomRelationshipChange(e.target.value)} className="w-full" required />
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category *</label>
                        <Select 
                            value={formData.category} 
                            onValueChange={(v) => {
                                if (!v) return;
                                handleChange("category", v);
                            }}
                        >
                            <SelectTrigger><SelectValue placeholder={passengerTypes.length === 0 ? 'Loading...' : 'Select type'} /></SelectTrigger>
                            <SelectContent>
                                {passengerTypes.map(t => {
                                    const noMax = t.age_max === null || t.age_max >= 999;
                                    const hint = t.age_min !== null && noMax
                                        ? `${t.age_min}+ yrs`
                                        : t.age_min !== null && t.age_max !== null
                                            ? `${t.age_min}–${t.age_max} yrs`
                                            : null;
                                    return (
                                        <SelectItem key={t.id} value={t.name}>
                                            {t.name}
                                            {hint && <span className="text-xs text-slate-400 ml-1">({hint})</span>}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="use-account-contact" checked={useAccountContact} onCheckedChange={handleAccountContactToggle} />
                        <label htmlFor="use-account-contact" className="text-sm font-medium">Same as my account contact info</label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number *</label>
                        <div className="flex gap-2">
                            <CountryCodeSelector 
                                value={countryCode} 
                                onChange={(country: CountryData) => {
                                    setCountryCode(country.iso2);
                                    const truncated = phoneDigits.slice(0, country.maxLength);
                                    setPhoneDigits(truncated);
                                    setFormData(prev => ({ ...prev, phone: '+' + country.dialCode + truncated }));
                                }}
                                className="w-[100px]"
                            />
                            <Input 
                                value={phoneDigits} 
                                onChange={(e) => handlePhoneChange(e.target.value)} 
                                placeholder={
                                    (() => {
                                        const match = defaultCountries.find(c => parseCountry(c).iso2 === countryCode) || defaultCountries[0];
                                        const parsed = parseCountry(match);
                                        const formatStr = typeof parsed.format === 'string' ? parsed.format : '';
                                        return formatStr.replace(/\./g, "0").replace(/\\/g, "") || "Phone Number";
                                    })()
                                }
                                type="tel"
                                required 
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email (optional)</label>
                        <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Address *</label>
                    <Input value={formData.address} onChange={(e) => handleChange("address", e.target.value)} required />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                    <Button type="submit" disabled={!isFormValid || (isEditing && !isDirty) || isSubmitting}>
                        {isSubmitting
                            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isEditing ? 'Updating...' : 'Saving...'}</>
                            : (isEditing ? 'Update Dependent' : 'Save Dependent')
                        }
                    </Button>
                </div>
            </form>
        </div>
    );
}
