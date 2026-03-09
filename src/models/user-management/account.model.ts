import { IPassenger } from './passenger.model';
import { ACCOUNT_ROLE, SEX } from 'constants/index';
import { ITravelAgency } from './travel-agency.model';
import { IClient } from './client.model';
import { IShippingLine } from '../shipping-line/shipping-line.model';
import { IVehicle } from '../vehicle/vehicle.model';
import { IVerification } from './dependent.model';

/**
 * An account can only be *one* of the following:
 * - a passenger
 * - part of a shipping line
 * - part of a travel agency
 * - part of a client
 *
 * of which the corresponding ID will not be null
 *
 * partnerships between travel agencies and clients
 * with shipping lines are modeled in their separate
 * tables/models (e.g. TravelAgencyShippingLine)
 */
export interface IAccount {
  // user ID
  id: string;
  passengerId?: number;
  passenger?: IPassenger;
  shippingLineId?: number;
  shippingLine?: IShippingLine;
  travelAgencyId?: number;
  travelAgency?: ITravelAgency;
  clientId?: number;
  client?: IClient;
  qr_code?: string;

  email: string;
  emailConsent: boolean;
  role: keyof typeof ACCOUNT_ROLE;

  isEmailVerified?: boolean;
  apiKey?: string;

  passengers?: IPassenger[];
  vehicles?: IVehicle[];
  verification?: IVerification;
  verificationDetails?: IVerification[];
  hasPassword?: boolean;
  providers?: string[];
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirm: string;
  agreement: boolean;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffixName?: string;
  sex: keyof typeof SEX;
  birthday: string;
  address: string;
  nationality: string;
  phone: string;
  countryCode: string;
  emailConsent: boolean;
}
