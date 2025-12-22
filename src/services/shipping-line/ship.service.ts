import { IShip } from '@/models';
import { SHIPS_API } from 'constants/api';

import shipsData from '@/data/ships.json';

export async function getAllShips(): Promise<IShip[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return shipsData as any as IShip[];
}

export async function getShips(): Promise<IShip[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (shipsData as any as IShip[]).filter(s => s.shippingLineId === 3);
}

export async function getShip(shipId: number): Promise<IShip | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (shipsData as any as IShip[]).find(s => s.id === shipId);
}
