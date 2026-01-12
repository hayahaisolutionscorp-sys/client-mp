export interface IPress {
  id: number | string;
  title: string;
  content: string;
  publish_date: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}