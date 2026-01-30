"use client"

import { useState } from "react"
import { CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import { SuccessModal } from "@/components/ui/SuccessModal"
import { AuthService } from "@/services/auth.service"
import { useAuth } from "@/contexts/AuthContexts"

export default function SecuritySettingsForm() {
    const { loggedInAccount, refreshProfile } = useAuth();
    const hasPassword = loggedInAccount?.hasPassword;
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isMatch = !!passwordData.newPassword && 
                   passwordData.newPassword === passwordData.confirmPassword;

    const isFormIncomplete = hasPassword 
        ? (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword)
        : (!passwordData.newPassword || !passwordData.confirmPassword);

    const hasNoChanges = isFormIncomplete || !isMatch;

    const updatePasswordData = (field: string, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordStatus({ type: 'error', message: "Passwords don't match" });
            return;
        }

        setPasswordLoading(true);
        setPasswordStatus(null);
        
        try {
            await AuthService.changePassword({
                current_password: hasPassword ? passwordData.currentPassword : null,
                new_password: passwordData.newPassword
            });
          
            setShowSuccessModal(true);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            await refreshProfile();
        } catch (error: any) {
            setPasswordStatus({ 
                type: 'error', 
                message: error.response?.data?.message || "Failed to update password. Please check your current password." 
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleChangePassword();
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pb-7">
                <CardTitle>{hasPassword ? "Security Settings" : "Set Up Password"}</CardTitle>
                <CardDescription>
                    {hasPassword 
                        ? "Manage your account security and password." 
                        : "Create a password for your account so you can login with your email."}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
                <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                    {passwordStatus && passwordStatus.type === 'error' && (
                        <div className="p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                            {passwordStatus.message}
                        </div>
                    )}
                    
                    {hasPassword && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Current Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Input
                                    type={showCurrentPassword ? "text" : "password"}
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => updatePasswordData('currentPassword', e.target.value)}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{hasPassword ? "New Password" : "Password"} <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Input
                                type={showNewPassword ? "text" : "password"}
                                required
                                value={passwordData.newPassword}
                                onChange={(e) => updatePasswordData('newPassword', e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Confirm {hasPassword ? "New " : ""}Password <span className="text-red-500">*</span></label>
                            {isMatch && (
                                <div className="flex items-center gap-1 text-xs text-green-600 font-medium animate-in fade-in slide-in-from-right-2">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Passwords match
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                className={cn(isMatch && "border-green-500 focus-visible:ring-green-500", "pr-10")}
                                value={passwordData.confirmPassword}
                                onChange={(e) => updatePasswordData('confirmPassword', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    
                    <Button 
                        type="submit" 
                        disabled={passwordLoading || hasNoChanges}
                    >
                        {passwordLoading ? "Processing..." : (hasPassword ? "Update Password" : "Set Password")}
                    </Button>
                </form>
            </CardContent>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={hasPassword ? "Password Updated!" : "Password Set!"}
                description={hasPassword 
                    ? "Your account password has been changed successfully." 
                    : "Your account password has been set successfully. You can now login using your email and password."}
            />
        </Card>
    );
}
