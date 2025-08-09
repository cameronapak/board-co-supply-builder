/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare global {
  interface Window {
    Alpine: import("alpinejs").Alpine;
  }
}

interface ImportMetaEnv {
  readonly S3_API_URL: string;
  readonly S3_ACCESS_KEY: string;
  readonly S3_SECRET_ACCESS_KEY: string;
  readonly LIBSQL_DATABASE_URL: string;
  readonly LIBSQL_DATABASE_TOKEN: string;
  readonly SQUARESPACE_API_KEY: string;
  readonly SQUARESPACE_PRODUCT_ID: string;
  /** https://docs.stripe.com/api */
  readonly STRIPE_SECRET_KEY: string;
  /** https://docs.stripe.com/api */
  readonly STRIPE_SECRET_TEST_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
