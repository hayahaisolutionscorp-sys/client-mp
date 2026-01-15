"use client"

import React from 'react'
import { Shield, AlertCircle, ShieldCheck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { VerificationStatus } from '@/utils/verification/statusHelpers'
import { useThemeSettings } from "@/hooks/theme-settings"

interface VerificationStatusBannerProps {
    status: VerificationStatus;
    isUnderCooldown: boolean;
    onResubmit?: () => void;
    rejectionReason?: string;
}

export const VerificationStatusBanner: React.FC<VerificationStatusBannerProps> = ({ 
    status, 
    isUnderCooldown,
    onResubmit,
    rejectionReason
}) => {
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primary || '#2563eb';
    
    if (status === 'unverified') {
        return (
            <div className="text-center py-6 space-y-4">
                <Shield className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="text-muted-foreground">Your account is currently unverified.</p>
                {onResubmit && (
                    <Button onClick={onResubmit}>
                        Start Verification
                    </Button>
                )}
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="text-center py-6 space-y-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                <p className="text-muted-foreground">Your verification request was rejected.</p>
                {onResubmit && (
                    <Button 
                        onClick={onResubmit} 
                        disabled={isUnderCooldown}
                        variant="destructive"
                    >
                        Resubmit Verification
                    </Button>
                )}
                {isUnderCooldown && (
                    <p className="text-[11px] italic" style={{ color: primaryColor }}>
                        Please wait at least 48 hours before resubmitting a request.
                    </p>
                )}
                {rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 max-w-md mx-auto">
                        <strong>Rejection Reason:</strong> {rejectionReason}
                    </div>
                )}
            </div>
        );
    }

    if (status === 'approved') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start gap-4 mb-6">
                <ShieldCheck className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                    <p className="font-semibold text-green-900">Account Verified</p>
                    <p className="text-sm text-green-700 mt-1">
                        Your identity has been verified. You can now enjoy faster check-ins and a smoother booking process.
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'pending' || status === 'under_review') {
        const isUnderReview = status === 'under_review';
        return (
            <div className={cn(
                "rounded-lg p-6 flex items-start gap-4 mb-6 border"
            )} style={isUnderReview ? {
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}40`
            } : {
                backgroundColor: '#fef9c3',
                borderColor: '#fde047'
            }}>
                {isUnderReview ? (
                    <Shield className="h-6 w-6 mt-0.5" style={{ color: primaryColor }} />
                ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                )}
                <div className="flex-1">
                    <p className="font-semibold" style={isUnderReview ? { color: primaryColor } : { color: '#713f12' }}>
                        {isUnderReview ? "Verification Under Review" : "Verification Pending"}
                    </p>
                    <p className="text-sm mt-1" style={isUnderReview ? { color: primaryColor } : { color: '#a16207' }}>
                        {isUnderCooldown ? (
                            "We are currently reviewing your documents. This usually takes 24-48 hours. You'll be able to enjoy faster check-ins once approved."
                        ) : (
                            "Review is taking longer than expected. You may resubmit if you need to update your info."
                        )}
                    </p>
                    {!isUnderCooldown && onResubmit && (
                        <div className="mt-4 flex gap-3">
                            <Button 
                                size="sm" 
                                className="h-8 text-xs font-medium"
                                onClick={onResubmit}
                            >
                                Resubmit Request
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};
