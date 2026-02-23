"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select"
import { IVehicle, IVehicleModel, IVehicleType } from "@/models"
import { VehicleModelService } from "@/services/booking/vehicle-model.service"
import { getVehicleTypes } from "@/services/booking/vehicle-type.service"
import { Loader2 } from "lucide-react"
import Combobox from "@/components/ui/Combobox"

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const MOTORCYCLE_KEYWORDS = ["motorcycle", "motorbike", "motor", "bike", "mc"];

const isMotorcycleType = (typeName: string) =>
    MOTORCYCLE_KEYWORDS.some((kw) => typeName.toLowerCase().includes(kw));

// ------------------------------------------------------------------
// Schema factory — plate number rules differ by vehicle category
// ------------------------------------------------------------------
const createVehicleSchema = (isMotorcycle: boolean) =>
    z.object({
        plate_number: z
            .string()
            .min(1, "Plate number is required")
            .transform((val) => val.trim().toUpperCase().replace(/[\s-]+/, " "))
            .refine(
                (val) => {
                    if (isMotorcycle) {
                        // MC Examples: AB 1234, ABC 123, 1A 1234
                        return (
                            /^[A-Z]{2,3}\s?\d{3,4}$/.test(val) || 
                            /^[0-9][A-Z]\s?\d{4}$/.test(val)
                        );
                    }
                    // Private Examples: AAA 1234, AAA 123
                    return /^[A-Z]{3}\s?\d{3,4}$/.test(val);
                },
                {
                    message: isMotorcycle
                        ? "Enter a valid motorcycle plate (e.g. AB 1234, ABC 123, or 1A 1234)"
                        : "Enter a valid plate number (e.g. ABC 1234 or ABC 123)",
                }
            ),
        vehicle_model_id: z.string().min(1, "Vehicle model is required"),
        make: z.string().optional(),
        model: z.string().optional(),
        vehicle_type_id: z.string().optional(),
    }).superRefine((data, ctx) => {
        if (data.vehicle_model_id === "other") {
            if (!data.make || data.make.trim() === "") {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Make is required", path: ["make"] });
            }
            if (!data.model || data.model.trim() === "") {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Model is required", path: ["model"] });
            }
            if (!data.vehicle_type_id) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vehicle type is required", path: ["vehicle_type_id"] });
            }
        }
    });

type VehicleFormValues = z.infer<ReturnType<typeof createVehicleSchema>>;

interface VehicleFormProps {
    userId: string;
    vehicle?: IVehicle;
    onSuccess: (vehicle: IVehicle) => Promise<void>;
    onCancel: () => void;
}

