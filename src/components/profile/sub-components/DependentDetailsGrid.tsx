"use client"

import React from 'react'
import { IDependent } from '@/models'

interface DependentDetailsGridProps {
    dependent: IDependent;
}

export const DependentDetailsGrid: React.FC<DependentDetailsGridProps> = ({ dependent }) => {
    return (
        <div className="pt-5 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Nationality</p>
                    <p className="text-sm text-slate-700">{dependent.nationality}</p>
                </div>
                <div className="mt-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Civil Status</p>
                    <p className="text-sm text-slate-700 capitalize">{dependent.civil_status}</p>
                </div>
            </div>
            <div>
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Occupation</p>
                    <p className="text-sm text-slate-700">{dependent.occupation || 'N/A'}</p>
                </div>
                <div className="mt-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Contact</p>
                    <p className="text-sm text-slate-700">{dependent.phone}</p>
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
    );
};
