/**
 * Squarespace Commerce API Integration Service
 *
 * This service handles all interactions with the Squarespace Commerce API,
 * including order creation, authentication, and error handling with retry logic.
 */

import type {
  SkateboardOrder,
  CustomerInfo,
  // OrderPricing,
  SquarespaceAddress,
  SquarespaceAmount,
  // SquarespaceLineItem,
  // SquarespaceShippingLine,
  SquarespaceOrderRequest,
  SquarespaceOrderResponse,
  // SquarespaceErrorResponse
} from '../types/orders';

// Squarespace API Configuration
const SQUARESPACE_CONFIG = {
  baseUrl: 'https://api.squarespace.com',
  apiVersion: '1.0',
  userAgent: 'Board Co Supply Skateboard Designer v1.0',
  maxRetries: 3,
  retryDelay: 1000, // Base delay in milliseconds
  rateLimit: {
    maxRequestsPerHour: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  }
} as const;

export interface SquarespaceError {
  type: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface SquarespaceApiError extends Error {
  status: number;
  squarespaceError?: SquarespaceError;
  isRetryable: boolean;
}

/**
 * Custom error class for Squarespace API errors
 */
export class SquarespaceApiError extends Error implements SquarespaceApiError {
  constructor(
    message: string,
    public status: number,
    public squarespaceError?: SquarespaceError,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'SquarespaceApiError';
  }
}

/**
 * Rate limiting tracker to comply with Squarespace API limits
 */
class RateLimitTracker {
  private requests: number[] = [];

  canMakeRequest(): boolean {
    const now = Date.now();
    const windowStart = now - SQUARESPACE_CONFIG.rateLimit.windowMs;

    // Remove old requests outside the window
    this.requests = this.requests.filter(timestamp => timestamp > windowStart);

    return this.requests.length < SQUARESPACE_CONFIG.rateLimit.maxRequestsPerHour;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) return 0;

    const oldestRequest = Math.min(...this.requests);
    const windowEnd = oldestRequest + SQUARESPACE_CONFIG.rateLimit.windowMs;
    return Math.max(0, windowEnd - Date.now());
  }
}

/**
 * Squarespace Commerce API Client
 */
export class SquarespaceApiClient {
  private apiKey: string;
  private rateLimitTracker = new RateLimitTracker();

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Squarespace API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Makes an authenticated request to the Squarespace API with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    // Check rate limiting
    if (!this.rateLimitTracker.canMakeRequest()) {
      const waitTime = this.rateLimitTracker.getTimeUntilNextRequest();
      throw new SquarespaceApiError(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`,
        429,
        undefined,
        true
      );
    }

    const url = `${SQUARESPACE_CONFIG.baseUrl}/${SQUARESPACE_CONFIG.apiVersion}${endpoint}`;

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': SQUARESPACE_CONFIG.userAgent,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add idempotency key for POST requests
    if (options.method === 'POST') {
      headers['Idempotency-Key'] = this.generateIdempotencyKey();
    }

    try {
      this.rateLimitTracker.recordRequest();

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        if (attempt <= SQUARESPACE_CONFIG.maxRetries) {
          const delay = SQUARESPACE_CONFIG.retryDelay * Math.pow(2, attempt - 1);
          console.warn(`Rate limited. Retrying in ${delay}ms (attempt ${attempt}/${SQUARESPACE_CONFIG.maxRetries})`);

          await this.sleep(delay);
          return this.makeRequest<T>(endpoint, options, attempt + 1);
        } else {
          throw new SquarespaceApiError(
            'Rate limit exceeded and max retries reached',
            429,
            undefined,
            false
          );
        }
      }

      // Handle other HTTP errors
      if (!response.ok) {
        let squarespaceError: SquarespaceError | undefined;

        try {
          const errorData = await response.json();
          squarespaceError = errorData;
        } catch {
          // If we can't parse the error response, continue with generic error
        }

        const isRetryable = this.isRetryableError(response.status);

        throw new SquarespaceApiError(
          `Squarespace API error: ${response.status} ${response.statusText}`,
          response.status,
          squarespaceError,
          isRetryable
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SquarespaceApiError) {
        throw error;
      }

      // Handle network errors with retry logic
      if (attempt <= SQUARESPACE_CONFIG.maxRetries && this.isNetworkError(error)) {
        const delay = SQUARESPACE_CONFIG.retryDelay * Math.pow(2, attempt - 1);
        console.warn(`Network error. Retrying in ${delay}ms (attempt ${attempt}/${SQUARESPACE_CONFIG.maxRetries})`);

        await this.sleep(delay);
        return this.makeRequest<T>(endpoint, options, attempt + 1);
      }

      throw new SquarespaceApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        undefined,
        false
      );
    }
  }

  /**
   * Creates an order in Squarespace
   */
  async createOrder(orderData: SquarespaceOrderRequest): Promise<SquarespaceOrderResponse> {
    try {
      console.log('Creating Squarespace order:', {
        externalOrderReference: orderData.externalOrderReference,
        customerEmail: orderData.customerEmail,
        grandTotal: orderData.grandTotal
      });

      const response = await this.makeRequest<SquarespaceOrderResponse>(
        '/commerce/orders',
        {
          method: 'POST',
          body: JSON.stringify(orderData),
        }
      );

      console.log('Squarespace order created successfully:', {
        id: response.id,
        orderNumber: response.orderNumber
      });

      return response;
    } catch (error) {
      console.error('Failed to create Squarespace order:', error);
      throw error;
    }
  }

  /**
   * Utility methods
   */
  private generateIdempotencyKey(): string {
    return `skateboard-order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isRetryableError(status: number): boolean {
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429;
  }

  private isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('timeout');
    }
    return false;
  }
}

