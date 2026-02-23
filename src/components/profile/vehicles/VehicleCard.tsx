import { useState } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { 
    Car, 
    MoreVertical, 
    Shield, 
    Trash2, 
    Edit2, 
    AlertCircle, 
    ChevronDown, 
    ChevronUp, 
    FileText, 
    Image as ImageIcon,
    ShieldCheck
} from "lucide-react"
import { IVehicle, IVehicleType } from "@/models"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { 
    getStatusBadge, 
    getStatusVariant,
    VerificationStatus 
} from "@/utils/verification/statusHelpers"
import { cn } from "@/lib/utils"
import { useThemeSettings } from "@/hooks/theme-settings"
import { SecureImage } from "@/components/ui/SecureImage"
import { VehicleVerificationHistory } from "../sub-components/VehicleVerificationHistory"

interface VehicleCardProps {
    vehicle: IVehicle;
    vehicleTypes?: IVehicleType[];
    onEdit: (vehicle: IVehicle) => void;
    onDelete: (id: string) => void;
    onRequestVerification: (vehicle: IVehicle) => void;
}

export default function VehicleCard({ vehicle, vehicleTypes, onEdit, onDelete, onRequestVerification }: VehicleCardProps) {
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primary || '#2563eb';
    const accentColor = themeSettings?.accent || '#60a5fa';

    const [isExpanded, setIsExpanded] = useState(false);
    
    const status = (vehicle.status || 'unverified') as VerificationStatus;
    const statusInfo = getStatusBadge(status);
    const latestVerification = vehicle.verifications?.[0];

    const canRequestVerification = status === 'unverified' || status === 'rejected' || status === 'expired';

    const manualTypeName = vehicleTypes?.find(t => t.id === vehicle.vehicle_type_id)?.name;
    const typeName = vehicle.vehicle_model?.vehicle_type?.name || manualTypeName || "Unknown Type";
    const make = vehicle.vehicle_model?.make || vehicle.make || "Unknown Make";
    const model = vehicle.vehicle_model?.model || vehicle.model || "Unknown Model";

    return (
        <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
                <div 
                    className="flex items-center p-4 gap-4 cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 flex-shrink-0" style={{ backgroundColor: isExpanded ? `${primaryColor}15` : undefined }}>
                        <Car className="h-6 w-6" style={{ color: isExpanded ? primaryColor : undefined }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900 truncate">
                                {vehicle.plate_number}
                            </h4>
                            <Badge variant={getStatusVariant(status)} className="text-[10px] px-1.5 py-0 h-5">
                                {statusInfo.icon}
                                <span className="ml-1">{statusInfo.label.toUpperCase()}</span>
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                            <span className="font-medium">{make}</span>
                            <span>•</span>
                            <span>{model}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{typeName}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {canRequestVerification && (
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="hidden sm:flex text-primary border-primary/20 hover:bg-primary/5 h-8 gap-1.5"
                                style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRequestVerification(vehicle);
                                }}
                            >
                                <Shield className="h-3.5 w-3.5" />
                                Verify
                            </Button>
                        )}

                        <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {canRequestVerification && (
                                        <DropdownMenuItem className="sm:hidden" onClick={() => onRequestVerification(vehicle)}>
                                            <Shield className="mr-2 h-4 w-4" />
                                            Verify Vehicle
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDelete(vehicle.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Vehicle
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        
                        <div className="text-slate-400 ml-1">
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="px-4 pb-5 border-t border-slate-50 pt-5 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Latest Verification Details */}
                        {latestVerification && status !== 'unverified' ? (
                            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                                <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" style={{ color: primaryColor }} />
                                    Latest Verification Details
                                </p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                            <FileText className="h-2.5 w-2.5" />
                                            Official Receipt
                                        </p>
                                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-white">
                                            <SecureImage 
                                                src={latestVerification.official_receipt_url} 
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
                                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-white">
                                            <SecureImage 
                                                src={latestVerification.certificate_of_registration_url} 
                                                alt="CR" 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                    {latestVerification.front_vehicle_url && (
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                                <ImageIcon className="h-2.5 w-2.5" />
                                                Front View
                                            </p>
                                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                <SecureImage 
                                                    src={latestVerification.front_vehicle_url} 
                                                    alt="Front" 
                                                    fill 
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {latestVerification.rear_vehicle_url && (
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                                <ImageIcon className="h-2.5 w-2.5" />
                                                Rear View
                                            </p>
                                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                <SecureImage 
                                                    src={latestVerification.rear_vehicle_url} 
                                                    alt="Rear" 
                                                    fill 
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {latestVerification.left_vehicle_url && (
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                                <ImageIcon className="h-2.5 w-2.5" />
                                                Left View
                                            </p>
                                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                <SecureImage 
                                                    src={latestVerification.left_vehicle_url} 
                                                    alt="Left" 
                                                    fill 
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {latestVerification.right_vehicle_url && (
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                                <ImageIcon className="h-2.5 w-2.5" />
                                                Right View
                                            </p>
                                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                <SecureImage 
                                                    src={latestVerification.right_vehicle_url} 
                                                    alt="Right" 
                                                    fill 
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {latestVerification.review_notes && (status === 'rejected' || status === 'expired') && (
                                    <div className={cn(
                                        "mt-4 text-xs p-3 rounded-lg border",
                                        status === 'rejected' ? "text-red-700 bg-red-50 border-red-100" : "text-gray-700 bg-gray-50 border-gray-100"
                                    )}>
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-bold mb-0.5">{status === 'rejected' ? "Rejection Reason:" : "Notes:"}</p>
                                                <p className="leading-relaxed">{latestVerification.review_notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {status === 'pending' && (
                                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2 text-xs text-blue-700">
                                        <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                                        <p>Verification request submitted on {new Date(latestVerification.created_at).toLocaleDateString()}. Our team is currently reviewing your documents.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Shield className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-sm text-slate-500 font-medium">No verification documents submitted yet</p>
                                <Button 
                                    variant="link" 
                                    className="text-primary text-xs h-auto p-0 mt-1"
                                    style={{ color: primaryColor }}
                                    onClick={() => onRequestVerification(vehicle)}
                                >
                                    Submit documents for verification
                                </Button>
                            </div>
                        )}

                        {/* Verification History */}
                        <VehicleVerificationHistory verifications={(vehicle.verifications || []).slice(1)} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

