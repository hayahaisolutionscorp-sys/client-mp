"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/Button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Copy, Check, Edit2, Camera, Shield, ShieldCheck, AlertCircle, Plus, Users, Loader2 } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContexts"
import { useRouter } from "next/navigation"
import ProfileVerificationForm from "@/components/profile/ProfileVerificationForm"
import PersonalDetailsForm from "@/components/profile/PersonalDetailsForm"
import SecuritySettingsForm from "@/components/profile/SecuritySettingsForm"
import { IPassenger, IAccount, IDependent} from "@/models"
import { updatePassenger, AuthService, getDependentsWithVerification } from "@/services"
import DependentTab from "@/components/profile/DependentTab"
import VerificationTab from "@/components/profile/VerificationTab"
import ProfileOverview from "@/components/profile/ProfileOverview"
import ProfileSkeleton from "@/components/profile/ProfileSkeleton"
import { cn } from "@/lib/utils"
import { UploadService } from "@/services/upload.service"
import ProfileImageCropper from "@/components/profile/ProfileImageCropper"

type VerificationStatus = "unverified" | "pending" | "verified"

interface VerificationDetails {
    govId: string;
    idNumber: string;
    discountType: string;
    frontImageUrl?: string;
    backImageUrl?: string;
    selfieUrl?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { loggedInAccount, loading, currentUser, refreshProfile } = useAuth();

    const [passenger, setPassenger] = useState<IPassenger | undefined>();
    const [account, setAccount] = useState<IAccount | undefined>();
    const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // UI states
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("unverified");
    const [verificationDetails, setVerificationDetails] = useState<VerificationDetails>({
        govId: '',
        idNumber: '',
        discountType: ''
    });
    const [dependents, setDependents] = useState<IDependent[]>([]);
    const [isCopied, setIsCopied] = useState(false);
    const [showVerificationForm, setShowVerificationForm] = useState(false);


    const [dependentToVerify, setDependentToVerify] = useState<IDependent | undefined>();
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    const getProfileImageUrl = () => {
        if (imagePreview) {
            return imagePreview;
        }
        if (passenger?.profile_picture_url) {
            return passenger.profile_picture_url;
        }
        return null;
    };

    const getStatusColor = (status: VerificationStatus): string => {
        const statusColors = {
            verified: "bg-green-500 text-white",
            pending: "bg-yellow-500 text-white",
            unverified: "bg-gray-500 text-white"
        }
        return statusColors[status]
    };

