import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { STRIPE_SECRET_KEY, STRIPE_SECRET_TEST_KEY } from "astro:env/server";
import Stripe from "stripe";

const getStripeInstance = () => new Stripe(
  import.meta.env.PROD
    ? STRIPE_SECRET_KEY
    : STRIPE_SECRET_TEST_KEY,
  {
    apiVersion: "2025-08-27.basil",
    typescript: true
  }
);

const SKATEBOARD_PRICE_ID = import.meta.env.PROD
  ? "price_1RrjSoHtvrrwAy8nAiPXkfCI"
  : "price_1RrjxgHtvrrwAy8n1kQQ4M9b";

export const stripe = {
  createPaymentPage: defineAction({
    input: z.object({
      orderId: z.number(),
    }),
    handler: async ({ orderId }, context) => {
      console.log({ orderId })
      const returnUrl = new URL("/success", context.url.origin);

      const stripeInstance = getStripeInstance();
      const session = await stripeInstance.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: [
          {
            price: SKATEBOARD_PRICE_ID,
            quantity: 1
          }
        ],
        mode: "payment",
        phone_number_collection: {
          enabled: true
        },
        // Required param replaced by Stripe, and we can't have it percent encoded
        return_url: returnUrl.toString() + `?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        automatic_tax: { enabled: true },
        allow_promotion_codes: true
      });

      return {
        session
      };
    }
  }),

  getSesssionFromId: defineAction({
    input: z.object({
      id: z.string()
    }),
    handler: async ({ id }, _context) => {
      const stripeInstance = getStripeInstance();
      const session = await stripeInstance.checkout.sessions.retrieve(id);
      if (!session) {
        throw new ActionError({
          code: "NOT_FOUND"
        })
      }
      const lineItems = await stripeInstance.checkout.sessions.listLineItems(id);
      if (!lineItems) {
        throw new ActionError({
          code: "NOT_FOUND"
        })
      }
      return { session, lineItems };
    }
  }),

  getTransactionIdFromSession: defineAction({
    input: z.object({
      sessionId: z.string()
    }),
    handler: async ({ sessionId }, _context) => {
      const stripeInstance = getStripeInstance();
      const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
      if (!session) {
        throw new ActionError({
          code: "NOT_FOUND"
        })
      }
      return {
        transactionId: session.payment_intent
      };
    }
  })
};
