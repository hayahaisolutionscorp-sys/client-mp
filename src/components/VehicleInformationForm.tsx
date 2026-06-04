'use client';

import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle, ForwardRefRenderFunction } from 'react';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { FiTrash } from 'react-icons/fi';
import { PiInfo } from 'react-icons/pi';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertModal } from '@/components/ui/AlertModal';

import { getVehicleTypes } from '@/services';
import { useThemeSettings } from '@/hooks/theme-settings';
import { hexToRgb } from 'helpers/theme.helpers';
import { PassengerData } from '@/types/booking/passenger-data';
import { VehicleData } from '@/types/booking/vehicle-data';
import { useAuth } from '@/contexts/AuthContexts';
import { getVehiclesWithVerification } from '@/services/user/profiles.service';
import type { IVehicle } from '@/models';

interface PassengerDetails {
  passenger: PassengerData;
  companions: PassengerData[];
}

interface VehicleTypes {
  vehicleTypeId: number;
  vehicleTypeName: string;
  vehicleTypeDescription: string;
  vehicleFare: number | 0;
  cargo_class?: string;
  weight_limit?: number;
}

type VehicleClassOption = {
  code: string;
  display: string;
  vehicleTypeId?: number | null;
  weight_limit?: number;
};

export interface VehicleInformationFormHandle {
  addVehicle: () => void;
}

interface VehicleInformationFormProps {
  rateTableId: number;
  vehicleSlots: number;
  title?: string;
  passengerDetails?: PassengerDetails | undefined;
  onChange?: (vehicles: VehicleData[]) => void;
  cargoRequired?: boolean;
  initialVehicles?: VehicleData[];
  shippingLineId?: string;
  isCrossTenant?: boolean;
  leg2ShippingLineId?: string;
  vehicleClasses?: VehicleClassOption[];
  leg2VehicleClasses?: VehicleClassOption[];
}

