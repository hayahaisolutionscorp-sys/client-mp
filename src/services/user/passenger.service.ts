import axios from '../core/axios';
import { PASSENGER_API } from 'constants/api';
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
  passengerId: number,
  passengerData: Partial<IPassenger>
): Promise<IPassenger | undefined> {
  // try {
  //   const { data: updatedPassenger } = await axios.patch<IPassenger>(
  //     `${PASSENGER_API}/${passengerId}`,
  //     passengerData
  //   );
  //   return updatedPassenger;
  // } catch (e) {
  //   console.error('Error updating passenger:', e);
  //   throw e;
  // }

  await new Promise(resolve => setTimeout(resolve, 500));
  return undefined;
}

export async function getPassenger(
  passengerId: number
): Promise<IPassenger | undefined> {
  // try {
  //   const { data: passenger } = await axios.get<IPassenger>(
  //     `${PASSENGER_API}/${passengerId}`
  //   );
  //   return passenger;
  // } catch (e) {
  //   console.error(e);
  // }

  await new Promise(resolve => setTimeout(resolve, 500));
  return undefined;
}