/**
 * Data transformation utilities
 */
export class SquarespaceDataTransformer {
  /**
   * Transforms internal order data to Squarespace API format
   */
  static transformOrderToSquarespace(
    order: SkateboardOrder,
    productVariantId: string
  ): SquarespaceOrderRequest {
    const now = new Date().toISOString();
    const orderReference = `SKATEBOARD-${Date.now()}`;

    return {
      channelName: 'Board Co Supply Designer',
      externalOrderReference: orderReference,
      customerEmail: order.customer.email,
      billingAddress: this.transformAddress(order.customer.billingAddress),
      shippingAddress: this.transformAddress(order.customer.shippingAddress),
      lineItems: [
        {
          variantId: productVariantId,
          productName: 'Custom Skateboard Deck',
          quantity: 1,
          unitPricePaid: this.transformAmount(order.pricing.subtotal, order.pricing.currency),
          customizations: [
            {
              label: 'Design Configuration',
              value: JSON.stringify(order.design)
            }
          ]
        }
      ],
      shippingLines: [
        {
          method: 'Standard Shipping',
          price: this.transformAmount(order.pricing.shippingCost, order.pricing.currency)
        }
      ],
      priceTaxInterpretation: 'EXCLUSIVE',
      subtotal: this.transformAmount(order.pricing.subtotal, order.pricing.currency),
      shippingTotal: this.transformAmount(order.pricing.shippingCost, order.pricing.currency),
      taxTotal: this.transformAmount(order.pricing.taxAmount, order.pricing.currency),
      grandTotal: this.transformAmount(order.pricing.grandTotal, order.pricing.currency),
      fulfillmentStatus: 'PENDING',
      createdOn: now
    };
  }

  /**
   * Transforms internal address to Squarespace format
   */
  private static transformAddress(address: CustomerInfo['billingAddress']): SquarespaceAddress {
    return {
      firstName: address.firstName,
      lastName: address.lastName,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      state: address.state,
      countryCode: address.countryCode,
      postalCode: address.postalCode,
      phone: address.phone
    };
  }

  /**
   * Transforms monetary amount to Squarespace format
   */
  private static transformAmount(amount: number, currency: string): SquarespaceAmount {
    return {
      value: amount.toFixed(2),
      currency: currency.toUpperCase()
    };
  }
}

/**
 * Main service class for Squarespace integration
 */
export class SquarespaceService {
  private client: SquarespaceApiClient;
  private productVariantId: string;

  constructor(apiKey: string, productVariantId: string) {
    this.client = new SquarespaceApiClient(apiKey);
    this.productVariantId = productVariantId;
  }

  /**
   * Creates an order in Squarespace from internal order data
   */
  async createOrder(order: SkateboardOrder): Promise<{
    squarespaceOrderId: string;
    orderNumber: string;
    externalOrderReference: string;
  }> {
    try {
      // Transform internal order data to Squarespace format
      const squarespaceOrder = SquarespaceDataTransformer.transformOrderToSquarespace(
        order,
        this.productVariantId
      );

      // Create the order in Squarespace
      const response = await this.client.createOrder(squarespaceOrder);

      return {
        squarespaceOrderId: response.id,
        orderNumber: response.orderNumber,
        externalOrderReference: squarespaceOrder.externalOrderReference
      };
    } catch (error) {
      console.error('Squarespace service error:', error);

      if (error instanceof SquarespaceApiError) {
        throw error;
      }

      throw new SquarespaceApiError(
        `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        undefined,
        false
      );
    }
  }

  /**
   * Validates that the service is properly configured
   */
  async validateConfiguration(): Promise<boolean> {
    try {
      // We could make a simple API call to validate the configuration
      // For now, we'll just check that we have the required credentials
      return Boolean(this.client && this.productVariantId);
    } catch (error) {
      console.error('Squarespace configuration validation failed:', error);
      return false;
    }
  }
}

/**
 * Factory function to create a configured Squarespace service instance
 */
export function createSquarespaceService(): SquarespaceService {
  const apiKey = process.env.SQUARESPACE_API_KEY;
  const productVariantId = process.env.SQUARESPACE_PRODUCT_VARIANT_ID;

  if (!apiKey) {
    throw new Error('SQUARESPACE_API_KEY environment variable is required');
  }

  if (!productVariantId) {
    throw new Error('SQUARESPACE_PRODUCT_VARIANT_ID environment variable is required');
  }

  return new SquarespaceService(apiKey, productVariantId);
}
