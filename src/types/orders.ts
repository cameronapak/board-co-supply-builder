import { z } from "zod";

// Core TypeScript interfaces for skateboard orders

export interface SkateboardOrder {
  id?: string;
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
  orderReference?: string;
  artworkFileId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerInfo {
  email: string;
  billingAddress: Address;
  shippingAddress: Address;
}

export interface Address {
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

export interface OrderPricing {
  basePrice: number;
  artworkFee: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
}

// Zod schemas for validation

export const AddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  countryCode: z.string().length(2, "Country code must be 2 characters"),
  postalCode: z.string().min(1, "Postal code is required"),
  phone: z.string().optional()
});

export const CustomerInfoSchema = z.object({
  email: z.string().email("Valid email is required"),
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema
});

export const DesignConfigSchema = z.object({
  imageUrl: z.string().url("Valid image URL is required"),
  panX: z.number(),
  panY: z.number(),
  zoom: z.number().min(0.1).max(5),
  rotation: z.number().min(-360).max(360)
});

export const OrderPricingSchema = z.object({
  basePrice: z.number().min(0),
  artworkFee: z.number().min(0),
  subtotal: z.number().min(0),
  shippingCost: z.number().min(0),
  taxAmount: z.number().min(0),
  grandTotal: z.number().min(0),
  currency: z.string().length(3, "Currency must be 3 characters")
});

export const SkateboardOrderSchema = z.object({
  id: z.string().optional(),
  design: DesignConfigSchema,
  customer: CustomerInfoSchema,
  pricing: OrderPricingSchema,
  squarespaceOrderId: z.string().optional(),
  orderReference: z.string().optional(),
  artworkFileId: z.string().optional(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Form validation schemas (for client-side use)
export const OrderFormSchema = z.object({
  design: DesignConfigSchema,
  customer: CustomerInfoSchema
});

export type OrderFormData = z.infer<typeof OrderFormSchema>;

// Squarespace API types

export interface SquarespaceAddress {
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

export interface SquarespaceAmount {
  value: string; // Decimal string representation
  currency: string;
}

export interface SquarespaceLineItem {
  variantId: string;
  sku?: string;
  productName: string;
  variantOptions?: Array<{
    optionName: string;
    optionChoice: string;
  }>;
  quantity: number;
  unitPricePaid: SquarespaceAmount;
  customizations?: Array<{
    label: string;
    value: string;
  }>;
}

export interface SquarespaceShippingLine {
  method: string;
  price: SquarespaceAmount;
}

export interface SquarespaceOrderRequest {
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
  createdOn: string; // ISO 8601 date string
}

export interface SquarespaceOrderResponse {
  id: string;
  orderNumber: string;
  externalOrderReference: string;
  channelName: string;
  customerEmail: string;
  billingAddress: SquarespaceAddress;
  shippingAddress: SquarespaceAddress;
  lineItems: SquarespaceLineItem[];
  shippingLines: SquarespaceShippingLine[];
  subtotal: SquarespaceAmount;
  shippingTotal: SquarespaceAmount;
  taxTotal: SquarespaceAmount;
  grandTotal: SquarespaceAmount;
  fulfillmentStatus: string;
  createdOn: string;
  modifiedOn: string;
}

export interface SquarespaceErrorResponse {
  type: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Zod schemas for Squarespace API validation

export const SquarespaceAddressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  countryCode: z.string().length(2),
  postalCode: z.string(),
  phone: z.string().optional()
});

export const SquarespaceAmountSchema = z.object({
  value: z.string(),
  currency: z.string().length(3)
});

export const SquarespaceLineItemSchema = z.object({
  variantId: z.string(),
  sku: z.string().optional(),
  productName: z.string(),
  variantOptions: z
    .array(
      z.object({
        optionName: z.string(),
        optionChoice: z.string()
      })
    )
    .optional(),
  quantity: z.number().int().positive(),
  unitPricePaid: SquarespaceAmountSchema,
  customizations: z
    .array(
      z.object({
        label: z.string(),
        value: z.string()
      })
    )
    .optional()
});

export const SquarespaceShippingLineSchema = z.object({
  method: z.string(),
  price: SquarespaceAmountSchema
});

export const SquarespaceOrderRequestSchema = z.object({
  channelName: z.string(),
  externalOrderReference: z.string(),
  customerEmail: z.string().email(),
  billingAddress: SquarespaceAddressSchema,
  shippingAddress: SquarespaceAddressSchema,
  lineItems: z.array(SquarespaceLineItemSchema),
  shippingLines: z.array(SquarespaceShippingLineSchema),
  priceTaxInterpretation: z.enum(["EXCLUSIVE", "INCLUSIVE"]),
  subtotal: SquarespaceAmountSchema,
  shippingTotal: SquarespaceAmountSchema,
  taxTotal: SquarespaceAmountSchema,
  grandTotal: SquarespaceAmountSchema,
  fulfillmentStatus: z.literal("PENDING"),
  createdOn: z.string()
});

export const SquarespaceOrderResponseSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  externalOrderReference: z.string(),
  channelName: z.string(),
  customerEmail: z.string(),
  billingAddress: SquarespaceAddressSchema,
  shippingAddress: SquarespaceAddressSchema,
  lineItems: z.array(SquarespaceLineItemSchema),
  shippingLines: z.array(SquarespaceShippingLineSchema),
  subtotal: SquarespaceAmountSchema,
  shippingTotal: SquarespaceAmountSchema,
  taxTotal: SquarespaceAmountSchema,
  grandTotal: SquarespaceAmountSchema,
  fulfillmentStatus: z.string(),
  createdOn: z.string(),
  modifiedOn: z.string()
});

// Utility types for data transformation
export type OrderToSquarespaceTransform = (order: SkateboardOrder) => SquarespaceOrderRequest;
export type SquarespaceToOrderTransform = (response: SquarespaceOrderResponse) => Partial<SkateboardOrder>;
