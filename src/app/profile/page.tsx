"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
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
import { AuthService, getDependents } from "@/services"
import { useAuth } from "@/contexts/AuthContexts"
import { IDependent, IVerification, IPassenger } from "@/models"
import { VerificationStatus } from "@/utils/verification/statusHelpers"
import { UploadService } from "@/services/upload.service"
import { updatePassenger } from "@/services"

export default function ProfilePage() {
    const router = useRouter();
    const { loggedInAccount, loading, currentUser } = useAuth();
    
    const [activeTab, setActiveTab] = useState("overview");
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    
    const [passenger, setPassenger] = useState<IPassenger | null>(null);
    const [dependents, setDependents] = useState<IDependent[]>([]);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("unverified");
    const [account, setAccount] = useState<{
        id: string;
        email: string;
        verificationDetails: IVerification[];
    } | null>(null);

    const [dependentToVerify, setDependentToVerify] = useState<IDependent | null>(null);
    const [showVerificationForm, setShowVerificationForm] = useState(false);

    // Profile image states
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    const fetchProfileData = useCallback(async () => {
        if (!loggedInAccount) return;

        try {
            const [profileResult, dependentsData] = await Promise.all([
                AuthService.getProfile(),
                getDependents(loggedInAccount.id)
            ]);

            const profileData = profileResult.data;
            
            setAccount({
                id: loggedInAccount.id,
                email: loggedInAccount.email,
                verificationDetails: profileData.verificationDetails || []
            });

            if (profileData.passenger) {
                setPassenger(profileData.passenger);
                // Set initial image preview
                if (profileData.passenger.profile_picture_url && !imagePreview) {
                    setImagePreview(profileData.passenger.profile_picture_url);
                }
            }

            setDependents(dependentsData || []);

            if (profileData.verificationDetails && profileData.verificationDetails.length > 0) {
                setVerificationStatus(profileData.verificationDetails[0].status as VerificationStatus);
            } else {
                setVerificationStatus('unverified');
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    }, [loggedInAccount]);

    useEffect(() => {
        if (loading) return;
        
        if (loggedInAccount === null) {
            router.replace('/login');
            return;
        }

        if (loggedInAccount?.role === 'Passenger') {
            setIsPageLoading(true);
            fetchProfileData().finally(() => {
                setIsPageLoading(false);
            });
        } else {
            setIsPageLoading(false);
        }
    }, [loggedInAccount, loading, fetchProfileData, router]);

    // Update image preview when passenger or currentUser profile picture changes
    useEffect(() => {
        const initialImage = passenger?.profile_picture_url || currentUser?.profile_picture_url;
        if (!imagePreview && initialImage) {
            setImagePreview(initialImage);
        }
    }, [passenger?.profile_picture_url, currentUser?.profile_picture_url]);

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

    const handleRequestVerificationForDependent = (dependent: IDependent) => {
        setDependentToVerify(dependent);
        setShowVerificationForm(true);
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
            
            await updatePassenger({ profile_picture_url: upload.url });
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

    if (isPageLoading) {
        return <ProfileSkeleton />;
    }

    if (!loggedInAccount) {
        return null;
    }

    return (
        <div className="container mx-auto pb-10 px-4 sm:px-6 lg:px-8">
            <ProfileHeader 
                firstName={passenger?.firstName || currentUser?.name?.split(' ')[0]}
                lastName={passenger?.lastName || currentUser?.name?.split(' ').slice(1).join(' ')}
                email={account?.email}
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
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
                <TabsList className="w-full h-auto justify-start border-b rounded-none bg-transparent p-0 mb-6 overflow-x-auto no-scrollbar">
                    {["overview", "account-settings", "booking-history", "verification", "dependents"].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab}
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3 whitespace-nowrap capitalize"
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