import { OPERATION_COSTS } from 'constants/enum';
import { IAccount } from '../user-management/account.model';

export interface IDisbursement {
  id: number;
  createdByAccountId?: string;
  createdByAccount?: IAccount;
  dateIso: string;
  officialReceipt: string;
  paidTo: string;
  description: OPERATION_COSTS;
  purpose: string;
  amount: number;
}
