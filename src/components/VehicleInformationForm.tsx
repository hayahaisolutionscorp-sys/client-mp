'use client';

import { useState, FC, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { FiPlus, FiTrash } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter, useSearchParams } from 'next/navigation';

import { getRateTableRowsByRateTableId } from '@/services';
import { formatCurrency } from 'helpers/general.helpers';
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
}

interface VehicleInformationFormProps {
  rateTableId: number;
  vehicleSlots: number;
  title?: string;
  passengerDetails?: PassengerDetails | undefined;
  onChange?: (vehicles: VehicleData[]) => void;
  cargoRequired?: boolean;
}

const VehicleInformationForm: FC<VehicleInformationFormProps> = ({
  rateTableId,
  vehicleSlots,
  title = '',
  passengerDetails = undefined,
  cargoRequired = false,
  onChange
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypes[]>([]);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [combinedPassengerData, setCombinedPassengerData] = useState<PassengerData[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleRemoveVehicle = (id: number) => {
    updateVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
  };

  const handleUpdateVehicle = (
    id: number,
    field: keyof VehicleData,
    value: string,
    vehicleTypeId: number,
    vehicleTypeDescription: string,
    driverId: number
  ) => {
    // Update the vehicle in the vehicles array
    const updatedVehicles = vehicles.map((vehicle) =>
      vehicle.id === id
        ? {
            ...vehicle,
            [field]: value,
            vehicleTypeId: vehicleTypeId,
            vehicleTypeDescription: vehicleTypeDescription,
            driverId: driverId
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
    if (rateTableId) {
      getRateTableRowsByRateTableId(rateTableId).then((data) => {
        const rows = Array.isArray(data) ? data : [data];
        const vehicleTypesList = rows
          .filter((row) => row.vehicleType && row.vehicleType.name) // Ensure valid rows with vehicleType
          .map((row) => ({
            vehicleTypeId: row.vehicleTypeId,
            vehicleTypeName: row.vehicleType.name,
            vehicleTypeDescription: row.vehicleType.description,
            vehicleFare: row.fare
          }))
          .sort((a, b) => a.vehicleTypeName.localeCompare(b.vehicleTypeName)); // Sort alphabetically by vehicleTypeName

        setVehicleTypes(vehicleTypesList);
      });
    }
  }, [rateTableId]);

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
    <div>
      {cargoRequired && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Vehicle information is required for this trip.
          </p>
        </div>
      )}
      {/* <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center ${
          title ? "h-[40px]" : ""
        } space-y-4 sm:space-y-0`}
      >
        <h3 className="text-lg w-full font-semibold text-customText">{title}</h3>
  
        {vehicles.length === 0 && (
        <div className="flex justify-center w-full mt-4 sm:justify-end">
          <Button
            variant="outline"
            className="w-full gap-2 py-2 px-4 sm:px-6 md:w-auto"
            onClick={handleAddVehicle}
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Vehicle or Cargo</span>
          </Button>
        </div>
      )}
      </div> */}

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
                    vehicle.driverId
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
                    vehicle.driverId
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
                    vehicle.driverId
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes?.map((row) => (
                    <SelectItem key={row.vehicleTypeId} value={row?.vehicleTypeName}>
                      {row?.vehicleTypeName} - ({formatCurrency(row?.vehicleFare || 0)})
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
                Driver Name
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
                      selectedDriverId
                    );
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver" />
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

      <div className="flex justify-center md:justify-end items-center mt-6">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={handleAddVehicle}
          disabled={vehicles.length >= (vehicleSlots || 1)}
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Vehicle or Cargo</span>
          {vehicles.length > 0 && <Badge>{vehicles.length}</Badge>}
        </Button>
      </div>

      {/* {vehicles.length > 0 && (
        <div className="flex justify-center md:justify-end items-center mt-6">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleAddVehicle}
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Vehicle or Cargo</span>
            {vehicles.length > 0 && (
              <Badge className="flex justify-center items-center bg-customBlue ml-1">
                {vehicles.length}
              </Badge>
            )}
          </Button>
        </div>
      )} */}
    </div>
  );
};

export default VehicleInformationForm;
