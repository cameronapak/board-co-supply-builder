// board-co-supply-builder/src/actions/validate.ts
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Orders } from "@/bknd-types";
import { getApi } from "@/bknd";
// import { TypeSchema, SizeSchema } from "@/alpine/store";

const STRIPE_ACCOUNT_ID = "acct_1L3520HtvrrwAy8n";

export const bknd = {
  createOrder: defineAction({
    accept: "form",
    input: z.object({
      artwork: z.instanceof(File),
      canvas: z.instanceof(File),
      designConfig: z.string().optional(),
      type: z.enum(["popsicle", "shovel"]),
      size: z.enum(['8.0 inches', '8.125 inches', '8.25 inches', '8.375 inches', '8.5 inches', '8.75 inches', '9.0 inches']),
      comments: z.string().optional()
    }),
    handler: async ({ artwork, type, size, designConfig, canvas, comments }, context) => {
      const api = await getApi(context.request.headers, { mode: "dynamic" });

      const order: BkndEntityCreate<"orders"> = await api.data.createOne("orders", {
        designConfig,
        status: "pending",
        type,
        size,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(comments ? { comments } : {}),
      });

      // Original Artwork
      await api.media.uploadToEntity(
        "orders", // entity name
        order.id as number, // entity id
        "artwork", // entity media field
        artwork // url, file, stream
      );

      // Rendered Canvas Artwork
      await api.media.uploadToEntity(
        "orders", // entity name
        order.id as number, // entity id
        "canvas", // entity media field
        canvas // url, file, stream
      );

      return { order: (order as any).toJSON() };
    }
  }),

  attachStripeSessionIdToOrder: defineAction({
    input: z.object({
      stripeSessionId: z.string(),
      orderId: z.number(),
      email: z.string().email().optional(),
      stripeTransactionId: z.string().optional(),
    }),
    handler: async ({ stripeSessionId, orderId, email, stripeTransactionId }, context) => {
      const api = await getApi(context.request.headers, { mode: "dynamic" });
      const isProduction = import.meta.env.PROD;

      // Transaction URL: https://dashboard.stripe.com/{ACCOUNT_ID}/[test/]payments/{PAYMENT_INTENT_ID}
      const stripeTransactionUrl = stripeTransactionId
       ? `https://dashboard.stripe.com/${STRIPE_ACCOUNT_ID}/${isProduction ? "" : "test/"}payments/${stripeTransactionId}`
       : undefined;

      const { data: order, error } = await api.data.updateOne("orders", orderId, {
        status: "complete",
        ...(email ? { email } : {}),
        ...(stripeTransactionUrl ? { stripeTransactionUrl } : {}),
      });

      // For some reason, when there isn't an order to update with
      // that given id, then the error I get is something like
      // `{ meta: { items: 0, time: 0.11, count: 0, total: 1 } }`
      // @ts-expect-error - order.meta is not typed
      if (order?.meta?.items === 0 || error) {
        throw new ActionError({
          message: "Failed to attach the Stripe Session ID to the Order",
          code: "NOT_FOUND"
        })
      }

      return { order } as { order: Orders }
    },
  }),

  markEmailSentOnUpdate: defineAction({
    input: z.object({
      orderId: z.number(),
    }),
    handler: async ({ orderId }, context) => {
      const api = await getApi(context.request.headers, { mode: "dynamic" });
      const { data: order, error } = await api.data.updateOne("orders", orderId, {
        emailSent: true,
      });

      // For some reason, when there isn't an order to update with
      // that given id, then the error I get is something like
      // `{ meta: { items: 0, time: 0.11, count: 0, total: 1 } }`
      // @ts-expect-error - order.meta is not typed
      if (order?.meta?.items === 0 || error) {
        throw new ActionError({
          message: "Failed to update the order to mark email as sent",
          code: "NOT_FOUND"
        })
      }

      return { order } as { order: Orders }
    },
  })
};
