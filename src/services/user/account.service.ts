import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '../core/axios';
import { ACCOUNT_API, VERIFICATION_API } from 'constants/api';
import { UPLOAD_API } from 'constants/api';
import { IAccount, IPassenger } from '@/models';

export async function getAccountInformation(): Promise<IAccount | undefined> {
  const cachedAccountInformation = fetchItem<IAccount>('logged-in-account');
  if (cachedAccountInformation !== undefined) {
    return cachedAccountInformation;
  }

  try {
    const { data } = await axios.get(`${ACCOUNT_API}/mine`);

    cacheItem('logged-in-account', data);
    return data;
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

export async function uploadProfilePicture(file: File | null, accountId: string | null) {
  if (!file || !accountId) {
    console.error(`${!file ? "File" : "Account ID"} is required`);
    return;
  }

  try {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("accountId", accountId);

    const { data } = await axios.post(`${UPLOAD_API}/${accountId}/profile_images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!data || !data.fileKey) {
      console.error("Invalid response format:", data);
      return;
    }

    return data;
  } catch (error: any) {
    console.error("Error uploading file:", error);
    if (error.response) {
      console.error("Server Response:", error.response.data);
    }
  }
}

export async function uploadIdImage(file: File | null, accountId: string | null) {
  if (!file || !accountId) {
    console.error(`${!file ? "File" : "Account ID"} is required`);
    return;
  }

  try {
    const formData = new FormData();
    formData.append("id_image", file);
    formData.append("accountId", accountId);

    const { data } = await axios.post(`${UPLOAD_API}/${accountId}/government_ids`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!data || !data.fileKey) {
      console.error("Invalid response format:", data);
      return;
    }

    return data;
  } catch (error: any) {
    console.error("Error uploading file:", error);
    if (error.response) {
      console.error("Server Response:", error.response.data);
    }
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

export async function submitVerificationRequest(accountId: string, verificationData: {
  id_type: string;
  id_number: string;
  discount_type: string;
  id_picture_url: string;
  status_req: string;
}) {
  try {
    const { data } = await axios.post(`${VERIFICATION_API}/${accountId}/verification-request`, verificationData);
    return data;
  } catch (error: any) {
    console.error("Error submitting verification request:", error);
    if (error.response) {
      console.error("Server Response:", error.response.data);
    }
    throw error;
  }
}

export async function getVerificationRequest(accountId: string) {
  try {
    const { data } = await axios.get(`${VERIFICATION_API}/account/${accountId}`);
    return data;
  } catch (error: any) {
    console.error("Error getting verification request:", error);
    if (error.response) {
      console.error("Server Response:", error.response.data);
    }
    return null;
  }
}

export async function removeVerification(accountId: string) {
  try {
    const { data } = await axios.delete(`${VERIFICATION_API}/account/${accountId}/remove`);
    return data;
  } catch (error: any) {
    console.error("Error removing verification:", error);
    if (error.response) {
      console.error("Server Response:", error.response.data);
    }
    throw error;
  }
}
