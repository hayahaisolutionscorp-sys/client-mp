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
import { Shield, ShieldCheck, AlertCircle } from "lucide-react"
import Image from "next/image"
import { AuthService, getVerificationsByUser, cancelVerificationRequest } from "@/services"
import ProfileVerificationForm from "./ProfileVerificationForm"
import { IDependent, IVerification } from "@/models"
import { cn } from "@/lib/utils"

type VerificationStatus = "unverified" | "pending" | "verified"

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
    onRefresh?: () => void;
}

export default function VerificationTab({ accountId, verificationDetails = [], onStatusChange, onRefresh }: VerificationComponentProps) {
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("unverified");
    const [activeDetails, setActiveDetails] = useState<VerificationDetails>({
        govId: '',
        idNumber: '',
        discountType: ''
    });
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    // Check if 48 hours have passed since the last verification request
    const lastVerification = verificationDetails?.[0];
    const isUnderCooldown = lastVerification?.created_at && 
        (new Date().getTime() - new Date(lastVerification.created_at).getTime()) < 48 * 60 * 60 * 1000;

    const canStartVerification = verificationStatus === "unverified" || (!isUnderCooldown && verificationStatus !== "verified");

    useEffect(() => {
        if (verificationDetails && verificationDetails.length > 0) {
            const active = verificationDetails[0];
            const status = active.status;
            let newStatus: VerificationStatus = 'unverified';
            if (status === 'approved') {
                newStatus = 'verified';
            } else if (status === 'pending' || status === 'under_review') {
                newStatus = 'pending';
            }
            
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

    const handleVerificationFormSubmit = (formData: any) => {
        setVerificationStatus("pending");
        onStatusChange?.("pending");
        onRefresh?.();
    };

    const handleCancelVerification = async () => {
        const lastVerification = verificationDetails?.[0];
        if (!lastVerification?.id) return;
        setIsCanceling(true);
        try {
            await cancelVerificationRequest(lastVerification.id);
            onRefresh?.();
        } catch (error) {
            console.error("Failed to cancel verification:", error);
        } finally {
            setIsCanceling(false);
        }
    };

    const getStatusColor = (status: VerificationStatus): string => {
        const statusColors = {
            verified: "bg-green-500 text-white",
            pending: "bg-yellow-500 text-white",
            unverified: "bg-gray-500 text-white"
        }
        return statusColors[status]
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>Identity Verification</CardTitle>
                        <CardDescription>Verify your identity for special discounts (Senior, Student, PWD).</CardDescription>
                    </div>
                    <Badge className={getStatusColor(verificationStatus)}>
                        {verificationStatus.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {verificationStatus === "unverified" && (
                    <div className="text-center py-6 space-y-4">
                        <Shield className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="text-muted-foreground">Your account is currently unverified.</p>
                        <Button 
                            onClick={() => setShowVerificationForm(true)}
                            disabled={!canStartVerification}
                        >
                            Start Verification
                        </Button>
                        {!canStartVerification && isUnderCooldown && (
                            <p className="text-[11px] text-blue-600 italic">
                                Please wait at least 48 hours before resubmitting a request.
                            </p>
                        )}
                    </div>
                )}

                {verificationStatus === "pending" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-4 mb-6">
                        <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold text-yellow-900">Verification Under Review</p>
                            <p className="text-sm text-yellow-700 mt-1">
                                {isUnderCooldown ? (
                                    "We are currently reviewing your documents. This usually takes 24-48 hours. You'll be able to book with discounts once approved."
                                ) : (
                                    "Review is taking longer than expected. You may cancel and resubmit if you need to update your info."
                                )}
                            </p>
                            <div className="mt-4 flex gap-3">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-medium"
                                    onClick={handleCancelVerification}
                                    disabled={isCanceling}
                                >
                                    {isCanceling ? "Canceling..." : "Cancel Request"}
                                </Button>
                                {!isUnderCooldown && (
                                    <Button 
                                        size="sm" 
                                        className="h-8 text-xs font-medium"
                                        onClick={() => {
                                            handleCancelVerification().then(() => setShowVerificationForm(true));
                                        }}
                                        disabled={isCanceling}
                                    >
                                        Resubmit Request
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {verificationStatus === "verified" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start gap-4 mb-6">
                        <ShieldCheck className="h-6 w-6 text-green-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-green-900">Account Verified</p>
                            <p className="text-sm text-green-700 mt-1">
                                Your identity has been verified. You can now enjoy discounted ferry rates.
                            </p>
                        </div>
                    </div>
                )}

                {(verificationStatus === "verified" || verificationStatus === "pending") && (
                    <div className="space-y-6">
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

                        {(activeDetails.frontImageUrl || activeDetails.backImageUrl || activeDetails.selfieUrl) && (
                            <div className="pt-6 border-t font-inter">
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

                        {verificationDetails.length > 1 && (
                            <div className="pt-6 border-t font-inter">
                                <p className="text-sm font-semibold text-slate-900 mb-4">Verification History</p>
                                <div className="space-y-3">
                                    {verificationDetails.slice(1).map((v, i) => (
                                        <div key={v.id || i} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-800">{v.id_type}</span>
                                                <span className="text-xs text-slate-500">{v.id_number} • {v.created_at ? new Date(v.created_at).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <Badge variant="outline" className={cn("text-[10px] h-5", 
                                                v.status === 'approved' ? "bg-green-100 text-green-700 border-green-200" :
                                                v.status === 'rejected' ? "bg-red-100 text-red-700 border-red-200" :
                                                "bg-yellow-100 text-yellow-700 border-yellow-200"
                                            )}>
                                                {v.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {showVerificationForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <CardContent className="p-0">
                                <ProfileVerificationForm
                                    onSubmit={handleVerificationFormSubmit}
                                    onCancel={() => setShowVerificationForm(false)}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
