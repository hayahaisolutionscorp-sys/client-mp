import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '../core/axios';
import { ACCOUNT_API, AUTH_API } from 'constants/api';
import { UPLOAD_API } from 'constants/api';
import { IAccount, IPassenger } from '@/models';


export async function getAccountInformation(forceRefresh = false): Promise<IAccount | undefined> {
  if (!forceRefresh) {
    const cachedAccountInformation = fetchItem<IAccount>('logged-in-user-profile');
    if (cachedAccountInformation !== undefined) {
      return cachedAccountInformation;
    }
  }

  try {
    const { data } = await axios.get(`${AUTH_API}/me`);

    cacheItem('logged-in-user-profile', data.data);

    return data.data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getAccount(
  accountId: string
): Promise<IAccount | undefined> {
  try {
    const { data: account } = await axios.get(`${ACCOUNT_API}/${accountId}`);
    return account;
  } catch (e) {
    console.error(e);
  }
}

export async function updateAccount(data: any): Promise<void> {
  try {
    await axios.patch(ACCOUNT_API, data);
  } catch (e) {
    console.error(e);
  }
}

export async function createPassengerAccount(
  token: string,
  passenger: IPassenger
) {
  try {
    const { data } = await axios.post(`${ACCOUNT_API}/passengers`, passenger, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getMyApiKey(): Promise<string> {
  const { data } = await axios.get<string>(`${ACCOUNT_API}/mine/api-key`);
  return data;
}

export async function generateApiKey(): Promise<string> {
  const { data } = await axios.post<string>(`${ACCOUNT_API}/mine/api-key`);
  return data;
}


