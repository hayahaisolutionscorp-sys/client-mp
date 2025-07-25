import { IShip } from '@/models';
import { SHIPS_API } from 'constants/api';

export async function getAllShips(): Promise<IShip[] | undefined> {
  try {
    const response = await fetch(SHIPS_API);
    
    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      throw new Error(`Error fetching ships: ${response.statusText}`);
    }

    // Parse the JSON response
    const data: IShip[] = await response.json();
    return data;

  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getShips(): Promise<IShip[] | undefined> {
  try {
    const response = await fetch(`${SHIPS_API}/my-shipping-line`);
    
    if (!response.ok) {
      throw new Error(`Error fetching ships: ${response.statusText}`);
    }

    const data: IShip[] = await response.json();
    return data;

  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getShip(shipId: number): Promise<IShip | undefined> {
  const ships = await getShips();
  return ships?.find((ship) => ship.id === shipId);
}
