"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card"
import Image from "next/image"
import { cancelVerificationRequest, getVerificationsByUser } from "@/services"
import ProfileVerificationForm from "../verification/ProfileVerificationForm"
import { IDependent, IVerification } from "@/models"
import { cn } from "@/lib/utils"
import { VerificationHistory } from "../sub-components/VerificationHistory"
import { VerificationStatusBanner } from "../sub-components/VerificationStatusBanner"
import { useThemeSettings } from "@/hooks/theme-settings"
import { 
    VerificationStatus,
    getStatusDisplayText,
    getStatusBadge,
    getStatusVariant
} from "@/utils/verification/statusHelpers"


interface VerificationDetails {
    govId: string;
    idNumber: string;
    discountType: string;
    frontImageUrl?: string;
    backImageUrl?: string;
    selfieUrl?: string;
}

interface VerificationComponentProps {
    accountId: string;
    verificationDetails?: IVerification[];
    onStatusChange?: (status: VerificationStatus) => void;
    onRefresh?: () => void; // Optional now since we can handle it locally
}

export default function VerificationTab({ accountId, verificationDetails: initialVerificationDetails = [], onStatusChange, onRefresh }: VerificationComponentProps) {
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primary || '#2563eb';
    
    const [verificationDetails, setVerificationDetails] = useState<IVerification[]>(initialVerificationDetails);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("unverified");
    const [activeDetails, setActiveDetails] = useState<VerificationDetails>({
        govId: '',
        idNumber: '',
        discountType: ''
    });
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    const lastVerification = verificationDetails?.[0];
   
    useEffect(() => {
        if (verificationDetails && verificationDetails.length > 0) {
            const active = verificationDetails[0];
            const status = active.status;
            let newStatus: VerificationStatus = active.status as VerificationStatus;
            setVerificationStatus(newStatus);
            onStatusChange?.(newStatus);

            setActiveDetails({
                govId: active.id_type || '',
                idNumber: active.id_number || '',
                discountType: '', // This should ideally come from passenger data, but for tab we show ID info
                frontImageUrl: active.front_image_url,
                backImageUrl: active.back_image_url,
                selfieUrl: active.selfie_url
            });
        } else {
            setVerificationStatus('unverified');
            onStatusChange?.('unverified');
        }
    }, [verificationDetails]);

    // Local refresh handler
    const refreshVerifications = async () => {
        try {
            const freshVerifications = await getVerificationsByUser(accountId);
            setVerificationDetails(freshVerifications);
            // Also call parent refresh if provided
            onRefresh?.();
        } catch (error) {
            if (typeof window === 'undefined') {
                console.error("Failed to refresh verifications:", error);
            }
        }
    };

    const handleVerificationFormSubmit = async (formData: any) => {
        setVerificationStatus("pending");
        onStatusChange?.("pending");
        await refreshVerifications();
        
        // Close modal after a delay to show success message
        setTimeout(() => {
            setShowVerificationForm(false);
        }, 2000);
    };

    const handleCancelVerification = async () => {
        const lastVerification = verificationDetails?.[0];
        if (!lastVerification?.id) return;
        setIsCanceling(true);
        try {
            await cancelVerificationRequest(lastVerification.id);
            await refreshVerifications();
        } catch (error) {
            if (typeof window === 'undefined') {
                console.error("Failed to cancel verification:", error);
            }
        } finally {
            setIsCanceling(false);
        }
    };



    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>Identity Verification</CardTitle>
                        <CardDescription>Verify your identity for faster check-ins and a smoother travel experience.</CardDescription>
                    </div>
                    <Badge 
                        variant={getStatusVariant(verificationStatus)} 
                        className="px-3 py-1"
                        style={verificationStatus === 'approved' ? { backgroundColor: primaryColor, color: 'white' } : { backgroundColor: 'grey', color: 'white' }}
                    >
                        {getStatusBadge(verificationStatus).label.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <VerificationStatusBanner 
                    status={verificationStatus}
                    onResubmit={() => setShowVerificationForm(true)}
                    rejectionReason={lastVerification?.review_notes ?? undefined}
                    lastSubmissionDate={lastVerification?.created_at}
                />

                {(verificationStatus === "approved" || verificationStatus === "pending" || verificationStatus === "under_review" || verificationStatus === "rejected") && (
                    <div className="space-y-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50 rounded-lg border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ID Type</p>
                                <p className="font-medium text-slate-700">{activeDetails.govId}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ID Number</p>
                                <p className="font-medium text-slate-700">{activeDetails.idNumber}</p>
                            </div>
                        </div>
                    </div>
                )}

                {(activeDetails.frontImageUrl || activeDetails.backImageUrl || activeDetails.selfieUrl) && (
                    <div className="pt-6 border-t font-inter mb-8">
                        <p className="text-sm font-semibold text-slate-900 mb-4">Latest Documents</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {activeDetails.frontImageUrl && (
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-500">ID Front</p>
                                    <div className="relative aspect-[3/2] rounded-lg overflow-hidden border bg-slate-100">
                                        <Image 
                                            src={activeDetails.frontImageUrl} 
                                            alt="ID Front" 
                                            fill 
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            )}
                            {activeDetails.backImageUrl && (
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-500">ID Back</p>
                                    <div className="relative aspect-[3/2] rounded-lg overflow-hidden border bg-slate-100">
                                        <Image 
                                            src={activeDetails.backImageUrl} 
                                            alt="ID Back" 
                                            fill 
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            )}
                            {activeDetails.selfieUrl && (
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-500">Verification Selfie</p>
                                    <div className="relative aspect-[3/2] rounded-lg overflow-hidden border bg-slate-100">
                                        <Image 
                                            src={activeDetails.selfieUrl} 
                                            alt="Selfie" 
                                            fill 
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* History Section */}
                <VerificationHistory 
                    verifications={verificationDetails.slice(1)} 
                    title="Verification History"
                />


                {showVerificationForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
                            <CardContent className="p-0">
                                <ProfileVerificationForm
                                    onSubmit={handleVerificationFormSubmit}
                                    onCancel={() => setShowVerificationForm(false)}
                                    initialData={lastVerification}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
