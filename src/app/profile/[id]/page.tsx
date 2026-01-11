"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Copy, Check, Edit2, Camera, Shield, ShieldCheck, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContexts"
import { QRCodeDisplay } from "@/components/profile/QRCodeDisplayProps"
import { useRouter } from "next/navigation"
import ProfileVerificationForm, { VerificationFormData } from "@/components/profile/ProfileVerificationForm"
import { IPassenger, IAccount } from "@/models"
import { getAccountInformation, getPassenger, uploadProfilePicture, updatePassenger, removeVerification, getVerificationRequest } from "@/services"
import { useThemeSettings } from "@/hooks/theme-settings"

type VerificationStatus = "unverified" | "pending" | "verified"

interface VerificationDetails {
    govId: string;
    idNumber: string;
    discountType: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { loggedInAccount, loading } = useAuth();
    const themeSettings = useThemeSettings();

    const [formData, setFormData] = useState<Partial<IPassenger>>({});
    const [passenger, setPassenger] = useState<IPassenger | undefined>();
    const [account, setAccount] = useState<IAccount | undefined>();
    const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // UI states
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("unverified");
    const [isCopied, setIsCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [showRemoveVerificationDialog, setShowRemoveVerificationDialog] = useState(false);
    const [verificationDetails, setVerificationDetails] = useState<VerificationDetails>({
        govId: '',
        idNumber: '',
        discountType: ''
    });

    const getProfileImageUrl = () => {
        if (imagePreview) {
            return imagePreview;
        }
        // "For now, for all profile pictures it will just be a their initial with blue background"
        // We override any existing profile picture from account
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

    const fetchAccount = async () => {
        try {
            const data = await getAccountInformation();
            setAccount(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPassenger = async (passengerId: number) => {
        const data = await getPassenger(passengerId);
        setPassenger(data);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(loggedInAccount?.id ?? '').then(() => {
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        })
    };

    const handleImageClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (!loggedInAccount) return;
        try {
            // Handle image upload if there's a selected image
            if (selectedImage) {
                await uploadProfilePicture(selectedImage, loggedInAccount.id);
                await fetchAccount();
            }

            if (Object.keys(formData).length > 0 && passenger) {
                const updatedPassenger = await updatePassenger(passenger.id, formData);
                if (updatedPassenger) {
                    setPassenger(updatedPassenger);
                }
            }

            setIsEditing(false);
            setFormData({});
            setSelectedImage(undefined);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Failed to update profile:', error.message);
            }
        }
    };

    const handleVerificationStatusChange = () => {
        if (verificationStatus === "unverified") {
            setShowVerificationForm(true);
            // Don't change status yet - this will happen after form completion
        } else if (verificationStatus === "pending") {
            setVerificationStatus("verified");
            setShowVerificationForm(false);
        } else if (verificationStatus === "verified") {
            // Show confirmation dialog instead of removing immediately
            setShowRemoveVerificationDialog(true);
        }
    };

    const handleRemoveVerification = async () => {
        if (!loggedInAccount) return;

        try {
            // Call the API to remove verification
            await removeVerification(loggedInAccount.id);

            // Update UI after successful API call
            setVerificationStatus("unverified");
            setShowRemoveVerificationDialog(false);

            // Reset verification details
            setVerificationDetails({
                govId: '',
                idNumber: '',
                discountType: ''
            });

        } catch (error) {
            console.error("Failed to remove verification:", error);
            // You might want to show an error message to the user
            setShowRemoveVerificationDialog(false);
        }
    };

    const handleCancelRemoveVerification = () => {
        setShowRemoveVerificationDialog(false);
    };

    const handleVerificationFormSubmit = (formData: VerificationFormData) => {
        console.log("Verification form submitted:", formData);
        setVerificationStatus("pending");
        setShowVerificationForm(false);
        setVerificationDetails({
            govId: formData.governmentId,
            idNumber: formData.idNumber,
            discountType: formData.discountType
        });
    };

    const handleVerificationFormCancel = () => {
        setShowVerificationForm(false);
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
            return;
        }

        if (loggedInAccount.role === 'Passenger') {
            fetchPassenger(loggedInAccount.passengerId!);
            fetchAccount();
        }
    }, [loggedInAccount, loading, router]);

    /*
        const fetchVerificationStatus = async (accountId: string) => {
            const verificationData = await getVerificationRequest(accountId);
            if (verificationData) {
                // Set verification status based on the response including rejected status
                if (verificationData.status_req === 'pending') {
                    setVerificationStatus('pending');
                } else if (verificationData.status_req === 'approved') {
                    setVerificationStatus('verified');
                    // Set verification details if approved
                    setVerificationDetails({
                        govId: verificationData.id_type || '',
                        idNumber: verificationData.id_number || '',
                        discountType: verificationData.discount_type || ''
                    });
                } else if (verificationData.status_req === 'rejected') {
                    // Handle rejected verification - back to unverified state
                    setVerificationStatus('unverified');
                } else {
                    setVerificationStatus('unverified');
                }
            }
        };
    */

    return (

        <div className="container mx-auto pb-10 px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Header Card */}
            <Card
                className="w-full border-none shadow-md"
                style={{
                    background: themeSettings ? `linear-gradient(to right, ${themeSettings.primaryColor}1a, ${themeSettings.secondaryColor}1a)` : undefined
                }}
            >
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
                                className="relative h-24 w-24 md:h-32 md:w-32 rounded-full ring-4 ring-white shadow-lg overflow-hidden cursor-pointer group flex items-center justify-center"
                                style={{ backgroundColor: themeSettings?.primaryColor }}
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
                                        {(passenger?.firstName?.charAt(0) || account?.email?.charAt(0) || '?').toUpperCase()}
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2">
                                <Badge className={getStatusColor(verificationStatus)}>
                                    {verificationStatus === "verified" && <ShieldCheck className="w-3 h-3 mr-1" />}
                                    {verificationStatus === "pending" && <AlertCircle className="w-3 h-3 mr-1" />}
                                    {verificationStatus === "unverified" && <Shield className="w-3 h-3 mr-1" />}
                                    {verificationStatus.toUpperCase()}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h1 className="text-3xl font-bold text-gray-900">{passenger?.firstName} {passenger?.lastName}</h1>
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
            <Tabs defaultValue="personal-info" className="w-full">
                <TabsList
                    className="w-full justify-start border-b rounded-none bg-transparent p-0 mb-6"
                    style={{ '--theme-primary': themeSettings?.primaryColor } as React.CSSProperties}
                >
                    <TabsTrigger
                        value="personal-info"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--theme-primary)] data-[state=active]:text-[var(--theme-primary)] data-[state=active]:bg-transparent px-8 py-3"
                    >
                        Personal Info
                    </TabsTrigger>
                    <TabsTrigger
                        value="booking-history"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--theme-primary)] data-[state=active]:text-[var(--theme-primary)] data-[state=active]:bg-transparent px-8 py-3"
                    >
                        Booking History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal-info">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                            <div className="space-y-1">
                                <CardTitle>Personal Details</CardTitle>
                                <CardDescription>Manage your personal information and preferences.</CardDescription>
                            </div>
                            {!isEditing && (
                                <Button onClick={() => {
                                    setFormData(passenger || {});
                                    setIsEditing(true);
                                }} variant="outline" size="sm">
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Details
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">First Name</label>
                                            <Input
                                                value={formData.firstName || ''}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Last Name</label>
                                            <Input
                                                value={formData.lastName || ''}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Sex</label>
                                            <Select
                                                value={formData.sex || ''}
                                                onValueChange={(value) => handleInputChange('sex', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select sex" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Date of Birth</label>
                                            <Input
                                                type="date"
                                                value={formData.birthdayIso ? formData.birthdayIso.split('T')[0] : ''}
                                                onChange={(e) => handleInputChange('birthdayIso', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nationality</label>
                                            <Input
                                                value={formData.nationality || ''}
                                                onChange={(e) => handleInputChange('nationality', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Mobile Number</label>
                                            <Input
                                                value={formData.mobile_number || ''}
                                                onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium">Address</label>
                                            <Input
                                                value={formData.address || ''}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button variant="outline" onClick={() => {
                                            setIsEditing(false);
                                            setFormData({});
                                            setSelectedImage(undefined);
                                            setImagePreview(undefined);
                                        }} type="button">
                                            Cancel
                                        </Button>
                                        <Button onClick={() => {
                                            setIsUploading(true);
                                            handleSave().finally(() => setIsUploading(false));
                                        }} disabled={isUploading}>
                                            {isUploading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                        <p className="font-medium">{passenger?.firstName} {passenger?.lastName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="font-medium">{account?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                                        <p className="font-medium">{passenger?.mobile_number || 'Not set'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Sex</p>
                                        <p className="font-medium">{passenger?.sex || 'Not set'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                                        <p className="font-medium">
                                            {passenger?.birthdayIso ? new Date(passenger.birthdayIso).toLocaleDateString() : 'Not set'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Nationality</p>
                                        <p className="font-medium">{passenger?.nationality || 'Not set'}</p>
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-3 space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                                        <p className="font-medium">{passenger?.address || 'Not set'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Verification Section - Temporary Disabled due to API unavailability */}
                            {false && (
                                <div className="mt-8 pt-8 border-t">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold">Identity Verification</h3>
                                            <p className="text-sm text-muted-foreground">Verify your identity to access exclusive features.</p>
                                        </div>
                                        {verificationStatus === "unverified" && (
                                            <Button onClick={handleVerificationStatusChange}>
                                                Verify Identity
                                            </Button>
                                        )}
                                        {verificationStatus === "verified" && (
                                            <Button variant="destructive" onClick={handleVerificationStatusChange}>
                                                Remove Verification
                                            </Button>
                                        )}
                                    </div>

                                    {verificationStatus === "pending" && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-yellow-900">Verification Pending</p>
                                                <p className="text-sm text-yellow-700">Your documents are under review. We'll notify you once approved.</p>
                                            </div>
                                        </div>
                                    )}

                                    {verificationStatus === "verified" && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ID Type</p>
                                                <p className="font-medium">{verificationDetails.govId}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ID Number</p>
                                                <p className="font-medium">{verificationDetails.idNumber}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Category</p>
                                                <p className="font-medium">{verificationDetails.discountType}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
            </Tabs>

            {/* Modals */}
            {showVerificationForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Verification Request</CardTitle>
                            <CardDescription>Submit your government ID for verification.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfileVerificationForm
                                onSubmit={handleVerificationFormSubmit}
                                onCancel={handleVerificationFormCancel}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {showRemoveVerificationDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-destructive">Remove Verification?</CardTitle>
                            <CardDescription>
                                Are you sure you want to remove your verified status? You will lose access to discounted rates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" onClick={handleCancelRemoveVerification}>Cancel</Button>
                            <Button variant="destructive" onClick={handleRemoveVerification}>Confirm Removal</Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}