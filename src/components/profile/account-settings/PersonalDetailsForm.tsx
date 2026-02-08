"use client"

import { useState, useEffect, useMemo } from "react"
import { parseISO, isValid } from "date-fns"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import BirthDatePicker from "@/components/ui/BirthDatePicker"
import Combobox from "@/components/ui/Combobox"
import { NATIONALITIES } from "constants/default"
import { IPassenger } from "@/models"
import { updatePassenger } from "@/services"
import { useAuth } from "@/contexts/AuthContexts"
import { SuccessModal } from "@/components/ui/SuccessModal"

interface PersonalDetailsFormProps {
    passenger?: IPassenger;
    email?: string;
    onUpdate: (updatedPassenger: IPassenger) => void;
}

export default function PersonalDetailsForm({ passenger, email, onUpdate }: PersonalDetailsFormProps) {
    const { refreshProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<IPassenger>>(passenger || {});
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (passenger) {
            setFormData({
                ...passenger,
                phone: passenger.phone && passenger.phone.startsWith('+63') 
                    ? passenger.phone 
                    : passenger.phone 
                        ? '+639' + passenger.phone.replace(/^\+639/, '').replace(/\D/g, '').slice(0, 9)
                        : ''
            });
        }
    }, [passenger]);

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
            'firstName', 'lastName', 'sex', 'birthdayIso', 
            'nationality', 'phone', 'address'
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

    const handlePhoneChange = (value: string) => {
        if (!value.startsWith('+639')) {
            value = '+639';
        }
        const prefix = '+639';
        const digitsOnly = value.slice(4).replace(/\D/g, '');
        const limitedDigits = digitsOnly.slice(0, 9);
        
        setFormData(prev => ({
            ...prev,
            phone: prefix + limitedDigits
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
            const phoneRegex = /^\+639\d{9}$/;
            if (!phoneRegex.test(formData.phone)) {
                setError("Phone number must start with +639 and be 13 characters long.");
                return;
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
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-7">
                <div className="space-y-1">
                    <CardTitle>Personal Details</CardTitle>
                    <CardDescription>Manage your personal information and preferences.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-0">
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
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.lastName || ''}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                required
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
                            <Input
                                value={formData.phone || '+639'}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder="+639171234567"
                                maxLength={13}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sex <span className="text-red-500">*</span></label>
                            <span className="sr-only">Sex selection</span>
                            <Select
                                value={formData.sex || ''}
                                onValueChange={(value) => handleInputChange('sex', value)}
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
                                        handleInputChange('birthdayIso', newDate.toISOString());
                                    }
                                }}
                                validationErrors={{}}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nationality <span className="text-red-500">*</span></label>
                            <Combobox
                                values={NATIONALITIES}
                                defaultValue={formData.nationality || ''}
                                placeholder="Select nationality"
                                onChange={(value) => handleInputChange('nationality', value)}
                            />
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
                            {isSaving ? 'Saving...' : 'Save Changes'}
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
