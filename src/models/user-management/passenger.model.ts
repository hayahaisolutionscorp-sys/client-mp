import {
  DISCOUNT_TYPE,
  SEX,
} from 'constants/enum';
import { IAccount } from './account.model';

export interface IPassenger {
  id: number;
  account?: IAccount;
  buddyId?: number;
  buddy?: IPassenger;

  firstName: string;
  lastName: string;
  sex: keyof typeof SEX;
  birthdayIso: string;
  address: string;
  nationality: string;
  phone?: string;
  discountType?: keyof typeof DISCOUNT_TYPE;
  profile_picture_url?: string;

  companions?: IPassenger[];
}
