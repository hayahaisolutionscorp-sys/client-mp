"use client"

import { useState, useEffect, useMemo } from "react"
import { parseISO, isValid, differenceInYears } from "date-fns"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import BirthDatePicker from "@/components/ui/BirthDatePicker"
import Combobox from "@/components/ui/Combobox"
import { NATIONALITIES } from "constants/default"
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
    const { refreshProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<IPassenger>>(passenger || {});
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [passengerTypes, setPassengerTypes] = useState<IPassengerType[]>([]);

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

    useEffect(() => {
        getPassengerTypes().then(types => {
            if (types) setPassengerTypes(types);
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
                            <label className="text-sm font-medium">Middle Name</label>
                            <Input
                                value={formData.middleName || ''}
                                onChange={(e) => handleInputChange('middleName', e.target.value)}
                                placeholder="Optional"
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
                            <label className="text-sm font-medium">suffix</label>
                            <Input
                                value={formData.suffixName || ''}
                                onChange={(e) => handleInputChange('suffixName', e.target.value)}
                                placeholder="Jr., Sr., etc. (Optional)"
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
                                        const iso = newDate.toISOString();
                                        handleInputChange('birthdayIso', iso);
                                        autoSelectByBirthday(iso);
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
                                    {passengerTypes.map(t => {
                                        const noMax = t.age_max === null || t.age_max >= 999;
                                        const hint = t.age_min !== null && noMax
                                            ? `${t.age_min}+ yrs`
                                            : t.age_min !== null && t.age_max !== null
                                                ? `${t.age_min}–${t.age_max} yrs`
                                                : null;
                                        return (
                                            <SelectItem key={t.id} value={String(t.id)}>
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
