export type DependentVerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired' | 'unverified';

export interface IDependent {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  gender: string;
  relationship: string;
  nationality: string;
  occupation: string;
  civil_status: string;
  mobile_number: string;
  address: string;
  email?: string;
  category: string;
  created_at?: string;
  updated_at?: string;
  verification?: IVerification;

  verificationStatus?: DependentVerificationStatus;
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
  rejection_reason?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDependentDto {
  first_name: string;
  last_name: string;
  birthday: string;
  gender: string;
  relationship: string;
  nationality: string;
  occupation: string;
  civil_status: string;
  mobile_number: string;
  address: string;
  email?: string;
  category: string;
}

export interface UpdateDependentDto {
  first_name?: string;
  last_name?: string;
  birthday?: string;
  gender?: string;
  relationship?: string;
  nationality?: string;
  occupation?: string;
  civil_status?: string;
  mobile_number?: string;
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
