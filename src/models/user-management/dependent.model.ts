export type DependentVerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired' | 'unverified';

export interface IDependent {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  sex: string;
  relationship: string;
  nationality: string;
  phone: string;
  address: string;
  email?: string;
  category: string;
  created_at?: string;
  updated_at?: string;
  verification?: IVerification;

  status?: DependentVerificationStatus;
  verifications?: IVerification[];
}

export interface IVerification {
  id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  id_type: string;
  id_number: string;
  document_country: string;
  expiry_date: string;
  front_image_url: string;
  back_image_url: string;
  selfie_url: string;
  user_id: string;
  dependent_id: string | null;
  is_latest: boolean;
  attempt_number: number;
  requires_manual_approval: boolean;
  review_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateDependentDto {
  first_name: string;
  last_name: string;
  birthday: string;
  sex: string;
  relationship: string;
  nationality: string;
  phone: string;
  address: string;
  email?: string;
  category: string;
}

export interface UpdateDependentDto {
  first_name?: string;
  last_name?: string;
  birthday?: string;
  sex?: string;
  relationship?: string;
  nationality?: string;
  phone?: string;
  address?: string;
  email?: string;
  category?: string;
}

export interface RequestVerificationDto {
  dependent_id?: string;
  id_type: string;
  id_number: string;
  document_country: string;
  expiry_date: string;
  front_image_url: string;
  back_image_url: string;
  selfie_url: string;
}
