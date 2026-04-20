"use client"

import { useState, useEffect, useMemo } from "react"
import { parseISO, isValid, differenceInYears } from "date-fns"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import BirthDatePicker from "@/components/ui/BirthDatePicker"
import CountryCodeSelector, { CountryData } from "@/components/ui/CountryCodeSelector"
import NationalitySelector from "@/components/ui/NationalitySelector"
import { defaultCountries, parseCountry } from "react-international-phone"
import { IPassenger, IPassengerType } from "@/models"
import { updatePassenger } from "@/services"
import { getPassengerTypes } from "@/services/user/passenger-type.service"
import { useAuth } from "@/contexts/AuthContexts"
import { SuccessModal } from "@/components/ui/SuccessModal"
import { Loader2 } from "lucide-react"


interface PersonalDetailsFormProps {
    passenger?: IPassenger;
    email?: string;
    onUpdate: (updatedPassenger: IPassenger) => void;
}

export default function PersonalDetailsForm({ passenger, email, onUpdate }: PersonalDetailsFormProps) {
    const { refreshProfile, currentUser } = useAuth();
    const isHayahaiLinked = currentUser?.providers?.includes('hayahai');
    const [isSaving, setIsSaving] = useState(false);
    const ph = defaultCountries.find(c => parseCountry(c).iso2 === 'ph') || defaultCountries[0];
    const defaultCountry = parseCountry(ph);

    const [formData, setFormData] = useState<Partial<IPassenger>>(passenger || {});
    const [countryCode, setCountryCode] = useState(defaultCountry.iso2);
    const [phoneDigits, setPhoneDigits] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [passengerTypes, setPassengerTypes] = useState<IPassengerType[]>([]);

    useEffect(() => {
        if (passenger && passenger.phone) {
            const match = defaultCountries.find(c => {
                const parsed = parseCountry(c);
                const dialCode = parsed.dialCode;
                return passenger.phone?.startsWith(dialCode) || passenger.phone?.startsWith('+' + dialCode);
            });
            if (match) {
                const parsed = parseCountry(match);
                const dialCode = parsed.dialCode;
                setCountryCode(parsed.iso2);
                const digits = passenger.phone.startsWith('+') 
                    ? passenger.phone.slice(dialCode.length + 1).replace(/\D/g, '')
                    : passenger.phone.slice(dialCode.length).replace(/\D/g, '');
                setPhoneDigits(digits);
            } else {
                setCountryCode(defaultCountry.iso2);
                setPhoneDigits(passenger.phone.replace(/\D/g, ''));
            }
            setFormData(passenger);
        } else if (passenger) {
            setFormData(passenger);
            setCountryCode(defaultCountry.iso2);
            setPhoneDigits("");
        }
    }, [passenger, defaultCountry.iso2]);

    useEffect(() => {
        getPassengerTypes().then(types => {
            if (types) {
                // Deduplicate by name to ensure unique values in the Select dropdown
                const uniqueTypes = Array.from(
                    new Map(types.map(item => [item.name, item])).values()
                );
                setPassengerTypes(uniqueTypes);
            }
        });
    }, []);

    const isFormIncomplete = useMemo(() => {
        return !formData.firstName?.trim() || 
               !formData.lastName?.trim() ||
               !email?.trim() ||
               !formData.phone?.trim() ||
               !formData.sex ||
               !formData.birthdayIso ||
               !formData.nationality ||
               !formData.address?.trim();
    }, [formData, email]);

    const hasNoChanges = useMemo(() => {
        if (!passenger) return true;
        
        const fieldsToCompare: (keyof IPassenger)[] = [
            'firstName', 'middleName', 'lastName', 'suffixName', 'sex', 'birthdayIso', 
            'nationality', 'phone', 'address', 'passengerType', 'passengerCode'
        ];

        return fieldsToCompare.every(field => {
            const current = formData[field] || '';
            const initial = passenger[field] || '';
            return current === initial;
        });
    }, [formData, passenger]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePassengerTypeChange = (typeId: string) => {
        const selected = passengerTypes.find(t => String(t.id) === typeId);
        if (selected) {
            setFormData(prev => ({
                ...prev,
                passengerType: selected.name,
                passengerCode: selected.code,
            }));
        }
    };

    const autoSelectByBirthday = (birthdayIso: string) => {
        if (!passengerTypes.length || !birthdayIso) return;
        const age = differenceInYears(new Date(), parseISO(birthdayIso));
        const match = passengerTypes.find(t => {
            const minOk = t.age_min === null || age >= t.age_min;
            const maxOk = t.age_max === null || t.age_max >= 999 || age <= t.age_max;
            return minOk && maxOk;
        });
        if (match) {
            setFormData(prev => ({
                ...prev,
                passengerType: match.name,
                passengerCode: match.code,
            }));
        }
    };

    const handlePhoneChange = (value: string) => {
        const match = defaultCountries.find(c => parseCountry(c).iso2 === countryCode) || defaultCountries[0];
        const parsed = parseCountry(match);
        const formatStr = typeof parsed.format === 'string' ? parsed.format : '';
        const dotMatches = formatStr.match(/\./g);
        const maxLength = dotMatches ? dotMatches.length : 10;
        
        const digitsOnly = value.replace(/\D/g, '').slice(0, maxLength);
        setPhoneDigits(digitsOnly);
        setFormData(prev => ({
            ...prev,
            phone: '+' + parsed.dialCode + digitsOnly
        }));
    };

    const handleSave = async () => {
        if (!passenger) return;
        
        if (
            !formData.firstName?.trim() || 
            !formData.lastName?.trim() ||
            !formData.sex ||
            !formData.birthdayIso ||
            !formData.nationality ||
            !formData.address?.trim()
        ) {
            setError("All fields marked with an asterisk (*) are required.");
            return;
        }

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

        // Age range validation against selected passenger type
        if (formData.passengerType && formData.birthdayIso) {
            const selected = passengerTypes.find(t => t.name === formData.passengerType);
            if (selected) {
                const age = differenceInYears(new Date(), parseISO(formData.birthdayIso));
                if (selected.age_min !== null && age < selected.age_min) {
                    setError(`Your age (${age}) is below the minimum of ${selected.age_min} for the "${selected.name}" passenger type.`);
                    return;
                }
                if (selected.age_max !== null && age > selected.age_max) {
                    setError(`Your age (${age}) exceeds the maximum of ${selected.age_max} for the "${selected.name}" passenger type.`);
                    return;
                }
            }
        }

        setIsSaving(true);
        try {
            setError(null);
            const updatedPassenger = await updatePassenger(formData);
            if (updatedPassenger) {
                onUpdate(updatedPassenger);
                await refreshProfile(true);
                setShowSuccessModal(true);
            }
        } catch (err: any) {
            console.error('Failed to update personal details:', err);
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-none shadow-none bg-transparent relative">
            {isSaving && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 rounded-xl">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm font-medium text-slate-600">Saving changes...</span>
                    </div>
                </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-7">
                <div className="space-y-1">
                    <CardTitle>Personal Details</CardTitle>
                    <CardDescription>Manage your personal information and preferences.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                {isHayahaiLinked && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">Managed by Hayahai</span>
                        </div>
                        <p className="text-xs opacity-80">
                            Some personal details are synchronized from your Hayahai account and cannot be edited here. 
                            To update these, please visit the main Hayahai portal.
                        </p>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First Name <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.firstName || ''}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                disabled={isHayahaiLinked}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Middle Name</label>
                            <Input
                                value={formData.middleName || ''}
                                onChange={(e) => handleInputChange('middleName', e.target.value)}
                                placeholder="Optional"
                                disabled={isHayahaiLinked}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.lastName || ''}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                disabled={isHayahaiLinked}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">suffix</label>
                            <Input
                                value={formData.suffixName || ''}
                                onChange={(e) => handleInputChange('suffixName', e.target.value)}
                                placeholder="Jr., Sr., etc. (Optional)"
                                disabled={isHayahaiLinked}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
                            <Input
                                value={email || ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                type="email"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
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
                                    className="flex-1"
                                    type="tel"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sex <span className="text-red-500">*</span></label>
                            <span className="sr-only">Sex selection</span>
                            <Select
                                value={formData.sex || ''}
                                onValueChange={(value) => handleInputChange('sex', value)}
                                disabled={isHayahaiLinked}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select sex" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem> 
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></label>
                            <BirthDatePicker
                                date={formData.birthdayIso ? parseISO(formData.birthdayIso) : undefined}
                                setDate={(dateAction) => {
                                    const current = formData.birthdayIso ? parseISO(formData.birthdayIso) : undefined;
                                    const newDate = typeof dateAction === 'function' ? dateAction(current) : dateAction;
                                    if (newDate && isValid(newDate)) {
                                        const iso = newDate.toISOString();
                                        handleInputChange('birthdayIso', iso);
                                        autoSelectByBirthday(iso);
                                    }
                                }}
                                validationErrors={{}}
                                disabled={isHayahaiLinked}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nationality <span className="text-red-500">*</span></label>
                            <NationalitySelector
                                onChange={(value) => handleInputChange('nationality', value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Passenger Type</label>
                            <Select
                                value={passengerTypes.find(t => t.name === formData.passengerType) ? String(passengerTypes.find(t => t.name === formData.passengerType)!.id) : ''}
                                onValueChange={handlePassengerTypeChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={passengerTypes.length === 0 ? 'Loading...' : 'Select type'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {passengerTypes.map((t, index) => {
                                        const noMax = t.age_max === null || t.age_max >= 999;
                                        const hint = t.age_min !== null && noMax
                                            ? `${t.age_min}+ yrs`
                                            : t.age_min !== null && t.age_max !== null
                                                ? `${t.age_min}–${t.age_max} yrs`
                                                : null;
                                        return (
                                            <SelectItem key={`${t.id}-${index}`} value={String(t.id)}>
                                                {t.name}
                                                {hint && <span className="text-xs text-slate-400 ml-1">({hint})</span>}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium">Address <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.address || ''}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSaving || hasNoChanges || isFormIncomplete}>
                            {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </CardContent>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Profile Updated!"
                description="Your personal details have been updated successfully."
            />
        </Card>
    );
}
