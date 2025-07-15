# Design Document

## Overview

The skateboard orders feature extends the existing skateboard designer interface to enable customers to place orders for their custom designs through integration with the Squarespace Commerce API. The system will capture the customer's design configuration, collect billing and shipping information, calculate pricing, and create orders in Squarespace for fulfillment.

The design leverages the existing Astro Actions pattern used in the codebase and integrates seamlessly with the current SkateboardDesigner component.

## Architecture

### High-Level Flow

1. Customer completes skateboard design using existing designer interface
2. Customer clicks "Order My Board" button (replacing current placeholder)
3. System displays order form with pricing calculation
4. Customer fills in billing/shipping information
5. System validates form data and calculates final pricing
6. System creates order in Squarespace via Commerce API
7. System displays order confirmation or error handling

### Component Architecture

```
SkateboardDesigner.astro (existing)
├── OrderForm.astro (new)
│   ├── PricingCalculator (client-side)
│   ├── AddressForm (client-side)
│   └── OrderSummary (client-side)
└── OrderConfirmation.astro (new)
```

### API Layer

```
src/actions/
├── validate.ts (existing)
└── orders.ts (new)
    ├── calculatePricing
    ├── createOrder
    └── validateOrderData
```

## Components and Interfaces

### 1. Order Data Models

```typescript
interface SkateboardOrder {
  design: {
    imageUrl: string;
    panX: number;
    panY: number;
    zoom: number;
    rotation: number;
  };
  customer: CustomerInfo;
  pricing: OrderPricing;
  squarespaceOrderId?: string;
}

interface CustomerInfo {
  email: string;
  billingAddress: Address;
  shippingAddress: Address;
}

interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  countryCode: string;
  postalCode: string;
  phone?: string;
}

interface OrderPricing {
  basePrice: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
}
```

### 2. Squarespace API Integration

```typescript
interface SquarespaceOrderRequest {
  channelName: string;
  externalOrderReference: string;
  customerEmail: string;
  billingAddress: SquarespaceAddress;
  shippingAddress: SquarespaceAddress;
  lineItems: SquarespaceLineItem[];
  shippingLines: SquarespaceShippingLine[];
  priceTaxInterpretation: "EXCLUSIVE" | "INCLUSIVE";
  subtotal: SquarespaceAmount;
  shippingTotal: SquarespaceAmount;
  taxTotal: SquarespaceAmount;
  grandTotal: SquarespaceAmount;
  fulfillmentStatus: "PENDING";
  createdOn: string;
}
```

### 3. OrderForm Component

The OrderForm component will be a new Astro component that handles:

- Design preview display
- Pricing calculation and display
- Customer information collection
- Form validation
- Order submission

### 4. Pricing Calculator

Client-side Alpine.js component that:

- Calculates base skateboard price
- Determines artwork fees based on custom design
- Calculates shipping costs
- Estimates tax amounts
- Updates totals in real-time

### 5. Squarespace API Service

Server-side service that:

- Handles authentication with Squarespace API
- Formats order data for Squarespace Commerce API
- Implements retry logic for rate limiting
- Provides error handling and logging

## Data Models

### Environment Configuration

```typescript
interface SquarespaceConfig {
  apiKey: string;
  apiVersion: string;
  baseUrl: string;
  websiteId: string;
  productVariantId: string; // For custom skateboard product
}
```

### Order State Management

The order process will use Alpine.js reactive data to manage state:

- Form validation states
- Pricing calculations
- Loading states
- Error handling

### Database Schema with bknd.io

Using bknd.io for data persistence and file storage:

**Orders Table:**

- id (primary key)
- userId (foreign key to bknd user)
- squarespaceOrderId
- orderReference
- designConfig (JSON)
- artworkFileId (reference to uploaded file)
- customerInfo (JSON)
- pricing (JSON)
- status
- createdAt
- updatedAt

**File Storage:**

- Artwork files stored in S3 via bknd.io
- Design configurations linked to user accounts
- Order history accessible per user

**Environment Variables:**

- S3_API: S3 configuration for file storage
- LIBSQL_DATABASE_URL: Database connection URL
- LIBSQL_DATABASE_TOKEN: Database authentication token
- SQUARESPACE_API_KEY: API key for Squarespace Commerce API authentication

**bknd.io Version Update:**

- Current version: 0.15.0-rc.4
- Target version: 0.15.0 (stable release)

## Error Handling

### Client-Side Error Handling

1. **Form Validation Errors**: Real-time validation with specific field-level feedback
2. **Network Errors**: Retry mechanisms with user feedback
3. **API Errors**: User-friendly error messages with technical details logged

### Server-Side Error Handling

1. **Squarespace API Errors**:

   - Rate limiting (429): Implement exponential backoff
   - Authentication errors (401): Log and alert administrators
   - Validation errors (400): Return specific field errors to client
   - Server errors (500): Log details and show generic error to user

2. **Data Validation Errors**: Comprehensive validation using Zod schemas

### Error Recovery

- Failed orders should allow customers to retry without losing form data
- Partial order data should be preserved during network interruptions
- Clear error messages should guide users to resolution

## Testing Strategy

### Unit Tests

1. **Pricing Calculator**: Test all pricing scenarios and edge cases
2. **Form Validation**: Test all validation rules and error states
3. **API Integration**: Mock Squarespace API responses for various scenarios
4. **Data Transformation**: Test conversion between internal and Squarespace formats

### Integration Tests

1. **End-to-End Order Flow**: Complete order process from design to confirmation
2. **API Error Scenarios**: Test handling of various Squarespace API error responses
3. **Form Submission**: Test complete form validation and submission process

### Manual Testing Scenarios

1. **Happy Path**: Complete successful order placement
2. **Error Scenarios**: Network failures, API errors, validation failures
3. **Edge Cases**: Minimum/maximum values, special characters, international addresses
4. **Mobile Responsiveness**: Order form functionality on mobile devices

### Test Data Requirements

- Mock Squarespace API responses
- Test product variant IDs
- Sample customer data for various countries
- Test artwork files and design configurations

## Security Considerations

### API Security

- Squarespace API keys stored as environment variables
- Request validation using Zod schemas
- Rate limiting compliance
- Secure handling of customer data

### Data Protection

- Customer information encrypted in transit
- Minimal data retention policy
- PCI compliance considerations for payment data (handled by Squarespace)
- GDPR compliance for customer data collection

### Input Validation

- Comprehensive server-side validation
- Sanitization of all user inputs
- File upload security (artwork validation)
- SQL injection prevention (if using database)

## Performance Considerations

### Client-Side Performance

- Lazy loading of order form components
- Debounced pricing calculations
- Optimized image handling for design preview
- Minimal JavaScript bundle size

### Server-Side Performance

- Efficient API request batching
- Caching of pricing calculations
- Optimized image processing for artwork
- Database query optimization (if applicable)

### Scalability

- Stateless server design
- Horizontal scaling capability
- CDN integration for static assets
- Database connection pooling (if applicable)
