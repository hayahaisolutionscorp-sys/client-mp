import { IAccount } from '../user-management/account.model';
import { INotification } from './notification.model';

export interface IAccountNotification {
  accountId: string;
  account?: IAccount;
  notificationId: number;
  notification?: INotification;

  isRead: boolean;
}