export default function VehicleForm({ userId, vehicle, onSuccess, onCancel }: VehicleFormProps) {
    const [models, setModels] = useState<IVehicleModel[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<IVehicleType[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMotorcycle, setIsMotorcycle] = useState(false);

    // ------------------------------------------------------------------
    // Dynamic schema / resolver — rebuilds when isMotorcycle changes
    // ------------------------------------------------------------------
    const schema = useMemo(() => createVehicleSchema(isMotorcycle), [isMotorcycle]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors },
    } = useForm<VehicleFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            plate_number: vehicle?.plate_number || "",
            vehicle_model_id: vehicle?.vehicle_model_id?.toString() || "",
            make: vehicle?.vehicle_model?.make || "",
            model: vehicle?.vehicle_model?.model || "",
            vehicle_type_id: vehicle?.vehicle_model?.vehicle_type?.id?.toString() || "",
        },
    });

    const selectedModelId = watch("vehicle_model_id");
    const selectedTypeId  = watch("vehicle_type_id");

    // ------------------------------------------------------------------
    // Fetch models & types
    // ------------------------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [modelsData, typesData] = await Promise.all([
                    VehicleModelService.getAllVehicleModels(),
                    getVehicleTypes(),
                ]);
                setModels(modelsData);
                setVehicleTypes(typesData || []);
            } catch (error) {
                console.error("Error fetching form data:", error);
            } finally {
                setIsLoadingModels(false);
            }
        };
        fetchData();
    }, []);

    // ------------------------------------------------------------------
    // Derive isMotorcycle from selected model or selected type (for "other")
    // ------------------------------------------------------------------
    useEffect(() => {
        let motorcycle = false;

        if (selectedModelId === "other") {
            // "other" path: look up selected vehicle type name
            if (selectedTypeId) {
                const type = vehicleTypes.find((t) => t.id.toString() === selectedTypeId);
                if (type) motorcycle = isMotorcycleType(type.name);
            }
        } else if (selectedModelId) {
            // standard path: look up model's vehicle_type
            const chosen = models.find((m) => m.id.toString() === selectedModelId);
            if (chosen?.vehicle_type) motorcycle = isMotorcycleType(chosen.vehicle_type.name);
        }

        setIsMotorcycle(motorcycle);
    }, [selectedModelId, selectedTypeId, models, vehicleTypes]);

    // Re-validate plate number whenever isMotorcycle changes so the error message refreshes
    useEffect(() => {
        trigger("plate_number");
    }, [isMotorcycle, trigger]);

    // ------------------------------------------------------------------
    // Submit
    // ------------------------------------------------------------------
    const onSubmit = async (data: VehicleFormValues) => {
        setIsSubmitting(true);
        try {
            const vehicleData: any = {
                ...vehicle,
                user_id: userId,
                plate_number: data.plate_number,
            };

            if (data.vehicle_model_id === "other") {
                vehicleData.make            = data.make;
                vehicleData.model           = data.model;
                vehicleData.vehicle_type_id = parseInt(data.vehicle_type_id!);
                vehicleData.vehicle_model_id = null;
            } else {
                vehicleData.vehicle_model_id = parseInt(data.vehicle_model_id);
            }

            await onSuccess(vehicleData as IVehicle);
        } catch (error) {
            console.error("Error submitting vehicle form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const modelOptions = [
        ...models.map((m) => ({ value: m.id.toString(), label: `${m.make} ${m.model}` })),
        { value: "other", label: "Other (Not in list)" },
    ];

    const platePlaceholder = isMotorcycle ? "e.g. AB 1234 or 1A 1234" : "e.g. ABC 1234";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">{vehicle ? "Edit Vehicle" : "Add Vehicle"}</h3>
                <p className="text-sm text-muted-foreground">Enter the details of your vehicle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plate Number */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Plate Number
                        {isMotorcycle && (
                            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                                Motorcycle
                            </span>
                        )}
                    </label>
                    <Input
                        {...register("plate_number")}
                        placeholder={platePlaceholder}
                        className={errors.plate_number ? "border-red-500" : ""}
                    />
                    {errors.plate_number && (
                        <p className="text-xs text-red-500">{errors.plate_number.message}</p>
                    )}
                </div>

                {/* Vehicle Model */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Model</label>
                    <Combobox
                        values={modelOptions}
                        value={selectedModelId}
                        onChange={(value) => setValue("vehicle_model_id", value, { shouldValidate: true })}
                        placeholder={isLoadingModels ? "Loading models..." : "Select model"}
                        className={errors.vehicle_model_id ? "border-red-500" : ""}
                    />
                    {errors.vehicle_model_id && (
                        <p className="text-xs text-red-500">{errors.vehicle_model_id.message}</p>
                    )}
                </div>

                {/* "Other" fields */}
                {selectedModelId === "other" && (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Make</label>
                            <Input
                                {...register("make")}
                                placeholder="e.g. Honda"
                                className={errors.make ? "border-red-500" : ""}
                            />
                            {errors.make && (
                                <p className="text-xs text-red-500">{errors.make.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Model</label>
                            <Input
                                {...register("model")}
                                placeholder="e.g. Beat"
                                className={errors.model ? "border-red-500" : ""}
                            />
                            {errors.model && (
                                <p className="text-xs text-red-500">{errors.model.message}</p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Vehicle Type</label>
                            <Select
                                value={watch("vehicle_type_id")}
                                onValueChange={(value) =>
                                    setValue("vehicle_type_id", value, { shouldValidate: true })
                                }
                            >
                                <SelectTrigger className={errors.vehicle_type_id ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicleTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.vehicle_type_id && (
                                <p className="text-xs text-red-500">{errors.vehicle_type_id.message}</p>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoadingModels}>
                    {isSubmitting && <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>}
                    {!isSubmitting && (vehicle ? "Update Vehicle" : "Add Vehicle")}
                </Button>
            </div>
        </form>
    );
}
