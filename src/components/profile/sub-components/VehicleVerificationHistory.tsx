"use client"

import React from 'react'
import { History, Calendar, FileText, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { IVehicleVerification } from '@/models'
import { getStatusBadge, getStatusVariant, VerificationStatus } from '@/utils/verification/statusHelpers'
import { useThemeSettings } from "@/hooks/theme-settings"
import { SecureImage } from "@/components/ui/SecureImage"

interface VehicleVerificationHistoryProps {
    verifications: IVehicleVerification[];
    title?: string;
    maxHeight?: string;
}

export const VehicleVerificationHistory: React.FC<VehicleVerificationHistoryProps> = ({ 
    verifications, 
    title = "Verification History",
    maxHeight = "500px"
}) => {
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primary || '#2563eb';
    
    if (!verifications || verifications.length === 0) return null;

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-slate-900">
                <History className="h-4 w-4" style={{ color: primaryColor }} />
                <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            <div className={cn("space-y-4 pr-2 no-scrollbar overflow-y-auto")} style={{ maxHeight }}>
                {verifications.map((v, i) => {
                    const statusConfig = getStatusBadge(v.status as VerificationStatus);
                    return (
                        <div key={v.id || i} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-200 transition-colors text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-800">Attempt #{v.attempt_number}</span>
                                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                        <Calendar className="h-3 w-3" />
                                        {v.created_at ? formatDate(v.created_at) : 'N/A'}
                                    </span>
                                </div>
                                <Badge variant={getStatusVariant(v.status as VerificationStatus)} className="text-[10px] h-5 whitespace-nowrap">
                                    {statusConfig.icon}
                                    {statusConfig.label}
                                </Badge>
                            </div>

                            {/* Documents Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                        <FileText className="h-2.5 w-2.5" />
                                        Official Receipt
                                    </p>
                                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                        <SecureImage 
                                            src={v.official_receipt_url} 
                                            alt="OR" 
                                            fill 
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                        <FileText className="h-2.5 w-2.5" />
                                        Certificate of Registration
                                    </p>
                                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                        <SecureImage 
                                            src={v.certificate_of_registration_url} 
                                            alt="CR" 
                                            fill 
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                {v.front_vehicle_url && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                            <ImageIcon className="h-2.5 w-2.5" />
                                            Front View
                                        </p>
                                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                            <SecureImage 
                                                src={v.front_vehicle_url} 
                                                alt="Front View" 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                                {v.rear_vehicle_url && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                            <ImageIcon className="h-2.5 w-2.5" />
                                            Rear View
                                        </p>
                                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                            <SecureImage 
                                                src={v.rear_vehicle_url} 
                                                alt="Rear View" 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                                {v.left_vehicle_url && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                            <ImageIcon className="h-2.5 w-2.5" />
                                            Left View
                                        </p>
                                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                            <SecureImage 
                                                src={v.left_vehicle_url} 
                                                alt="Left View" 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                                {v.right_vehicle_url && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                            <ImageIcon className="h-2.5 w-2.5" />
                                            Right View
                                        </p>
                                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                            <SecureImage 
                                                src={v.right_vehicle_url} 
                                                alt="Right View" 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {v.review_notes && (v.status === 'rejected' || v.status === 'expired') && (
                                <div className={cn(
                                    "mt-2 text-[11px] p-2 rounded-lg border",
                                    v.status === 'rejected' ? "text-red-600 bg-red-50/50 border-red-100/50" : "text-gray-600 bg-gray-50/50 border-gray-100/50"
                                )}>
                                    <p className="font-semibold mb-0.5">{v.status === 'rejected' ? "Rejection Reason:" : "Notes:"}</p>
                                    <p className="leading-relaxed">{v.review_notes}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
