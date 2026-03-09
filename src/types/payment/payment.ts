export interface PaymentInitiationRequest {
  paymentGateway?: string;
}

export interface PaymentInitiationResponse {
  redirectUrl: string;
  paymentReference: string;
}

// PayMongo Types
export interface PaymongoLineItem {
  name: string;
  quantity: number;
  amount: number; // in cents
  currency: string;
  description?: string;
}

export interface PaymongoCreateCheckoutRequest {
  bookingPaymentId: string;
  lineItems: PaymongoLineItem[];
  paymentMethodTypes: string[];
  successUrl: string;
  cancelUrl: string;
  referenceNumber?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymongoCheckoutSession {
  id: string;
  type: string;
  attributes: {
    billing?: any;
    cancel_url: string;
    checkout_url: string;
    client_key: string;
    created_at: number;
    currency: string;
    description?: string;
    line_items: PaymongoLineItem[];
    livemode: boolean;
    metadata?: Record<string, any>;
    payment_intent: {
      id: string;
      type: string;
      attributes: any;
    };
    payment_method_types: string[];
    payments: any[];
    reference_number: string;
    send_email_receipt: boolean;
    show_description: boolean;
    show_line_items: boolean;
    status: string;
    success_url: string;
    updated_at: number;
  };
}

export interface PaymongoCreateCheckoutResponse {
  data: PaymongoCheckoutSession;
}

export interface PaymongoCheckoutApiResponse {
  success: boolean;
  data: {
    checkoutUrl: string;
    checkoutSessionId: string;
    expiresAt?: number;
    transactionId: string;
  };
}

// Maya Types
export interface MayaItemAmount {
  value: number;
}

export interface MayaItem {
  name: string;
  quantity: number;
  code?: string;
  description?: string;
  amount: MayaItemAmount;
  totalAmount: MayaItemAmount;
}

export interface MayaCreateCheckoutRequest {
  bookingPaymentId: string;
  totalAmount: { value: number; currency: string };
  buyer?: {
    firstName?: string;
    lastName?: string;
    contact?: { phone?: string; email?: string };
  };
  items: MayaItem[];
  successUrl: string;
  failureUrl: string;
  cancelUrl: string;
  requestReferenceNumber: string;
  metadata?: Record<string, any>;
}

export interface MayaCheckoutApiResponse {
  success: boolean;
  data: {
    checkoutUrl: string;
    checkoutId: string;
    transactionId: string;
  };
}

// PayMongo Payment Intent types (for GCash, PayMaya, GrabPay, DOB)
export interface PaymongoInitiateRequest {
  bookingPaymentId: string;
  amount: number; // in PHP (float)
  paymentMethodType: 'gcash' | 'paymaya' | 'grab_pay';
  returnUrl: string;
  billing?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface PaymongoInitiateApiResponse {
  success: boolean;
  data: {
    redirectUrl: string;
    paymentIntentId: string;
    transactionId: string;
  };
}
