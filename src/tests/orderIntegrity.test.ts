import { isValidOrderStatusTransition, calculateAuthoritativeOrderTotal } from '../services/orderService';
import { Order } from '../types';

function runOrderIntegrityTests() {
  console.log('Running Order Integrity & State Machine Tests (Round 1 of 3)...');

  // Test 1: State Machine Valid Transitions
  const validTransitions: [any, any][] = [
    ['cart', 'checkout'],
    ['checkout', 'payment_pending'],
    ['payment_pending', 'paid'],
    ['paid', 'restaurant_pending'],
    ['restaurant_pending', 'accepted'],
    ['accepted', 'preparing'],
    ['preparing', 'ready'],
    ['ready', 'out_for_delivery'],
    ['out_for_delivery', 'delivered'],
    ['accepted', 'cancelled'],
  ];

  for (const [from, to] of validTransitions) {
    const valid = isValidOrderStatusTransition(from, to);
    if (!valid) {
      throw new Error(`Expected transition ${from} -> ${to} to be valid, but got false.`);
    }
  }
  console.log('PASS: Valid state machine transitions verified.');

  // Test 2: State Machine Invalid Transitions (Security checks)
  const invalidTransitions: [any, any][] = [
    ['payment_pending', 'delivered'],
    ['payment_pending', 'preparing'],
    ['preparing', 'delivered'],
    ['delivered', 'preparing'],
    ['delivered', 'accepted'],
    ['rejected', 'preparing'],
    ['cancelled', 'preparing'],
  ];

  for (const [from, to] of invalidTransitions) {
    const valid = isValidOrderStatusTransition(from, to);
    if (valid) {
      throw new Error(`SECURITY FAILURE: Expected invalid transition ${from} -> ${to} to be rejected, but it was allowed.`);
    }
  }
  console.log('PASS: Invalid state machine transitions correctly blocked.');

  // Test 3: Authoritative Order Total Calculation (Price tampering prevention)
  const mockOrder: Order = {
    id: 'test_order_1',
    orderNumber: 'ORD-001',
    userId: 'user_1',
    restaurantId: 'rest_1',
    restaurantName: 'Test Rest',
    fulfillmentMethod: 'delivery',
    currency: 'GBP',
    estimatedDeliveryTime: '30 mins',
    items: [
      {
        id: 'ci_1',
        meal: {
          id: 'meal_1',
          restaurantId: 'rest_1',
          restaurantName: 'Test Rest',
          restaurantCity: 'London',
          name: 'Jollof Rice',
          description: 'Party jollof',
          priceGBP: 10.00,
          priceNGN: 5000,
          rating: 4.8,
          reviewCount: 12,
          prepTimeMinutes: 20,
          image: '',
          region: 'West African',
          cuisine: 'Nigerian',
          category: 'Rice & Grains',
          ingredients: ['Rice', 'Tomatoes'],
          allergens: [],
          spiceLevel: 'medium',
          dietaryFlags: ['halal'],
          mealPeriods: ['lunch'],
          isAvailable: true,
          customizationOptions: []
        },
        restaurant: {
          id: 'rest_1',
          name: 'Test Rest',
          tagline: 'Authentic Nigerian',
          description: 'Test restaurant',
          city: 'London',
          address: '123 Test St',
          rating: 4.8,
          reviewCount: 12,
          isOpen: true,
          orderAcceptanceMode: 'auto',
          operatingHours: '9am - 10pm',
          fulfillmentOptions: ['delivery'],
          estimatedDeliveryMin: 20,
          estimatedDeliveryMax: 40,
          deliveryFeeNGN: 1000,
          deliveryFeeGBP: 3.50,
          minimumOrderNGN: 5000,
          minimumOrderGBP: 15.00,
          verified: true,
          cuisines: ['Nigerian'],
          image: '',
          logo: ''
        },
        quantity: 2,
        itemPrice: 10.00,
        selectedCustomizations: []
      }
    ],
    status: 'payment_pending',
    paymentStatus: 'pending',
    deliveryAddress: { id: 'loc_1', label: 'Home', address: '123 Test St', city: 'London', postcodeOrArea: 'SE1', currency: 'GBP', isDefault: true },
    deliveryFee: 3.50,
    serviceFee: 1.00,
    subtotal: 1.00, // Tampered subtotal sent by client
    total: 2.00,    // Tampered total sent by client
    createdAt: new Date().toISOString()
  };

  const authoritative = calculateAuthoritativeOrderTotal(mockOrder);
  if (authoritative.subtotal !== 20.00 || authoritative.total !== 24.50) {
    throw new Error(`Price tampering not prevented! Expected subtotal 20.00, total 24.50, got subtotal ${authoritative.subtotal}, total ${authoritative.total}`);
  }
  console.log('PASS: Authoritative price calculation successfully blocked client price tampering.');

  console.log('ALL ORDER INTEGRITY TESTS PASSED SUCCESSFULLY.');
}

// Execute tests
runOrderIntegrityTests();
