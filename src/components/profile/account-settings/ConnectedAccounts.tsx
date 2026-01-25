"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContexts"
import Image from "next/image"
import { ConfirmationModal } from "@/components/ui/ConfirmationModal"
import { AuthService } from "@/services/auth.service"

export default function ConnectedAccounts() {
    const { loggedInAccount, refreshProfile, signInWithGoogle, signInWithFacebook } = useAuth();
    const providers = loggedInAccount?.providers || [];
    const isGoogleConnected = providers.includes('google');
    const isFacebookConnected = providers.includes('facebook');
    
    const [connectionLoading, setConnectionLoading] = useState({ google: false, facebook: false });
    const [disconnectingProvider, setDisconnectingProvider] = useState<'google' | 'facebook' | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async (provider: 'google' | 'facebook') => {
        setConnectionLoading(prev => ({ ...prev, [provider]: true }));
        setError(null);
        try {
            if (provider === 'google') {
                await signInWithGoogle();
            } else {
                await signInWithFacebook();
            }
            await refreshProfile();
        } catch (error: any) {
            console.error(`Error connecting to ${provider}:`, error);
            setError(`Failed to connect ${provider} account.`);
        } finally {
            setConnectionLoading(prev => ({ ...prev, [provider]: false }));
        }
    };

    const handleDisconnectRequest = (provider: 'google' | 'facebook') => {
        setDisconnectingProvider(provider);
        setIsConfirming(true);
        setError(null);
    };

    const handleDisconnectConfirm = async () => {
        if (!disconnectingProvider) return;

        setConnectionLoading(prev => ({ ...prev, [disconnectingProvider]: true }));
        setIsConfirming(false);
        try {
            await AuthService.disconnectSocialProvider(disconnectingProvider);
            await refreshProfile();
        } catch (error: any) {
            console.error(`Error disconnecting ${disconnectingProvider}:`, error);
            if (error.response?.data?.message === 'CANNOT_DISCONNECT_ONLY_LOGIN_METHOD') {
                setError("You cannot disconnect your only login method. Please set a password or connect another account first.");
            } else {
                setError(`Failed to disconnect ${disconnectingProvider} account.`);
            }
        } finally {
            setConnectionLoading(prev => ({ ...prev, [disconnectingProvider]: false }));
            setDisconnectingProvider(null);
        }
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pb-7">
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                    Connect your social accounts to sign in faster.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                {error && (
                    <div className="p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                        {error}
                    </div>
                )}

                <div className="grid gap-4 w-full">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center border rounded-md">
                                <Image src="/assets/icons/google_logo.svg" alt="Google" width={24} height={24} />
                            </div>
                            <div>
                                <p className="font-medium">Google</p>
                                <p className="text-xs text-muted-foreground">
                                    {isGoogleConnected ? "Connected" : "Not connected"}
                                </p>
                            </div>
                        </div>
                        {isGoogleConnected ? (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={connectionLoading.google}
                                onClick={() => handleDisconnectRequest('google')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                                {connectionLoading.google ? "Processing..." : "Disconnect"}
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={connectionLoading.google}
                                onClick={() => handleConnect('google')}
                            >
                                {connectionLoading.google ? "Connecting..." : "Connect"}
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center border rounded-md bg-[#1877F2]">
                                <Image src="/assets/icons/facebook_logo.svg" alt="Facebook" width={24} height={24} className="brightness-0 invert" />
                            </div>
                            <div>
                                <p className="font-medium">Facebook</p>
                                <p className="text-xs text-muted-foreground">
                                    {isFacebookConnected ? "Connected" : "Not connected"}
                                </p>
                            </div>
                        </div>
                        {isFacebookConnected ? (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={connectionLoading.facebook}
                                onClick={() => handleDisconnectRequest('facebook')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                                {connectionLoading.facebook ? "Processing..." : "Disconnect"}
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={connectionLoading.facebook}
                                onClick={() => handleConnect('facebook')}
                            >
                                {connectionLoading.facebook ? "Connecting..." : "Connect"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>

            <ConfirmationModal
                isOpen={isConfirming}
                onClose={() => setIsConfirming(false)}
                onConfirm={handleDisconnectConfirm}
                title={`Disconnect ${disconnectingProvider ? disconnectingProvider.charAt(0).toUpperCase() + disconnectingProvider.slice(1) : ''}?`}
                description={`Are you sure you want to disconnect your ${disconnectingProvider} account? You won't be able to log in using this method anymore.`}
                confirmText="Disconnect"
                cancelText="Cancel"
                variant="destructive"
                isLoading={connectionLoading[disconnectingProvider || 'google']}
            />
        </Card>
    );
}
