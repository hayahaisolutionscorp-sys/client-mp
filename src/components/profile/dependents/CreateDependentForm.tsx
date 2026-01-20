"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../../ui/Button"
import { Input } from "../../ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/Select"
import { X, Loader2 } from "lucide-react"
import { IDependent, CreateDependentDto } from "@/models"
import BirthDatePicker from "../../ui/BirthDatePicker"
import { parseISO, isValid } from "date-fns"
import Combobox from "../../ui/Combobox"
import { NATIONALITIES } from "constants/default"
import { Checkbox } from "../../ui/Checkbox"
import { useAuth } from "@/contexts/AuthContexts"
import { createDependents, updateDependent } from "@/services"

interface DependentFormProps {
    userId: string;
    dependent?: IDependent;
    onSuccess: (dependent: IDependent) => void;
    onCancel: () => void;
    isEditing?: boolean;
}

const civilStatuses = ["Single", "Married", "Widowed", "Separated", "Divorced"];
const categoryOptions = ["Regular", "Student", "Senior", "PWD", "Infant", "Child"];
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
    const [isUnemployed, setIsUnemployed] = useState(false);
    
    const [formData, setFormData] = useState<CreateDependentDto>({
        first_name: "",
        last_name: "",
        birthday: "",
        sex: "Female",
        relationship: "Son",
        nationality: "Filipino",
        occupation: "",
        address: "",
        civil_status: "Single",
        phone: "",
        email: "",
        category: "Regular",
    });

    const [selectedRelationship, setSelectedRelationship] = useState("Son");
    const [customRelationship, setCustomRelationship] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [initialState, setInitialState] = useState<any>(null);

    useEffect(() => {
        if (dependent) {
            // 1. Prepare all values first
            const rawCivil = (dependent.civil_status || "Single").toString().trim().toLowerCase();
            const validCivilStatus = civilStatuses.find(s => s.toLowerCase() === rawCivil) || "Single";

            const rawCategory = (dependent.category || "Regular").toString().trim().toLowerCase();
            const validCategory = categoryOptions.find(c => c.toLowerCase() === rawCategory) || "Regular";

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
                last_name: dependent.last_name || "",
                birthday: dependent.birthday ? dependent.birthday.split('T')[0] : "",
                sex: dependent.sex || "Female",
                relationship: initialRel === "Other" ? initialCustomRel : initialRel,
                nationality: dependent.nationality || "Filipino",
                occupation: dependent.occupation || "",
                address: dependent.address || "",
                civil_status: validCivilStatus,
                phone: dependent.phone && dependent.phone.startsWith('+63')
                    ? dependent.phone
                    : dependent.phone
                        ? '+63' + dependent.phone.replace(/^\+63/, '').replace(/\D/g, '').slice(0, 10)
                        : '',
                email: dependent.email || "",
                category: validCategory,
            };

            // 2. Apply all updates together
            
            setIsUnemployed(dependent.occupation === "Unemployed");
            setSelectedRelationship(initialRel);
            setCustomRelationship(initialCustomRel);
            setFormData(data);
            setInitialState({
                formData: { ...data },
                selectedRelationship: initialRel,
                customRelationship: initialCustomRel
            });
        }
    }, [dependent]);

    const handleChange = (field: keyof CreateDependentDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhoneChange = (value: string) => {
        if (!value.startsWith('+63')) value = '+63';
        const digitsOnly = value.slice(3).replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, phone: '+63' + digitsOnly }));
    };

    const handleAccountContactToggle = (checked: boolean) => {
        setUseAccountContact(checked);
        if (checked && loggedInAccount) {
            setFormData(prev => ({
                ...prev,
                address: loggedInAccount.passenger?.address || prev.address,
                phone: loggedInAccount.passenger?.phone || prev.phone,
                email: loggedInAccount.email || prev.email,
            }));
        }
    };

    const handleUnemployedToggle = (checked: boolean) => {
        setIsUnemployed(checked);
        handleChange("occupation", checked ? "Unemployed" : "");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const phoneRegex = /^\+63\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError("Phone number must start with +63 and be 13 characters long.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && dependent) {
                const updated = await updateDependent(dependent.id, formData);
                if (updated) onSuccess(updated);
            } else {
                const created = await createDependents(userId, [formData]);
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
        last_name: Boolean(formData.last_name?.trim()),
        birthday: Boolean(formData.birthday),
        sex: Boolean(formData.sex),
        relationship: Boolean(selectedRelationship === "Other" ? customRelationship?.trim() : selectedRelationship),
        nationality: Boolean(formData.nationality),
        address: Boolean(formData.address?.trim()),
        civil_status: Boolean(formData.civil_status),
        phone: Boolean(formData.phone),
        category: Boolean(formData.category),
        occupation: Boolean(formData.occupation)
    };
    
    const isFormValid = Object.values(validationChecks).every(check => check === true);
    
    const isDirty = !isEditing || !initialState || JSON.stringify({
        formData,
        selectedRelationship,
        customRelationship
    }) !== JSON.stringify(initialState);
    

    return (
        <div className="bg-white">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">{isEditing ? "Edit Dependent" : "Add Dependent"}</h2>
                    <p className="text-sm text-slate-500 mt-1">{isEditing ? "Update the info." : "Add a traveler."}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onCancel} className="h-10 w-10 !text-black"><X className="h-6 w-6" /></Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">First Name *</label>
                        <Input value={formData.first_name} onChange={(e) => handleChange("first_name", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Last Name *</label>
                        <Input value={formData.last_name} onChange={(e) => handleChange("last_name", e.target.value)} required />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Birth Date *</label>
                        <BirthDatePicker
                            date={formData.birthday ? parseISO(formData.birthday) : undefined}
                            setDate={(val) => {
                                let newDate: Date | undefined;
                                if (typeof val === 'function') {
                                    const current = formData.birthday ? parseISO(formData.birthday) : undefined;
                                    newDate = (val as any)(current);
                                } else {
                                    newDate = val;
                                }
                                
                                if (newDate && isValid(newDate)) {
                                    handleChange("birthday", newDate.toISOString().split("T")[0]);
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Relationship *</label>
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
                            <Input placeholder="Specify..." value={customRelationship} onChange={(e) => handleCustomRelationshipChange(e.target.value)} className="mt-2" required />
                        )}
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
                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                                {categoryOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nationality *</label>
                        <Combobox values={NATIONALITIES} value={formData.nationality} onChange={(v) => handleChange("nationality", v)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Civil Status *</label>
                        <Select 
                            value={formData.civil_status} 
                            onValueChange={(v) => {
                                if (!v) return;
                                handleChange("civil_status", v);
                            }} 
                            required
                        >
                            <SelectTrigger><SelectValue placeholder="Select civil status" /></SelectTrigger>
                            <SelectContent>
                                {civilStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="use-account-contact" checked={useAccountContact} onCheckedChange={handleAccountContactToggle} />
                        <label htmlFor="use-account-contact" className="text-sm font-medium">Same as my account contact info</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="is-unemployed" checked={isUnemployed} onCheckedChange={handleUnemployedToggle} />
                        <label htmlFor="is-unemployed" className="text-sm font-medium">Dependent is currently unemployed</label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number *</label>
                        <Input value={formData.phone || '+63'} onChange={(e) => handlePhoneChange(e.target.value)} maxLength={13} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email (optional)</label>
                        <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Occupation *</label>
                    <Input value={formData.occupation} onChange={(e) => handleChange("occupation", e.target.value)} required disabled={isUnemployed} />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Address *</label>
                    <Input value={formData.address} onChange={(e) => handleChange("address", e.target.value)} required />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-4 py-2 border rounded hover:bg-slate-50">Cancel</button>
                    <Button type="submit" disabled={!isFormValid || (isEditing && !isDirty) || isSubmitting}>
                        {isSubmitting ? "Saving..." : (isEditing ? "Update Dependent" : "Save Dependent")}
                    </Button>
                </div>
            </form>
        </div>
    );
}
