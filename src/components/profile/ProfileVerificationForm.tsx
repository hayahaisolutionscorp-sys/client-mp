"use client"

import type React from "react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { Input } from "../ui/Input"
import { Button } from "../ui/Button"
import { ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContexts"
import { uploadIdImage, submitVerificationRequest } from "@/services"

const steps = [
    { id: 1, title: "Personal Information" },
    { id: 2, title: "Document Upload" },
    { id: 3, title: "Verification" },
]

export interface VerificationFormData {
    governmentId: string;
    discountType: string;
    idNumber: string;
    idImage: File | null;
}

interface ProfileVerificationFormProps {
    onSubmit: (formData: VerificationFormData) => void;
    onCancel: () => void;
}

const idTypes = ["Philippine National ID (PhilID)","Postal ID","Driver's License","SSS UMID Card","PRC ID","Voter's ID", "PhilHealth ID","Senior Citizen ID","PWD ID","GSIS", "Passport"]
const discountTypes = ["Student", "Senior", "PWD"]

export default function ProfileVerification({ onCancel, onSubmit}: ProfileVerificationFormProps) {
    const { loggedInAccount } = useAuth();
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<VerificationFormData>({
        governmentId: "",
        discountType: "",
        idNumber: "",
        idImage: null,
    })
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        if (file) {
            setFormData({ ...formData, idImage: file })
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmitVerification = async () => {
        setIsSubmitting(true);
        try {
            if (formData.idImage && loggedInAccount) {
                // First upload the ID image
                const uploadResult = await uploadIdImage(formData.idImage, loggedInAccount.id);
                if (uploadResult) {
                    // Then submit the verification request with all required fields
                    const dto = {
                        id_type: formData.governmentId.toLowerCase(),
                        id_number: formData.idNumber,
                        discount_type: formData.discountType.toLowerCase(),
                        id_picture_url: uploadResult.url || '', // Make sure url is included from upload result
                        status_req: 'pending'
                    };

                    await submitVerificationRequest(loggedInAccount.id, dto);
                    await onSubmit({
                        ...formData,
                        idImage: null
                    });
                    setCurrentStep(3);
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
            if (currentStep === 2) {
                handleSubmitVerification();
            } else {
                setCurrentStep(currentStep + 1);
            }
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Progress Steps */}
            <div className="p-6 pb-0">
                <div className="relative flex justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step.id === currentStep
                                    ? "bg-blue-500 text-white"
                                    : step.id < currentStep
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                            >
                                {step.id}
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`absolute h-[2px] top-4 -z-10 ${index === 0 ? "left-[4%] w-[42%]" : "left-[54%] w-[42%]"
                                        } ${step.id < currentStep ? "bg-blue-500" : "bg-gray-200"}`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 1: ID Information */}
            {currentStep === 1 && (
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Government Issued Id</label>
                            <Select
                                value={formData.governmentId}
                                onValueChange={(value) => setFormData({ ...formData, governmentId: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                    {idTypes.map((type) => (
                                        <SelectItem key={type} value={type.toLowerCase()}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                            <Select
                                value={formData.discountType}
                                onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                    {discountTypes.map((type) => (
                                        <SelectItem key={type} value={type.toLowerCase()}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                        <Input
                            placeholder="Enter your ID Number"
                            value={formData.idNumber}
                            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        />
                    </div>

                    <div className="mt-6 flex justify-between">
                        <Button
                            className="bg-gray-500 hover:bg-gray-600"
                            onClick={onCancel} // Calls parent function to close the modal
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={!formData.governmentId || !formData.discountType || !formData.idNumber}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Document Upload */}
            {currentStep === 2 && (
                <div className="p-6">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-64 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                            {previewUrl ? (
                                <Image
                                    src={previewUrl || "/placeholder.svg"}
                                    alt="ID Preview"
                                    width={256}
                                    height={192}
                                    className="object-contain w-full h-full"
                                />
                            ) : (
                                <ImageIcon size={64} className="text-gray-400" />
                            )}
                        </div>

                        <label htmlFor="id-upload">
                            <Button
                                variant="default"
                                className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                                onClick={() => document.getElementById("id-upload")?.click()}
                            >
                                Upload photo of Valid ID
                            </Button>
                            <input id="id-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>

                    <div className="mt-6 flex justify-between">
                        <Button variant="outline" onClick={handleBack}>
                            Back
                        </Button>
                        <Button onClick={handleNext} disabled={!formData.idImage}>
                            Submit
                        </Button>
                    </div>  
                </div>
            )}

            {/* Step 3: Verification Complete */}
            {currentStep === 3 && (
                <div className="p-6 flex flex-col items-center justify-center">
                    <div className="w-56 h-60">
                        {isSubmitting ? (
                            <Loader2 className="w-full h-full text-blue-500 animate-spin" />
                        ) : (
                            <div className="flex justify-center w-full h-full">
                                <Image
                                    src="/assets/icons/Ayahay_blue_vertical.svg"
                                    alt="Ayahay Logo"
                                    width={500}
                                    height={500}
                                    className="h-100 w-100"
                                />
                            </div>
                        )}
                    </div>

                    <p className="text-gray-600 text-center mb-4">
                        Thank you for completing the verification process.
                        Your documents are currently being reviewed, and we will notify you once the process is complete.
                    </p>

                    <Button
                        className="mt-8 bg-blue-500 hover:bg-blue-600"
                        onClick={() => (window.location.href = `/profile/${loggedInAccount?.id}`)}
                    >
                        Back to profile
                    </Button>
                </div>
            )}
        </div>
    )
}

