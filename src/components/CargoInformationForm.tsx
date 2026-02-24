'use client';

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, ForwardRefRenderFunction } from 'react';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { FiPlus, FiTrash } from 'react-icons/fi';
import { PiInfo } from 'react-icons/pi';
import { Button } from '@/components/ui/Button';

import { getCommodities } from '@/services';
import { useThemeSettings } from '@/hooks/theme-settings';
import { hexToRgb } from 'helpers/theme.helpers';
import { CargoData } from '@/types/booking/cargo-data';

interface CommodityTypes {
    commodityId: number;
    commodityName: string;
    commodityDescription: string;
    cbmRate: string;
    cargo_class?: string;
}

export interface CargoInformationFormHandle {
    addCargo: () => void;
}

interface CargoInformationFormProps {
    onChange?: (cargos: CargoData[]) => void;
    initialCargos?: CargoData[];
}

const CargoInformationForm: ForwardRefRenderFunction<CargoInformationFormHandle, CargoInformationFormProps> = ({
    onChange,
    initialCargos
}, ref) => {
    const themeSettings = useThemeSettings();

    const [commodityTypes, setCommodityTypes] = useState<CommodityTypes[]>([]);
    const [cargos, setCargos] = useState<CargoData[]>(initialCargos || []);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const generateUniqueNumber = (): number => {
        return (Date.now() + Math.floor(Math.random() * 1000)) * -1;
    };

    // Notify parent component about state updates
    const updateCargos = useCallback(
        (newCargos: CargoData[]) => {
            setCargos(newCargos);
            if (onChange) onChange(newCargos);
        },
        [onChange]
    );

    const handleAddCargo = () => {
        updateCargos([
            ...cargos,
            {
                id: generateUniqueNumber(),
                commodityId: 0,
                commodityName: '',
                commodityDescription: '',
                quantity: 1,
                cbmRate: '0'
            }
        ]);
    };

    useImperativeHandle(ref, () => ({
        addCargo: handleAddCargo
    }));

    const handleRemoveCargo = (id: number) => {
        updateCargos(cargos.filter((cargo) => cargo.id !== id));
    };

    const handleUpdateCargo = (
        id: number,
        field: keyof CargoData,
        value: string | number,
        commodityId: number,
        commodityDescription: string,
        cbmRate: string,
        cargo_class?: string
    ) => {
        const updatedCargos = cargos.map((cargo) =>
            cargo.id === id
                ? {
                    ...cargo,
                    [field]: value,
                    commodityId: commodityId,
                    commodityDescription: commodityDescription,
                    cbmRate: cbmRate,
                    cargo_class: cargo_class
                }
                : cargo
        );

        updateCargos(updatedCargos);

        // Validate all fields after the update
        const newErrors: { [key: string]: string } = {};
        updatedCargos.forEach((cargo) => {
            if (!cargo.commodityName) {
                newErrors[`${cargo.id}-commodityName`] = 'Commodity Type is required';
            }
            if (!cargo.quantity || cargo.quantity <= 0) {
                newErrors[`${cargo.id}-quantity`] = 'Quantity must be greater than 0';
            }
        });

        setErrors(newErrors);
    };

    useEffect(() => {
        // Fetch commodity types from API
        getCommodities().then((commoditiesData) => {
            if (!commoditiesData) {
                console.warn('No commodities data received');
                setCommodityTypes([]);
                return;
            }

            // Map commodities from API
            const commodityTypesList = commoditiesData
                .map((commodity) => ({
                    commodityId: commodity.id,
                    commodityName: commodity.name,
                    commodityDescription: commodity.description,
                    cbmRate: commodity.cbm_rate,
                    cargo_class: commodity.cargo_class || '' // Map cargo_class
                }))
                .sort((a, b) => a.commodityName.localeCompare(b.commodityName));

            setCommodityTypes(commodityTypesList);
        }).catch((error) => {
            console.error('Error fetching commodities:', error);
            setCommodityTypes([]);
        });
    }, []);

    if (cargos.length === 0) {
        return null;
    }

    return (
        <div>
            {cargos.map((cargo, index) => (
                <div key={cargo.id} className="border rounded-lg shadow-md bg-white p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
                        <h3 className="text-lg font-semibold text-customText">Cargo {index + 1} Information</h3>
                        <Button
                            variant={null}
                            className="border-2 border-red-500 text-red-500 flex items-center"
                            onClick={() => handleRemoveCargo(cargo.id)}
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
                            <strong>Please select the correct commodity type.</strong> CBM rates will be calculated based on the selected type and quantity.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Commodity Type */}
                        <div>
                            <label htmlFor={`commodityType-${cargo.id}`} className="block text-sm font-medium text-customText">
                                Commodity Type
                            </label>
                            <Select
                                value={cargo.commodityName}
                                onValueChange={(value) => {
                                    const selectedCommodity = commodityTypes?.find((row) => row?.commodityName === value);
                                    handleUpdateCargo(
                                        cargo.id,
                                        'commodityName',
                                        value,
                                        selectedCommodity?.commodityId || 0,
                                        selectedCommodity?.commodityDescription || '',
                                        selectedCommodity?.cbmRate || '0',
                                        selectedCommodity?.cargo_class
                                    );
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select commodity type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {commodityTypes?.map((row) => (
                                        <SelectItem key={row.commodityId} value={row?.commodityName}>
                                            {row?.commodityName} - {row?.commodityDescription}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!cargo.commodityName.trim() && errors[`${cargo.id}-commodityName`] && (
                                <p className="text-sm text-red-500 mt-1">{errors[`${cargo.id}-commodityName`]}</p>
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label htmlFor={`quantity-${cargo.id}`} className="block text-sm font-medium text-customText">
                                Quantity (CBM)
                            </label>
                            <Input
                                type="number"
                                id={`quantity-${cargo.id}`}
                                value={cargo.quantity}
                                min="1"
                                placeholder="e.g. 5"
                                onChange={(e) =>
                                    handleUpdateCargo(
                                        cargo.id,
                                        'quantity',
                                        parseInt(e.target.value) || 0,
                                        cargo.commodityId,
                                        cargo.commodityDescription,
                                        cargo.cbmRate,
                                        cargo.cargo_class
                                    )
                                }
                            />
                            {(!cargo.quantity || cargo.quantity <= 0) && errors[`${cargo.id}-quantity`] && (
                                <p className="text-sm text-red-500 mt-1">{errors[`${cargo.id}-quantity`]}</p>
                            )}
                        </div>
                    </div>

                    {/* Display CBM Rate Info */}
                    {cargo.cbmRate && parseFloat(cargo.cbmRate) > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-customText">
                                <strong>CBM Rate:</strong> ₱{parseFloat(cargo.cbmRate).toFixed(2)} per CBM
                            </p>
                            <p className="text-sm text-customText mt-1">
                                <strong>Total:</strong> ₱{(parseFloat(cargo.cbmRate) * cargo.quantity).toFixed(2)}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default forwardRef(CargoInformationForm);
