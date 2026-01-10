'use client';

import { useState, useEffect, type FC } from 'react';
import { FiPlus, FiTrash } from 'react-icons/fi';
import { PiInfo } from 'react-icons/pi';
import { GiCheckMark } from 'react-icons/gi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSearchParams } from 'next/navigation';
import Combobox from '@/components/ui/Combobox';

import type { DISCOUNT_TYPE } from 'constants/enum';
import { getDefaultDOB } from 'helpers/date.helpers';
import { NATIONALITIES } from 'constants/default';
import { useThemeSettings } from '@/hooks/theme-settings';
import { hexToRgb } from 'helpers/theme.helpers';
import { getRateTableRowsByRateTableId } from '@/services';
import { PassengerData } from '@/types/booking/passenger-data';
import { IRateTableRow } from '@/models';

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
  passengerDetails?: PassengerDetails | undefined;
  onChange?: (data: { passenger: PassengerData; companions: PassengerData[] }) => void;
}

const PassengerDetailsForm: FC<PassengerDetailsFormProps> = ({ rateTableId, onChange }) => {
  const generateUniqueNumber = (): number => {
    return (Date.now() + Math.floor(Math.random() * 1000)) * -1;
  };

  const [fareTypes, setFareTypes] = useState<FareTypes[]>([]);
  const [companions, setCompanions] = useState<PassengerData[]>([]);
  const [passenger, setPassenger] = useState<PassengerData>({
    id: generateUniqueNumber(),
    firstname: '',
    lastname: '',
    sex: 'Male',
    dob: getDefaultDOB(),
    nationality: 'Filipino',
    accommodation: '',
    address: '',
    discountType: null
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({ passenger, companions });
  const [isClient, setIsClient] = useState(false);
  const themeSettings = useThemeSettings();

  useEffect(() => {
    onChange?.(formData); // Notify parent AFTER rendering
  }, [formData, onChange]);

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
            a.discountType && b.discountType ? a.discountType.localeCompare(b.discountType) : 0
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

  const handleDiscountTypeChange = (value: keyof typeof DISCOUNT_TYPE | null, id: number, isCompanion: boolean) => {
    if (isCompanion) {
      const updatedCompanions = companions.map((comp) => (comp.id === id ? { ...comp, discountType: value } : comp));
      setCompanions(updatedCompanions);
      setFormData({
        passenger,
        companions: updatedCompanions
      });
    } else {
      const updatedPassenger = { ...passenger, discountType: value };
      setPassenger(updatedPassenger);
      setFormData({
        passenger: updatedPassenger,
        companions
      });
    }
  };

  const uniqueFareTypes = Array.from(new Map(fareTypes.map((type) => [type.discountType, type])).values());

  const renderFareTypeSelector = (passenger: PassengerData, isCompanion = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-customText mb-2">Passenger Type</label>
      {isClient && (
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name={`discountType-${passenger.id}`}
              value=""
              checked={passenger.discountType === null}
              onChange={() => handleDiscountTypeChange(null, passenger.id, isCompanion)}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: themeSettings?.accent || '#23abff', colorScheme: 'light' }}
            />
            <span className="text-sm capitalize">Regular</span>
          </label>
          {uniqueFareTypes.map((type) => (
            <label key={`${type.id}-${passenger.id}`} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`discountType-${passenger.id}`}
                value={type.discountType}
                checked={passenger.discountType === type.discountType}
                onChange={() => handleDiscountTypeChange(type.discountType || null, passenger.id, isCompanion)}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: themeSettings?.accent || '#23abff', colorScheme: 'light' }}
              />
              <span className="text-sm capitalize">{type.discountType}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const passengerCount = Number.parseInt(searchParams.get('passengerCount') || '0', 10);

    // Add passenger forms automatically if passengerCount is not empty and passengerCount > 0
    if (passengerCount && passengerCount > 0) {
      const newPassengers = Array.from({ length: passengerCount - 1 }).map(() => ({
        id: generateUniqueNumber(),
        firstname: '',
        lastname: '',
        sex: 'Male',
        dob: getDefaultDOB(),
        nationality: 'Filipino',
        accommodation: '',
        address: '',
        discountType: null
      }));
      setCompanions(newPassengers);
      setFormData({ passenger, companions: newPassengers });
    }
  }, [searchParams, passenger]);

  const handleAddCompanion = () => {
    setCompanions((passengers) => {
      const newCompanions = [
        ...passengers,
        {
          id: generateUniqueNumber(),
          firstname: '',
          lastname: '',
          sex: 'Male',
          dob: getDefaultDOB(),
          nationality: 'Filipino',
          accommodation: '',
          address: '',
          discountType: null
        }
      ];
      setFormData({ passenger, companions: newCompanions });
      return newCompanions;
    });
  };

  const handleRemoveCompanion = (id: number) => {
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
              <p className="text-sm">(Adult Ticket)</p>
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
            </div>
            <Input
              id="lastname"
              value={companion.lastname}
              onChange={(e) => handleChange('lastname', e.target.value, companion.id)}
              placeholder="e.g. Doe"
            />
            {!companion.lastname.trim() && errors[`${companion.id}-lastname`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${companion.id}-lastname`]}</p>
            )}
          </div>

          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-customText">
              Sex
            </label>
            <div className="flex items-center space-x-4 mt-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`sex-${companion.id}`}
                  value="Male"
                  checked={companion.sex === 'Male'}
                  onChange={(e) => handleChange('sex', e.target.value, companion.id)}
                  className="w-4 h-4 mr-2 cursor-pointer"
                  style={{ accentColor: themeSettings?.accent || '#23abff', colorScheme: 'light' }}
                />
                Male
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`sex-${companion.id}`}
                  value="Female"
                  checked={companion.sex === 'Female'}
                  onChange={(e) => handleChange('sex', e.target.value, companion.id)}
                  className="w-4 h-4 mr-2 cursor-pointer"
                  style={{ accentColor: themeSettings?.accent || '#23abff', colorScheme: 'light' }}
                />
                Female
              </label>
            </div>
            {!companion.sex.trim() && errors[`${companion.id}-sex`] && (
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
            <Combobox
              values={NATIONALITIES}
              placeholder="Search nationality"
              defaultValue={companion.nationality}
              onChange={(selectedValue) => handleChange('nationality', selectedValue, companion.id)}
            />
            {!companion.nationality.trim() && errors[`${companion.id}-nationality`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${companion.id}-nationality`]}</p>
            )}
          </div>

          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <label htmlFor="address" className="block text-sm font-medium text-customText">
                Address
              </label>
              <div className="flex items-center mt-2 sm:mt-0">
                <input
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
            </div>
            <Input
              id="address"
              value={companion.address}
              onChange={(e) => handleChange('address', e.target.value, companion.id)}
              placeholder="House #, Street, City, Province, Postal Code"
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

  const validateFields = (updatedData: PassengerData, isMainPassenger = false) => {
    const errors: Record<string, string> = {};

    // Check if it's the passenger or a companion and validate accordingly
    if (isMainPassenger) {
      // For passenger, no id in the error key
      if (!updatedData.firstname.trim()) {
        errors['firstname'] = 'First Name is required';
      }
      if (!updatedData.lastname.trim()) {
        errors['lastname'] = 'Last Name is required';
      }
      if (!updatedData.sex.trim()) {
        errors['sex'] = 'Sex is required';
      }
      if (!updatedData.dob.trim()) {
        errors['dob'] = 'Date of Birth is required';
      }
      if (!updatedData.nationality.trim()) {
        errors['nationality'] = 'Nationality is required';
      }
      if (!updatedData.address.trim()) {
        errors['address'] = 'Address is required';
      }
    } else {
      // For companions, include the id in the error key
      if (!updatedData.firstname.trim()) {
        errors[`${updatedData.id}-firstname`] = 'First Name is required';
      }
      if (!updatedData.lastname.trim()) {
        errors[`${updatedData.id}-lastname`] = 'Last Name is required';
      }
      if (!updatedData.sex.trim()) {
        errors[`${updatedData.id}-sex`] = 'Sex is required';
      }
      if (!updatedData.dob.trim()) {
        errors[`${updatedData.id}-dob`] = 'Date of Birth is required';
      }
      if (!updatedData.nationality.trim()) {
        errors[`${updatedData.id}-nationality`] = 'Nationality is required';
      }
      if (!updatedData.address.trim()) {
        errors[`${updatedData.id}-address`] = 'Address is required';
      }
    }

    return errors;
  };

  const handleChange = (field: keyof PassengerData, value: string, id: number) => {
    const updatedData = id === passenger.id ? passenger : companions.find((c) => c.id === id);

    if (updatedData) {
      if (field == 'id') {
        updatedData[field] = Number(value);
      } else {
        updatedData[field] = value;
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
              <p className="text-sm">(Adult Ticket)</p>
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
              '--bg-color': hexToRgb(themeSettings?.backgroundColor || '#23abff')
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

          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-customText">
              Sex
            </label>
            <div className="flex items-center space-x-4 mt-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  value="Male"
                  checked={passenger.sex === 'Male'}
                  onChange={(e) => handleChange('sex', e.target.value, passenger.id)}
                  className="w-4 h-4 mr-2 cursor-pointer"
                  style={{ accentColor: themeSettings?.accent || '#23abff', colorScheme: 'light' }}
                />
                Male
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  value="Female"
                  checked={passenger.sex === 'Female'}
                  onChange={(e) => handleChange('sex', e.target.value, passenger.id)}
                  className="w-4 h-4 mr-2 cursor-pointer"
                  style={{ accentColor: themeSettings?.accent || '#23abff', colorScheme: 'light' }}
                />
                Female
              </label>
            </div>
            {!passenger.sex.trim() && errors['sex'] && <p className="text-red-500 text-sm mt-1">{errors['sex']}</p>}
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

          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-customText">
              Nationality
            </label>
            <Combobox
              values={NATIONALITIES}
              placeholder="Search nationality"
              defaultValue={passenger.nationality}
              onChange={(selectedValue) => handleChange('nationality', selectedValue, passenger.id)}
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

      {/* Add Companion Section */}
      <div className="flex flex-col justify-end items-center mb-4 mt-6 md:flex-row">
        <Button variant="outline" className="border-2 w-full md:w-auto" onClick={handleAddCompanion}>
          <FiPlus className="w-4 h-4" />
          Add Companion
          {companions.length > 0 && (
            <Badge style={{ backgroundColor: themeSettings?.accent || '#23abff' }}>{companions.length}</Badge>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PassengerDetailsForm;
