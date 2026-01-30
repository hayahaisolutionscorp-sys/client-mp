import axios from '../core/axios';
import { PROFILES_API } from 'constants/api';
import { IDependent, CreateDependentDto, UpdateDependentDto, RequestVerificationDto, IVerification } from '@/models';

// ==================== DEPENDENTS ====================

export async function createDependents(
  userId: string,
  dependents: CreateDependentDto[]
): Promise<IDependent[] | undefined> {
  try {
    const { data } = await axios.post(`${PROFILES_API}/${userId}/dependents`, dependents);
    return data.data;
  } catch (error: any) {
    if (typeof window === 'undefined') {
      console.error('Error creating dependents:', error);
    }
    throw error;
  }
}

export async function getDependents(userId: string): Promise<IDependent[]> {
  try {
    const { data } = await axios.get(`${PROFILES_API}/${userId}/dependents`);
    return data.data || [];
  } catch (error: any) {
    if (typeof window === 'undefined') {
      console.error('Error fetching dependents:', error);
    }
    return [];
  }
}

export async function updateDependent(
  id: string,
  updateData: UpdateDependentDto
): Promise<IDependent | undefined> {
  try {
    const { data } = await axios.patch(`${PROFILES_API}/dependents/${id}`, updateData);
    return data.data;
  } catch (error: any) {
    if (typeof window === 'undefined') {
      console.error('Error updating dependent:', error);
    }
    throw error;
  }
}

export async function deleteDependent(id: string): Promise<void> {
  try {
    await axios.delete(`${PROFILES_API}/dependents/${id}`);
  } catch (error: any) {
    if (typeof window === 'undefined') {
      console.error('Error deleting dependent:', error);
    }
    throw error;
  }
}

// ==================== VERIFICATION ====================

export async function requestVerification(
  userId: string,
  verificationData: RequestVerificationDto
): Promise<IVerification | undefined> {
  try {
    const { data } = await axios.post(
      `${PROFILES_API}/${userId}/verification-request`,
      verificationData
    );
    return data.data;
  } catch (error: any) {
    if (typeof window === 'undefined') {
      console.error('Error submitting verification request:', error);
    }
    throw error;
  }
}

export async function getVerificationsByUser(userId: string): Promise<IVerification[]> {
  try {
    const { data } = await axios.get(`${PROFILES_API}/${userId}/verifications`);
    return data.data || [];
  } catch (error: any) {
    if (typeof window === 'undefined') {
      console.error('Error fetching verifications:', error);
    }
    throw error;
  }
}

export async function getVerificationDetails(id: string): Promise<IVerification> {
  try {
    const { data } = await axios.get(`${PROFILES_API}/verification/${id}`);
    return data.data;
  } catch (error: any) {
    if (typeof window === 'undefined') {
      console.error('Error fetching verification details:', error);
    }
    throw error;
  }
}

export async function getDependentsWithVerification(userId: string): Promise<IDependent[]> {
  try {
    const { data } = await axios.get(`${PROFILES_API}/${userId}/dependents-with-verifications`);
    return data.data;
  } catch (error: any) {
    if (typeof window === 'undefined') {
      console.error('Error fetching dependents with verification:', error);
    }
    throw error;
  }
}

export async function cancelVerificationRequest(verificationId: string): Promise<void> {
  try {
    await axios.post(`${PROFILES_API}/verification/${verificationId}/cancel`);
  } catch (error: any) {
    if (typeof window === 'undefined') {
      console.error('Error canceling verification request:', error);
    }
    throw error;
  }
}
