export interface IContactUs {
  id: number;
  shippingLineId: number;
  headingText: string;
  headingDescription: string;
  contactNumber: string;
  email: string;
  address: string;
  backgroundImageFilename: string;
}

export interface IContactInformation {
  id: string;
  type: string;
  value: string;
  label: string;
  display_order?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}
