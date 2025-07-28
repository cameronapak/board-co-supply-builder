type Unit = "INCH" | "POUND";

interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: Unit;
}

interface Weight {
  value: number;
  unit: Unit;
}

interface ShippingMeasurements {
  dimensions: Dimensions;
  weight: Weight;
}

interface Image {
  originalSize: {
    width: number;
    height: number;
  };
  id: string;
  availableFormats: string[];
  orderIndex: number;
  url: string;
  altText: string;
}

interface PricingValue {
  value: string; // e.g. "0.00"
  currency: string; // e.g. "USD"
}

interface Pricing {
  basePrice: PricingValue;
  onSale: boolean;
  salePrice: PricingValue;
}

interface Stock {
  unlimited: boolean;
  quantity: number;
}

export interface Variant {
  shippingMeasurements: ShippingMeasurements;
  id: string;
  sku: string;
  pricing: Pricing;
  stock: Stock;
  image: Image | null;
  attributes: Record<string, string> & {
    "Size": string;
  };
}

export interface Product {
  id: string;
  description: string;
  seoOptions: unknown | null;
  createdOn: string; // ISO date string
  isVisible: boolean;
  url: string;
  tags: string[];
  type: string; // e.g. "PHYSICAL"
  pricing: Pricing | null;
  digitalGood: unknown | null;
  modifiedOn: string; // ISO date string
  images: Image[];
  variants: Variant[];
  storePageId: string;
  urlSlug: string;
  name: string;
  variantAttributes: string[];
}

interface Pagination {
  hasNextPage: boolean;
  nextPageUrl: string | null;
  nextPageCursor: string | null;
}

export interface Content {
  pagination: Pagination;
  products: Product[];
}

interface Attachment {
  name: string;
  content: Content;
  kind: string; // e.g. "text-pasteboard-item"
}

interface Root {
  attachments: Attachment[];
}
