"use client"

import type React from "react"
import { useState } from "react"
import { defaultCountries, parseCountry } from "react-international-phone";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { ImageIcon, Loader2, Camera, User, CheckCircle2, X, AlertCircle } from "lucide-react"
import Image from "next/image"
import { SecureImage } from "@/components/ui/SecureImage"
import { useAuth } from "@/contexts/AuthContexts"
import { requestVerification } from "@/services"
import CameraCapture from "@/components/profile/verification/CameraCapture"
import { UploadService } from "@/services/upload.service"
import { IVerification } from "@/models"
import { useThemeSettings } from "@/hooks/theme-settings"

const steps = [
    { id: 1, title: "ID Information" },
    { id: 2, title: "ID Documents" },
    { id: 3, title: "Selfie" },
    { id: 4, title: "Review" },
    { id: 5, title: "Complete" },
]

export interface VerificationFormData {
    governmentId: string;
    customIdType?: string;
    idNumber: string;
    documentCountry: string;
    expiryDate: string;
    idFront: File | null;
    idBack: File | null;
    selfie: File | Blob | null;
}

interface ProfileVerificationFormProps {
    onSubmit: (formData: any) => void;
    onCancel: () => void;
    dependentId?: string;
    dependentName?: string;
    initialData?: IVerification;
}

import CountrySelector from "@/components/ui/CountrySelector"

const idTypes = ["Philippine National ID (PhilID)","Postal ID","Driver's License","SSS UMID Card","PRC ID","Voter's ID", "PhilHealth ID","Senior Citizen ID","PWD ID","GSIS", "Passport", "Others"]