    const fetchProfile = async () => {
        try {
            const profileResult = await AuthService.getProfile();
            const profileData = profileResult.data || profileResult;
            
            // 1. Set Account & Passenger
            setAccount(profileData);
            setPassenger(profileData.passenger);

            // 2. Process Verification
            const activeVerification = profileData.verificationDetails?.[0];
            if (activeVerification) {
                const status = activeVerification.status;
                if (status === 'approved') {
                    setVerificationStatus('verified');
                } else if (status === 'pending' || status === 'under_review') {
                    setVerificationStatus('pending');
                } else {
                    setVerificationStatus('unverified');
                }

                setVerificationDetails({
                    govId: activeVerification.id_type || '',
                    idNumber: activeVerification.id_number || '',
                    discountType: profileData.passenger?.discountType || '',
                    frontImageUrl: activeVerification.front_image_url,
                    backImageUrl: activeVerification.back_image_url,
                    selfieUrl: activeVerification.selfie_url
                });
            } else {
                setVerificationStatus('unverified');
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            throw error;
        }
    };

    const fetchDependents = async () => {
        try {
            const depData = await getDependentsWithVerification(loggedInAccount?.id || '');
            setDependents(depData);
        } catch (error) {
            console.error("Failed to fetch dependents:", error);
            throw error;
        }
    };

    const fetchProfileData = async () => {
        try {
            // Kick off both but don't wait for both to start displaying the profile
            const profilePromise = fetchProfile();
            const dependentsPromise = fetchDependents();

            // Prioritize profile data to hide skeleton early
            await profilePromise;
            setIsPageLoading(false);

            // Continue loading dependents in the background
            await dependentsPromise;
        } catch (error) {
            console.error("Error loading profile data:", error);
            setIsPageLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(loggedInAccount?.id ?? '').then(() => {
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        })
    };

    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && loggedInAccount) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        if (!loggedInAccount) return;
        
        setShowCropper(false);
        setIsUploading(true);
        try {
            const file = new File([croppedBlob], "profile-picture.jpg", { type: "image/jpeg" });
            const res = await UploadService.uploadKYCProfilePicture(file);
            const updatedPassenger = await updatePassenger({ profile_picture_url: res.url });
            
            setImagePreview(res.url);
            setPassenger(updatedPassenger);
            await refreshProfile();
        } catch (error) {
            console.error("Failed to upload profile picture:", error);
        } finally {
            setIsUploading(false);
            setImageToCrop(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleVerificationStatusChange = () => {
        if (verificationStatus === "unverified") {
            setShowVerificationForm(true);
        }
    };

    const handleVerificationFormSubmit = (formData: any) => {
        setVerificationStatus("pending");
        // Re-fetch everything to ensure consistent state
        fetchProfileData();
    };

    const handleVerificationFormCancel = () => {
        setShowVerificationForm(false);
        setDependentToVerify(undefined);
    };



    const handleRequestVerificationForDependent = (dependent: IDependent) => {
        setDependentToVerify(dependent);
        setShowVerificationForm(true);
    };

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    useEffect(() => {
        if (loading) return;
        
        if (loggedInAccount === null || loggedInAccount === undefined) {
            router.replace('/login');
            return;
        }

        if (loggedInAccount.role === 'Passenger') {
            setIsPageLoading(true);
            fetchProfileData().finally(() => {
                setIsPageLoading(false);
            });
        } else {
            setIsPageLoading(false);
        }
    }, [loggedInAccount, loading]);

    if (loading || isPageLoading) {
        return <ProfileSkeleton />;
    }

    if (!loggedInAccount) {
        return null;
    }

    return (
        <div className="container mx-auto pb-10 px-4 sm:px-6 lg:px-8">
            {/* Header Card */}
            <Card className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-md">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                name="profile_picture"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div
                                className="relative h-24 w-24 md:h-32 md:w-32 rounded-full ring-4 ring-white shadow-lg overflow-hidden cursor-pointer group bg-blue-600 flex items-center justify-center"
                                onClick={handleImageClick}
                            >
                                {getProfileImageUrl() ? (
                                    <Image
                                        src={getProfileImageUrl()!}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-white">
                                        {(passenger?.firstName?.charAt(0) || currentUser?.name?.charAt(0) || account?.email?.charAt(0) || '?').toUpperCase()}
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
                                    className={cn(getStatusColor(verificationStatus), "cursor-pointer hover:opacity-90 transition-all")} 
                                    onClick={() => setActiveTab("verification")}
                                >
                                    {verificationStatus === "verified" && <ShieldCheck className="w-3 h-3 mr-1" />}
                                    {verificationStatus === "pending" && <AlertCircle className="w-3 h-3 mr-1" />}
                                    {verificationStatus === "unverified" && <Shield className="w-3 h-3 mr-1" />}
                                    {verificationStatus.toUpperCase()}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {passenger?.firstName ? `${passenger.firstName} ${passenger.lastName}` : (currentUser?.name || 'No Name')}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                                <span className="font-mono text-sm">{account?.email}</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                                <span>ID: {account?.id ?? '...'}</span>
                                <Button variant="ghost" size="icon" className="h-4 w-4" onClick={copyToClipboard}>
                                    {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
                <TabsList className="w-full h-auto justify-start border-b rounded-none bg-transparent p-0 mb-6 overflow-x-auto">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3 whitespace-nowrap"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="account-settings"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3 whitespace-nowrap"
                    >
                        Account Settings
                    </TabsTrigger>
                    <TabsTrigger
                        value="booking-history"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3 whitespace-nowrap"
                    >
                        Booking History
                    </TabsTrigger>
                    <TabsTrigger
                        value="verification"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3 whitespace-nowrap"
                    >
                        Verification
                    </TabsTrigger>
                    <TabsTrigger
                        value="dependents"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3 whitespace-nowrap"
                    >
                        Dependents
                    </TabsTrigger>
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
                                passenger={passenger} 
                                email={account?.email} 
                                onUpdate={(updated) => setPassenger(updated)} 
                            />
                        </CardContent>
                    </Card>
                    <Card className="w-full lg:w-[400px]">
                        <CardContent>
                            <SecuritySettingsForm />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="booking-history">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Bookings</CardTitle>
                            <CardDescription>View and manage your past and upcoming trips.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No booking history found.</p>
                                <Button variant="link" className="mt-2" onClick={() => router.push('/search')}>
                                    Book a trip now
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="verification">
                    <VerificationTab 
                        accountId={loggedInAccount.id} 
                        verificationDetails={account?.verificationDetails}
                        onStatusChange={setVerificationStatus}
                        onRefresh={fetchProfileData}
                    />
                </TabsContent>

                <TabsContent value="dependents">
                    <DependentTab 
                        userId={loggedInAccount.id} 
                        dependents={dependents}
                        onRefresh={fetchProfileData}
                        onRequestVerification={handleRequestVerificationForDependent} 
                    />
                </TabsContent>
            </Tabs>

            {/* Modals */}
            {showVerificationForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                onClose={() => {
                    setShowCropper(false);
                    setImageToCrop(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }}
                onCropComplete={handleCropComplete}
            />
        </div>
    )
}