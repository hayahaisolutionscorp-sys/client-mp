'use client';

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, ForwardRefRenderFunction } from 'react';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { FiPlus, FiTrash } from 'react-icons/fi';
import { PiInfo } from 'react-icons/pi';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertModal } from '@/components/ui/AlertModal';

import { getVehicleTypes } from '@/services';
import { formatCurrency } from 'helpers/general.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import { hexToRgb } from 'helpers/theme.helpers';
import { PassengerData } from '@/types/booking/passenger-data';
import { VehicleData } from '@/types/booking/vehicle-data';

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
}

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
}

const VehicleInformationForm: ForwardRefRenderFunction<VehicleInformationFormHandle, VehicleInformationFormProps> = ({
  rateTableId,
  vehicleSlots,
  title = '',
  passengerDetails = undefined,
  cargoRequired = false,
  initialVehicles,
  onChange
}, ref) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const themeSettings = useThemeSettings();

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypes[]>([]);
  const [vehicles, setVehicles] = useState<VehicleData[]>(initialVehicles || []);
  const [combinedPassengerData, setCombinedPassengerData] = useState<PassengerData[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  // Notify parent component about state updates
  const updateVehicles = useCallback(
    (newVehicles: VehicleData[]) => {
      setVehicles(newVehicles);
      if (onChange) onChange(newVehicles); // Call onChange when state updates
    },
    [onChange]
  );

  const handleAddVehicle = () => {
    const totalPassengers = combinedPassengerData.length;
    if (vehicles.length >= totalPassengers) {
      setAlertModal({
        isOpen: true,
        title: 'Vehicle Limit Reached',
        description: `Cannot add more vehicles. The number of vehicles cannot exceed the number of passengers (${totalPassengers}).`
      });
      return;
    }

    updateVehicles([
      ...vehicles,
      {
        id: generateUniqueNumber(),
        vehicleTypeId: 0,
        vehicleTypeDescription: '',
        modelName: '',
        plateNumber: '',
        modelBody: '',
        driverName: '',
        driverId: 0
      }
    ]);
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
    cargo_class?: string
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
          cargo_class: cargo_class
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
    // Fetch vehicle types from API
    getVehicleTypes().then((vehicleTypesData) => {
      if (!vehicleTypesData) {
        console.warn('No vehicle types data received');
        setVehicleTypes([]);
        return;
      }

      // Map vehicle types from API
      const vehicleTypesList = vehicleTypesData
        .map((vt: { id: number; name: string; description: string }) => ({
          vehicleTypeId: vt.id,
          vehicleTypeName: vt.name,
          vehicleTypeDescription: vt.description,
          vehicleFare: 0, // Fare not provided by vehicle types endpoint
          cargo_class: (vt as any).cargo_class // Map cargo_class from API
        }))
        .sort((a: VehicleTypes, b: VehicleTypes) => a.vehicleTypeName.localeCompare(b.vehicleTypeName));

      setVehicleTypes(vehicleTypesList);
    }).catch((error) => {
      console.error('Error fetching vehicle types:', error);
      setVehicleTypes([]);
    });
  }, []);

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
    if (vehicleCount && vehicleCount > 0) {
      const newVehicles = Array.from({ length: vehicleCount }).map(() => ({
        id: generateUniqueNumber(),
        vehicleTypeId: 0,
        vehicleTypeDescription: '',
        modelName: '',
        plateNumber: '',
        modelBody: '',
        driverName: '',
        driverId: 0
      }));
      updateVehicles(newVehicles);
    }
  }, [searchParams, router, updateVehicles]);

  useEffect(() => {
    // Add initial vehicle if cargo is required and no vehicles exist
    if (cargoRequired && vehicles.length === 0) {
      updateVehicles([
        {
          id: generateUniqueNumber(),
          vehicleTypeId: 0,
          vehicleTypeDescription: '',
          modelName: '',
          plateNumber: '',
          modelBody: '',
          driverName: '',
          driverId: 0
        }
      ]);
    }
  }, [cargoRequired, updateVehicles, vehicles.length]); // Add cargoRequired to dependencies

  // Update the early return condition
  if (!cargoRequired && (!vehicleSlots || vehicleSlots === 0)) {
    return null;
  }

  return (
    <div className="mt-8">



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
                    selectedVehicleType?.cargo_class
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

            {/* Driver Name */}
            <div>
              <label htmlFor={`driverName-${vehicle.id}`} className="block text-sm font-medium text-customText">
                Vehicle Owner
              </label>
              <Select
                value={vehicle.driverId.toString()}
                onValueChange={(value) => {
                  const selectedDriverId = parseInt(value, 10);
                  const selectedDriver = combinedPassengerData.find((passenger) => passenger.id === selectedDriverId);
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
                  {combinedPassengerData?.length > 0 &&
                    combinedPassengerData
                      .filter((passenger) => passenger.firstname && passenger.lastname)
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
