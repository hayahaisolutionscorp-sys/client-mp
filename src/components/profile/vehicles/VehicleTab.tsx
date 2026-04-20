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
import { Plus, Car, AlertTriangle } from "lucide-react"
import { IVehicle, IVehicleType } from "@/models"
import VehicleForm from "./VehicleForm"
import VehicleCard from "./VehicleCard"
import VehicleVerificationForm from "./VehicleVerificationForm"
import { getVehiclesWithVerification, createVehicles, updateVehicle, deleteVehicle } from "@/services"
import { getVehicleTypes } from "@/services/booking/vehicle-type.service"
import { Skeleton } from "@/components/ui/Skeleton"

interface VehicleTabProps {
    userId: string;
}

export default function VehicleTab({ userId }: VehicleTabProps) {
    const [vehicles, setVehicles] = useState<IVehicle[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<IVehicleType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<IVehicle | undefined>();
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [vehicleToVerify, setVehicleToVerify] = useState<IVehicle | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<IVehicle | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const refreshVehicles = async () => {
        setIsLoading(true);
        try {
            const [data, types] = await Promise.all([
                getVehiclesWithVerification(userId),
                getVehicleTypes()
            ]);
            
            setVehicleTypes(types || []);

            setVehicles(data || []);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshVehicles();
    }, [userId]);

    const handleAddVehicle = () => {
        setEditingVehicle(undefined);
        setShowForm(true);
    };

    const handleEditVehicle = (vehicle: IVehicle) => {
        setEditingVehicle(vehicle);
        setShowForm(true);
    };

    const handleDeleteVehicle = (vehicle: IVehicle) => {
        setVehicleToDelete(vehicle);
    };

    const handleConfirmDelete = async () => {
        if (!vehicleToDelete) return;
        setIsDeleting(true);
        try {
            await deleteVehicle(vehicleToDelete.id);
            setVehicleToDelete(null);
            refreshVehicles();
        } catch (error) {
            console.error("Error deleting vehicle:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFormSuccess = async (vehicleData: Partial<IVehicle>) => {
        try {
            if (editingVehicle) {
                await updateVehicle(editingVehicle.id, vehicleData);
            } else {
                await createVehicles(userId, [vehicleData]);
            }
            setShowForm(false);
            refreshVehicles();
        } catch (error) {
            console.error("Error saving vehicle:", error);
        }
    };

    const handleRequestVerification = (vehicle: IVehicle) => {
        setVehicleToVerify(vehicle);
        setShowVerificationModal(true);
    };

    const handleVerificationSubmit = () => {
        refreshVehicles();
        setShowVerificationModal(false);
        setVehicleToVerify(null);
    };

    return (
        <div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1">
                        <CardTitle>Vehicles</CardTitle>
                        <CardDescription>Manage your vehicles for faster ferry bookings and cargo services.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddVehicle}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vehicle
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                                    <Skeleton className="h-12 w-12 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        vehicles.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground space-y-3">
                                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                    <Car className="h-6 w-6" />
                                </div>
                                <p>No vehicles added yet.</p>
                                <Button variant="outline" className="mt-4" onClick={handleAddVehicle}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Vehicle
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {vehicles.map((vehicle) => (
                                    <VehicleCard
                                        key={vehicle.id}
                                        vehicle={vehicle}
                                        vehicleTypes={vehicleTypes}
                                        onEdit={handleEditVehicle}
                                        onDelete={() => handleDeleteVehicle(vehicle)}
                                        onRequestVerification={handleRequestVerification}
                                    />
                                ))}
                            </div>
                        ))}
                </CardContent>
            </Card>

            {/* Vehicle Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <Card className="w-full max-w-2xl">
                        <CardContent className="p-0">
                            <VehicleForm
                                vehicle={editingVehicle}
                                onSuccess={handleFormSuccess}
                                onCancel={() => setShowForm(false)}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Verification Modal */}
            {showVerificationModal && vehicleToVerify && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar">
                        <CardContent className="p-0">
                            <VehicleVerificationForm
                                userId={userId}
                                vehicleId={vehicleToVerify.id}
                                plateNumber={vehicleToVerify.plate_number}
                                initialData={vehicleToVerify.verifications?.[0]}
                                onSubmit={handleVerificationSubmit}
                                onCancel={() => setShowVerificationModal(false)}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {vehicleToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <Card className="w-full max-w-sm">
                        <CardHeader className="text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertTriangle className="h-7 w-7 text-red-600" />
                            </div>
                            <CardTitle className="text-red-700">Delete Vehicle?</CardTitle>
                            <CardDescription>
                                Are you sure you want to delete{" "}
                                <strong>{vehicleToDelete.plate_number}</strong>? This action cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 pt-2">
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete Vehicle"}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setVehicleToDelete(null)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
