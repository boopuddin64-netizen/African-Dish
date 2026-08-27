import { updateOrderStatusInFirestore } from './orderService';

export interface PaymentInitiationResult {
  paymentReference: string;
  authorizationUrl?: string;
  status: 'initiated' | 'verified' | 'failed';
}

/**
 * Initiates payment simulation (Paystack / Card test gateway).
 */
export async function initiatePayment(
  orderId: string, 
  amount: number, 
  currency: string
): Promise<PaymentInitiationResult> {
  const reference = `TX_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  
  // Simulate network payment handoff
  await new Promise((res) => setTimeout(res, 800));

  return {
    paymentReference: reference,
    status: 'initiated'
  };
}

/**
 * Server-side verified payment confirmation.
 */
export async function verifyAndConfirmPayment(
  orderId: string, 
  paymentReference: string
): Promise<boolean> {
  // Simulate backend gateway verification check
  await new Promise((res) => setTimeout(res, 600));

  // Mark order as paid & send to restaurant pending queue in Firestore
  await updateOrderStatusInFirestore(orderId, 'paid', {
    paymentStatus: 'paid',
    paymentReference
  });

  return true;
}
