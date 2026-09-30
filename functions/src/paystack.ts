import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verifies a Paystack webhook signature: `x-paystack-signature` is the hex HMAC-SHA512 of the *raw* request
 * body keyed with the merchant secret key. Uses a constant-time comparison.
 */
export function verifyPaystackSignature(rawBody: Buffer | string, signature: string | undefined, secret: string | undefined): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac('sha512', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function signPaystackPayload(rawBody: Buffer | string, secret: string): string {
  return createHmac('sha512', secret).update(rawBody).digest('hex');
}
