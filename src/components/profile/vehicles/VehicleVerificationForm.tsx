"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card"
import { Upload, X, Check, Loader2, FileText, AlertCircle, Camera, Car, Info, CheckCircle2, RefreshCw } from "lucide-react"
import { UploadService } from "@/services/upload.service"
import { requestVehicleVerification } from "@/services"
import { SecureImage } from "@/components/ui/SecureImage"
import { useThemeSettings } from "@/hooks/theme-settings"
import CameraCapture from "@/components/profile/verification/CameraCapture"
import { IVehicleVerification } from "@/models"

const steps = [
    { id: 1, title: "Documents" },
    { id: 2, title: "Front View" },
    { id: 3, title: "Rear View" },
    { id: 4, title: "Left Side" },
    { id: 5, title: "Right Side" },
    { id: 6, title: "Review" },
]

interface VehicleVerificationFormProps {
    userId: string;
    vehicleId: string;
    plateNumber: string;
    initialData?: IVehicleVerification;
    onSubmit: () => void;
    onCancel: () => void;
}

type FileType = 'OR' | 'CR' | 'FRONT' | 'REAR' | 'LEFT' | 'RIGHT';

export default function VehicleVerificationForm({
    userId,
    vehicleId,
    plateNumber,
    initialData,
    onSubmit,
    onCancel,
}: VehicleVerificationFormProps) {
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primary || '#3b82f6';

    const [currentStep, setCurrentStep] = useState(1);
    const [hasReachedReview, setHasReachedReview] = useState(false);

    // New File objects (null = user hasn't changed this slot)
    const [orFile, setOrFile] = useState<File | null>(null);
    const [crFile, setCrFile] = useState<File | null>(null);
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [rearFile, setRearFile] = useState<File | null>(null);
    const [leftFile, setLeftFile] = useState<File | null>(null);
    const [rightFile, setRightFile] = useState<File | null>(null);

    // Displayed previews — initialised from existing URLs if resubmitting
    const [orPreview, setOrPreview] = useState<string | null>(initialData?.official_receipt_url || null);
    const [crPreview, setCrPreview] = useState<string | null>(initialData?.certificate_of_registration_url || null);
    const [frontPreview, setFrontPreview] = useState<string | null>(initialData?.front_vehicle_url || null);
    const [rearPreview, setRearPreview] = useState<string | null>(initialData?.rear_vehicle_url || null);
    const [leftPreview, setLeftPreview] = useState<string | null>(initialData?.left_vehicle_url || null);
    const [rightPreview, setRightPreview] = useState<string | null>(initialData?.right_vehicle_url || null);

    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isResubmission = !!initialData;

    // ------------------------------------------------------------------
    // File helpers
    // ------------------------------------------------------------------
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: FileType) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            switch (type) {
                case 'OR':    setOrFile(file);    setOrPreview(result);    break;
                case 'CR':    setCrFile(file);    setCrPreview(result);    break;
                case 'FRONT': setFrontFile(file); setFrontPreview(result); break;
                case 'REAR':  setRearFile(file);  setRearPreview(result);  break;
                case 'LEFT':  setLeftFile(file);  setLeftPreview(result);  break;
                case 'RIGHT': setRightFile(file); setRightPreview(result); break;
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveFile = (type: FileType) => {
        // On remove during resubmission keep the existing URL if no new file was selected yet
        switch (type) {
            case 'OR':    setOrFile(null);    setOrPreview(null);    break;
            case 'CR':    setCrFile(null);    setCrPreview(null);    break;
            case 'FRONT': setFrontFile(null); setFrontPreview(null); break;
            case 'REAR':  setRearFile(null);  setRearPreview(null);  break;
            case 'LEFT':  setLeftFile(null);  setLeftPreview(null);  break;
            case 'RIGHT': setRightFile(null); setRightPreview(null); break;
        }
    };

    const handleCameraCapture = (blob: Blob, type: FileType) => {
        const file = new File([blob], `${type.toLowerCase()}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        switch (type) {
            case 'FRONT': setFrontFile(file); setFrontPreview(url); break;
            case 'REAR':  setRearFile(file);  setRearPreview(url);  break;
            case 'LEFT':  setLeftFile(file);  setLeftPreview(url);  break;
            case 'RIGHT': setRightFile(file); setRightPreview(url); break;
        }
    };

    // ------------------------------------------------------------------
    // Submit — only re-upload slots where a new File was chosen
    // ------------------------------------------------------------------
    const handleSubmit = async () => {
        if (!orPreview || !crPreview || !frontPreview || !rearPreview || !leftPreview || !rightPreview) {
            setError("Please complete all steps and upload all required photos.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const [orUrl, crUrl, frontUrl, rearUrl, leftUrl, rightUrl] = await Promise.all([
                orFile
                    ? UploadService.uploadVehicleOR(orFile).then(r => r.url)
                    : Promise.resolve(initialData?.official_receipt_url || ''),
                crFile
                    ? UploadService.uploadVehicleCR(crFile).then(r => r.url)
                    : Promise.resolve(initialData?.certificate_of_registration_url || ''),
                frontFile
                    ? UploadService.uploadVehiclePicture(frontFile).then(r => r.url)
                    : Promise.resolve(initialData?.front_vehicle_url || ''),
                rearFile
                    ? UploadService.uploadVehiclePicture(rearFile).then(r => r.url)
                    : Promise.resolve(initialData?.rear_vehicle_url || ''),
                leftFile
                    ? UploadService.uploadVehiclePicture(leftFile).then(r => r.url)
                    : Promise.resolve(initialData?.left_vehicle_url || ''),
                rightFile
                    ? UploadService.uploadVehiclePicture(rightFile).then(r => r.url)
                    : Promise.resolve(initialData?.right_vehicle_url || ''),
            ]);

            await requestVehicleVerification(vehicleId, {
                official_receipt_url: orUrl,
                certificate_of_registration_url: crUrl,
                front_vehicle_url: frontUrl,
                rear_vehicle_url: rearUrl,
                left_vehicle_url: leftUrl,
                right_vehicle_url: rightUrl,
            });

            setCurrentStep(7);
        } catch (err: any) {
            console.error("Error submitting vehicle verification:", err);
            setError(err.message || "Failed to submit verification request. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // ------------------------------------------------------------------
    // Navigation
    // ------------------------------------------------------------------
    const nextStep = () => {
        if (currentStep === 5) {
            setHasReachedReview(true);
            setCurrentStep(6);
        } else {
            setCurrentStep(prev => Math.min(prev + 1, 6));
        }
    };
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const isStep1Valid = !!orPreview && !!crPreview;
    const isStep2Valid = !!frontPreview;
    const isStep3Valid = !!rearPreview;
    const isStep4Valid = !!leftPreview;
    const isStep5Valid = !!rightPreview;

    // ------------------------------------------------------------------
    // Document upload slot (OR / CR) — shows existing image with overlay
    // ------------------------------------------------------------------
    const renderDocSlot = (
        label: string,
        preview: string | null,
        type: 'OR' | 'CR',
        isExisting: boolean,
    ) => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
            <div
                className={`relative border-2 border-dashed rounded-xl p-3 transition-all ${preview ? 'border-blue-500 bg-blue-50/10' : 'border-slate-200 hover:border-slate-300'}`}
                style={{ borderColor: preview ? primaryColor : undefined }}
            >
                {preview ? (
                    <div className="relative aspect-[3/2] w-full group">
                        <SecureImage src={preview} alt={label} fill className="object-cover rounded-lg" />
                        {/* Hover overlay — change photo */}
                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/40 transition-opacity rounded-lg">
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, type)} />
                            <Button variant="outline" className="text-white border-white pointer-events-none text-xs h-8">
                                <RefreshCw className="h-3 w-3 mr-1" /> Change Photo
                            </Button>
                        </label>
                        {/* Remove button */}
                        <button
                            onClick={() => handleRemoveFile(type)}
                            className="absolute -top-2 -right-2 p-1 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 z-10"
                        >
                            <X className="h-3 w-3" />
                        </button>
                        {isExisting && (
                            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                                Previously submitted
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="relative flex flex-col items-center justify-center py-4 text-center">
                        <Upload className="h-6 w-6 mb-1 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-600">Upload {label}</p>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, type)} />
                    </div>
                )}
            </div>
        </div>
    );

    // ------------------------------------------------------------------
    // Step renders
    // ------------------------------------------------------------------
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <h4 className="font-bold text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" style={{ color: primaryColor }} />
                                Step 1: Document Upload
                            </h4>
                            <p className="text-xs text-muted-foreground">Upload your vehicle's OR and CR.</p>
                        </div>

                        {isResubmission && (
                            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-blue-700 flex items-start gap-2">
                                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                Previous photos are shown below. Hover over a photo and click <strong>Change Photo</strong> to replace it, or leave it as-is to resubmit the same image.
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {renderDocSlot("Official Receipt (OR)", orPreview, 'OR', !orFile && !!initialData?.official_receipt_url)}
                            {renderDocSlot("Certificate of Registration (CR)", crPreview, 'CR', !crFile && !!initialData?.certificate_of_registration_url)}
                        </div>

                        <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Disclaimer
                            </div>
                            <p className="text-[10px] text-amber-700 leading-tight">
                                Photos must match your registered vehicle details. Inaccurate info may lead to rejection.
                            </p>
                        </div>
                    </div>
                );

            case 2:
            case 3:
            case 4:
            case 5: {
                const cameraSteps = [
                    { id: 'FRONT' as FileType, label: 'Front View',      preview: frontPreview, tip: "Plate number must be visible." },
                    { id: 'REAR' as FileType,  label: 'Rear View',       preview: rearPreview,  tip: "Plate number must be visible." },
                    { id: 'LEFT' as FileType,  label: 'Left Side View',  preview: leftPreview,  tip: "Capture the full left side." },
                    { id: 'RIGHT' as FileType, label: 'Right Side View', preview: rightPreview, tip: "Capture the full right side." },
                ];
                const activeStep = cameraSteps[currentStep - 2];
                const isExistingPreview = (() => {
                    switch (activeStep.id) {
                        case 'FRONT': return !frontFile && !!initialData?.front_vehicle_url;
                        case 'REAR':  return !rearFile  && !!initialData?.rear_vehicle_url;
                        case 'LEFT':  return !leftFile  && !!initialData?.left_vehicle_url;
                        case 'RIGHT': return !rightFile && !!initialData?.right_vehicle_url;
                    }
                })();

                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2 text-center">
                            <h4 className="font-bold text-lg flex items-center justify-center gap-2">
                                <Car className="h-4 w-4" style={{ color: primaryColor }} />
                                Step {currentStep}: {activeStep.label}
                            </h4>
                            <p className="text-xs text-muted-foreground">{activeStep.tip}</p>
                        </div>

                        {/* If there's an existing photo, show it with option to replace */}
                        {activeStep.preview && (
                            <div className="relative group aspect-video max-w-sm mx-auto border-2 border-dashed rounded-xl overflow-hidden"
                                style={{ borderColor: primaryColor }}>
                                <SecureImage src={activeStep.preview} alt={activeStep.label} fill className="object-cover" />
                                <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/50 transition-opacity">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, activeStep.id)}
                                    />
                                    <Button variant="outline" className="text-white border-white pointer-events-none text-xs">
                                        <RefreshCw className="h-3 w-3 mr-1" /> Change Photo
                                    </Button>
                                </label>
                                <button
                                    onClick={() => handleRemoveFile(activeStep.id)}
                                    className="absolute top-2 right-2 p-1 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 z-10"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                                {isExistingPreview && (
                                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                                        Previously submitted
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Camera always available to retake */}
                        {!activeStep.preview && (
                            <div className="flex justify-center -mx-6">
                                <CameraCapture
                                    key={`${activeStep.id}-${currentStep}`}
                                    facingMode="environment"
                                    onCapture={(blob) => handleCameraCapture(blob, activeStep.id)}
                                />
                            </div>
                        )}

                        {activeStep.preview && (
                            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                                <Info className="h-3.5 w-3.5" />
                                Hover the photo and click <strong>Change Photo</strong> to retake, or proceed to the next step.
                            </div>
                        )}

                        {!activeStep.preview && (
                            <div className="flex items-center gap-2 justify-center text-xs font-medium rounded-lg p-2"
                                style={{ color: `${primaryColor}CC`, backgroundColor: `${primaryColor}12` }}>
                                <Info className="h-3.5 w-3.5" />
                                Align the vehicle within the frame
                            </div>
                        )}
                    </div>
                );
            }

            case 6: {
                const reviewItems = [
                    { label: 'OR',    preview: orPreview,    step: 1, existing: !orFile    && !!initialData?.official_receipt_url },
                    { label: 'CR',    preview: crPreview,    step: 1, existing: !crFile    && !!initialData?.certificate_of_registration_url },
                    { label: 'Front', preview: frontPreview, step: 2, existing: !frontFile && !!initialData?.front_vehicle_url },
                    { label: 'Rear',  preview: rearPreview,  step: 3, existing: !rearFile  && !!initialData?.rear_vehicle_url },
                    { label: 'Left',  preview: leftPreview,  step: 4, existing: !leftFile  && !!initialData?.left_vehicle_url },
                    { label: 'Right', preview: rightPreview, step: 5, existing: !rightFile && !!initialData?.right_vehicle_url },
                ];
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center space-y-1">
                            <h4 className="font-bold text-lg">Review and Submit</h4>
                            <p className="text-[11px] text-muted-foreground">Double check your photos before submission.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {reviewItems.map((item, index) => (
                                <div key={index} className="space-y-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-center">{item.label}</p>
                                    <div className="relative group aspect-square border border-slate-100 rounded-lg overflow-hidden bg-slate-50 shadow-sm">
                                        {item.preview ? (
                                            <>
                                                <SecureImage src={item.preview} alt={item.label} fill className="object-cover opacity-90 transition-opacity group-hover:opacity-40" />
                                                {item.existing && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[8px] text-center py-0.5 font-medium">
                                                        Unchanged
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-[10px] font-bold hover:bg-slate-100 text-slate-700"
                                                        onClick={() => setCurrentStep(item.step)}
                                                    >
                                                        <RefreshCw className="h-3 w-3 mr-1" />
                                                        Retake
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <X className="h-4 w-4 text-red-200" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: primaryColor }}>
                                <Check className="h-3.5 w-3.5" />
                                All set!
                            </div>
                            <p className="text-[10px] text-blue-700 leading-tight">
                                {isResubmission
                                    ? "Photos marked as \"Unchanged\" will be resubmitted as-is. Only updated photos will be re-uploaded."
                                    : "Click submit to finalize your vehicle verification."}
                            </p>
                        </div>
                    </div>
                );
            }

            default:
                return null;
        }
    };

    // ------------------------------------------------------------------
    // Success screen
    // ------------------------------------------------------------------
    if (currentStep === 7) {
        return (
            <div className="p-10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h3>
                <p className="text-slate-600 max-w-sm mb-10">
                    Your vehicle verification {isResubmission ? "resubmission" : "request"} for{" "}
                    <span className="font-bold" style={{ color: primaryColor }}>{plateNumber}</span> has been received.
                    Our team will review your documents and photos.
                </p>
                <Button
                    className="w-full max-w-xs hover:brightness-90 h-11 text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                    onClick={onSubmit}
                >
                    Back to Profile
                </Button>
            </div>
        );
    }

    // ------------------------------------------------------------------
    // Main layout
    // ------------------------------------------------------------------
    return (
        <div className="bg-transparent relative">
            {/* Sticky Header */}
            <div className="border-b sticky top-0 bg-white z-20">
                <div className="p-6 flex pb-2 justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {isResubmission ? "Resubmit Vehicle Verification" : "Vehicle Verification"}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {isResubmission ? "Update and resubmit photos for" : "Verify"}{" "}
                            <span className="font-bold underline" style={{ color: primaryColor }}>{plateNumber}</span>.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full !text-black hover:bg-slate-100 shrink-0 ml-4"
                        onClick={onCancel}
                        disabled={isUploading}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 pb-4">
                    <div className="flex justify-between items-start">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex-1 flex flex-col items-center relative">
                                {index < steps.length - 1 && (
                                    <div
                                        className="absolute h-[2px] transition-all duration-500 z-0"
                                        style={{
                                            backgroundColor: step.id < currentStep ? primaryColor : "#e2e8f0",
                                            width: "100%",
                                            left: "50%",
                                            top: "0.875rem",
                                        }}
                                    />
                                )}
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm relative z-10"
                                    style={{
                                        backgroundColor: step.id <= currentStep ? primaryColor : "#f1f5f9",
                                        color: step.id <= currentStep ? "#ffffff" : "#64748b",
                                        border: step.id <= currentStep ? `2px solid ${primaryColor}` : "2px solid #e2e8f0",
                                    }}
                                >
                                    {step.id < currentStep ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <span className="text-xs font-bold">{step.id}</span>
                                    )}
                                </div>
                                <span
                                    className="text-[8px] mt-1 font-semibold transition-colors duration-300 text-center px-1 uppercase tracking-tight"
                                    style={{ color: step.id === currentStep ? primaryColor : "#94a3b8" }}
                                >
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="p-6">
                <div className="min-h-[340px]">
                    {renderStep()}
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 mt-6 animate-in shake duration-500">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={currentStep === 1 ? onCancel : prevStep}
                        disabled={isUploading || (currentStep > 1 && !hasReachedReview)}
                        className={`text-slate-500 font-bold hover:bg-slate-100 h-10 px-6 ${currentStep > 1 && !hasReachedReview && 'opacity-0 pointer-events-none'}`}
                    >
                        {currentStep === 1 ? 'Cancel' : 'Back'}
                    </Button>

                    <Button
                        onClick={currentStep === 6 ? handleSubmit : nextStep}
                        disabled={
                            isUploading ||
                            (currentStep === 1 ? !isStep1Valid :
                            currentStep === 2 ? !isStep2Valid :
                            currentStep === 3 ? !isStep3Valid :
                            currentStep === 4 ? !isStep4Valid :
                            currentStep === 5 ? !isStep5Valid : false)
                        }
                        style={{ backgroundColor: primaryColor }}
                        className="hover:brightness-95 text-white font-bold px-8 h-10 shadow-md active:scale-95 transition-all"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : currentStep === 6 ? (
                            isResubmission ? 'Resubmit Verification' : 'Submit Verification'
                        ) : currentStep === 5 ? (
                            'Review All'
                        ) : (
                            'Next Step'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
