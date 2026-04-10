"use client"

import { useState, useCallback, useEffect, useRef, useLayoutEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import ProfileSkeleton from "@/components/profile/ProfileSkeleton"
import ProfileOverview from "@/components/profile/ProfileOverview"
import PersonalDetailsForm from "@/components/profile/account-settings/PersonalDetailsForm"
import SecuritySettingsForm from "@/components/profile/account-settings/SecuritySettingsForm"
import ConnectedAccounts from "@/components/profile/account-settings/ConnectedAccounts"
import VerificationTab from "@/components/profile/verification/VerificationTab"
import DependentTab from "@/components/profile/dependents/DependentTab"
import ProfileVerificationForm from "@/components/profile/verification/ProfileVerificationForm"
import ProfileImageCropper from "@/components/profile/ProfileImageCropper"
import { Card, CardContent } from "@/components/ui/Card"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { BookingHistoryTab } from "@/components/profile/BookingHistoryTab"
import VehicleTab from "@/components/profile/vehicles/VehicleTab"
import { AuthService, getDependents } from "@/services"
import { useAuth } from "@/contexts/AuthContexts"
import { IDependent, IVerification, IPassenger } from "@/models"
import { VerificationStatus } from "@/utils/verification/statusHelpers"
import { UploadService } from "@/services/upload.service"
import { updatePassenger } from "@/services"
import { useThemeSettings } from "@/hooks/theme-settings"

export default function ProfilePageClient() {
    const router = useRouter();
    const { loggedInAccount, loading, currentUser } = useAuth();
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primary || '#2563eb';
    
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    const SESSION_KEY = 'ayahay-profile-tab';
    const [activeTab, setActiveTab] = useState(tabParam || 'overview');

    useEffect(() => {
        if (!tabParam) {
            const stored = sessionStorage.getItem(SESSION_KEY);
            if (stored) setActiveTab(stored);
        }
    }, []);
    const [isCopied, setIsCopied] = useState(false);

    const [passenger, setPassenger] = useState<IPassenger | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [dependents, setDependents] = useState<IDependent[]>([]);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("unverified");
    const [account, setAccount] = useState<{
        id: string;
        email: string;
        verificationDetails: IVerification[];
        qrCodeUrl?: string;
        qrCodeId?: string;
    } | null>(null);

    const [dependentToVerify, setDependentToVerify] = useState<IDependent | null>(null);
    const [showVerificationForm, setShowVerificationForm] = useState(false);

    // Profile image states
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    // Track whether auth state has been resolved (not just the initial false/null defaults)
    const [authReady, setAuthReady] = useState(false);
    useLayoutEffect(() => {
        setAuthReady(true);
    }, []);

    const fetchProfileData = useCallback(async () => {
        if (!loggedInAccount) return;

        try {
            const [profileResult, dependentsData] = await Promise.all([
                AuthService.getProfile(),
                getDependents(loggedInAccount.id)
            ]);

            const profileData = profileResult.data;

            // Deep sanitize helper to ensure only strings reach renderable fields
            const s = (val: any) => typeof val === 'string' ? val : (val ? String(val) : '');

            const sanitizedVerifications = (profileData.verificationDetails || []).map((v: any) => ({
                ...v,
                id_type: s(v.id_type),
                id_number: s(v.id_number),
                status: s(v.status),
                review_notes: s(v.review_notes),
                created_at: s(v.created_at)
            }));

            setAccount({
                id: (loggedInAccount.id || profileData.id || profileData.accountId)?.toString() || '',
                email: typeof profileData.email === 'string' ? profileData.email : (typeof loggedInAccount.email === 'string' ? loggedInAccount.email : ''),
                verificationDetails: sanitizedVerifications,
                qrCodeUrl: typeof profileData.passenger?.qrCodeUrl === 'string' ? profileData.passenger.qrCodeUrl : undefined,  
                qrCodeId:  profileData.passenger?.hayahaiId || profileData.passenger?.qrId
            });

            if (profileData.passenger) {
                setPassenger({
                    ...profileData.passenger,
                    firstName: s(profileData.passenger.firstName),
                    lastName: s(profileData.passenger.lastName),
                    middleName: s(profileData.passenger.middleName),
                    suffixName: s(profileData.passenger.suffixName),
                    phone: s(profileData.passenger.phone),
                    address: s(profileData.passenger.address)
                });
                
                // Set initial image preview
                if (profileData.passenger.profilePictureUrl && !imagePreview) {
                    setImagePreview(profileData.passenger.profilePictureUrl);
                }
            }

            const sanitizedDependents = (dependentsData || []).map((d: any) => ({
                ...d,
                first_name: s(d.first_name),
                last_name: s(d.last_name),
                status: s(d.status)
            }));
            setDependents(sanitizedDependents);

            if (sanitizedVerifications.length > 0) {
                setVerificationStatus(sanitizedVerifications[0].status as VerificationStatus);
            } else {
                setVerificationStatus('unverified');
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setIsProfileLoading(false);
        }
    }, [loggedInAccount]);

    useEffect(() => {
        if (!authReady || loading) return;

        if (loggedInAccount === null) {
            router.replace('/login');
            return;
        }

        if (loggedInAccount?.role === 'Passenger') {
            fetchProfileData();
        } else {
            setIsProfileLoading(false);
        }
    }, [authReady, loggedInAccount, loading, fetchProfileData, router]);

    // Persist active tab to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem(SESSION_KEY, activeTab);
    }, [activeTab]);

    // Update image preview when passenger or currentUser profile picture changes
    useEffect(() => {
        const initialImage = passenger?.profilePictureUrl || currentUser?.profile_picture_url;
        if (!imagePreview && initialImage) {
            setImagePreview(initialImage);
        }
    }, [passenger?.profilePictureUrl, currentUser?.profile_picture_url]);

    // Cleanup blob URLs
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const copyToClipboard = () => {
        if (account?.id) {
            navigator.clipboard.writeText(account.id);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleVerificationStatusChange = (status: VerificationStatus) => {
        setVerificationStatus(status);
    };

    const handleVerificationFormSubmit = (formData: any) => {
        // Don't close modal immediately - let the form show success state
        // setShowVerificationForm(false);
        // setDependentToVerify(null);
        fetchProfileData();

        // Close modal after a delay to show success message
        setTimeout(() => {
            setShowVerificationForm(false);
            setDependentToVerify(null);
        }, 2000);
    };

    const handleVerificationFormCancel = () => {
        setShowVerificationForm(false);
        setDependentToVerify(null);
    };

    // Profile image handlers
    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setShowCropper(false);
        setIsUploading(true);

        try {
            const file = new File([croppedBlob], "profile-picture.jpg", { type: "image/jpeg" });
            const upload = await UploadService.uploadKYCProfilePicture(file);

            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }

            await updatePassenger({ profilePictureUrl: upload.url });
            setImagePreview(upload.url);
            fetchProfileData();
        } catch (error: any) {
            console.error("Updating profile picture failed:", error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const getProfileImageUrl = useCallback(() => {
        return imagePreview;
    }, [imagePreview]);

    if ((!loggedInAccount && loading) || isProfileLoading) {
        return <ProfileSkeleton />;
    }

    if (!loggedInAccount) {
        return null;
    }

    return (
        <div className="container mx-auto pb-10 px-4 sm:px-6 lg:px-8">
            <ProfileHeader
                firstName={passenger?.firstName || (typeof currentUser?.name === 'string' ? currentUser.name.split(' ')[0] : '')}
                lastName={passenger?.lastName || (typeof currentUser?.name === 'string' ? currentUser.name.split(' ').slice(1).join(' ') : '')}
                email={typeof account?.email === 'string' ? account.email : ''}
                accountId={account?.id}
                profileImageUrl={getProfileImageUrl()}
                verificationStatus={verificationStatus}
                isUploading={isUploading}
                isCopied={isCopied}
                onImageClick={handleImageClick}
                onCopyClick={copyToClipboard}
                onVerificationClick={() => setActiveTab("verification")}
                fileInputRef={fileInputRef}
                onImageChange={handleImageChange}
                isHayahaiLinked={loggedInAccount?.providers?.some((p: any) => p.provider === 'hayahai')}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
                <TabsList className="w-full h-auto justify-start border-b rounded-none bg-transparent p-0 mb-6 overflow-x-auto no-scrollbar">
                    {["overview", "account-settings", "booking-history", "vehicles", "verification", "dependents"].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab}
                            data-template-ignore="true"
                            style={activeTab === tab ? { borderColor: primaryColor } : {}}
                            className="rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent px-8 py-3 whitespace-nowrap capitalize"
                        >
                            {tab.replace('-', ' ')}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="overview">
                    <ProfileOverview
                        verificationStatus={verificationStatus}
                        verificationDetails={account?.verificationDetails}
                        dependents={dependents}
                        onTabChange={setActiveTab}
                        qrCode={account?.qrCodeUrl}
                        qrCodeId={account?.qrCodeId}
                        passengerName={passenger ? `${passenger.firstName} ${passenger.lastName}` : (typeof currentUser?.name === 'string' ? currentUser.name : '')}
                    />
                </TabsContent>

                <TabsContent value="account-settings" className="flex flex-col lg:flex-row gap-6 items-start">
                    <Card className="flex-1 w-full">
                        <CardContent className="space-y-12">
                            <PersonalDetailsForm
                                passenger={passenger || undefined}
                                email={account?.email}
                                onUpdate={(updated) => setPassenger(updated)}
                            />
                        </CardContent>
                    </Card>
                    <div className="w-full lg:w-[400px] space-y-6">
                        <Card>
                            <CardContent>
                                <SecuritySettingsForm />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <ConnectedAccounts />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="booking-history">
                    <BookingHistoryTab />
                </TabsContent>

                <TabsContent value="vehicles">
                    <VehicleTab 
                        userId={loggedInAccount.id}
                    />
                </TabsContent>

                <TabsContent value="verification">
                    <VerificationTab
                        accountId={loggedInAccount.id}
                        verificationDetails={account?.verificationDetails}
                        onStatusChange={handleVerificationStatusChange}
                        onRefresh={fetchProfileData}
                    />
                </TabsContent>

                <TabsContent value="dependents">
                    <DependentTab
                        userId={loggedInAccount.id}
                    />
                </TabsContent>
            </Tabs>

            {showVerificationForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
                        <CardContent className="p-0">
                            <ProfileVerificationForm
                                onSubmit={handleVerificationFormSubmit}
                                onCancel={handleVerificationFormCancel}
                                dependentId={dependentToVerify?.id}
                                dependentName={dependentToVerify ? `${dependentToVerify.first_name} ${dependentToVerify.last_name}` : undefined}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            <ProfileImageCropper
                image={imageToCrop}
                open={showCropper}
                onClose={() => setShowCropper(false)}
                onCropComplete={handleCropComplete}
            />
        </div>
    )
}