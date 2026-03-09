export interface IPassengerType {
  id: number;
  name: string;
  code: string;
  age_max: number | null;
  age_min: number | null;
  description?: string;
  requires_id?: boolean;
  sort_order?: number;
  is_active?: boolean;
}
