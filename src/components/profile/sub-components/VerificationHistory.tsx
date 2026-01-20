"use client"

import React from 'react'
import { History, Calendar, Fingerprint } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { IVerification } from '@/models'
import { getStatusBadge, getStatusVariant, VerificationStatus } from '@/utils/verification/statusHelpers'
import { useThemeSettings } from "@/hooks/theme-settings"

interface VerificationHistoryProps {
    verifications: IVerification[];
    title?: string;
    maxHeight?: string;
}

export const VerificationHistory: React.FC<VerificationHistoryProps> = ({ 
    verifications, 
    title = "Verification History",
    maxHeight = "400px"
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
            <div className={cn("space-y-3 pr-2 no-scrollbar overflow-y-auto")} style={{ maxHeight }}>
                {verifications.map((v, i) => {
                    const statusConfig = getStatusBadge(v.status as VerificationStatus);
                    return (
                        <div key={v.id || i} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-200 transition-colors text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-800">{v.id_type}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {v.created_at ? formatDate(v.created_at) : 'N/A'}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-mono">• {v.id_number}</span>
                                    </div>
                                </div>
                                <Badge variant={getStatusVariant(v.status as VerificationStatus)} className="text-[10px] h-5 whitespace-nowrap">
                                    {statusConfig.icon}
                                    {statusConfig.label}
                                </Badge>
                            </div>
                            {v.status === 'rejected' && v.review_notes && (
                                <div className="mt-2 text-[11px] text-red-600 bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                                    <p className="font-semibold mb-0.5">Rejection Reason:</p>
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
