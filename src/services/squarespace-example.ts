/**
 * Example usage of the Squarespace API integration service
 *
 * This file demonstrates how to use the SquarespaceService to create orders
 * from skateboard design data.
 */

import { createSquarespaceService } from './squarespace';
import type { SkateboardOrder } from '../types/orders';

/**
 * Example function showing how to create an order in Squarespace
 */
export async function createSkateboardOrder(orderData: SkateboardOrder): Promise<{
  success: boolean;
  squarespaceOrderId?: string;
  orderNumber?: string;
  error?: string;
}> {
  try {
    // Create the Squarespace service instance
    const squarespaceService = createSquarespaceService();

    // Validate the service configuration
    const isConfigValid = await squarespaceService.validateConfiguration();
    if (!isConfigValid) {
      return {
        success: false,
        error: 'Squarespace service is not properly configured'
      };
    }

    // Create the order in Squarespace
    const result = await squarespaceService.createOrder(orderData);

    return {
      success: true,
      squarespaceOrderId: result.squarespaceOrderId,
      orderNumber: result.orderNumber
    };

  } catch (error) {
    console.error('Failed to create Squarespace order:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Example order data for testing
 */
export const exampleOrderData: SkateboardOrder = {
  design: {
    imageUrl: 'https://example.com/skateboard-design.jpg',
    panX: 0,
    panY: 0,
    zoom: 1.2,
    rotation: 15
  },
  customer: {
    email: 'customer@example.com',
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main Street',
      address2: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      countryCode: 'US',
      postalCode: '94102',
      phone: '555-123-4567'
    },
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '456 Oak Avenue',
      city: 'Oakland',
      state: 'CA',
      countryCode: 'US',
      postalCode: '94601'
    }
  },
  pricing: {
    basePrice: 75.00,
    artworkFee: 25.00,
    subtotal: 100.00,
    shippingCost: 15.00,
    taxAmount: 9.25,
    grandTotal: 124.25,
    currency: 'USD'
  },
  status: 'pending'
};

/**
 * Example usage with error handling
 */
export async function exampleUsage() {
  console.log('Creating example skateboard order...');

  const result = await createSkateboardOrder(exampleOrderData);

  if (result.success) {
    console.log('Order created successfully!');
    console.log('Squarespace Order ID:', result.squarespaceOrderId);
    console.log('Order Number:', result.orderNumber);
  } else {
    console.error('Failed to create order:', result.error);
  }
}

// Uncomment to run the example (requires proper environment variables)
// exampleUsage().catch(console.error);
