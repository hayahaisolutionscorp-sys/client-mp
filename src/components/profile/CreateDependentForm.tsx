"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { X, Loader2 } from "lucide-react"
import { IDependent, CreateDependentDto, UpdateDependentDto } from "@/models"
import BirthDatePicker from "../ui/BirthDatePicker"
import { parseISO, isValid } from "date-fns"
import Combobox from "../ui/Combobox"
import { NATIONALITIES } from "constants/default"
import { Checkbox } from "../ui/Checkbox"
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
        gender: "Female",
        relationship: "",
        nationality: "Filipino",
        occupation: "",
        address: "",
        civil_status: "Single",
        mobile_number: "",
        email: "",
        category: "Regular",
    });
    const [selectedRelationship, setSelectedRelationship] = useState("");
    const [customRelationship, setCustomRelationship] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (dependent) {
            setFormData({
                first_name: dependent.first_name || "",
                last_name: dependent.last_name || "",
                birthday: dependent.birthday ? dependent.birthday.split('T')[0] : "",
                gender: dependent.gender || "Female",
                relationship: dependent.relationship || "",
                nationality: dependent.nationality || "Filipino",
                occupation: dependent.occupation || "",
                address: dependent.address || "",
                civil_status: dependent.civil_status || "Single",
                mobile_number: dependent.mobile_number && dependent.mobile_number.startsWith('+63')
                    ? dependent.mobile_number
                    : dependent.mobile_number
                        ? '+63' + dependent.mobile_number.replace(/^\+63/, '').replace(/\D/g, '').slice(0, 10)
                        : '',
                email: dependent.email || "",
                category: dependent.category || "Regular",
            });
            if (dependent.occupation === "Unemployed") setIsUnemployed(true);

            if (dependent.relationship) {
                if (relationshipOptions.includes(dependent.relationship)) {
                    setSelectedRelationship(dependent.relationship);
                } else {
                    setSelectedRelationship("Other");
                    setCustomRelationship(dependent.relationship);
                }
            }
        }
    }, [dependent]);

    const handleChange = (field: keyof CreateDependentDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMobileChange = (value: string) => {
        // Always ensure it starts with +63
        if (!value.startsWith('+63')) {
            value = '+63';
        }
        
        // Remove any non-digit characters after +63
        const prefix = '+63';
        const digitsOnly = value.slice(3).replace(/\D/g, '');
        
        // Limit to 10 digits after +63 (total 13 characters)
        const limitedDigits = digitsOnly.slice(0, 10);
        
        setFormData(prev => ({
            ...prev,
            mobile_number: prefix + limitedDigits
        }));
    };

    const handleAccountContactToggle = (checked: boolean) => {
        setUseAccountContact(checked);
        if (checked && loggedInAccount) {
            setFormData(prev => ({
                ...prev,
                address: loggedInAccount.passenger?.address || prev.address,
                mobile_number: loggedInAccount.passenger?.mobile_number || prev.mobile_number,
                email: loggedInAccount.email || prev.email,
            }));
        }
    };

    const handleUnemployedToggle = (checked: boolean) => {
        setIsUnemployed(checked);
        if (checked) {
            handleChange("occupation", "Unemployed");
        } else {
            handleChange("occupation", "");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const mobileRegex = /^\+63\d{10}$/;
        if (!mobileRegex.test(formData.mobile_number)) {
            setError("Mobile number must start with +63 and be 13 characters long (e.g., +639171234567).");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && dependent) {
                const updated = await updateDependent(dependent.id, formData);
                if (updated) {
                    onSuccess(updated);
                }
            } else {
                const created = await createDependents(userId, [formData]);
                if (created && created.length > 0) {
                    onSuccess(created[0]);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to save dependent.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = 
        formData.first_name && 
        formData.last_name && 
        formData.birthday && 
        formData.gender && 
        formData.relationship && 
        formData.nationality && 
        formData.address && 
        formData.civil_status &&
        formData.mobile_number &&
        formData.category &&
        formData.occupation;

    return (
        <div className="bg-white">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        {isEditing ? "Edit Dependent" : "Add Dependent"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {isEditing 
                            ? "Update the information for this dependent."
                            : "Add a minor, infant, or dependent who travels with you."}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full !text-black hover:bg-slate-100 shrink-0 ml-4"
                    onClick={onCancel}
                >
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="Enter first name"
                            value={formData.first_name}
                            onChange={(e) => handleChange("first_name", e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="Enter last name"
                            value={formData.last_name}
                            onChange={(e) => handleChange("last_name", e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Birth Date and Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Birth Date <span className="text-red-500">*</span></label>
                        <BirthDatePicker
                            date={formData.birthday ? parseISO(formData.birthday) : undefined}
                            setDate={(dateAction) => {
                                const current = formData.birthday ? parseISO(formData.birthday) : undefined;
                                const newDate = typeof dateAction === 'function' ? dateAction(current) : dateAction;
                                if (newDate && isValid(newDate)) {
                                    handleChange("birthday", newDate.toISOString().split("T")[0]);
                                }
                            }}
                            validationErrors={{}}
                            allowMinors={true}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
                        <Select
                            value={formData.gender}
                            onValueChange={(value) => handleChange("gender", value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Relationship and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Relationship <span className="text-red-500">*</span></label>
                        <Select
                            value={selectedRelationship}
                            onValueChange={handleRelationshipChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                                {relationshipOptions.map((opt) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedRelationship === "Other" && (
                            <Input
                                placeholder="Please specify relationship"
                                value={customRelationship}
                                onChange={(e) => handleCustomRelationshipChange(e.target.value)}
                                className="mt-2"
                                required
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => handleChange("category", value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Regular">Regular</SelectItem>
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Senior">Senior Citizen</SelectItem>
                                <SelectItem value="PWD">PWD</SelectItem>
                                <SelectItem value="Infant">Infant</SelectItem>
                                <SelectItem value="Child">Child</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Nationality and Civil Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nationality <span className="text-red-500">*</span></label>
                        <Combobox
                            values={NATIONALITIES}
                            defaultValue={formData.nationality}
                            placeholder="Select nationality"
                            onChange={(value) => handleChange("nationality", value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Civil Status <span className="text-red-500">*</span></label>
                        <Select
                            value={formData.civil_status}
                            onValueChange={(value) => handleChange("civil_status", value)}
                            required
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select civil status" />
                            </SelectTrigger>
                            <SelectContent>
                                {civilStatuses.map((status) => (
                                    <SelectItem key={status} value={status.toLowerCase()}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Contact Info Toggles */}
                <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="use-account-contact" 
                            checked={useAccountContact}
                            onCheckedChange={handleAccountContactToggle}
                        />
                        <label htmlFor="use-account-contact" className="text-sm font-medium leading-none cursor-pointer">
                            Same as my account contact info (Address, Mobile, Email)
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="is-unemployed" 
                            checked={isUnemployed}
                            onCheckedChange={handleUnemployedToggle}
                        />
                        <label htmlFor="is-unemployed" className="text-sm font-medium leading-none cursor-pointer">
                            Dependent is currently unemployed
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="+639171234567"
                            value={formData.mobile_number || '+63'}
                            onChange={(e) => handleMobileChange(e.target.value)}
                            maxLength={13}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email <span className="text-slate-400">(optional)</span></label>
                        <Input
                            type="email"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Occupation <span className="text-red-500">*</span></label>
                    <Input
                        placeholder="Enter occupation"
                        value={formData.occupation}
                        onChange={(e) => handleChange("occupation", e.target.value)}
                        required
                        disabled={isUnemployed}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
                    <Input
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        required
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={!isFormValid || isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            isEditing ? "Update Dependent" : "Save Dependent"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
