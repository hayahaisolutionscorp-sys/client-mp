import React from 'react'
import { ShieldCheck, Shield, AlertCircle, XCircle, Clock } from 'lucide-react'

export type VerificationStatus = 
  | 'unverified' 
  | 'pending' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'expired'

export interface StatusConfig {
  label: string
  color: string
  icon: React.ReactNode
}

/**
 * Get Tailwind CSS classes for status badge color
 */
export const getStatusColor = (status: VerificationStatus): string => {
  const statusColors: Record<VerificationStatus, string> = {
    approved: 'bg-green-500 text-white',
    pending: 'bg-yellow-500 text-white',
    under_review: 'bg-blue-500 text-white',
    rejected: 'bg-red-500 text-white',
    expired: 'bg-gray-500 text-white',
    unverified: 'bg-gray-400 text-white'
  }
  return statusColors[status] || 'bg-gray-400 text-white'
}

/**
 * Get user-friendly display text for status
 */
export const getStatusDisplayText = (status: VerificationStatus): string => {
  const statusText: Record<VerificationStatus, string> = {
    approved: 'VERIFIED',
    pending: 'PENDING',
    under_review: 'UNDER REVIEW',
    rejected: 'REJECTED',
    expired: 'EXPIRED',
    unverified: 'UNVERIFIED'
  }
  return statusText[status] || status.replace(/_/g, ' ').toUpperCase()
}

/**
 * Get Badge variant for status
 */
export const getStatusVariant = (status: VerificationStatus): "default" | "secondary" | "destructive" | "outline" => {
  const variantMap: Record<VerificationStatus, "default" | "secondary" | "destructive" | "outline"> = {
    approved: 'default',      // Primary color (usually blue/brand color)
    pending: 'secondary',     // Secondary color
    under_review: 'secondary',// Secondary color
    rejected: 'destructive',  // Red/danger color
    expired: 'outline',       // Outline variant
    unverified: 'outline'     // Outline variant
  }
  return variantMap[status] || 'outline'
}

/**
 * Get icon component for status
 */
export const getStatusIcon = (status: VerificationStatus): React.ReactNode => {
  const iconMap: Record<VerificationStatus, React.ReactNode> = {
    approved: <ShieldCheck className="w-3 h-3 mr-1" />,
    pending: <Clock className="w-3 h-3 mr-1" />,
    under_review: <AlertCircle className="w-3 h-3 mr-1" />,
    rejected: <XCircle className="w-3 h-3 mr-1" />,
    expired: <AlertCircle className="w-3 h-3 mr-1" />,
    unverified: <Shield className="w-3 h-3 mr-1" />
  }
  return iconMap[status] || <Shield className="w-3 h-3 mr-1" />
}

/**
 * Get complete status badge configuration
 */
export const getStatusBadge = (status: VerificationStatus): StatusConfig => {
  const configs: Record<VerificationStatus, StatusConfig> = {
    approved: {
      label: 'Verified',
      color: 'bg-green-500 text-white',
      icon: <ShieldCheck className="h-3 w-3 mr-1" />
    },
    pending: {
      label: 'Pending',
      color: 'bg-yellow-500 text-white',
      icon: <Clock className="h-3 w-3 mr-1" />
    },
    under_review: {
      label: 'Under Review',
      color: 'bg-blue-500 text-white',
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-500 text-white',
      icon: <XCircle className="h-3 w-3 mr-1" />
    },
    expired: {
      label: 'Expired',
      color: 'bg-gray-500 text-white',
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    },
    unverified: {
      label: 'Unverified',
      color: 'bg-gray-400 text-white',
      icon: <Shield className="h-3 w-3 mr-1" />
    }
  }
  
  return configs[status] || configs.unverified
}
