/**
 * Order Integrity & Pricing State Machine Tests
 */
import { calculateAuthoritativeOrderTotal, isValidOrderStatusTransition, VALID_ORDER_TRANSITIONS } from '../services/orderService';
import { Order, CartItem, Meal, Restaurant, SavedLocation } from '../types';

export function runOrderIntegrityTests() {
  console.log('====================================================');
  console.log('STARTING ORDER INTEGRITY & PRICING LOGIC TESTS');
  console.log('====================================================');

  const dummyRestaurant: Restaurant = {
    id: 'rest_buka',
    name: 'Mama Put Buka',
    tagline: 'Authentic Nigerian Food',
    description: 'Fresh and authentic dishes',
    city: 'Port Harcourt',
    address: '12 Aba Road',
    rating: 4.8,
    reviewCount: 150,
    isOpen: true,
    image: 'https://example.com/rest.jpg',
    logo: 'https://example.com/logo.jpg',
    orderAcceptanceMode: 'manual',
    operatingHours: '10am - 10pm',
    fulfillmentOptions: ['delivery', 'pickup'],
    estimatedDeliveryMin: 25,
    estimatedDeliveryMax: 40,
    deliveryFeeNGN: 1000,
    deliveryFeeGBP: 3.50,
    minimumOrderNGN: 2000,
    minimumOrderGBP: 10,
    verified: true,
    cuisines: ['Nigerian']
  };

  const dummyMeal: Meal = {
    id: 'meal_jollof_1',
    restaurantId: 'rest_buka',
    restaurantName: 'Mama Put Buka',
    restaurantCity: 'Port Harcourt',
    region: 'West African',
    cuisine: 'Nigerian',
    name: 'Party Jollof Rice',
    description: 'Smoky party jollof with fried plantain',
    priceNGN: 3500,
    priceGBP: 8.50,
    rating: 4.8,
    reviewCount: 120,
    image: 'https://example.com/jollof.jpg',
    prepTimeMinutes: 20,
    category: 'Rice & Grains',
    ingredients: ['Rice', 'Tomatoes', 'Peppers'],
    allergens: [],
    spiceLevel: 'medium',
    dietaryFlags: ['halal'],
    mealPeriods: ['lunch', 'dinner'],
    isAvailable: true,
    customizationOptions: [
      {
        id: 'cust_protein_1',
        name: 'Fried Chicken',
        priceDelta: 1000,
        category: 'protein'
      }
    ]
  };

  const item1: CartItem = {
    id: 'cart_item_1',
    meal: dummyMeal,
    restaurant: dummyRestaurant,
    quantity: 2,
    itemPrice: 4500, // 3500 base + 1000 chicken
    selectedCustomizations: [{ id: 'cust_protein_1', name: 'Fried Chicken', priceDelta: 1000, category: 'protein' }]
  };

  const item2: CartItem = {
    id: 'cart_item_2',
    meal: { ...dummyMeal, id: 'meal_plantain_2', priceNGN: 1500 },
    restaurant: dummyRestaurant,
    quantity: 1,
    itemPrice: 1500,
    selectedCustomizations: []
  };

  const deliveryAddress: SavedLocation = {
    id: 'loc_1',
    label: 'Home',
    address: '12 Aba Road',
    city: 'Port Harcourt',
    postcodeOrArea: '500101',
    isDefault: true,
    currency: 'NGN',
    coordinates: { lat: 4.8156, lng: 7.0498 }
  };

  const orderMock: Order = {
    id: 'ord_test_999',
    orderNumber: 'ORD-TEST-999',
    userId: 'user_test_1',
    items: [item1, item2],
    restaurantId: 'rest_buka',
    restaurantName: 'Mama Put Buka',
    fulfillmentMethod: 'delivery',
    deliveryAddress,
    subtotal: 0, // client attempted 0
    deliveryFee: 1000,
    serviceFee: 0,
    total: 10, // client attempted forged total
    currency: 'NGN',
    status: 'payment_pending',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    estimatedDeliveryTime: '35-45 mins'
  };

  // Test Authoritative Pricing
  const authoritativeTotals = calculateAuthoritativeOrderTotal(orderMock);
  // Expected Subtotal = (4500 * 2) + (1500 * 1) = 9000 + 1500 = 10500 NGN
  if (authoritativeTotals.subtotal !== 10500) {
    throw new Error(`Pricing calculation mismatch: expected subtotal 10500, got ${authoritativeTotals.subtotal}`);
  }

  // Expected Service Fee = 5% of 10500 = 525 NGN
  if (authoritativeTotals.serviceFee !== 525) {
    throw new Error(`Service fee calculation mismatch: expected 525, got ${authoritativeTotals.serviceFee}`);
  }

  // Expected Total = 10500 + 1000 + 525 = 12025 NGN
  if (authoritativeTotals.total !== 12025) {
    throw new Error(`Total calculation mismatch: expected 12025, got ${authoritativeTotals.total}`);
  }

  console.log('✅ PASS: calculateAuthoritativeOrderTotal correctly recalculated price and rejected client forgery');

  // Test Valid State Transitions
  if (!isValidOrderStatusTransition('payment_pending', 'paid')) {
    throw new Error('Valid transition payment_pending -> paid was marked invalid');
  }
  if (!isValidOrderStatusTransition('paid', 'accepted')) {
    throw new Error('Valid transition paid -> accepted was marked invalid');
  }
  if (!isValidOrderStatusTransition('accepted', 'preparing')) {
    throw new Error('Valid transition accepted -> preparing was marked invalid');
  }
  if (!isValidOrderStatusTransition('preparing', 'ready')) {
    throw new Error('Valid transition preparing -> ready was marked invalid');
  }
  if (!isValidOrderStatusTransition('ready', 'out_for_delivery')) {
    throw new Error('Valid transition ready -> out_for_delivery was marked invalid');
  }
  if (!isValidOrderStatusTransition('out_for_delivery', 'delivered')) {
    throw new Error('Valid transition out_for_delivery -> delivered was marked invalid');
  }

  // Test Invalid State Transitions
  if (isValidOrderStatusTransition('payment_pending', 'delivered')) {
    throw new Error('Invalid transition payment_pending -> delivered was marked valid!');
  }
  if (isValidOrderStatusTransition('delivered', 'preparing')) {
    throw new Error('Invalid transition delivered -> preparing was marked valid!');
  }
  if (isValidOrderStatusTransition('cart', 'out_for_delivery')) {
    throw new Error('Invalid transition cart -> out_for_delivery was marked valid!');
  }

  console.log('✅ PASS: isValidOrderStatusTransition correctly enforced all valid and invalid transitions');
  console.log('====================================================');
}
