"use client"

import React, { useState, useEffect } from 'react'
import Image from "next/image"
import { Camera, Check, Copy, LogOut } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useThemeSettings } from "@/hooks/theme-settings"
import { useAuth } from "@/contexts/AuthContexts"
import { 
    VerificationStatus, 
    getStatusIcon, 
    getStatusDisplayText,
    getStatusVariant
} from "@/utils/verification/statusHelpers"

interface ProfileHeaderProps {
    firstName?: string;
    lastName?: string;
    email?: string;
    accountId?: string;
    profileImageUrl?: string | null;
    verificationStatus: VerificationStatus;
    isUploading: boolean;
    isCopied: boolean;
    onImageClick: () => void;
    onCopyClick: () => void;
    onVerificationClick: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    firstName,
    lastName,
    email,
    accountId,
    profileImageUrl,
    verificationStatus,
    isUploading,
    isCopied,
    onImageClick,
    onCopyClick,
    onVerificationClick,
    fileInputRef,
    onImageChange
}) => {
    const [imageError, setImageError] = useState(false);

    // Reset image error when profileImageUrl changes
    useEffect(() => {
        setImageError(false);
    }, [profileImageUrl]);

    const { logout } = useAuth();
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primaryColor || themeSettings?.primary || '#2563eb';
    return (
        <Card className="w-full border-none shadow-md" style={{
            background: `linear-gradient(to right, ${primaryColor}15, ${primaryColor}10)`
        }}>
            <CardContent className="pt-6 relative">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        <input
                            type="file"
                            ref={fileInputRef}
                            name="profile_picture"
                            onChange={onImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <div
                            className="relative h-24 w-24 md:h-32 md:w-32 rounded-full ring-4 ring-white shadow-lg overflow-hidden cursor-pointer group flex items-center justify-center"
                            style={{ backgroundColor: primaryColor }}
                            onClick={onImageClick}
                        >
                            {profileImageUrl && !imageError ? (
                                <Image
                                    src={profileImageUrl}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <span className="text-4xl font-bold text-white">
                                    {(firstName?.charAt(0) || email?.charAt(0) || '?').toUpperCase()}
                                </span>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                            <Badge 
                                variant={getStatusVariant(verificationStatus)}
                                className="cursor-pointer hover:opacity-90 transition-all" 
                                onClick={onVerificationClick}
                            >
                                {getStatusIcon(verificationStatus)}
                                {getStatusDisplayText(verificationStatus)}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {firstName ? `${firstName} ${lastName || ''}` : 'No Name'}
                                </h1>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                                    <span className="font-mono text-sm">{email}</span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                                    <span>ID: {accountId ?? '...'}</span>
                                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={onCopyClick}>
                                        {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                className="md:self-start gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                                onClick={() => logout()}
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
