import { IAccount } from "../user-management/account.model";
import { IVehicleType } from "./vehicle-type.model";
import { VerificationStatus } from "@/utils/verification/statusHelpers";

export interface IVehicleModel {
  id: number;
  make: string;
  model: string;
  vehicle_type: IVehicleType;
}

export interface IVehicle {
  id: string; // Changed to string as it's UUID in backend
  user_id: string;
  account?: IAccount;
  vehicle_model_id: number;
  vehicle_model?: IVehicleModel;
  vehicleType?: { id?: number; name: string };

  // For 'Other' vehicles
  make?: string;
  model?: string;
  vehicle_type_id?: number;

  plate_number: string;
  status?: VerificationStatus;

  created_at?: string;
  updated_at?: string;

  verifications: IVehicleVerification[];
}

export interface IVehicleVerification {
  id: string;
  vehicle_id: string;
  certificate_of_registration_url: string;
  official_receipt_url: string;
  front_vehicle_url?: string;
  rear_vehicle_url?: string;
  left_vehicle_url?: string;
  right_vehicle_url?: string;
  status: VerificationStatus;
  is_latest: boolean;
  attempt_number: number;
  review_notes: null;
  reviewed_at: string;
  reviewer_by: string;
  created_at: string;
  updated_at: string;
}