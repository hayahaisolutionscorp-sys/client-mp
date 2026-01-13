"use client"

import { useState } from "react"
import { IDependent, DependentVerificationStatus as VerificationStatus } from "@/models"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { 
    MoreVertical, 
    Edit2, 
    Trash2, 
    ShieldCheck, 
    Shield, 
    AlertCircle, 
    Clock, 
    XCircle,
    User,
    Check,
    History
} from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteDependent, cancelVerificationRequest } from "@/services"
import DependentForm from "./CreateDependentForm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/Card"

interface DependentCardProps {
    dependent: IDependent;
    onRequestVerification: (dependent: IDependent) => void;
    onRefresh: () => void;
}



const getVerificationStatus = (dependent: IDependent): VerificationStatus => {
    if (!dependent.verificationStatus) return 'unverified';
    return dependent.verificationStatus;
};

const getStatusBadge = (status: VerificationStatus) => {
    const configs: Record<VerificationStatus, { label: string; className: string; icon: React.ReactNode }> = {
        approved: {
            label: "Verified",
            className: "bg-green-500 text-white",
            icon: <ShieldCheck className="h-3 w-3 mr-1" />
        },
        pending: {
            label: "Pending",
            className: "bg-yellow-500 text-white",
            icon: <Clock className="h-3 w-3 mr-1" />
        },
        under_review: {
            label: "Under Review",
            className: "bg-blue-500 text-white",
            icon: <AlertCircle className="h-3 w-3 mr-1" />
        },
        rejected: {
            label: "Rejected",
            className: "bg-red-500 text-white",
            icon: <XCircle className="h-3 w-3 mr-1" />
        },
        expired: {
            label: "Expired",
            className: "bg-gray-500 text-white",
            icon: <AlertCircle className="h-3 w-3 mr-1" />
        },
        unverified: {
            label: "Unverified",
            className: "bg-gray-400 text-white",
            icon: <Shield className="h-3 w-3 mr-1" />
        }
    };
    return configs[status];
};

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
    onRefresh
}: DependentCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    
    const status = getVerificationStatus(dependent);
    
    // Check if 48 hours have passed since the last verification request
    const lastVerification = dependent.verification || (dependent.verifications && dependent.verifications[0]);
    const isUnderCooldown = lastVerification?.created_at && 
        (new Date().getTime() - new Date(lastVerification.created_at).getTime()) < 48 * 60 * 60 * 1000;
    
    const canRequestVerification = (status === 'unverified' || status === 'rejected' || status === 'expired') && 
        (!isUnderCooldown || status === 'unverified');

    const canResubmitIfStuck = (status === 'pending' || status === 'under_review') && !isUnderCooldown;

    const handleUpdateSuccess = () => {
        setShowEditForm(false);
        onRefresh();
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
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold text-slate-900 truncate">
                                        {dependent.first_name} {dependent.last_name}
                                    </h3>
                                    <div className="flex gap-2">
                                        <Badge className={cn("text-[10px] px-1.5 py-0 h-4", statusConfig.className)}>
                                            {statusConfig.icon}
                                            {statusConfig.label}
                                        </Badge>
                                        {dependent.category && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-blue-200 text-blue-700 bg-blue-50">
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
                                    <span className="capitalize">{dependent.gender}</span>
                                    <span className="text-slate-400">({dependent.relationship})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="pt-5 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Nationality</p>
                                    <p className="text-sm text-slate-700">{dependent.nationality}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Civil Status</p>
                                    <p className="text-sm text-slate-700 capitalize">{dependent.civil_status}</p>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Occupation</p>
                                    <p className="text-sm text-slate-700">{dependent.occupation || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Contact</p>
                                    <p className="text-sm text-slate-700">{dependent.mobile_number}</p>
                                    {dependent.email && <p className="text-xs text-slate-500 mt-1">{dependent.email}</p>}
                                </div>
                            </div>
                            <div className="md:col-span-2 lg:col-span-1">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Address</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{dependent.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Verification Section */}
                        {dependent.verification && status !== 'unverified' && (
                            <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                                <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-blue-600" />
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
                                {status === 'rejected' && dependent.verification.rejection_reason && (
                                    <div className="mt-3 p-2 bg-red-100/50 border border-red-200 rounded text-xs text-red-700">
                                        <strong>Reason:</strong> {dependent.verification.rejection_reason}
                                    </div>
                                )}

                                {(status === 'pending' || status === 'under_review') && (
                                    <div className="mt-4 flex flex-col gap-3">
                                        <div className="p-2 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-700 italic">
                                            {isUnderCooldown ? (
                                                "Your request is being reviewed. Please wait at least 48 hours before resubmitting if you encounter issues."
                                            ) : (
                                                "Review is taking longer than expected. You may cancel and resubmit if necessary."
                                            )}
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-7 text-[10px] text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancelVerification();
                                            }}
                                            disabled={isCanceling}
                                        >
                                            {isCanceling ? "Canceling..." : "Cancel Request"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Verification History */}
                        {dependent.verifications && dependent.verifications.length > 0 && (
                            <div className="mt-6 pt-6 border-t">
                                <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <History className="h-4 w-4 text-blue-600" />
                                    Verification History
                                </p>
                                <div className="space-y-3">
                                    {dependent.verifications.map((v, i) => {
                                        const vStatusConfig = getStatusBadge(v.status);
                                        return (
                                            <div key={v.id || i} className="flex items-center justify-between p-3 rounded-lg border bg-white text-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800">{v.id_type}</span>
                                                    <span className="text-xs text-slate-500">{v.id_number} • {v.created_at ? formatDate(v.created_at) : 'N/A'}</span>
                                                </div>
                                                <Badge className={cn("text-[10px] h-5", vStatusConfig.className)}>
                                                    {vStatusConfig.icon}
                                                    {vStatusConfig.label}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom: Action Buttons */}
                <div className="px-5 py-3 bg-slate-50 border-t flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 h-8 font-medium transition-colors"
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
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRequestVerification(dependent);
                            }}
                        >
                            <Shield className="h-3.5 w-3.5 mr-1.5" />
                            Verify Identity
                        </Button>
                    )}

                    {canResubmitIfStuck && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 font-medium transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCancelVerification().then(() => onRequestVerification(dependent));
                            }}
                        >
                            <History className="h-3.5 w-3.5 mr-1.5" />
                            Resubmit Request
                        </Button>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
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
