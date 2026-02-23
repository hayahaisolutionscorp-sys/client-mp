import axios from '../core/axios';
import { AUTH_API } from 'constants/api'; // Changed from PASSENGER_API
import { RegisterForm, IPassenger } from '@/models';

export function mapPassengerToDto(values: RegisterForm): IPassenger {
  const {
    firstName,
    middleName,
    lastName,
    suffixName,
    sex,
    birthday,
    address,
    phone,
    nationality,
  } = values;

  return {
    id: -1,
    firstName,
    middleName,
    lastName,
    suffixName,
    sex,
    birthdayIso: new Date(birthday).toISOString(),
    address,
    phone,
    nationality,
  };
}

export async function updatePassenger(
  passengerData: Partial<IPassenger>
): Promise<IPassenger | undefined> {
  try {
    const payload = {
      firstName: passengerData.firstName,
      middleName: passengerData.middleName,
      lastName: passengerData.lastName,
      suffixName: passengerData.suffixName,
      sex: passengerData.sex,
      birthday: passengerData.birthdayIso,
      address: passengerData.address,
      nationality: passengerData.nationality,
      phone: passengerData.phone,
      profilePictureUrl: passengerData.profilePictureUrl,
      passengerType: passengerData.passengerType,
      passengerCode: passengerData.passengerCode,
    };

    const { data } = await axios.patch(`${AUTH_API}/me`, payload);

    return data.data.passenger;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error updating passenger:', e);
    }
    throw e;
  }
}

export async function getPassenger(): Promise<IPassenger | undefined> {
  try {
    const { data } = await axios.get(`${AUTH_API}/me`);
    return data.data.passenger;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching passenger:', e);
    }
  }
}
