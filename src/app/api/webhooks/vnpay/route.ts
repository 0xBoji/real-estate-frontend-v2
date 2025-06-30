import { NextRequest, NextResponse } from 'next/server';
import { vnpayService } from '@/lib/vnpay';
import { membershipApi } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('VNPay webhook received:', body);

    // Extract VNPay IPN (Instant Payment Notification) data
    const {
      vnp_Amount,
      vnp_BankCode,
      vnp_BankTranNo,
      vnp_CardType,
      vnp_OrderInfo,
      vnp_PayDate,
      vnp_ResponseCode,
      vnp_TmnCode,
      vnp_TransactionNo,
      vnp_TransactionStatus,
      vnp_TxnRef,
      vnp_SecureHash
    } = body;

    // Verify the webhook signature
    const isValidSignature = vnpayService.verifyReturnUrl(body);
    
    if (!isValidSignature) {
      console.error('Invalid VNPay webhook signature');
      return NextResponse.json(
        { RspCode: '97', Message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Check if payment was successful
    const isPaymentSuccess = vnpayService.isPaymentSuccess(body);
    
    if (isPaymentSuccess) {
      try {
        // Update membership status in database
        const membershipData = {
          transactionId: vnp_TransactionNo || vnp_TxnRef,
          amount: parseInt(vnp_Amount) / 100, // Convert from cents
          paymentMethod: 'VNPAY',
          paymentGateway: 'VNPAY',
          status: 'COMPLETED',
          paymentDate: vnp_PayDate,
          orderInfo: vnp_OrderInfo,
          bankCode: vnp_BankCode,
          bankTranNo: vnp_BankTranNo,
          cardType: vnp_CardType
        };

        // Call backend API to update membership
        // This would typically extract user info from vnp_OrderInfo
        // and update the user's membership status
        console.log('Updating membership with data:', membershipData);
        
        // In a real implementation, you would:
        // 1. Parse vnp_OrderInfo to get user ID and plan ID
        // 2. Update user's membership in database
        // 3. Send confirmation email
        // 4. Log the transaction
        
        // For now, we'll just log the successful payment
        console.log('VNPay payment successful:', {
          transactionId: vnp_TransactionNo,
          amount: parseInt(vnp_Amount) / 100,
          orderInfo: vnp_OrderInfo
        });

        // Respond with success to VNPay
        return NextResponse.json({
          RspCode: '00',
          Message: 'Confirm Success'
        });

      } catch (error) {
        console.error('Error updating membership:', error);
        
        // Even if our processing fails, we should acknowledge receipt
        // to prevent VNPay from retrying the webhook
        return NextResponse.json({
          RspCode: '00',
          Message: 'Received but processing failed'
        });
      }
    } else {
      // Payment failed
      console.log('VNPay payment failed:', {
        responseCode: vnp_ResponseCode,
        transactionStatus: vnp_TransactionStatus,
        orderInfo: vnp_OrderInfo
      });

      // Log failed payment for investigation
      const failedPaymentData = {
        transactionId: vnp_TxnRef,
        amount: parseInt(vnp_Amount) / 100,
        paymentMethod: 'VNPAY',
        paymentGateway: 'VNPAY',
        status: 'FAILED',
        paymentDate: vnp_PayDate,
        orderInfo: vnp_OrderInfo,
        responseCode: vnp_ResponseCode,
        transactionStatus: vnp_TransactionStatus
      };

      console.log('Logging failed payment:', failedPaymentData);

      return NextResponse.json({
        RspCode: '00',
        Message: 'Payment failed but acknowledged'
      });
    }

  } catch (error) {
    console.error('VNPay webhook error:', error);
    
    return NextResponse.json(
      { 
        RspCode: '99',
        Message: 'System error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (VNPay might send GET requests for some notifications)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Convert search params to object
  const params: any = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  console.log('VNPay GET webhook received:', params);

  // Process the same way as POST
  try {
    const isValidSignature = vnpayService.verifyReturnUrl(params);
    
    if (!isValidSignature) {
      return NextResponse.json(
        { RspCode: '97', Message: 'Invalid signature' },
        { status: 400 }
      );
    }

    const isPaymentSuccess = vnpayService.isPaymentSuccess(params);
    
    if (isPaymentSuccess) {
      console.log('VNPay GET payment successful:', {
        transactionId: params.vnp_TransactionNo,
        amount: parseInt(params.vnp_Amount) / 100,
        orderInfo: params.vnp_OrderInfo
      });
    }

    return NextResponse.json({
      RspCode: '00',
      Message: 'Success'
    });

  } catch (error) {
    console.error('VNPay GET webhook error:', error);
    
    return NextResponse.json(
      { 
        RspCode: '99',
        Message: 'System error'
      },
      { status: 500 }
    );
  }
}
