"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Shield, ShieldCheck, AlertCircle, Users, ExternalLink, ArrowRight } from "lucide-react"
import { IDependent, IVerification } from "@/models"
import { cn } from "@/lib/utils"

interface ProfileOverviewProps {
    verificationStatus: 'unverified' | 'pending' | 'verified';
    verificationDetails?: IVerification[];
    dependents: IDependent[];
    onTabChange: (tab: string) => void;
}

export default function ProfileOverview({ 
    verificationStatus, 
    verificationDetails, 
    dependents,
    onTabChange 
}: ProfileOverviewProps) {
    
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
            case 'approved':
                return { label: "Verified", className: "bg-green-500 text-white", icon: <ShieldCheck className="h-3 w-3 mr-1" /> };
            case 'pending':
            case 'under_review':
                return { label: "Pending", className: "bg-yellow-500 text-white", icon: <AlertCircle className="h-3 w-3 mr-1" /> };
            default:
                return { label: "Unverified", className: "bg-gray-500 text-white", icon: <Shield className="h-3 w-3 mr-1" /> };
        }
    };

    const accountStatus = getStatusBadge(verificationStatus);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Verification Summary */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onTabChange("verification")}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-0.5">
                            <CardTitle className="text-lg">Account Verification</CardTitle>
                            <CardDescription>Your current identity status</CardDescription>
                        </div>
                        <Badge className={cn("text-xs px-2 py-0.5", accountStatus.className)}>
                            {accountStatus.icon}
                            {accountStatus.label}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        {verificationStatus !== 'unverified' && verificationDetails && verificationDetails.length > 0 ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">ID Type</p>
                                        <p className="text-sm font-medium">{verificationDetails[0].id_type}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">ID Number</p>
                                        <p className="text-sm font-medium">{verificationDetails[0].id_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-blue-600 text-sm font-medium group-hover:underline">
                                    View verification details <ArrowRight className="ml-1 h-3 w-3" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">Verify your identity to unlock special discounts on ferry bookings.</p>
                                <Button variant="outline" size="sm" className="w-full">
                                    Get Verified
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dependents Summary */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onTabChange("dependents")}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-0.5">
                            <CardTitle className="text-lg">Dependents</CardTitle>
                            <CardDescription>Travel companions managed by you</CardDescription>
                        </div>
                        <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dependents.length > 0 ? (
                                <>
                                    <div className="space-y-2">
                                        {dependents.slice(0, 3).map((dep) => (
                                            <div key={dep.id} className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{dep.first_name} {dep.last_name}</span>
                                                <Badge variant="outline" className={cn("text-[10px] h-5", getStatusBadge(dep.verificationStatus || 'unverified').className.replace('text-white', 'border-transparent text-white'))}>
                                                    {getStatusBadge(dep.verificationStatus || 'unverified').label}
                                                </Badge>
                                            </div>
                                        ))}
                                        {dependents.length > 3 && (
                                            <p className="text-xs text-muted-foreground">and {dependents.length - 3} more...</p>
                                        )}
                                    </div>
                                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:underline">
                                        Manage all dependents <ArrowRight className="ml-1 h-3 w-3" />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">Add dependents to save their info and book tickets faster.</p>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Add Dependent
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Tips / Status */}
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4 flex items-start gap-3">
                    <div className="mt-0.5">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900">Why verify your account?</p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Verified passengers and dependents enjoy special discounted rates (Students, Seniors, PWD) and faster check-in at ports. 
                            Your data is securely stored and used only for terminal fee and boarding requirements.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
