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

        const response = await axios.post(`${UPLOAD_API}/users/profile-picture`, formData, {
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
     * Upload a vehicle image for vehicle registration
     * @param file - Vehicle image file (JPG, JPEG, PNG, WEBP, SVG) - max 5MB
     * @returns Promise with uploaded file URL
     */
    uploadVehicleCR: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${UPLOAD_API}/kyc/vehicle/cr`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    /**
     * Upload a vehicle image for vehicle registration
     * @param file - Vehicle image file (JPG, JPEG, PNG, WEBP, SVG) - max 5MB
     * @returns Promise with uploaded file URL
     */
    uploadVehicleOR: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${UPLOAD_API}/kyc/vehicle/or`, formData, {
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

    /**
     * Upload a vehicle picture (front, rear, side)
     * @param file - Image file
     * @returns Promise with uploaded file URL
     */
    uploadVehiclePicture: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${UPLOAD_API}/kyc/vehicle-pics`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },
    /**
     * Get a short-lived presigned URL for a secure document
     * @param path - The file path or key in the storage bucket
     * @returns Promise with the presigned URL
     */
    getPresignedUrl: async (path: string): Promise<string> => {
        try {
            const response = await axios.get(`${UPLOAD_API}/${path}`);
            // Handle different variations of API response structure
            return response.data?.data?.url || response.data?.url || '';
        } catch (error) {
            console.error('Error fetching presigned URL:', error);
            return '';
        }
    },
};
