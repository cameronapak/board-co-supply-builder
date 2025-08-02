import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { STRIPE_SECRET_KEY, STRIPE_SECRET_TEST_KEY } from "astro:env/server";
import Stripe from "stripe";

const stripeInstance = new Stripe(
  import.meta.env.PROD
    ? STRIPE_SECRET_KEY
    : STRIPE_SECRET_TEST_KEY,
  {
    apiVersion: "2025-07-30.basil",
    typescript: true
  }
);

const SKATEBOARD_PRICE_ID = import.meta.env.PROD
  ? "price_1RrjSoHtvrrwAy8nAiPXkfCI"
  : "price_1RrjxgHtvrrwAy8n1kQQ4M9b";

export const stripe = {
  createPaymentPage: defineAction({
    input: z.object({
      // size: z.enum(['8.0"', '8.125"', '8.25"', '8.375"', '8.5"', '8.75"', '9.0"',]),
      // type: z.enum(["Popsicle", "Shovel"]),
      // userId: z.string(),
    }),
    handler: async ({ }, context) => {
      const returnUrl = new URL("/", context.url.origin);

      const session = await stripeInstance.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: [
          {
            price: SKATEBOARD_PRICE_ID,
            quantity: 1
          }
        ],
        // client_reference_id: userId,
        mode: "payment",
        phone_number_collection: {
          enabled: true
        },
        // Required param replaced by Stripe, and we can't have it percent encoded
        return_url: returnUrl.toString() + "?session_id={CHECKOUT_SESSION_ID}",
        automatic_tax: { enabled: true },
        allow_promotion_codes: true
      });

      return {
        session
      };
    }
  }),
};
