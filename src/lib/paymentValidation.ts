import { z } from 'zod';

// Payment validation schemas
export const billingInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  postalCode: z.string().optional(),
});

export const cardInfoSchema = z.object({
  cardNumber: z.string().min(13, 'Card number must be at least 13 digits').max(19, 'Card number must be at most 19 digits'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
  cvv: z.string().min(3, 'CVV must be at least 3 digits').max(4, 'CVV must be at most 4 digits'),
  cardholderName: z.string().min(2, 'Cardholder name must be at least 2 characters'),
});

export const paymentRequestSchema = z.object({
  planId: z.number().positive('Plan ID must be positive'),
  paymentMethod: z.enum(['vnpay', 'credit_card'], {
    errorMap: () => ({ message: 'Payment method must be vnpay or credit_card' })
  }),
  billingInfo: billingInfoSchema,
  cardInfo: cardInfoSchema.optional(),
});

// Payment security utilities
export class PaymentSecurity {
  // Sanitize card number for display (show only last 4 digits)
  static maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return '*'.repeat(cleaned.length);
    return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
  }

  // Validate card number using Luhn algorithm
  static validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Validate expiry date
  static validateExpiryDate(expiryDate: string): boolean {
    const match = expiryDate.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!match) return false;

    const month = parseInt(match[1]);
    const year = parseInt(match[2]) + 2000;
    const now = new Date();
    const expiry = new Date(year, month - 1);

    return expiry > now;
  }

  // Validate CVV
  static validateCVV(cvv: string, cardType?: string): boolean {
    const cleaned = cvv.replace(/\D/g, '');
    
    if (cardType === 'amex') {
      return cleaned.length === 4;
    }
    
    return cleaned.length === 3;
  }

  // Get card type from number
  static getCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    if (/^35/.test(cleaned)) return 'jcb';
    if (/^30[0-5]/.test(cleaned) || /^36/.test(cleaned) || /^38/.test(cleaned)) return 'diners';
    
    return 'unknown';
  }

  // Sanitize amount (prevent decimal manipulation)
  static sanitizeAmount(amount: number): number {
    return Math.round(amount * 100) / 100; // Round to 2 decimal places
  }

  // Validate amount range
  static validateAmount(amount: number, min: number = 0, max: number = 1000000000): boolean {
    return amount >= min && amount <= max && Number.isFinite(amount);
  }

  // Generate secure transaction reference
  static generateTxnRef(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN${timestamp}${random}`.toUpperCase();
  }

  // Validate transaction reference format
  static validateTxnRef(txnRef: string): boolean {
    return /^TXN\d{13}[A-Z0-9]{6}$/.test(txnRef);
  }

  // Hash sensitive data for logging (one-way hash)
  static hashForLogging(data: string): string {
    // Simple hash for logging purposes (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Validate email for payment notifications
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Validate phone number (international format)
  static validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  // Check for suspicious patterns in payment data
  static detectSuspiciousActivity(paymentData: any): string[] {
    const warnings: string[] = [];

    // Check for repeated attempts with same card
    if (paymentData.cardNumber && this.isRepeatedCard(paymentData.cardNumber)) {
      warnings.push('Repeated card usage detected');
    }

    // Check for unusual amounts
    if (paymentData.amount && (paymentData.amount > 50000000 || paymentData.amount < 1000)) {
      warnings.push('Unusual payment amount');
    }

    // Check for suspicious email patterns
    if (paymentData.email && this.isSuspiciousEmail(paymentData.email)) {
      warnings.push('Suspicious email pattern');
    }

    return warnings;
  }

  private static isRepeatedCard(cardNumber: string): boolean {
    // In a real implementation, this would check against a database
    // of recent transactions to detect repeated card usage
    return false;
  }

  private static isSuspiciousEmail(email: string): boolean {
    // Check for common suspicious patterns
    const suspiciousPatterns = [
      /\d{10,}/, // Too many consecutive digits
      /(.)\1{5,}/, // Repeated characters
      /^[a-z]+\d+@/, // Simple pattern like user123@
    ];

    return suspiciousPatterns.some(pattern => pattern.test(email));
  }
}

// Payment error types
export enum PaymentErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  GATEWAY_ERROR = 'GATEWAY_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  CARD_DECLINED = 'CARD_DECLINED',
  EXPIRED_CARD = 'EXPIRED_CARD',
  INVALID_CARD = 'INVALID_CARD',
  FRAUD_DETECTED = 'FRAUD_DETECTED',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

export class PaymentError extends Error {
  constructor(
    public type: PaymentErrorType,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

// Payment logging utility
export class PaymentLogger {
  static logPaymentAttempt(paymentData: any): void {
    const sanitizedData = {
      planId: paymentData.planId,
      paymentMethod: paymentData.paymentMethod,
      amount: paymentData.amount,
      currency: paymentData.currency,
      customerEmail: PaymentSecurity.hashForLogging(paymentData.customerEmail || ''),
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    };

    console.log('Payment attempt:', sanitizedData);
  }

  static logPaymentSuccess(transactionId: string, amount: number): void {
    console.log('Payment success:', {
      transactionId: PaymentSecurity.hashForLogging(transactionId),
      amount,
      timestamp: new Date().toISOString(),
    });
  }

  static logPaymentFailure(error: PaymentError, paymentData?: any): void {
    console.error('Payment failure:', {
      errorType: error.type,
      errorMessage: error.message,
      errorCode: error.code,
      amount: paymentData?.amount,
      paymentMethod: paymentData?.paymentMethod,
      timestamp: new Date().toISOString(),
    });
  }
}
