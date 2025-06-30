export interface MembershipPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  features: string[];
  maxProperties: number;
  maxImages: number;
  priority: boolean;
  analytics: boolean;
  support: 'basic' | 'priority' | 'premium';
  popular?: boolean;
  color: string;
}

export interface UserMembership {
  id: number;
  userId: number;
  planId: number;
  plan: MembershipPlan;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: number;
  userId: number;
  membershipId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentGateway: 'VNPAY' | 'STRIPE' | 'PAYPAL';
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  planId: number;
  paymentMethod: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  paymentUrl: string;
  transactionId: string;
  amount: number;
  currency: string;
}
