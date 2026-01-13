"use client"

import { useState } from "react"
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
import DependentForm from "@/components/profile/CreateDependentForm"
import DependentCard from "@/components/profile/DependentCard"
import DependentSkeleton from "@/components/profile/DependentSkeleton"

interface DependentComponentProps {
    userId: string;
    dependents: IDependent[];
    onRefresh: () => void;
    onRequestVerification: (dependent: IDependent) => void;
}

export default function DependentTab({ userId, dependents, onRefresh, onRequestVerification }: DependentComponentProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddSuccessPrompt, setShowAddSuccessPrompt] = useState(false);
    const [lastAddedDependent, setLastAddedDependent] = useState<IDependent | undefined>();

    const handleAddDependent = () => {
        setShowAddForm(true);
    };

    const handleAddFormSuccess = (created: IDependent) => {
        setLastAddedDependent(created);
        setShowAddForm(false);
        setShowAddSuccessPrompt(true);
        onRefresh();
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
            onRequestVerification(lastAddedDependent);
        }
        setLastAddedDependent(undefined);
    };

    const handleAddSuccessDone = () => {
        setShowAddSuccessPrompt(false);
        setLastAddedDependent(undefined);
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
                    {dependents.length === 0 ? (
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
                                    onRefresh={onRefresh}
                                    onRequestVerification={() => onRequestVerification(dependent)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal for Adding New Dependent */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="text-green-700">Dependent Added!</CardTitle>
                            <CardDescription>
                                <strong>{lastAddedDependent.first_name} {lastAddedDependent.last_name}</strong> has been added successfully.
                                Would you like to verify their identity for discounts?
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
        </div>
    )
}
