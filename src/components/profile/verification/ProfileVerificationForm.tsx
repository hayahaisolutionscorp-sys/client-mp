"use client"

import type React from "react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { ImageIcon, Loader2, Camera, User, CheckCircle2, X, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContexts"
import { requestVerification } from "@/services"
import CameraCapture from "@/components/profile/verification/CameraCapture"
import { UploadService } from "@/services/upload.service"

const steps = [
    { id: 1, title: "ID Information" },
    { id: 2, title: "ID Documents" },
    { id: 3, title: "Selfie" },
    { id: 4, title: "Review" },
    { id: 5, title: "Complete" },
]

export interface VerificationFormData {
    governmentId: string;
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
}

const idTypes = ["Philippine National ID (PhilID)","Postal ID","Driver's License","SSS UMID Card","PRC ID","Voter's ID", "PhilHealth ID","Senior Citizen ID","PWD ID","GSIS", "Passport"]
const countryCodes = [
    { code: "PH", name: "Philippines" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "JP", name: "Japan" },
    { code: "KR", name: "South Korea" },
    { code: "CN", name: "China" },
]

export default function ProfileVerification({ onCancel, onSubmit, dependentId, dependentName }: ProfileVerificationFormProps) {
    const { loggedInAccount } = useAuth();
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<VerificationFormData>({
        governmentId: "",
        idNumber: "",
        documentCountry: "PH",
        expiryDate: "",
        idFront: null,
        idBack: null,
        selfie: null,
    })
    const [previews, setPreviews] = useState<{
        idFront: string | null;
        idBack: string | null;
        selfie: string | null;
    }>({
        idFront: null,
        idBack: null,
        selfie: null,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSelfieDone, setIsSelfieDone] = useState(false)

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
            if (formData.idFront && formData.idBack && formData.selfie && loggedInAccount) {
                // Upload Front
                const frontResult = await UploadService.uploadKYCIdentityDocument(formData.idFront);
                // Upload Back
                const backResult = await UploadService.uploadKYCIdentityDocument(formData.idBack);
                // Upload Selfie
                const selfieResult = await UploadService.uploadKYCVerificationSelfie(formData.selfie instanceof File ? formData.selfie : new File([formData.selfie], "selfie.jpg"));

                if (frontResult && backResult && selfieResult) {
                    // Combine URLs (comma-separated for the single field in backend)
                    const combinedUrls = [frontResult.url, backResult.url, selfieResult.url].join(',');

                    const dto = {
                        id_type: formData.governmentId,
                        id_number: formData.idNumber,
                        document_country: formData.documentCountry,
                        expiry_date: new Date(formData.expiryDate).toISOString(),
                        front_image_url: frontResult.url,
                        back_image_url: backResult.url,
                        selfie_url: selfieResult.url,
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
            console.error('Failed to submit verification:', error);
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
            {/* Form Header - Sticky */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-20">
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
                >
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {/* Progress Steps */}
            <div className="p-6 pb-4">
                <div className="relative flex justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${step.id <= currentStep
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-500"
                                    }`}
                            >
                                {step.id === currentStep && isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : step.id < currentStep ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <span className="text-xs font-bold">{step.id}</span>
                                )}
                            </div>
                            <span className={`text-[10px] mt-1 font-medium ${step.id === currentStep ? "text-blue-600" : "text-gray-400"}`}>
                                {step.title}
                            </span>
                            {index < steps.length - 1 && (
                                <div
                                    className={`absolute h-[2px] top-4 -z-10 w-[24.5%] ${index === 0 ? "left-[12.5%]" : index === 1 ? "left-[37.5%]" : "left-[62.5%]"
                                        } ${step.id < currentStep ? "bg-blue-600" : "bg-gray-200"}`}
                                />
                            )}
                        </div>
                    ))}
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Document Issuing Country</label>
                            <Select
                                value={formData.documentCountry}
                                onValueChange={(value) => setFormData({ ...formData, documentCountry: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Country" />
                                </SelectTrigger>
                                <SelectContent side="bottom" align="start">
                                    {countryCodes.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                            <p className="text-[11px] text-slate-500 italic leading-relaxed">
                                If your ID only shows Month and Year, you may select the 1st day or the last day of that month.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleNext}
                            disabled={!formData.governmentId || !formData.documentCountry || !formData.idNumber || !formData.expiryDate}
                        >
                            Next: Document Upload
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Document Upload (Front & Back) */}
            {currentStep === 2 && (
                <div className="p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Front of ID */}
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-center uppercase tracking-wider text-slate-500">ID Front Side</p>
                            <div className="aspect-[3/2] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center relative overflow-hidden bg-slate-50 group">
                                {previews.idFront ? (
                                    <Image src={previews.idFront} alt="ID Front" fill className="object-cover" />
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
                                    <Image src={previews.idBack} alt="ID Back" fill className="object-cover" />
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
                        <Button onClick={handleNext} disabled={!formData.idFront || !formData.idBack}>
                            Next: Take Selfie
                        </Button>
                    </div>  
                </div>
            )}

            {/* Step 3: Selfie Capture */}
            {currentStep === 3 && (
                <div className="p-6">
                    <div className="mb-6 text-center">
                        <p className="text-sm font-medium text-slate-600">Please position your face clearly in the frame.</p>
                    </div>
                    
                    <CameraCapture 
                        onCapture={handleSelfieCapture} 
                        onCancel={handleBack}
                    />

                    {isSubmitting && (
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                            <p className="text-sm font-medium text-blue-600">Uploading and verifying documents...</p>
                        </div>
                    )}

                    {isSelfieDone && (<div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                        <Button onClick={handleNext} disabled={!formData.selfie}>
                            Next: Review Details
                        </Button>
                    </div>  )}

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
                                Once submitted, you cannot resubmit another request while it's pending or for 48 hours for review purposes. 
                                Make sure all information and documents are correct.
                            </p>
                        </div>
                    </div>

                    {/* ID Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">ID Information</h3>
                            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>Edit</Button>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Government ID Type</p>
                                    <p className="text-sm font-medium text-slate-900 capitalize">{formData.governmentId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">ID Number</p>
                                    <p className="text-sm font-medium text-slate-900">{formData.idNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Issuing Country</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {countryCodes.find(c => c.code === formData.documentCountry)?.name || formData.documentCountry}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Expiry Date</p>
                                    <p className="text-sm font-medium text-slate-900">{new Date(formData.expiryDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Uploaded Documents Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">Uploaded Documents</h3>
                            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>Edit</Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <p className="text-xs text-slate-500 text-center">ID Front</p>
                                <div className="aspect-[3/2] border-2 border-slate-200 rounded-lg overflow-hidden relative">
                                    {previews.idFront && <Image src={previews.idFront} alt="ID Front" fill className="object-cover" />}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-slate-500 text-center">ID Back</p>
                                <div className="aspect-[3/2] border-2 border-slate-200 rounded-lg overflow-hidden relative">
                                    {previews.idBack && <Image src={previews.idBack} alt="ID Back" fill className="object-cover" />}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-slate-500 text-center">Selfie</p>
                                <div className="aspect-[3/2] border-2 border-slate-200 rounded-lg overflow-hidden relative">
                                    {previews.selfie && <Image src={previews.selfie} alt="Selfie" fill className="object-cover" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t">
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                        <Button 
                            onClick={handleSubmitVerification} 
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700"
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
                        className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 h-11"
                        onClick={onCancel}
                    >
                        Back to Profile
                    </Button>
                </div>
            )}
        </div>
    )
}
