"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Copy, Check } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContexts"
import { QRCodeDisplay } from "@/components/profile/QRCodeDisplayProps"
import { useRouter } from "next/navigation"
import ProfileVerificationForm, { VerificationFormData } from "@/components/profile/ProfileVerificationForm"
import { IPassenger, IAccount } from "@/models"
import { getAccount, getPassenger, uploadProfilePicture, updatePassenger, removeVerification, getVerificationRequest } from "@/services"

type VerificationStatus = "unverified" | "pending" | "verified"

interface VerificationDetails {
    govId: string;
    idNumber: string;
    discountType: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { loggedInAccount, loading } = useAuth();

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
        if (account?.profile_picture) {
            return account.profile_picture;
        }
        return "/assets/icons/google_logo.svg"; // Default image
    };

    const getStatusColor = (status: VerificationStatus): string => {
        const statusColors = {
            verified: "bg-green-500 text-white",
            pending: "bg-yellow-500 text-white",
            unverified: "bg-gray-500 text-white"
        }
        return statusColors[status]
    };

    const fetchAccount = async (accountId: string) => {
        const data = (await getAccount(accountId));
        setAccount(data);
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
                await fetchAccount(loggedInAccount.id);
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
            fetchAccount(loggedInAccount.id);
            fetchVerificationStatus(loggedInAccount.id);
        }
    }, [loggedInAccount, loading, router]);

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

    return (
        <div className="flex-grow overflow-auto">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-32">
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6 sm:p-8">
                        {showVerificationForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
                                    <h2 className="text-xl font-bold mb-4">Profile Verification</h2>
                                    <ProfileVerificationForm 
                                        onSubmit={handleVerificationFormSubmit}
                                        onCancel={handleVerificationFormCancel}
                                    />
                                </div>
                            </div>
                        )}

                        {showRemoveVerificationDialog && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                                    <h2 className="text-xl font-bold mb-4 text-red-600">Remove Verification?</h2>
                                    <p className="mb-6 text-gray-700">
                                        This will remove your verification status. You&lsquo;ll need to verify your account again if you want to access verified features.
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <Button 
                                            variant="outline" 
                                            onClick={handleCancelRemoveVerification}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            onClick={handleRemoveVerification}
                                        >
                                            Remove Verification
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 border-b pb-8">
                            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                <div className="pt-8 relative flex flex-col items-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        name="profile_picture"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <div
                                        className={`relative h-24 w-24 rounded-full overflow-hidden ${
                                            isEditing ? 'group cursor-pointer' : ''
                                        }`}
                                        onClick={isEditing ? handleImageClick : undefined}
                                    >
                                        <Image
                                            src={getProfileImageUrl()}
                                            alt="Profile picture"
                                            className="rounded-full object-cover h-full w-full"
                                            fill
                                        />
                                        {isEditing && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Image
                                                    src="/assets/icons/upload_image.svg"
                                                    alt="Upload icon"
                                                    width={200}
                                                    height={200}
                                                    className="h-12 w-12"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={isEditing ? "outline" : "default"}
                                        className={`mt-2 text-xs ${isEditing ? "hover:bg-gray-200" : "bg-customBlue hover:bg-blue-700 text-white"}`}
                                        onClick={() => {
                                            if (isEditing) {
                                                setIsUploading(true);
                                                handleSave().finally(() => setIsUploading(false));
                                            } else {
                                                setFormData(passenger || {});
                                                setIsEditing(true);
                                            }
                                        }}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? 'Saving...' : isEditing ? 'Save' : 'Edit Profile'}
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-gray-900">{passenger?.firstName}</h1>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 break-all">{account?.id}</span>
                                        <Button size="icon" variant="ghost" onClick={copyToClipboard} className="h-6 w-6">
                                            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <Badge
                                        className={`${getStatusColor(verificationStatus)} px-2 py-1 text-xs font-semibold rounded-full`}
                                    >
                                        {verificationStatus.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                            <div className="h-30 w-30 flex-shrink-0">
                                <QRCodeDisplay qr_code={account?.qr_code ?? ''} />
                            </div>
                        </div>

                        <Tabs defaultValue="personal-info" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 lg:w-1/3 mb-8">
                                <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
                                <TabsTrigger value="booking-history">Booking History</TabsTrigger>
                            </TabsList>
                            <TabsContent value="personal-info">
                                <form className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                                        {loggedInAccount?.role === 'Passenger' && passenger && (
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                                        First Name
                                                    </span>
                                                    <div className="mt-1 relative">
                                                        <Input
                                                            id="firstName"
                                                            value={isEditing ? formData.firstName || '' : passenger?.firstName || ''}
                                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                            disabled={!isEditing}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                                        Last Name
                                                    </span>
                                                    <Input
                                                        id="lastName"
                                                        value={isEditing ? formData.lastName || '' : passenger?.lastName || ''}
                                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                                        Sex
                                                    </span>
                                                    <Select
                                                        value={isEditing ? formData.sex || '' : passenger?.sex || ''}
                                                        onValueChange={(value) => handleInputChange('sex', value)}
                                                        disabled={!isEditing}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select gender" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Male">Male</SelectItem>
                                                            <SelectItem value="Female">Female</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                                        Date of Birth
                                                    </span>
                                                    <Input
                                                        id="birthdayIso"
                                                        type="date"
                                                        disabled={!isEditing}
                                                        onChange={(e) => handleInputChange('birthdayIso', e.target.value)}
                                                        value={isEditing 
                                                            ? (formData.birthdayIso ? formData.birthdayIso.split('T')[0] : '') 
                                                            : (passenger.birthdayIso ? passenger.birthdayIso.split('T')[0] : '')
                                                        }
                                                        className="mt-1 w-full" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                                        Nationality
                                                    </span>
                                                    <Input
                                                        id="nationality"
                                                        disabled={!isEditing}
                                                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                                                        value={isEditing ? formData.nationality || '' : passenger.nationality || ''}
                                                        className="mt-1 w-full" />
                                                </div>
                                                <div className="sm:col-span-2 lg:col-span-2">
                                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                                        Address
                                                    </span>
                                                    <Input
                                                        id="address"
                                                        disabled={!isEditing}
                                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                                        value={isEditing ? formData.address || '' : passenger?.address || ''}
                                                        placeholder="House #, Street, City, Province, Postal Code"
                                                        className=" w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                                        Mobile Number
                                                    </span>
                                                    <div className="mt-1 flex gap-2">
                                                        <Input
                                                            id="mobile"
                                                            onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                                                            value={isEditing ? formData.mobile_number || '' : passenger?.mobile_number || ''}
                                                            disabled={!isEditing}
                                                            className="flex-1" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email
                                                    </span>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={loggedInAccount?.email || ''}
                                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="mt-1 w-full"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Verification button - only shown if not verified */}
                                    {verificationStatus === "unverified" && (
                                        <div>
                                            <Button
                                                type="button"
                                                onClick={handleVerificationStatusChange}
                                                className="w-full sm:w-auto bg-customBlue hover:bg-blue-700 text-white"
                                            >
                                                Start Verification
                                            </Button>
                                        </div>
                                    )}
                                    
                                    {/* Show pending message if status is pending */}
                                    {verificationStatus === "pending" && (
                                        <div className="text-yellow-600 font-medium">
                                            Your verification request is pending approval.
                                        </div>
                                    )}
                                    
                                    {/* Show verification details only when verified */}
                                    {verificationStatus === "verified" && (
                                        <div className="space-y-6">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Verification Details</h2>
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                                        Government Id
                                                    </span>
                                                    <Input 
                                                        id="govId" 
                                                        value={verificationDetails.govId}
                                                        disabled
                                                        className="mt-1 w-full" 
                                                    />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                                        ID Number
                                                    </span>
                                                    <Input 
                                                        id="idNumber" 
                                                        value={verificationDetails.idNumber}
                                                        disabled
                                                        className="mt-1 w-full" 
                                                    />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                                        Discount Type
                                                    </span>
                                                    <Input 
                                                        id="discountType" 
                                                        value={verificationDetails.discountType}
                                                        disabled
                                                        className="mt-1 w-full" 
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Option to remove verification */}
                                            <Button
                                                type="button"
                                                onClick={handleVerificationStatusChange}
                                                variant="destructive"
                                                className="mt-4"
                                            >
                                                Remove Verification
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </TabsContent>

                            <TabsContent value="booking-history">
                                <div className="mt-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking History</h2>
                                    <p className="text-gray-600">Your booking history will be displayed here.</p>
                                    {/* Add your booking history component or table here */}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}