export default function ProfileVerification({ onCancel, onSubmit, dependentId, dependentName, initialData }: ProfileVerificationFormProps) {
    const { loggedInAccount, branding } = useAuth();
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primary || '#2563eb';
    const isHayahaiLinked = loggedInAccount?.providers?.includes('hayahai');
    const isSelfVerification = !dependentId;
    const isGlobalManaged = isHayahaiLinked && isSelfVerification;
    
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<VerificationFormData>({
        governmentId: initialData?.id_type?.toLowerCase() || "",
        customIdType: initialData?.id_type && !idTypes.some(t => t.toLowerCase() === initialData.id_type.toLowerCase()) ? initialData.id_type : "",
        idNumber: initialData?.id_number || "",
        documentCountry: initialData?.document_country || "Philippines",
        expiryDate: initialData?.expiry_date ? new Date(initialData.expiry_date).toISOString().split('T')[0] : "",
        idFront: null,
        idBack: null,
        selfie: null,
    })
    const [previews, setPreviews] = useState<{
        idFront: string | null;
        idBack: string | null;
        selfie: string | null;
    }>({
        idFront: initialData?.front_image_url || null,
        idBack: initialData?.back_image_url || null,
        selfie: initialData?.selfie_url || null,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSelfieDone, setIsSelfieDone] = useState(initialData?.selfie_url ? true : false)
    const [expiryDateError, setExpiryDateError] = useState("");

    // Get today's date in YYYY-MM-DD format for validation
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Validate expiry date is after today and has valid 4-digit year
    const isExpiryDateValid = (date: string) => {
        if (!date) return false;
        
        // Check format is YYYY-MM-DD with exactly 4-digit year
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(date)) return false;
        
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        return selectedDate > today;
    };

    const handleFileChange = (field: 'idFront' | 'idBack', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        if (file) {
            setFormData(prev => ({ ...prev, [field]: file }))
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [field]: reader.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSelfieCapture = (blob: Blob) => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setFormData(prev => ({ ...prev, selfie: file }));
        const url = URL.createObjectURL(blob);
        setPreviews(prev => ({ ...prev, selfie: url }));
        setIsSelfieDone(true);
        // setCurrentStep(currentStep + 1); // Auto-advance after capture if desired, or let user click Next
    }

    

    const handleSubmitVerification = async () => {
        setIsSubmitting(true);
        try {
            if (loggedInAccount) {
                // Determine URLs to use (newly uploaded or existing)
                let frontUrl = initialData?.front_image_url || '';
                let backUrl = initialData?.back_image_url || '';
                let selfieUrl = initialData?.selfie_url || '';

                // Upload documents only if they have been changed
                if (formData.idFront) {
                    const frontResult = await UploadService.uploadKYCIdentityDocument(formData.idFront);
                    if (frontResult) frontUrl = frontResult.url;
                }
                
                if (formData.idBack) {
                    const backResult = await UploadService.uploadKYCIdentityDocument(formData.idBack);
                    if (backResult) backUrl = backResult.url;
                }

                if (formData.selfie) {
                    const selfieResult = await UploadService.uploadKYCVerificationSelfie(
                        formData.selfie instanceof File ? formData.selfie : new File([formData.selfie], "selfie.jpg")
                    );
                    if (selfieResult) selfieUrl = selfieResult.url;
                }

                if (frontUrl && backUrl && selfieUrl) {
                    // Combine URLs (comma-separated for legacy reasons if needed, but we use individual fields now)
                    const combinedUrls = [frontUrl, backUrl, selfieUrl].join(',');

                    const dto = {
                        id_type: formData.governmentId === "others" ? formData.customIdType || "Others" : formData.governmentId,
                        id_number: formData.idNumber,
                        document_country: formData.documentCountry,
                        expiry_date: new Date(formData.expiryDate).toISOString(),
                        front_image_url: frontUrl,
                        back_image_url: backUrl,
                        selfie_url: selfieUrl,
                        ...(dependentId && { dependent_id: dependentId })
                    };

                    await requestVerification(loggedInAccount.id, dto);
                    onSubmit({
                        ...formData,
                        id_picture_url: combinedUrls
                    });
                    setCurrentStep(5);
                }
            }
        } catch (error) {
            if (typeof window === 'undefined') {
                console.error('Failed to submit verification:', error);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    return (
        <div className="bg-transparent relative">
            {isGlobalManaged ? (
                /* Global Management Screen for Linked Users */
                <div className="p-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <User className="h-10 w-10 text-blue-600" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Profile Managed by Hayahai</h3>
                    <p className="text-slate-600 max-w-sm mb-6 leading-relaxed">
                        Your identity verification is managed globally through your Hayahai account. 
                        Please complete your verification on the main Hayahai portal to ensure your status is synced across all marketplaces.
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 w-full max-w-sm">
                        <div className="flex items-center gap-3 mb-3 text-left">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Sync Benefits</p>
                        </div>
                        <ul className="text-xs text-slate-500 text-left space-y-2 list-disc list-inside">
                            <li>Verified status shared across all partners</li>
                            <li>Secure global document management</li>
                            <li>Faster boarding on all shipping lines</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <Button
                            className="w-full hover:brightness-90 h-11"
                            style={{ backgroundColor: primaryColor }}
                            onClick={() => window.open('https://ayahay.com/profile/verification', '_blank')}
                        >
                            Go to Hayahai Main Portal
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full h-11 text-slate-500"
                            onClick={onCancel}
                        >
                            Back to Profile
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                {/* Form Header - Sticky */}
            <div className="border-b sticky top-0 bg-white z-20">
                <div className="p-6 flex pb-2 justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            {dependentName ? `Verify ${dependentName}` : "Verification Request"}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {dependentName 
                                ? `Submit government ID and selfie to verify ${dependentName}.`
                                : "Submit your government ID and selfie for verification."}
                        </p>
                    </div>
                    <Button 
                        variant="ghost"
                        size="icon" 
                        className="h-10 w-10 rounded-full !text-black hover:bg-slate-100 shrink-0 ml-4" 
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Progress Steps (Moved inside sticky header) */}
                <div className="px-6 pb-4">
                    <div className="flex justify-between items-start">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex-1 flex flex-col items-center relative">
                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div
                                        className="absolute h-[2px] transition-all duration-500 z-0"
                                        style={{
                                            backgroundColor: step.id < currentStep ? primaryColor : "#e2e8f0",
                                            width: "100%",
                                            left: "50%",
                                            top: "0.875rem", // Centered at 14px (half of w-7)
                                        }}
                                    />
                                )}
                                
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm relative z-10"
                                    style={{
                                        backgroundColor: step.id <= currentStep ? primaryColor : "#f1f5f9",
                                        color: step.id <= currentStep ? "#ffffff" : "#64748b",
                                        border: step.id <= currentStep ? `2px solid ${primaryColor}` : "2px solid #e2e8f0"
                                    }}
                                >
                                    {step.id === currentStep && isSubmitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : step.id < currentStep ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <span className="text-xs font-bold">{step.id}</span>
                                    )}
                                </div>
                                <span 
                                    className="text-[9px] mt-1 font-semibold transition-colors duration-300 text-center px-1 uppercase tracking-tight"
                                    style={{ color: step.id === currentStep ? primaryColor : "#94a3b8" }}
                                >
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step 1: ID Information */}
            {currentStep === 1 && (
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Government Issued ID</label>
                            <Select
                                value={formData.governmentId}
                                onValueChange={(value) => setFormData({ ...formData, governmentId: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select ID Type" />
                                </SelectTrigger>
                                <SelectContent side="bottom" align="start">
                                    {idTypes.map((type) => (
                                        <SelectItem key={type} value={type.toLowerCase()}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.governmentId === "others" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">ID Type</label>
                                <Input
                                    placeholder="Enter ID Type (e.g., Company ID, School ID)"
                                    value={formData.customIdType}
                                    onChange={(e) => setFormData({ ...formData, customIdType: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Document Issuing Country</label>
                            <CountrySelector
                                value={formData.documentCountry}
                                onChange={(value) => setFormData({ ...formData, documentCountry: value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">ID Number</label>
                            <Input
                                placeholder="Enter your ID Number"
                                value={formData.idNumber}
                                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                            <Input
                                type="date"
                                value={formData.expiryDate}
                                min={getTodayDate()}
                                onChange={(e) => {
                                    const newDate = e.target.value;
                                    setFormData({ ...formData, expiryDate: newDate });
                                    if (newDate && !isExpiryDateValid(newDate)) {
                                        setExpiryDateError("ID expiry date must be in the future with a valid 4-digit year");
                                    } else {
                                        setExpiryDateError("");
                                    }
                                }}
                                className={expiryDateError ? "border-red-500" : ""}
                            />
                            {expiryDateError && (
                                <p className="text-xs text-red-600">{expiryDateError}</p>
                            )}
                            <p className="text-[11px] text-slate-500 italic leading-relaxed">
                                If your ID only shows Month and Year, you may select the 1st day or the last day of that month.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleNext}
                            disabled={
                                !formData.governmentId || 
                                (formData.governmentId === "others" && !formData.customIdType) ||
                                !formData.documentCountry || 
                                !formData.idNumber || 
                                !formData.expiryDate || 
                                !isExpiryDateValid(formData.expiryDate) || 
                                !!expiryDateError
                            }
                        >
                            Next: Document Upload
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Document Upload (Front & Back) */}
            {currentStep === 2 && (
                <div className="p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {/* Front of ID */}
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-center uppercase tracking-wider text-slate-500">ID Front Side</p>
                            <div className="aspect-[3/2] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center relative overflow-hidden bg-slate-50 group">
                                {previews.idFront ? (
                                    <SecureImage src={previews.idFront} alt="ID Front" fill className="object-cover" />
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500">Click to upload front view</p>
                                    </div>
                                )}
                                <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/40 transition-opacity">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('idFront', e)} />
                                    <Button variant="outline" className="text-white border-white pointer-events-none">Change Photo</Button>
                                </label>
                            </div>
                        </div>

                        {/* Back of ID */}
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-center uppercase tracking-wider text-slate-500">ID Back Side</p>
                            <div className="aspect-[3/2] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center relative overflow-hidden bg-slate-50 group">
                                {previews.idBack ? (
                                    <SecureImage src={previews.idBack} alt="ID Back" fill className="object-cover" />
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500">Click to upload back view</p>
                                    </div>
                                )}
                                <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/40 transition-opacity">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('idBack', e)} />
                                    <Button variant="outline" className="text-white border-white pointer-events-none">Change Photo</Button>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                        <Button onClick={handleNext} disabled={!previews.idFront || !previews.idBack}>
                            Next: Take Selfie
                        </Button>
                    </div>  
                </div>
            )}

            {/* Step 3: Selfie Capture */}
            {currentStep === 3 && (
                <div className="p-3 flex flex-col h-full">
                    {isSelfieDone && previews.selfie ? (
                        /* Show existing / captured selfie with option to retake */
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-slate-600">Your selfie photo</p>
                                {!formData.selfie && initialData?.selfie_url && (
                                    <p className="text-xs text-slate-400 mt-0.5">Previously submitted — retake if needed</p>
                                )}
                            </div>
                            <div className="relative group aspect-square max-w-xs mx-auto border-2 border-dashed rounded-2xl overflow-hidden"
                                style={{ borderColor: primaryColor }}>
                                <SecureImage src={previews.selfie} alt="Selfie" fill className="object-cover" />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/50 transition-opacity">
                                    <Button
                                        variant="outline"
                                        className="text-white border-white pointer-events-auto text-xs"
                                        onClick={() => setIsSelfieDone(false)}
                                    >
                                        <Camera className="h-3.5 w-3.5 mr-1.5" />
                                        Retake Selfie
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <Button variant="outline" onClick={handleBack}>Back</Button>
                                <Button onClick={handleNext}>
                                    Next: Review Details
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Camera capture mode */
                        <>
                            <div className="mb-2 text-center">
                                <p className="text-sm font-medium text-slate-600">Please position your face clearly in the frame.</p>
                            </div>

                            <CameraCapture
                                onCapture={handleSelfieCapture}
                                onRetake={() => setIsSelfieDone(false)}
                                onCancel={handleBack}
                            />

                            {isSubmitting && (
                                <div className="mt-8 flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
                                    <p className="text-sm font-medium" style={{ color: primaryColor }}>Uploading and verifying documents...</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Step 4: Review & Confirmation */}
            {currentStep === 4 && (
                <div className="p-6 space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-4">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="text-sm text-amber-800 font-semibold mb-1">Please review your information carefully</p>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Once submitted, you cannot resubmit another request while it's pending. 
                                Make sure all information and documents are correct.
                            </p>
                        </div>
                    </div>

                    {/* Information Grid for better space usage */}
                    <div className="space-y-8">
                        {/* ID Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="text-lg font-semibold text-slate-900">ID Information</h3>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setCurrentStep(1)} 
                                    className="hover:bg-opacity-10"
                                    style={{ color: primaryColor }}
                                >
                                    Edit
                                </Button>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">Government ID Type</p>
                                        <p className="text-sm font-semibold text-slate-900 break-words">
                                            {formData.governmentId === "others" ? formData.customIdType : formData.governmentId}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">ID Number</p>
                                        <p className="text-sm font-semibold text-slate-900 break-all">{formData.idNumber}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">Issuing Country</p>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {defaultCountries.map(c => parseCountry(c)).find(pc => pc.iso2.toUpperCase() === formData.documentCountry)?.name || formData.documentCountry}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">Expiry Date</p>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Uploaded Documents Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="text-lg font-semibold text-slate-900">Uploaded Documents</h3>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setCurrentStep(2)} 
                                    className="hover:bg-opacity-10"
                                    style={{ color: primaryColor }}
                                >
                                    Edit
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[
                                    { label: 'Front View',          preview: previews.idFront, isUnchanged: !formData.idFront  && !!initialData?.front_image_url, step: 2 },
                                    { label: 'Back View',           preview: previews.idBack,  isUnchanged: !formData.idBack   && !!initialData?.back_image_url,  step: 2 },
                                    { label: 'Selfie Verification', preview: previews.selfie,  isUnchanged: !formData.selfie   && !!initialData?.selfie_url,       step: 3 },
                                ].map((item) => (
                                    <div key={item.label} className="space-y-3">
                                        <p className="text-xs font-medium text-slate-500 text-center uppercase tracking-tight">{item.label}</p>
                                        <div className="aspect-[3/2] border border-slate-200 rounded-xl overflow-hidden relative shadow-sm bg-white group">
                                            {item.preview && (
                                                <SecureImage src={item.preview} alt={item.label} fill className="object-cover opacity-90 group-hover:opacity-50 transition-opacity" />
                                            )}
                                            {item.isUnchanged && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5 font-medium">
                                                    Unchanged
                                                </div>
                                            )}
                                            {item.preview && !item.isUnchanged && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-[9px] text-center py-0.5 font-medium">
                                                    Updated
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-[10px] font-bold hover:bg-slate-100 text-slate-700"
                                                    onClick={() => setCurrentStep(item.step)}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t">
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                        <Button 
                            onClick={handleSubmitVerification} 
                            disabled={isSubmitting}
                            className="hover:brightness-90"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Verification"
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 5: Verification Complete */}
            {currentStep === 5 && (
                <div className="p-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Verification Submitted!</h3>
                    <p className="text-slate-600 max-w-sm mb-10">
                        Thank you for your submission. Our team is now reviewing your documents. 
                        You'll receive a notification once your account is verified.
                    </p>

                    <Button
                        className="w-full max-w-xs hover:brightness-90 h-11"
                        style={{ backgroundColor: primaryColor }}
                        onClick={onCancel}
                    >
                        Back to Profile
                    </Button>
                </div>
            )}
                </>
            )}
        </div>
    )
}
