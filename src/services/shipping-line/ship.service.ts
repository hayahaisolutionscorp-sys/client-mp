import { IShip } from '@/models';
import { SHIPS_API } from 'constants/api';
import axios from '@/services/core/axios';

import shipsData from '@/data/ships.json';

export async function getAllShips(): Promise<IShip[] | undefined> {
  // try {
  //   const { data } = await axios.get(SHIPS_API);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return shipsData as any as IShip[];
}

export async function getShips(): Promise<IShip[] | undefined> {
  // try {
  //   const { data } = await axios.get(SHIPS_API);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (shipsData as any as IShip[]).filter(s => s.shippingLineId === 3);
}

export async function getShip(shipId: number): Promise<IShip | undefined> {
  // try {
  //   const { data } = await axios.get(`${SHIPS_API}/${shipId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (shipsData as any as IShip[]).find(s => s.id === shipId);
}
