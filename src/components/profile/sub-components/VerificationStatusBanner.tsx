"use client"

import React from 'react'
import { Shield, AlertCircle, ShieldCheck, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { VerificationStatus } from '@/utils/verification/statusHelpers'
import { useThemeSettings } from "@/hooks/theme-settings"

interface VerificationStatusBannerProps {
    status: VerificationStatus;
    onResubmit?: () => void;
    rejectionReason?: string;
    lastSubmissionDate?: string;
}

export const VerificationStatusBanner: React.FC<VerificationStatusBannerProps> = ({ 
    status, 
    onResubmit,
    rejectionReason,
    lastSubmissionDate
}) => {
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primary || '#2563eb';
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000); // Update every 10 seconds
        return () => clearInterval(timer);
    }, []);

    const getRemainingTime = () => {
        // Only apply 24-hour check for pending and under_review
        const needsTimingCheck = status === 'pending' || status === 'under_review';
        if (!lastSubmissionDate || !needsTimingCheck) return { canResubmit: true, message: "" };
        
        const lastDate = new Date(lastSubmissionDate);
        const diffMs = currentTime.getTime() - lastDate.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);
        
        if (diffHrs >= 24) return { canResubmit: true, message: "" };
        
        const totalRemainingMs = (24 * 60 * 60 * 1000) - diffMs;
        const remainingHrs = Math.floor(totalRemainingMs / (1000 * 60 * 60));
        const remainingMins = Math.floor((totalRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const remainingSecs = Math.floor((totalRemainingMs % (1000 * 60)) / 1000);
        
        // Show seconds if less than a minute remaining
        if (remainingHrs === 0 && remainingMins === 0) {
            return {
                canResubmit: false,
                message: `You can resubmit in ${remainingSecs}s.`
            };
        }

        return { 
            canResubmit: false, 
            message: `You can resubmit in ${remainingHrs}h ${remainingMins}m.` 
        };
    };

    const { canResubmit, message: timingMessage } = getRemainingTime();
    
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
                    <div className="space-y-2">
                        <Button 
                            onClick={onResubmit} 
                            variant="destructive"
                        >
                            Resubmit Verification
                        </Button>
                    </div>
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
                        Your identity has been verified. You can now enjoy faster check-ins and a smoother travel experience.
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
                    
                    { canResubmit && (
                    <p className="text-sm mt-1" style={isUnderReview ? { color: primaryColor } : { color: '#a16207' }}>
                        Review is taking longer than expected. You may resubmit if you need to update your info.
                    </p>
                    )}
                    
                    {onResubmit && (
                        <div className="mt-4 flex flex-col gap-2 items-start">
                            <Button 
                                size="sm" 
                                className="h-8 text-xs font-medium"
                                onClick={onResubmit}
                                disabled={!canResubmit}
                            >
                                Resubmit Request
                            </Button>
                            {!canResubmit && (
                                <p className="text-[11px] font-medium" style={isUnderReview ? { color: primaryColor } : { color: '#a16207' }}>
                                    {timingMessage}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (status === 'expired') {
        return (
            <div className="text-center py-6 space-y-4">
                <Clock className="h-12 w-12 text-gray-400 mx-auto" />
                <div className="space-y-1">
                    <p className="text-lg font-semibold text-slate-900">Verification Expired</p>
                    <p className="text-sm text-muted-foreground">Your verification has expired. Please resubmit your documents to stay verified.</p>
                </div>
                {onResubmit && (
                    <Button onClick={onResubmit}>
                        Resubmit Verification
                    </Button>
                )}
                {rejectionReason && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-slate-600 max-w-md mx-auto">
                        <strong>Notes:</strong> {rejectionReason}
                    </div>
                )}
            </div>
        );
    }

    return null;
};
