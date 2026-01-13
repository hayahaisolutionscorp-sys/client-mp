import axios from '@/services/core/axios';
import { UPLOAD_API } from 'constants/api';

export interface UploadResponse {
    url: string;
}

export const UploadService = {
    /**
     * Upload a profile picture for KYC verification
     * @param file - Image file (JPG, JPEG, PNG, WEBP, SVG) - max 5MB
     * @returns Promise with uploaded file URL
     */
    uploadKYCProfilePicture: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${UPLOAD_API}/kyc/profile-picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    /**
     * Upload an identity document for KYC verification
     * @param file - Identity document file (JPG, JPEG, PNG, WEBP, SVG) - max 5MB
     * @returns Promise with uploaded file URL
     */
    uploadKYCIdentityDocument: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${UPLOAD_API}/kyc/identity-document`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    /**
     * Upload a verification selfie for KYC
     * @param file - Selfie image file (JPG, JPEG, PNG, WEBP, SVG) - max 5MB
     * @returns Promise with uploaded file URL
     */
    uploadKYCVerificationSelfie: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${UPLOAD_API}/kyc/verification-selfie`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },
};
