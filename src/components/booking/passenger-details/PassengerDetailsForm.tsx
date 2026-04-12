'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, ForwardRefRenderFunction } from 'react';
import { FiTrash } from 'react-icons/fi';
import { PiInfo } from 'react-icons/pi';
import { GiCheckMark } from 'react-icons/gi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import NationalitySelector from '@/components/ui/NationalitySelector';
import { AlertModal } from '@/components/ui/AlertModal';
import type { DISCOUNT_TYPE } from 'constants/enum';
import { getDefaultDOB } from 'helpers/date.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import { hexToRgb } from 'helpers/theme.helpers';
import { getRateTableRowsByRateTableId } from '@/services';
import type { PassengerType } from '@/services/booking/passenger.service';
import { PassengerData } from '@/types/booking/passenger-data';
import { IRateTableRow, IDependent } from '@/models';
import { differenceInYears, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContexts';
import { getDependents } from '@/services/user/profiles.service';

interface PassengerDetails {
  passenger: PassengerData;
  companions: PassengerData[];
}

interface FareTypes {
  id: number;
  cabinId?: number;
  discountType?: keyof typeof DISCOUNT_TYPE;
  fare: number;
}

interface PassengerDetailsFormProps {
  rateTableId: number;
  title?: string;
  vehicleCount?: number;
  passengerDetails?: PassengerDetails | undefined;
  shippingLineId?: string;
  passengerTypeCodes?: string[];
  onChange?: (data: { passenger: PassengerData; companions: PassengerData[] }) => void;
  onAddVehicle?: () => void;
}

const PassengerDetailsForm: ForwardRefRenderFunction<{ handleAddCompanion: () => void }, PassengerDetailsFormProps> = ({ rateTableId, vehicleCount = 0, passengerDetails, shippingLineId, passengerTypeCodes, onChange, onAddVehicle }, ref) => {
  const generateUniqueNumber = (): number => {
    return (Date.now() + Math.floor(Math.random() * 1000)) * -1;
  };

  const [fareTypes, setFareTypes] = useState<FareTypes[]>([]);
  const [passengerTypes, setPassengerTypes] = useState<PassengerType[]>([]);
  const [companions, setCompanions] = useState<PassengerData[]>(passengerDetails?.companions || []);
  const [passenger, setPassenger] = useState<PassengerData>(passengerDetails?.passenger || {
    id: generateUniqueNumber(),
    firstname: '',
    lastname: '',
    sex: 'Male',
    dob: getDefaultDOB(),
    nationality: 'Filipino',
    accommodation: '',
    address: '',
    discountType: 'ADULT'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [userDependents, setUserDependents] = useState<IDependent[]>([]);
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    passenger: passengerDetails?.passenger || passenger,
    companions: passengerDetails?.companions || companions
  });
  const [isClient, setIsClient] = useState(false);
  const themeSettings = useThemeSettings();

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: '',
    description: ''
  });

  useEffect(() => {
    onChange?.(formData); // Notify parent AFTER rendering
  }, [formData, onChange]);

  useEffect(() => {
    if (passengerTypeCodes?.length) {
      setPassengerTypes(passengerTypeCodes.map(name => ({
        id: 0,
        code: name.toUpperCase(),
        name,
        description: '',
        age_min: null,
        age_max: null,
        requires_id: false,
        sort_order: 0,
        is_active: true,
      })));
    }
  }, [passengerTypeCodes]);

  useEffect(() => {
    if (currentUser?.id) {
      getDependents(currentUser.id).then(setUserDependents);
    } else {
      setUserDependents([]);
    }
  }, [currentUser]);

  // Auto-fill first passenger details if user is logged in
  useEffect(() => {
    if (currentUser?.passenger && !passenger.firstname && !passenger.lastname) {
      const profile = currentUser.passenger;
      const updatedPassenger = {
        ...passenger,
        firstname: profile.firstName || '',
        lastname: profile.lastName || '',
        sex: profile.sex || 'Male',
        dob: profile.birthdayIso ? format(new Date(profile.birthdayIso), 'yyyy-MM-dd') : getDefaultDOB(),
        nationality: profile.nationality || 'Filipino',
        address: profile.address || '',
      };
      setPassenger(updatedPassenger);
      setFormData(prev => ({ ...prev, passenger: updatedPassenger }));
    }
  }, [currentUser, passenger.firstname, passenger.lastname]);

  useEffect(() => {
    if (rateTableId) {
      getRateTableRowsByRateTableId(rateTableId).then((data) => {
        const rows = Array.isArray(data) ? data : [data];
        const fareTypesList = rows
          .filter((row: IRateTableRow) => row.cabinId && row.discountType)
          .map((row: IRateTableRow) => ({
            id: row.id,
            cabinId: row.cabinId,
            discountType: row.discountType,
            fare: row.fare
          }))
          .sort((a: FareTypes, b: FareTypes) =>
            a.discountType && b.discountType ? String(a.discountType).localeCompare(String(b.discountType)) : 0
          );

        setFareTypes(fareTypesList);

        // If no special rates are available, set all prices to regular
        if (fareTypesList.length === 0) {
          setPassenger((prev) => ({ ...prev, discountType: null }));
          setCompanions((prev) => prev.map((companion) => ({ ...companion, discountType: null })));
        }
      });
    }
  }, [rateTableId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDiscountTypeChange = (value: string | null, id: number, isCompanion: boolean) => {
    if (value === 'DRIVER') {
      const currentDriverCount = (passenger.discountType === 'DRIVER' ? 1 : 0) +
        companions.filter(c => c.discountType === 'DRIVER').length;

      const currentData = isCompanion ? companions.find(c => c.id === id) : passenger;
      const isAlreadyDriver = currentData?.discountType === 'DRIVER';

      if (!isAlreadyDriver && currentDriverCount >= vehicleCount) {
        setAlertModal({
          isOpen: true,
          title: 'Driver Limit Reached',
          description: `You can only select up to ${vehicleCount} Driver(s), which is the number of vehicles in your booking.`
        });
        return;
      }
    }

    let updatedData;
    if (isCompanion) {
      const updatedCompanions = companions.map((comp) => (comp.id === id ? { ...comp, discountType: value as any } : comp));
      setCompanions(updatedCompanions);
      updatedData = updatedCompanions.find(c => c.id === id);
      setFormData({
        passenger,
        companions: updatedCompanions
      });
    } else {
      const updatedPassenger = { ...passenger, discountType: value as any };
      setPassenger(updatedPassenger);
      updatedData = updatedPassenger;
      setFormData({
        passenger: updatedPassenger,
        companions
      });
    }

    if (updatedData) {
      const validationErrors = validateFields(updatedData, !isCompanion);
      setErrors((prev) => ({ ...prev, ...validationErrors }));
    }
  };

  useEffect(() => {
    const syncDriversWithVehicles = () => {
      let changed = false;
      let currentDriverCount = (passenger.discountType === 'DRIVER' ? 1 : 0) +
        companions.filter(c => c.discountType === 'DRIVER').length;

      let updatedPassenger = passenger;
      let updatedCompanions = [...companions];

      // Case 1: Driver count is less than vehicle count (Auto-assign)
      if (currentDriverCount < vehicleCount) {
        if (passenger.discountType !== 'DRIVER' && currentDriverCount < vehicleCount) {
          updatedPassenger = { ...passenger, discountType: 'DRIVER' as any };
          setPassenger(updatedPassenger);
          currentDriverCount++;
          changed = true;
        }

        updatedCompanions = updatedCompanions.map((comp) => {
          if (comp.discountType !== 'DRIVER' && currentDriverCount < vehicleCount) {
            currentDriverCount++;
            changed = true;
            return { ...comp, discountType: 'DRIVER' as any };
          }
          return comp;
        });
      }
      // Case 2: Driver count is more than vehicle count (Revert to Adult)
      else if (currentDriverCount > vehicleCount) {
        // Revert companions first (reverse order)
        for (let i = updatedCompanions.length - 1; i >= 0 && currentDriverCount > vehicleCount; i--) {
          if (updatedCompanions[i].discountType === 'DRIVER') {
            updatedCompanions[i] = { ...updatedCompanions[i], discountType: 'ADULT' as any };
            currentDriverCount--;
            changed = true;
          }
        }

        // Then revert main passenger if still over limit
        if (currentDriverCount > vehicleCount && updatedPassenger.discountType === 'DRIVER') {
          updatedPassenger = { ...updatedPassenger, discountType: 'ADULT' as any };
          setPassenger(updatedPassenger);
          currentDriverCount--;
          changed = true;
        }
      }

      if (changed) {
        setCompanions(updatedCompanions);
        setFormData({
          passenger: updatedPassenger,
          companions: updatedCompanions
        });
      }
    };

    syncDriversWithVehicles();
  }, [vehicleCount]);

  const uniqueFareTypes = Array.from(new Map(fareTypes.map((type) => [type.discountType, type])).values());

  const renderFareTypeSelector = (passenger: PassengerData, isCompanion = false) => {
    const filteredTypes = passengerTypes.filter(type => type.code === 'ADULT' || type.code === 'DRIVER');

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-customText mb-2">Passenger Type</label>
        <div className="flex items-center space-x-4 mt-2">
          {filteredTypes.map((type) => {
            const isDriver = type.code === 'DRIVER';
            const currentDriverCount = (formData.passenger.discountType === 'DRIVER' ? 1 : 0) +
              formData.companions.filter(c => c.discountType === 'DRIVER').length;

            const isDisabled = isDriver && passenger.discountType !== 'DRIVER' && currentDriverCount >= vehicleCount;

            return (
              <label key={type.id} className={`flex items-center ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="radio"
                  name={`discountType-${passenger.id}`}
                  value={type.code}
                  checked={passenger.discountType === type.code}
                  onChange={(e) => handleDiscountTypeChange(e.target.value, passenger.id, isCompanion)}
                  className="w-4 h-4 mr-2 cursor-pointer"
                  style={{ accentColor: themeSettings?.accent || '#23abff', colorScheme: 'light' }}
                  disabled={isDisabled || passenger.isDependent}
                />
                {type.name}
              </label>
            );
          })}
        </div>
        {!passenger.discountType && errors[`${passenger.id}-discountType`] && (
          <p className="text-red-500 text-sm mt-1">{errors[`${passenger.id}-discountType`]}</p>
        )}
        {errors[`${passenger.id}-age`] && (
          <p className="text-red-500 text-sm mt-1">{errors[`${passenger.id}-age`]}</p>
        )}
      </div>
    );
  };

  useEffect(() => {
    // Only auto-initialize companions if no data was restored from props
    if (passengerDetails) return;

    const passengerCount = Number.parseInt(searchParams.get('passengerCount') || '0', 10);

    // Add passenger forms automatically if passengerCount > 1 and companions are empty
    if (passengerCount > 1 && companions.length === 0) {
      const newPassengers = Array.from({ length: passengerCount - 1 }).map((_, index) => {
        const expectedCompType = (index + 1) < vehicleCount ? 'DRIVER' : 'ADULT';
        return {
          id: generateUniqueNumber(),
          firstname: '',
          lastname: '',
          sex: 'Male',
          dob: getDefaultDOB(),
          nationality: 'Filipino',
          accommodation: '',
          address: '',
          discountType: expectedCompType as any
        };
      });
      setCompanions(newPassengers);
      setFormData({ passenger, companions: newPassengers });
    }
  }, [searchParams, passengerDetails]); // Only run when params or initial data changes

  const handleAddCompanion = (dependent?: IDependent) => {
    setCompanions((passengers) => {
      const nextIndex = passengers.length + 1;
      const expectedCompType = nextIndex < vehicleCount ? 'DRIVER' : 'ADULT';

      const newCompanion: PassengerData = dependent ? {
        id: generateUniqueNumber(),
        firstname: dependent.first_name,
        lastname: dependent.last_name,
        sex: dependent.sex ? (dependent.sex.charAt(0).toUpperCase() + dependent.sex.slice(1).toLowerCase()) : 'Male',
        dob: dependent.birthday ? format(new Date(dependent.birthday), 'yyyy-MM-dd') : getDefaultDOB(),
        nationality: dependent.nationality || 'Filipino',
        accommodation: '',
        address: dependent.address || '',
        discountType: expectedCompType as any,
        isDependent: true
      } : {
        id: generateUniqueNumber(),
        firstname: '',
        lastname: '',
        sex: 'Male',
        dob: getDefaultDOB(),
        nationality: 'Filipino',
        accommodation: '',
        address: '',
        discountType: expectedCompType as any
      };

      const newCompanions = [...passengers, newCompanion];
      setFormData({ passenger, companions: newCompanions });
      return newCompanions;
    });
  };

  // Expose handleAddCompanion to parent via ref
  useImperativeHandle(ref, () => ({
    handleAddCompanion
  }));

  const handleRemoveCompanion = (id: number) => {
    // Check 1:1 ratio constraint
    const currentPassengerCount = companions.length + 1;
    if (currentPassengerCount <= vehicleCount) {
      setAlertModal({
        isOpen: true,
        title: 'Passenger Required',
        description: `Cannot remove passenger. At least ${vehicleCount} passenger(s) are required for the ${vehicleCount} vehicle(s) selected.`
      });
      return;
    }

    setCompanions((companions) => {
      const updatedCompanions = companions.filter((companion) => companion.id !== id);
      setFormData({ passenger, companions: updatedCompanions });
      return updatedCompanions;
    });
  };

  const renderCompanionForms = () => {
    return companions.map((companion, index) => (
      <div key={companion.id} className="border rounded-lg shadow-md bg-white p-4 sm:p-6 mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div className="flex justify-start items-start sm:items-center text-customText">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold mr-2">Companion {index + 1} Details</h2>
              <p className="text-sm">({passengerTypes.find(t => t.code === companion.discountType)?.name || 'Adult'} Ticket)</p>
              {companion.isDependent && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 border-blue-200">
                  Dependent
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant={null}
            className="mt-2 sm:mt-0 bg-white border-2 border-red-500 text-red-500"
            onClick={() => handleRemoveCompanion(companion.id)}
          >
            <FiTrash className="w-4 h-4" />
            Remove
          </Button>
        </div>

        {/* Companion Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="firstname" className="block text-sm font-medium text-customText">
              First Name
            </label>
            <Input
              id="firstname"
              value={companion.firstname}
              onChange={(e) => handleChange('firstname', e.target.value, companion.id)}
              placeholder="e.g. John"
              readOnly={companion.isDependent}
              disabled={companion.isDependent}
            />
            {!companion.firstname.trim() && errors[`${companion.id}-firstname`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${companion.id}-firstname`]}</p>
            )}
          </div>

          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <label htmlFor="lastname" className="block text-sm font-medium text-customText">
                Last Name
              </label>
              {!companion.isDependent && (
                <div className="flex items-center mt-2 sm:mt-0">
                  <input
                    type="checkbox"
                    id={`same-lastname-${companion.id}`}
                    onChange={(e) => handleChange('lastname', e.target.checked ? passenger.lastname : '', companion.id)}
                    className="mr-2 cursor-pointer"
                    style={{ accentColor: themeSettings?.accent || '#23abff', colorScheme: 'light' }}
                  />
                  <label
                    htmlFor={`same-lastname-${companion.id}`}
                    className="text-sm font-medium text-customText cursor-pointer"
                  >
                    Same as main passenger&apos;s lastname
                  </label>
                </div>
              )}
            </div>
            <Input
              id="lastname"
              value={companion.lastname}
              onChange={(e) => handleChange('lastname', e.target.value, companion.id)}
              placeholder="e.g. Doe"
              readOnly={companion.isDependent}
              disabled={companion.isDependent}
            />
            {!companion.lastname.trim() && errors[`${companion.id}-lastname`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${companion.id}-lastname`]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="sex" className="block text-sm font-medium text-customText">
              Sex
            </label>
            <Select
              value={companion.sex ? (companion.sex.charAt(0).toUpperCase() + companion.sex.slice(1).toLowerCase()) : ''}
              onValueChange={(value) => handleChange('sex', value, companion.id)}
              disabled={companion.isDependent}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            {!companion.sex?.trim() && errors[`${companion.id}-sex`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${companion.id}-sex`]}</p>
            )}
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-customText">
              Date of Birth
            </label>
            <Input
              type="date"
              id="dob"
              value={companion.dob}
              onChange={(e) => handleChange('dob', e.target.value, companion.id)}
              placeholder="mm/dd/yyyy"
              readOnly={companion.isDependent}
              disabled={companion.isDependent}
            />
            {!companion.dob.trim() && errors[`${companion.id}-dob`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${companion.id}-dob`]}</p>
            )}
          </div>

          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <label htmlFor="nationality" className="block text-sm font-medium text-customText">
                Nationality
              </label>
            </div>
            {companion.isDependent ? (
              <Input
                value={companion.nationality}
                readOnly
                disabled
              />
            ) : (
              <NationalitySelector
                value={companion.nationality}
                onChange={(selectedValue) => handleChange('nationality', selectedValue, companion.id)}
              />
            )}
            {!companion.nationality.trim() && errors[`${companion.id}-nationality`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${companion.id}-nationality`]}</p>
            )}
          </div>

          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <label htmlFor={`address-${companion.id}`} className="block text-sm font-medium text-customText">
                Address
              </label>
              {!companion.isDependent && (
                <div className="flex items-center mt-2 sm:mt-0">
                  <input
                    type="checkbox"
                    id={`same-address-${companion.id}`}
                    onChange={(e) => handleChange('address', e.target.checked ? passenger.address : '', companion.id)}
                    className="mr-2 cursor-pointer"
                    style={{ accentColor: themeSettings?.accent || '#23abff', colorScheme: 'light' }}
                  />
                  <label
                    htmlFor={`same-address-${companion.id}`}
                    className="text-sm font-medium text-customText cursor-pointer"
                  >
                    Same as main passenger&apos;s address
                  </label>
                </div>
              )}
            </div>
            <Input
              id={`address-${companion.id}`}
              value={companion.address}
              onChange={(e) => handleChange('address', e.target.value, companion.id)}
              placeholder="House #, Street, City, Province, Postal Code"
              readOnly={companion.isDependent}
              disabled={companion.isDependent}
            />
            {!companion.address.trim() && errors[`${companion.id}-address`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${companion.id}-address`]}</p>
            )}
          </div>
          {renderFareTypeSelector(companion, true)}
        </div>
      </div>
    ));
  };

  const validateAge = (dob: string, passengerTypeCode: string | null): string | null => {
    if (!dob || !passengerTypeCode) return null;

    const passengerType = passengerTypes.find(t => t.code === passengerTypeCode);
    if (!passengerType) return null;

    const age = differenceInYears(new Date(), new Date(dob));

    if (passengerType.age_min !== null && age < passengerType.age_min) {
      return `Age must be at least ${passengerType.age_min} years old for ${passengerType.name}`;
    }

    if (passengerType.age_max !== null && age > passengerType.age_max) {
      return `Age must be at most ${passengerType.age_max} years old for ${passengerType.name}`;
    }

    return null;
  };

  const validateFields = (updatedData: PassengerData, isMainPassenger = false) => {
    const errors: Record<string, string> = {};
    const prefix = isMainPassenger ? '' : `${updatedData.id}-`;

    const getErrorKey = (field: string) => isMainPassenger ? field : `${updatedData.id}-${field}`;

    if (!updatedData.firstname.trim()) errors[getErrorKey('firstname')] = 'First Name is required';
    if (!updatedData.lastname.trim()) errors[getErrorKey('lastname')] = 'Last Name is required';
    if (!updatedData.sex.trim()) errors[getErrorKey('sex')] = 'Sex is required';
    if (!updatedData.dob.trim()) errors[getErrorKey('dob')] = 'Date of Birth is required';
    if (!updatedData.nationality.trim()) errors[getErrorKey('nationality')] = 'Nationality is required';
    if (!updatedData.address.trim()) errors[getErrorKey('address')] = 'Address is required';

    // Validate Passenger Type presence (assuming it's required now since we are using a dropdown)
    // If it's optional, we can relax this, but usually "Adult" is default or required.
    // For now, let's say it's required if we want to enforce proper type selection.
    // However, existing logic allowed null (Regular). If "Regular" maps to "ADULT" in new system, we should handle default.
    // Let's assume user must select a type.
    if (!updatedData.discountType) {
      errors[getErrorKey('discountType')] = 'Passenger Type is required';
    }

    // Validate Age
    const ageError = validateAge(updatedData.dob, updatedData.discountType as string);
    if (ageError) {
      errors[getErrorKey('age')] = ageError;
    } else {
      // Clear age error if valid
      delete errors[getErrorKey('age')];
    }

    return errors;
  };

  const handleChange = (field: keyof PassengerData, value: string, id: number) => {
    const currentData = id === passenger.id ? passenger : companions.find((c) => c.id === id);

    if (currentData) {
      if (currentData.isDependent && field !== 'accommodation' && field !== 'discountType') {
        return; // Don't allow changing details of dependent-sourced companion
      }

      const updatedData = { ...currentData };
      if (field == 'id') {
        updatedData[field] = Number(value);
      } else {
        (updatedData as any)[field] = value;
      }

      if (id === passenger.id) {
        setPassenger(updatedData);
        setFormData({ passenger: updatedData, companions });

        // Validate passenger
        const validationErrors = validateFields(updatedData, true);
        setErrors((prev) => ({ ...prev, ...validationErrors }));
      } else {
        const updatedCompanions = companions.map((companion) => (companion.id === id ? updatedData : companion));
        setCompanions(updatedCompanions);
        setFormData({ passenger, companions: updatedCompanions });

        // Validate companion
        const validationErrors = validateFields(updatedData);
        setErrors((prev) => ({ ...prev, ...validationErrors }));
      }
    }
  };

  return (
    <div>
      <div className="p-4 sm:p-6 mt-8 border rounded-lg shadow-lg bg-white">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center text-customText">
            <div className="flex items-center">
              <h2 className="text-base sm:text-lg font-semibold mr-2">Passenger Details</h2>
              <p className="text-sm">({passengerTypes.find(t => t.code === passenger.discountType)?.name || 'Adult'} Ticket)</p>
            </div>
          </div>
          <div className="flex items-center">
            <GiCheckMark className="w-5 h-5 mr-1" style={{ color: themeSettings?.accent || '#23abff' }} />
            <span
              className="text-sm sm:text-base font-semibold"
              style={{ color: themeSettings?.accent || '#23abff' }}
            >
              Login
            </span>
            <span className="text-customText text-sm sm:text-base ml-1.5">for easy booking.</span>
          </div>
        </div>

        {/* Information Box */}
        <div
          className="flex flex-col items-center border border-[rgba(var(--border-color),1)] bg-[rgba(var(--bg-color),0.05)] p-4 mb-6 rounded-md sm:flex-row"
          style={
            {
              '--border-color': hexToRgb(themeSettings?.accent || '#8C1F21'),
              '--bg-color': hexToRgb('#FFFFFF')
            } as React.CSSProperties
          }
        >
          <div className="flex items-start">
            <PiInfo className="mr-2 mt-[3px] flex-shrink-0" style={{ color: themeSettings?.accent || '#23abff' }} />
            <p className="text-sm text-customText leading-relaxed">
              Use all given names and last names{' '}
              <strong className="font-semibold">exactly as they appear in your ID</strong> to avoid boarding
              complications.
            </p>
          </div>
        </div>

        {/* Main Passenger Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="firstname" className="block text-sm font-medium text-customText">
              First Name
            </label>
            <Input
              id="firstname"
              value={passenger.firstname}
              onChange={(e) => handleChange('firstname', e.target.value, passenger.id)}
              placeholder="e.g. John"
            />
            {!passenger.firstname.trim() && errors['firstname'] && (
              <p className="text-red-500 text-sm mt-1">{errors['firstname']}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastname" className="block text-sm font-medium text-customText">
              Last Name
            </label>
            <Input
              id="lastname"
              value={passenger.lastname}
              onChange={(e) => handleChange('lastname', e.target.value, passenger.id)}
              placeholder="e.g. Doe"
            />
            {!passenger.lastname.trim() && errors['lastname'] && (
              <p className="text-red-500 text-sm mt-1">{errors['lastname']}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="sex" className="block text-sm font-medium text-customText">
              Sex
            </label>
            <Select
              value={passenger.sex ? (passenger.sex.charAt(0).toUpperCase() + passenger.sex.slice(1).toLowerCase()) : ''}
              onValueChange={(value) => handleChange('sex', value, passenger.id)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            {!passenger.sex?.trim() && errors['sex'] && <p className="text-red-500 text-sm mt-1">{errors['sex']}</p>}
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-customText">
              Date of Birth
            </label>
            <Input
              type="date"
              id="dob"
              value={passenger.dob}
              onChange={(e) => handleChange('dob', e.target.value, passenger.id)}
              placeholder="mm/dd/yyyy"
            />
            {!passenger.dob.trim() && errors['dob'] && <p className="text-red-500 text-sm mt-1">{errors['dob']}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="nationality" className="block text-sm font-medium text-customText">
              Nationality
            </label>
            <NationalitySelector
              value={passenger.nationality}
              onChange={(value) => handleChange('nationality', value, passenger.id)}
            />
            {!passenger.nationality.trim() && errors['nationality'] && (
              <p className="text-red-500 text-sm mt-1">{errors['nationality']}</p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-customText">
              Address
            </label>
            <Input
              id="address"
              value={passenger.address}
              onChange={(e) => handleChange('address', e.target.value, passenger.id)}
              placeholder="House #, Street, City, Province, Postal Code"
            />
            {!passenger.address.trim() && errors['address'] && (
              <p className="text-red-500 text-sm mt-1">{errors['address']}</p>
            )}
          </div>
          {renderFareTypeSelector(passenger)}
        </div>
      </div>

      {renderCompanionForms()}

      {/* Add Dependent Section */}
      {userDependents.length > 0 && (
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-md font-semibold mb-3 text-customText">Add Companion from Dependents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDependents.map((dependent) => {
              const isAdded = companions.some(c =>
                c.firstname === dependent.first_name &&
                c.lastname === dependent.last_name
              );

              return (
                <div
                  key={dependent.id}
                  className={`p-3 border rounded-md flex justify-between items-center bg-white ${isAdded ? 'opacity-60' : ''}`}
                >
                  <div>
                    <p className="font-medium text-sm text-customText">{dependent.first_name} {dependent.last_name}</p>
                    <p className="text-xs text-gray-500">{dependent.relationship}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCompanion(dependent)}
                    disabled={isAdded}
                    className="h-8 py-1"
                    style={{
                      borderColor: themeSettings?.accent || '#23abff',
                      color: themeSettings?.accent || '#23abff'
                    }}
                  >
                    {isAdded ? 'Added' : 'Add'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

export default forwardRef(PassengerDetailsForm);
