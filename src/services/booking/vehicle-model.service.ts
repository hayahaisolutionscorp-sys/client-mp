import axios from '@/services/core/axios';
import { VEHICLE_MODELS_API } from 'constants/api';
import { IVehicleModel } from '@/models';

export const VehicleModelService = {
  getAllVehicleModels: async () => {
    const response = await axios.get(`${VEHICLE_MODELS_API}/all`);
    return response.data.data;
  },
}