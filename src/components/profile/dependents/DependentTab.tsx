"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card"
import { Plus, Users, Check, Shield } from "lucide-react"
import { IDependent, CreateDependentDto } from "@/models"
import DependentForm from "@/components/profile/dependents/CreateDependentForm"
import DependentCard from "@/components/profile/dependents/DependentCard"
import DependentSkeleton from "@/components/profile/dependents/DependentSkeleton"
import ProfileVerificationForm from "@/components/profile/verification/ProfileVerificationForm"
import { getDependentsWithVerification } from "@/services"

interface DependentComponentProps {
    userId: string;
}

export default function DependentTab({ userId }: DependentComponentProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddSuccessPrompt, setShowAddSuccessPrompt] = useState(false);
    const [showUpdateSuccessPrompt, setShowUpdateSuccessPrompt] = useState(false);
    const [lastAddedDependent, setLastAddedDependent] = useState<IDependent | undefined>();
    const [lastUpdatedDependent, setLastUpdatedDependent] = useState<IDependent | undefined>();
    const [dependents, setDependents] = useState<IDependent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Verification modal state
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [dependentToVerify, setDependentToVerify] = useState<IDependent | null>(null);

    const refreshDependents = async () => {
        setIsLoading(true);

        try {
            const data = await getDependentsWithVerification(userId);
            
            // Deep sanitize helper
            const s = (val: any) => typeof val === 'string' ? val : (val ? String(val) : '');

            const sanitizedDependents = (data || []).map((d: any) => ({
                ...d,
                first_name: s(d.first_name),
                last_name: s(d.last_name),
                status: s(d.status) || 'unverified'
            }));

            setDependents(sanitizedDependents);
        } catch (error) {
            console.error("Error fetching dependents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshDependents();
    }, [userId]);

    const handleAddDependent = () => {
        setShowAddForm(true);
    };

    const handleAddFormSuccess = (created: IDependent) => {
        setLastAddedDependent(created);
        setShowAddForm(false);
        setShowAddSuccessPrompt(true);
        refreshDependents();
    };

    const handleAddFormCancel = () => {
        setShowAddForm(false);
    };

    const handleAddSuccessAddAnother = () => {
        setShowAddSuccessPrompt(false);
        setLastAddedDependent(undefined);
        setShowAddForm(true);
    };

    const handleAddSuccessVerify = () => {
        setShowAddSuccessPrompt(false);
        if (lastAddedDependent) {
            // Use local modal instead of parent callback
            setDependentToVerify(lastAddedDependent);
            setShowVerificationModal(true);
        }
        setLastAddedDependent(undefined);
    };

    const handleAddSuccessDone = () => {
        setShowAddSuccessPrompt(false);
        setLastAddedDependent(undefined);
    };

    const handleUpdateSuccess = (updated: IDependent) => {
        setLastUpdatedDependent(updated);
        setShowUpdateSuccessPrompt(true);
        refreshDependents();
    };

    const handleUpdateSuccessDone = () => {
        setShowUpdateSuccessPrompt(false);
        setLastUpdatedDependent(undefined);
    };

    // Verification modal handlers
    const handleRequestVerification = (dependent: IDependent) => {
        setDependentToVerify(dependent);
        setShowVerificationModal(true);
    };

    const handleVerificationSubmit = async (formData: any) => {
        // Auto-refresh dependents after verification submission
        await refreshDependents();
        
        // Close modal after a delay to show success message
        setTimeout(() => {
            setShowVerificationModal(false);
            setDependentToVerify(null);
        }, 2000);
    };

    const handleVerificationCancel = () => {
        setShowVerificationModal(false);
        setDependentToVerify(null);
    };

    return (
        <div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1">
                        <CardTitle>Dependents</CardTitle>
                        <CardDescription>Save details of travel companions without an account (minors, infants, or PWDs) to make ferry bookings faster.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddDependent}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Dependent
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-col gap-4">
                            <DependentSkeleton />
                            <DependentSkeleton />
                            <DependentSkeleton />
                        </div>
                    ) : (
                        dependents.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground space-y-3">
                                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                    <Users className="h-6 w-6 text-gray-400" />
                                </div>
                                <p>You haven't saved any dependents yet.</p>
                                <p className="text-xs">Saving frequent travelers makes booking ferry tickets much faster!</p>
                                <Button variant="outline" className="mt-4" onClick={handleAddDependent}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Dependent
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {dependents.map((dependent) => (
                                    <DependentCard
                                        key={dependent.id}
                                        dependent={dependent}
                                        onRefresh={refreshDependents}
                                        onRequestVerification={() => handleRequestVerification(dependent)}
                                        onUpdateSuccess={handleUpdateSuccess}
                                    />
                                ))}
                            </div>
                        ))}
                </CardContent>
            </Card>

            {/* Modal for Adding New Dependent */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <Card className="no-scrollbar w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-0">
                            <DependentForm
                                userId={userId}
                                onSuccess={handleAddFormSuccess}
                                onCancel={handleAddFormCancel}
                                isEditing={false}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {showAddSuccessPrompt && lastAddedDependent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="text-green-700">Dependent Added!</CardTitle>
                            <CardDescription>
                                <strong>{lastAddedDependent.first_name} {lastAddedDependent.last_name}</strong> has been added successfully.
                                Would you like to verify their identity for faster check-ins?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 pt-4">
                            <Button onClick={handleAddSuccessVerify}>
                                <Shield className="h-4 w-4 mr-2" />
                                Request Verification
                            </Button>
                            <Button variant="outline" onClick={handleAddSuccessAddAnother}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Another Dependent
                            </Button>
                            <Button onClick={handleAddSuccessDone}>
                                Done
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {showUpdateSuccessPrompt && lastUpdatedDependent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="text-green-700">Updated Successfully!</CardTitle>
                            <CardDescription>
                                <strong>{lastUpdatedDependent.first_name} {lastUpdatedDependent.last_name}</strong>'s information has been updated.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center pt-4">
                            <Button onClick={handleUpdateSuccessDone} className="w-full">
                                Done
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Verification Modal for Dependents */}
            {showVerificationModal && dependentToVerify && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar">
                        <CardContent className="p-0">
                            <ProfileVerificationForm
                                onSubmit={handleVerificationSubmit}
                                onCancel={handleVerificationCancel}
                                dependentId={dependentToVerify.id}
                                dependentName={`${dependentToVerify.first_name} ${dependentToVerify.last_name}`}
                                initialData={dependentToVerify.verifications?.[0]}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