const VehicleInformationForm: ForwardRefRenderFunction<VehicleInformationFormHandle, VehicleInformationFormProps> = ({
  vehicleSlots,
  title = '',
  passengerDetails = undefined,
  cargoRequired = false,
  initialVehicles,
  onChange,
  shippingLineId,
  isCrossTenant = false,
  leg2ShippingLineId,
  vehicleClasses,
  leg2VehicleClasses
}, ref) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const themeSettings = useThemeSettings();

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypes[]>([]);
  const [leg2VehicleTypes, setLeg2VehicleTypes] = useState<VehicleTypes[]>([]);
  const [vehicles, setVehicles] = useState<VehicleData[]>(initialVehicles || []);
  const [savedVehicles, setSavedVehicles] = useState<IVehicle[]>([]);
  const [combinedPassengerData, setCombinedPassengerData] = useState<PassengerData[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasAppliedSavedVehicles, setHasAppliedSavedVehicles] = useState(false);
  const { currentUser } = useAuth();

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: '',
    description: ''
  });

  const generateUniqueNumber = (): number => {
    return (Date.now() + Math.floor(Math.random() * 1000)) * -1;
  };

  const createBlankVehicle = useCallback((): VehicleData => ({
    id: generateUniqueNumber(),
    vehicleTypeId: 0,
    vehicleTypeDescription: '',
    modelName: '',
    plateNumber: '',
    modelBody: '',
    driverName: '',
    driverId: 0,
    weight: undefined,
    weight_limit: undefined
  }), []);

  const normalizePlate = (plateNumber?: string | null) => (plateNumber || '').trim().toUpperCase();
  const normalizeName = (passenger: Pick<PassengerData, 'firstname' | 'lastname'>) =>
    `${passenger.firstname} ${passenger.lastname}`.trim().toLowerCase();

  const isEmptyVehicle = (vehicle: VehicleData) =>
    !vehicle.plateNumber.trim() && !vehicle.modelName.trim() && !vehicle.modelBody.trim();

  const approvedSavedVehicles = useMemo(
    () => savedVehicles.filter((vehicle) => vehicle.status === 'approved'),
    [savedVehicles]
  );

  const getSavedVehicleTypeId = (vehicle: IVehicle) =>
    vehicle.vehicle_model?.vehicle_type?.id ||
    vehicle.vehicleType?.id ||
    vehicle.vehicle_type_id ||
    0;

  const getSavedVehicleTypeName = (vehicle: IVehicle) =>
    vehicle.vehicle_model?.vehicle_type?.name ||
    vehicle.vehicleType?.name ||
    (vehicle as IVehicle & { type?: string }).type ||
    '';

  const getSavedVehicleModelName = (vehicle: IVehicle) => {
    const make = vehicle.vehicle_model?.make || vehicle.make || '';
    const model = vehicle.vehicle_model?.model || vehicle.model || '';
    return [make, model].filter(Boolean).join(' ').trim() || model;
  };

  const loggedInPassengerOwner = useMemo<PassengerData | null>(() => {
    const profile = currentUser?.passenger;
    if (!profile?.id || !profile.firstName || !profile.lastName) return null;

    return {
      id: profile.id,
      firstname: profile.firstName,
      middlename: profile.middleName,
      lastname: profile.lastName,
      suffixName: profile.suffixName,
      sex: profile.sex || 'Male',
      dob: profile.birthdayIso || '',
      nationality: profile.nationality || 'Filipino',
      accommodation: '',
      address: profile.address || '',
      discountType: profile.discountType || 'ADULT'
    };
  }, [currentUser?.passenger]);

  const vehicleOwnerOptions = useMemo(() => {
    const owners: PassengerData[] = [];
    const seenIds = new Set<number>();
    const seenNames = new Set<string>();

    const addOwner = (owner?: PassengerData | null) => {
      if (!owner?.id || !owner.firstname || !owner.lastname) return;
      const normalizedName = normalizeName(owner);
      if (seenIds.has(owner.id) || seenNames.has(normalizedName)) return;

      owners.push(owner);
      seenIds.add(owner.id);
      seenNames.add(normalizedName);
    };

    addOwner(loggedInPassengerOwner);
    combinedPassengerData.forEach(addOwner);

    return owners;
  }, [combinedPassengerData, loggedInPassengerOwner]);

  const findMatchingVehicleType = useCallback((vehicle: IVehicle) => {
    const savedTypeId = getSavedVehicleTypeId(vehicle);
    const savedTypeName = getSavedVehicleTypeName(vehicle).trim().toLowerCase();

    return vehicleTypes.find((type) => {
      if (savedTypeId && type.vehicleTypeId === savedTypeId) return true;
      return savedTypeName && type.vehicleTypeName.trim().toLowerCase() === savedTypeName;
    });
  }, [vehicleTypes]);

  const mapSavedVehicleToFormVehicle = useCallback((vehicle: IVehicle): VehicleData | null => {
    const matchingType = findMatchingVehicleType(vehicle);
    if (!matchingType) return null;

    return {
      id: generateUniqueNumber(),
      vehicleTypeId: matchingType.vehicleTypeId,
      vehicleTypeDescription: matchingType.vehicleTypeDescription,
      modelName: getSavedVehicleModelName(vehicle),
      plateNumber: vehicle.plate_number || '',
      modelBody: matchingType.vehicleTypeName,
      driverName: '',
      driverId: 0,
      cargo_class: matchingType.cargo_class,
      weight: undefined,
      weight_limit: matchingType.weight_limit
    };
  }, [findMatchingVehicleType]);

  // Notify parent component about state updates
  const updateVehicles = useCallback(
    (newVehicles: VehicleData[]) => {
      setVehicles(newVehicles);
      if (onChange) onChange(newVehicles); // Call onChange when state updates
    },
    [onChange]
  );

  const canAppendVehicle = () => {
    const passengerCountFromQuery = Number.parseInt(searchParams.get('passengerCount') || '1', 10);
    const totalPassengers = Math.max(combinedPassengerData.length, passengerCountFromQuery || 1);

    if (vehicleSlots > 0 && vehicles.length >= vehicleSlots) {
      setAlertModal({
        isOpen: true,
        title: 'Vehicle Slot Limit Reached',
        description: `Only ${vehicleSlots} vehicle slot(s) are currently available for this trip.`
      });
      return false;
    }

    if (vehicles.length >= totalPassengers) {
      setAlertModal({
        isOpen: true,
        title: 'Vehicle Limit Reached',
        description: `Cannot add more vehicles. The number of vehicles cannot exceed the number of passengers (${totalPassengers}).`
      });
      return false;
    }

    return true;
  };

  const handleAddVehicle = () => {
    if (!canAppendVehicle()) return;

    updateVehicles([
      ...vehicles,
      createBlankVehicle()
    ]);
  };

  const handleAddSavedVehicle = (savedVehicle: IVehicle) => {
    const plate = normalizePlate(savedVehicle.plate_number);
    if (plate && vehicles.some((vehicle) => normalizePlate(vehicle.plateNumber) === plate)) return;

    const vehicleData = mapSavedVehicleToFormVehicle(savedVehicle);
    if (!vehicleData) {
      setAlertModal({
        isOpen: true,
        title: 'Vehicle Type Unavailable',
        description: 'This saved vehicle type is not available for the selected trip.'
      });
      return;
    }

    const emptyVehicleIndex = vehicles.findIndex(isEmptyVehicle);
    if (emptyVehicleIndex >= 0) {
      const updatedVehicles = vehicles.map((vehicle, index) => (
        index === emptyVehicleIndex ? vehicleData : vehicle
      ));
      updateVehicles(updatedVehicles);
      return;
    }

    if (!canAppendVehicle()) return;
    updateVehicles([...vehicles, vehicleData]);
  };

  useImperativeHandle(ref, () => ({
    addVehicle: handleAddVehicle
  }));

  const handleRemoveVehicle = (id: number) => {
    updateVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
  };

  const handleUpdateVehicle = (
    id: number,
    field: keyof VehicleData,
    value: string,
    vehicleTypeId: number,
    vehicleTypeDescription: string,
    driverId: number,
    cargo_class?: string,
    weight_limit?: number
  ) => {
    // Update the vehicle in the vehicles array
    const updatedVehicles = vehicles.map((vehicle) =>
      vehicle.id === id
        ? {
          ...vehicle,
          [field]: value,
          vehicleTypeId: vehicleTypeId,
          vehicleTypeDescription: vehicleTypeDescription,
          driverId: driverId,
          cargo_class: cargo_class,
          weight_limit: weight_limit
        }
        : vehicle
    );

    // Update the state with the new vehicles list
    updateVehicles(updatedVehicles);

    // Validate all fields after the update
    const newErrors: { [key: string]: string } = {};
    updatedVehicles.forEach((vehicle) => {
      // Validate each field in the vehicle
      if (!vehicle.modelName) {
        newErrors[`${vehicle.id}-modelName`] = 'Model Name is required';
      }
      if (!vehicle.plateNumber) {
        newErrors[`${vehicle.id}-plateNumber`] = 'Plate Number is required';
      }
      if (!vehicle.modelBody) {
        newErrors[`${vehicle.id}-modelBody`] = 'Model Body is required';
      }
      if (!vehicle.driverName) {
        newErrors[`${vehicle.id}-driverName`] = 'Driver Name is required';
      }
    });

    // Update the errors state
    setErrors(newErrors);
  };

  useEffect(() => {
    setHasAppliedSavedVehicles(false);

    if (currentUser?.id) {
      setSavedVehicles([]);
      getVehiclesWithVerification(currentUser.id).then(setSavedVehicles).catch(() => setSavedVehicles([]));
    } else {
      setSavedVehicles([]);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (vehicleClasses?.length) {
      setVehicleTypes(vehicleClasses
        .filter(vc => vc.vehicleTypeId != null)
        .map(vc => ({
          vehicleTypeId: vc.vehicleTypeId!,
          vehicleTypeName: vc.display,
          vehicleTypeDescription: '',
          vehicleFare: 0,
          cargo_class: undefined,
          weight_limit: vc.weight_limit
        })));
    } else {
      getVehicleTypes(shippingLineId).then((vehicleTypesData) => {
        if (!vehicleTypesData) { setVehicleTypes([]); return; }
        setVehicleTypes(vehicleTypesData
          .map((vt: { id: number; name: string; description: string }) => ({
            vehicleTypeId: vt.id,
            vehicleTypeName: vt.name,
            vehicleTypeDescription: vt.description,
            vehicleFare: 0,
            cargo_class: (vt as { cargo_class?: string }).cargo_class,
            weight_limit: (vt as { weight_limit?: number }).weight_limit
          }))
          .sort((a: VehicleTypes, b: VehicleTypes) => a.vehicleTypeName.localeCompare(b.vehicleTypeName)));
      }).catch(() => setVehicleTypes([]));
    }
  }, [vehicleClasses, shippingLineId]);

  // Fetch leg 2 vehicle types for cross-tenant
  useEffect(() => {
    if (!isCrossTenant) return;
    if (leg2VehicleClasses?.length) {
      setLeg2VehicleTypes(leg2VehicleClasses
        .filter(vc => vc.vehicleTypeId != null)
        .map(vc => ({
          vehicleTypeId: vc.vehicleTypeId!,
          vehicleTypeName: vc.display,
          vehicleTypeDescription: '',
          vehicleFare: 0,
          cargo_class: undefined,
          weight_limit: vc.weight_limit
        })));
    } else if (leg2ShippingLineId) {
      getVehicleTypes(leg2ShippingLineId).then((data) => {
        if (!data) { setLeg2VehicleTypes([]); return; }
        setLeg2VehicleTypes(data
          .map((vt: { id: number; name: string; description: string }) => ({
            vehicleTypeId: vt.id,
            vehicleTypeName: vt.name,
            vehicleTypeDescription: vt.description,
            vehicleFare: 0,
            cargo_class: (vt as { cargo_class?: string }).cargo_class,
            weight_limit: (vt as { weight_limit?: number }).weight_limit
          }))
          .sort((a: VehicleTypes, b: VehicleTypes) => a.vehicleTypeName.localeCompare(b.vehicleTypeName)));
      }).catch(() => setLeg2VehicleTypes([]));
    }
  }, [isCrossTenant, leg2VehicleClasses, leg2ShippingLineId]);

  useEffect(() => {
    if (passengerDetails) {
      setCombinedPassengerData([passengerDetails.passenger, ...passengerDetails.companions]);
    } else {
      setCombinedPassengerData([]);
    }
  }, [passengerDetails]);

  useEffect(() => {
    const vehicleCount = parseInt(searchParams.get('vehicleCount') || '0', 10);
    const passengerCount = parseInt(searchParams.get('passengerCount') || '0', 10);

    if (vehicleCount > passengerCount) router.back();

    // Add vehicle forms automatically if vehicleCount is not empty and vehicleCount > 0
    if (vehicleCount && vehicleCount > 0 && vehicles.length === 0) {
      const newVehicles = Array.from({ length: vehicleCount }).map(createBlankVehicle);
      updateVehicles(newVehicles);
    }
  }, [searchParams, router, updateVehicles, vehicles.length, createBlankVehicle]);

  useEffect(() => {
    const vehicleCount = parseInt(searchParams.get('vehicleCount') || '0', 10);
    const hasOnlyEmptyVehicles = vehicles.length > 0 && vehicles.every(isEmptyVehicle);

    if (
      hasAppliedSavedVehicles ||
      vehicleCount <= 0 ||
      approvedSavedVehicles.length === 0 ||
      vehicleTypes.length === 0 ||
      (vehicles.length > 0 && !hasOnlyEmptyVehicles)
    ) {
      return;
    }

    const savedVehicleRows = approvedSavedVehicles
      .map(mapSavedVehicleToFormVehicle)
      .filter((vehicle): vehicle is VehicleData => !!vehicle)
      .slice(0, vehicleCount);

    if (savedVehicleRows.length === 0) {
      setHasAppliedSavedVehicles(true);
      return;
    }

    const blankRows = Array.from({
      length: Math.max(0, vehicleCount - savedVehicleRows.length)
    }).map(createBlankVehicle);

    updateVehicles([...savedVehicleRows, ...blankRows]);
    setHasAppliedSavedVehicles(true);
  }, [
    approvedSavedVehicles,
    createBlankVehicle,
    hasAppliedSavedVehicles,
    mapSavedVehicleToFormVehicle,
    searchParams,
    updateVehicles,
    vehicleTypes.length,
    vehicles
  ]);

  useEffect(() => {
    // Add initial vehicle if cargo is required and no vehicles exist
    if (cargoRequired && vehicles.length === 0) {
      updateVehicles([
        createBlankVehicle()
      ]);
    }
  }, [cargoRequired, createBlankVehicle, updateVehicles, vehicles.length]); // Add cargoRequired to dependencies

  // Update the early return condition
  if (!cargoRequired && vehicleSlots === 0 && vehicles.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">



      {approvedSavedVehicles.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-md font-semibold mb-3 text-customText">Add Vehicle from Saved Vehicles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedSavedVehicles.map((savedVehicle) => {
              const plate = normalizePlate(savedVehicle.plate_number);
              const isAdded = vehicles.some((vehicle) => normalizePlate(vehicle.plateNumber) === plate);
              const matchingType = findMatchingVehicleType(savedVehicle);
              const modelName = getSavedVehicleModelName(savedVehicle) || 'Saved vehicle';
              const typeName = matchingType?.vehicleTypeName || getSavedVehicleTypeName(savedVehicle) || 'Vehicle';

              return (
                <div
                  key={savedVehicle.id}
                  className={`p-3 border rounded-md bg-white ${isAdded ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-sm text-customText">{savedVehicle.plate_number}</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          Verified
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{modelName}</p>
                      <p className="text-xs text-gray-500">{typeName}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddSavedVehicle(savedVehicle)}
                      disabled={isAdded || !matchingType}
                      className="h-8 py-1 shrink-0"
                      style={{
                        borderColor: themeSettings?.accent || '#23abff',
                        color: themeSettings?.accent || '#23abff'
                      }}
                    >
                      {isAdded ? 'Added' : matchingType ? 'Add' : 'Unavailable'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {vehicles.map((vehicle, index) => (
        <div key={vehicle.id} className="border rounded-lg shadow-md bg-white p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
            <h3 className="text-lg font-semibold text-customText">Vehicle {index + 1} Information</h3>
            <Button
              variant={null}
              className="border-2 border-red-500 text-red-500 flex items-center"
              onClick={() => handleRemoveVehicle(vehicle.id)}
              disabled={cargoRequired && vehicles.length <= 1}
            >
              <FiTrash className="w-4 h-4" />
              <span>Remove</span>
            </Button>
          </div>

          <div
            className="mb-4 p-4 border rounded-lg flex items-start"
            style={{
              backgroundColor: `rgba(${hexToRgb(themeSettings?.accent || '#23abff')}, 0.1)`,
              borderColor: `rgba(${hexToRgb(themeSettings?.accent || '#23abff')}, 0.3)`
            }}
          >
            <PiInfo
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              style={{ color: themeSettings?.accent || '#23abff' }}
            />
            <p className="text-sm text-customText">
              <strong>Please choose the correct Model Body.</strong> Any misdeclaration of information will automatically void the ticket&apos;s validity and make it non-refundable.
            </p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${title ? 'gap-4' : 'gap-6'}`}>
            {/* Model Name */}
            <div>
              <label htmlFor={`modelName-${vehicle.id}`} className="block text-sm font-medium text-customText">
                Model Name
              </label>
              <Input
                id={`modelName-${vehicle.id}`}
                value={vehicle.modelName}
                placeholder="Toyota Innova, Vios, Hilux"
                onChange={(e) =>
                  handleUpdateVehicle(
                    vehicle.id,
                    'modelName',
                    e.target.value,
                    vehicle.vehicleTypeId,
                    vehicle.vehicleTypeDescription,
                    vehicle.driverId,
                    vehicle.cargo_class
                  )
                }
              />
              {!vehicle.modelName.trim() && errors[`${vehicle.id}-modelName`] && (
                <p className="text-sm text-red-500 mt-1">{errors[`${vehicle.id}-modelName`]}</p>
              )}
            </div>

            {/* Plate Number */}
            <div>
              <label htmlFor={`plateNumber-${vehicle.id}`} className="block text-sm font-medium text-customText">
                Plate Number
              </label>
              <Input
                id={`plateNumber-${vehicle.id}`}
                value={vehicle.plateNumber}
                placeholder="e.g. G40183"
                onChange={(e) =>
                  handleUpdateVehicle(
                    vehicle.id,
                    'plateNumber',
                    e.target.value,
                    vehicle.vehicleTypeId,
                    vehicle.vehicleTypeDescription,
                    vehicle.driverId,
                    vehicle.cargo_class
                  )
                }
              />
              {!vehicle.plateNumber.trim() && errors[`${vehicle.id}-plateNumber`] && (
                <p className="text-sm text-red-500 mt-1">{errors[`${vehicle.id}-plateNumber`]}</p>
              )}
            </div>

            {/* Model Body */}
            <div>
              <label htmlFor={`modelBody-${vehicle.id}`} className="block text-sm font-medium text-customText">
                Model Body
              </label>
              <Select
                value={vehicle.modelBody}
                onValueChange={(value) => {
                  const selectedVehicleType = vehicleTypes?.find((row) => row?.vehicleTypeName === value);
                  handleUpdateVehicle(
                    vehicle.id,
                    'modelBody',
                    value,
                    selectedVehicleType?.vehicleTypeId || 0,
                    selectedVehicleType?.vehicleTypeDescription || '',
                    vehicle.driverId,
                    selectedVehicleType?.cargo_class,
                    selectedVehicleType?.weight_limit
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes?.map((row) => (
                    <SelectItem key={row.vehicleTypeId} value={row?.vehicleTypeName}>
                      {row?.vehicleTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!vehicle.modelBody.trim() && errors[`${vehicle.id}-modelBody`] && (
                <p className="text-sm text-red-500 mt-1">{errors[`${vehicle.id}-modelBody`]}</p>
              )}
            </div>

            {/* Model Body (Leg 2) — cross-tenant only */}
            {isCrossTenant && (
              <div>
                <label htmlFor={`leg2ModelBody-${vehicle.id}`} className="flex items-center gap-1 text-sm font-medium text-customText">
                  Model Body (Leg 2)
                  <span title="Different shipping lines may have different vehicle classifications. Select the vehicle type for the second leg.">
                    <PiInfo className="w-4 h-4 text-gray-400 cursor-help" />
                  </span>
                </label>
                <Select
                  value={vehicle.leg2ModelBody || ''}
                  onValueChange={(value) => {
                    const selected = leg2VehicleTypes?.find((row) => row?.vehicleTypeName === value);
                    const updatedVehicles = vehicles.map((v) =>
                      v.id === vehicle.id
                        ? {
                          ...v,
                          leg2ModelBody: value,
                          leg2VehicleTypeId: selected?.vehicleTypeId || 0,
                          leg2VehicleTypeDescription: selected?.vehicleTypeDescription || '',
                          leg2CargoClass: selected?.cargo_class,
                          leg2Weight_limit: selected?.weight_limit
                        }
                        : v
                    );
                    updateVehicles(updatedVehicles);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {leg2VehicleTypes?.map((row) => (
                      <SelectItem key={row.vehicleTypeId} value={row?.vehicleTypeName}>
                        {row?.vehicleTypeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Driver Name */}
            <div>
              <label htmlFor={`driverName-${vehicle.id}`} className="block text-sm font-medium text-customText">
                Vehicle Owner
              </label>
              <Select
                value={vehicle.driverId.toString()}
                onValueChange={(value) => {
                  const selectedDriverId = parseInt(value, 10);
                  const selectedDriver = vehicleOwnerOptions.find((passenger) => passenger.id === selectedDriverId);
                  if (selectedDriver) {
                    handleUpdateVehicle(
                      vehicle.id,
                      'driverName',
                      `${selectedDriver.firstname} ${selectedDriver.lastname}`,
                      vehicle.vehicleTypeId,
                      vehicle.vehicleTypeDescription,
                      selectedDriverId,
                      vehicle.cargo_class
                    );
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle owner" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleOwnerOptions.length > 0 &&
                    vehicleOwnerOptions
                      .filter(
                        (passenger) =>
                          !vehicles.some(
                            (v) =>
                              v.id !== vehicle.id && // Exclude current vehicle
                              v.driverId === passenger.id // Check by ID instead of name
                          )
                      )
                      .map((passenger) => (
                        <SelectItem key={passenger.id} value={passenger.id.toString()}>
                          {`${passenger.firstname} ${passenger.lastname}`}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
              {!vehicle.driverName.trim() && errors[`${vehicle.id}-driverName`] && (
                <p className="text-sm text-red-500 mt-1">{errors[`${vehicle.id}-driverName`]}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        description={alertModal.description}
        variant="warning"
      />
    </div>
  );
};

export default forwardRef(VehicleInformationForm);
