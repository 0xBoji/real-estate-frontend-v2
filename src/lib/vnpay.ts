import CryptoJS from 'crypto-js';
import moment from 'moment';
import qs from 'qs';

// VNPay Configuration
const VNPAY_CONFIG = {
  vnp_TmnCode: process.env.NEXT_PUBLIC_VNPAY_TMN_CODE || '2QXUI4J4',
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || 'SANDBOXHASHSECRET',
  vnp_Url: process.env.NEXT_PUBLIC_VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.NEXT_PUBLIC_VNPAY_RETURN_URL || 'http://localhost:3001/membership/payment/vnpay/return',
  vnp_Api: process.env.NEXT_PUBLIC_VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'
};

export interface VNPayPaymentRequest {
  amount: number;
  orderInfo: string;
  orderType: string;
  locale?: string;
  currCode?: string;
  clientIp?: string;
}

export interface VNPayPaymentResponse {
  paymentUrl: string;
  vnp_TxnRef: string;
}

export interface VNPayReturnData {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

class VNPayService {
  private sortObject(obj: any): any {
    const sorted: any = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }

  private createSecureHash(params: any, secretKey: string): string {
    const sortedParams = this.sortObject(params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = CryptoJS.HmacSHA512(signData, secretKey);
    return hmac.toString();
  }

  public createPaymentUrl(paymentData: VNPayPaymentRequest): VNPayPaymentResponse {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId = moment(date).format('DDHHmmss');
    
    const vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
      vnp_Locale: paymentData.locale || 'vn',
      vnp_CurrCode: paymentData.currCode || 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: paymentData.orderInfo,
      vnp_OrderType: paymentData.orderType,
      vnp_Amount: paymentData.amount * 100, // VNPay requires amount in VND cents
      vnp_ReturnUrl: VNPAY_CONFIG.vnp_ReturnUrl,
      vnp_IpAddr: paymentData.clientIp || '127.0.0.1',
      vnp_CreateDate: createDate
    };

    // Create secure hash
    const secureHash = this.createSecureHash(vnp_Params, VNPAY_CONFIG.vnp_HashSecret);
    vnp_Params.vnp_SecureHash = secureHash;

    // Build payment URL
    const paymentUrl = VNPAY_CONFIG.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

    return {
      paymentUrl,
      vnp_TxnRef: orderId
    };
  }

  public verifyReturnUrl(returnData: VNPayReturnData): boolean {
    const secureHash = returnData.vnp_SecureHash;
    delete (returnData as any).vnp_SecureHash;
    delete (returnData as any).vnp_SecureHashType;

    const signData = qs.stringify(returnData, { encode: false });
    const hmac = CryptoJS.HmacSHA512(signData, VNPAY_CONFIG.vnp_HashSecret);
    const signed = hmac.toString();

    return secureHash === signed;
  }

  public isPaymentSuccess(returnData: VNPayReturnData): boolean {
    return returnData.vnp_ResponseCode === '00' && returnData.vnp_TransactionStatus === '00';
  }

  public getPaymentStatus(returnData: VNPayReturnData): {
    success: boolean;
    message: string;
    transactionId: string;
    amount: number;
    orderInfo: string;
    payDate: string;
  } {
    const isValid = this.verifyReturnUrl(returnData);
    const isSuccess = this.isPaymentSuccess(returnData);

    let message = '';
    if (!isValid) {
      message = 'Invalid signature';
    } else if (!isSuccess) {
      message = this.getResponseMessage(returnData.vnp_ResponseCode);
    } else {
      message = 'Payment successful';
    }

    return {
      success: isValid && isSuccess,
      message,
      transactionId: returnData.vnp_TransactionNo || returnData.vnp_TxnRef,
      amount: parseInt(returnData.vnp_Amount) / 100, // Convert back from cents
      orderInfo: returnData.vnp_OrderInfo,
      payDate: returnData.vnp_PayDate
    };
  }

  private getResponseMessage(responseCode: string): string {
    const messages: { [key: string]: string } = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    };

    return messages[responseCode] || 'Lỗi không xác định';
  }

  // Query transaction status from VNPay
  public async queryTransaction(txnRef: string, transDate: string): Promise<any> {
    const date = new Date();
    const requestId = moment(date).format('HHmmss');
    
    const vnp_Params: any = {
      vnp_RequestId: requestId,
      vnp_Version: '2.1.0',
      vnp_Command: 'querydr',
      vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Query transaction ${txnRef}`,
      vnp_TransactionDate: transDate,
      vnp_CreateDate: moment(date).format('YYYYMMDDHHmmss'),
      vnp_IpAddr: '127.0.0.1'
    };

    const secureHash = this.createSecureHash(vnp_Params, VNPAY_CONFIG.vnp_HashSecret);
    vnp_Params.vnp_SecureHash = secureHash;

    try {
      const response = await fetch(VNPAY_CONFIG.vnp_Api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vnp_Params)
      });

      return await response.json();
    } catch (error) {
      console.error('VNPay query error:', error);
      throw error;
    }
  }
}

export const vnpayService = new VNPayService();
