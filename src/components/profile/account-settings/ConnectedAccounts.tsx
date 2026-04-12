"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { useAuth } from "@/contexts/AuthContexts"
import Image from "next/image"
import { ConfirmationModal } from "@/components/ui/ConfirmationModal"
import { AuthService } from "@/services/auth.service"

export default function ConnectedAccounts() {
    const { currentUser, refreshProfile, signInWithGoogle, signInWithFacebook, signInWithHayahai } = useAuth();
    const providers = currentUser?.providers || [];

    const isGoogleConnected = providers.some((p: string) => p === 'google');
    const isFacebookConnected = providers.some((p: string) => p === 'facebook');
    const isHayahaiConnected = providers.some((p: string) => p === 'hayahai');
    
    const [connectionLoading, setConnectionLoading] = useState({ google: false, facebook: false, hayahai: false });
    const [disconnectingProvider, setDisconnectingProvider] = useState<'google' | 'facebook' | 'hayahai' | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async (provider: 'google' | 'facebook' | 'hayahai') => {
        setConnectionLoading(prev => ({ ...prev, [provider]: true }));
        setError(null);
        try {
            if (provider === 'google') {
                await signInWithGoogle();
            } else if (provider === 'facebook') {
                await signInWithFacebook();
            } else {
                await signInWithHayahai();
            }
            await refreshProfile();
        } catch (error: any) {
            console.error(`Error connecting to ${provider}:`, error);
            setError(`Failed to connect ${provider} account.`);
        } finally {
            setConnectionLoading(prev => ({ ...prev, [provider]: false }));
        }
    };

    const handleDisconnectRequest = (provider: 'google' | 'facebook' | 'hayahai') => {
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

                    {process.env.NEXT_PUBLIC_IS_CLIENT === "true" && (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center border rounded-md overflow-hidden">
                                    <Image src="/assets/icons/Ayahay_logo.svg" alt="Hayahai" width={24} height={24} />
                                </div>
                                <div>
                                    <p className="font-medium">Hayahai</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isHayahaiConnected ? "Connected" : "Not connected"}
                                    </p>
                                </div>
                            </div>
                            {isHayahaiConnected ? (
                                <div className="flex flex-col items-end gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={true}
                                        className="text-slate-400 border-slate-200 cursor-not-allowed opacity-70"
                                    >
                                        Disconnect
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={connectionLoading.hayahai}
                                    onClick={() => handleConnect('hayahai')}
                                >
                                    {connectionLoading.hayahai ? "Connecting..." : "Connect"}
                                </Button>
                            )}
                        </div>
                    )}
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
