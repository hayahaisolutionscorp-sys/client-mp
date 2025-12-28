import axios from '../core/axios';
import { AUTH_API } from 'constants/api'; // Changed from PASSENGER_API
import { RegisterForm, IPassenger } from '@/models';

export function mapPassengerToDto(values: RegisterForm): IPassenger {
  const {
    firstName,
    lastName,
    occupation,
    sex,
    civilStatus,
    birthday,
    address,
    mobile_number,
    nationality,
  } = values;

  return {
    id: -1,
    firstName,
    lastName,
    occupation,
    sex,
    civilStatus,
    birthdayIso: new Date(birthday).toISOString(),
    address,
    mobile_number,
    nationality,
  };
}

export async function updatePassenger(
  passengerId: number | string, // Relax type to allow usage if needed, though we ignore it for /me
  passengerData: Partial<IPassenger>
): Promise<IPassenger | undefined> {
  try {
    // Map IPassenger fields to UpdateProfileDto fields expected by backend
    // Backend expects: firstName, lastName, sex, birthday, address, nationality, occupation, mobile_number, civilStatus
    const payload = {
      firstName: passengerData.firstName,
      lastName: passengerData.lastName,
      sex: passengerData.sex,
      birthday: passengerData.birthdayIso, // Backend UpdateProfileDto has birthday (string)
      address: passengerData.address,
      nationality: passengerData.nationality,
      occupation: passengerData.occupation,
      mobile_number: passengerData.mobile_number,
      civilStatus: passengerData.civilStatus
    };

    const { data } = await axios.patch(`${AUTH_API}/me`, payload);
    // Backend returns { ...user, passenger: { ... } }
    return data.data.passenger;
  } catch (e) {
    console.error('Error updating passenger:', e);
    throw e;
  }
}

export async function getPassenger(
  passengerId: number
): Promise<IPassenger | undefined> {
  try {
    const { data } = await axios.get(`${AUTH_API}/me`);
    return data.data.passenger;
  } catch (e) {
    console.error(e);
  }
}
