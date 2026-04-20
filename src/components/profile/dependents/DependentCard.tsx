"use client"

import { useState, useEffect } from "react"
import { IDependent } from "@/models"
import { Badge } from "../../ui/Badge"
import { Button } from "../../ui/Button"
import { 
    MoreVertical, 
    Edit2, 
    Trash2, 
    User,
    Check,
    History,
    Shield,
    ShieldCheck,
    Clock,
    Loader2
} from "lucide-react"
import { getStatusBadge, getStatusVariant, VerificationStatus } from "@/utils/verification/statusHelpers"
import { cn } from "@/lib/utils"
import { deleteDependent, cancelVerificationRequest } from "@/services"
import DependentForm from "./CreateDependentForm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/Card"
import { DependentDetailsGrid } from "../sub-components/DependentDetailsGrid"
import { VerificationHistory } from "../sub-components/VerificationHistory"
import { useThemeSettings } from "@/hooks/theme-settings"

interface DependentCardProps {
    dependent: IDependent;
    onRequestVerification: (dependent: IDependent) => void;
    onRefresh: () => void;
    onUpdateSuccess: (dependent: IDependent) => void;
}

const calculateAge = (birthday: string): number => {
    const today = new Date();
    const birth = new Date(birthday);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export default function DependentCard({ 
    dependent, 
    onRequestVerification,
    onRefresh,
    onUpdateSuccess
}: DependentCardProps) {
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primary || '#2563eb';
    const accentColor = themeSettings?.accent || '#60a5fa';
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    
    const status = (dependent.status || dependent.verification?.status || 'unverified') as VerificationStatus;
  
    const canRequestVerification = (status === 'unverified' || status === 'rejected' || status === 'expired') 
    
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000); // Update every 10 seconds
        return () => clearInterval(timer);
    }, []);

    const getRemainingTime = () => {
        const needsTimingCheck = status === 'pending' || status === 'under_review';
        const lastSubmissionDate = dependent.verifications?.[0]?.created_at || dependent.verifications?.[0]?.updated_at;
        
        if (!lastSubmissionDate || !needsTimingCheck) return { canResubmit: true, message: "" };
        
        const lastDate = new Date(lastSubmissionDate);
        const diffMs = currentTime.getTime() - lastDate.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);
        
        if (diffHrs >= 24) return { canResubmit: true, message: "" };
        
        const totalRemainingMs = (24 * 60 * 60 * 1000) - diffMs;
        const remainingHrs = Math.floor(totalRemainingMs / (1000 * 60 * 60));
        const remainingMins = Math.floor((totalRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const remainingSecs = Math.floor((totalRemainingMs % (1000 * 60)) / 1000);
        
        if (remainingHrs === 0 && remainingMins === 0) {
            return {
                canResubmit: false,
                message: `Resubmit in ${remainingSecs}s`
            };
        }

        return { 
            canResubmit: false, 
            message: `Resubmit in ${remainingHrs}h ${remainingMins}m` 
        };
    };

    const { canResubmit, message: timingMessage } = getRemainingTime();
    
    const canResubmitIfStuck = (status === 'pending' || status === 'under_review');

    const handleUpdateSuccess = (updated: IDependent) => {
        setShowEditForm(false);
        onUpdateSuccess(updated);
    };

    const age = calculateAge(dependent.birthday);
    const statusConfig = getStatusBadge(status);

    const handleDeleteConfirm = async () => {
        setIsSaving(true);
        try {
            await deleteDependent(dependent.id);
            setShowDeleteDialog(false);
            onRefresh();
        } catch (error) {
            console.error("Failed to delete dependent:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelVerification = async () => {
        if (!dependent.verification?.id) return;
        setIsCanceling(true);
        try {
            await cancelVerificationRequest(dependent.verification.id);
            onRefresh();
        } catch (error) {
            console.error("Failed to cancel verification:", error);
        } finally {
            setIsCanceling(false);
        }
    };

    return (
        <>
            <div className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div 
                    className="p-5 cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-start justify-between gap-4">
                        {/* Left: Avatar and Info */}
                        <div className="flex items-start gap-4 flex-1">
                            <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}20` }}>
                                <User className="h-6 w-6" style={{ color: primaryColor }} />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold text-slate-900 truncate">
                                        {dependent.first_name} {dependent.last_name}
                                    </h3>
                                    <div className="flex gap-2">
                                        <Badge variant={getStatusVariant(status)} className="text-[10px] px-1.5 py-0 h-4">
                                            {statusConfig.icon}
                                            {statusConfig.label}
                                        </Badge>
                                        {dependent.category && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{
                                                borderColor: `${accentColor}40`,
                                                color: primaryColor,
                                                backgroundColor: `${primaryColor}10`
                                            }}>
                                                {dependent.category}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {age} years old
                                    </span>
                                    <span className="capitalize">{dependent.sex}</span>
                                    <span className="text-slate-400">({dependent.relationship})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <DependentDetailsGrid dependent={dependent} />

                        {/* Verification Section */}
                        {dependent.verification && status !== 'unverified' && (
                            <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                                <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" style={{ color: primaryColor }} />
                                    Verification Details
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">ID Type</p>
                                        <p className="text-xs font-medium text-slate-700">{dependent.verification.id_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">ID Number</p>
                                        <p className="text-xs font-medium text-slate-700">{dependent.verification.id_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Country</p>
                                        <p className="text-xs font-medium text-slate-700">{dependent.verification.document_country}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Expiry</p>
                                        <p className="text-xs font-medium text-slate-700">{formatDate(dependent.verification.expiry_date)}</p>
                                    </div>
                                </div>
                                {(status === 'rejected' || status === 'expired') && dependent.verification.review_notes && (
                                    <div className={cn(
                                        "mt-3 p-2 border rounded text-xs",
                                        status === 'rejected' ? "bg-red-100/50 border-red-200 text-red-700" : "bg-gray-100/50 border-gray-200 text-gray-700"
                                    )}>
                                        <strong>{status === 'rejected' ? "Reason:" : "Notes:"}</strong> {dependent.verification.review_notes}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Verification History */}
                        <VerificationHistory verifications={(dependent.verifications || []).slice(1)} />
                    </div>
                )}

                {/* Bottom: Action Buttons */}
                <div className="px-5 py-3 bg-slate-50 border-t flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 font-medium transition-colors"
                            style={{
                                color: primaryColor,
                                borderColor: `${accentColor}40`
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowEditForm(true);
                            }}
                        >
                            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                            Update Info
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-700 h-8 font-medium transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteDialog(true);
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Remove
                        </Button>
                    </div>
                    
                    {canRequestVerification && (
                        <Button 
                            size="sm" 
                            className="h-8 font-medium shadow-sm transition-all text-white"
                            style={{
                                backgroundColor: status === 'rejected' ? '#dc2626' : primaryColor
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRequestVerification(dependent);
                            }}
                        >
                            <Shield className="h-3.5 w-3.5 mr-1.5" />
                            {status === 'rejected' ? 'Resubmit Verification' : 'Verify Identity'}
                        </Button>
                    )}

                    {canResubmitIfStuck && (
                        <div className="flex flex-col items-end gap-1">
                            <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 font-medium transition-all"
                                style={{
                                    borderColor: `${accentColor}40`,
                                    color: primaryColor
                                }}
                                disabled={!canResubmit || isCanceling}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelVerification().then(() => onRequestVerification(dependent));
                                }}
                            >
                                {isCanceling ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <History className="h-3.5 w-3.5 mr-1.5" />
                                        Resubmit Request
                                    </>
                                )}
                            </Button>
                            {!canResubmit && (
                                <span className="text-[10px] font-medium" style={{ color: primaryColor }}>
                                    {timingMessage}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
                        <CardContent className="p-0">
                            <DependentForm
                                userId={dependent.user_id}
                                dependent={dependent}
                                onSuccess={handleUpdateSuccess}
                                onCancel={() => setShowEditForm(false)}
                                isEditing={true}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-destructive">Delete Dependent?</CardTitle>
                            <CardDescription>
                                Are you sure you want to delete <strong>{dependent.first_name} {dependent.last_name}</strong>? 
                                This action cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isSaving}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSaving}>
                                {isSaving ? "Deleting..." : "Delete"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
