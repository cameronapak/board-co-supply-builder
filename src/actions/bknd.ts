// board-co-supply-builder/src/actions/validate.ts
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Orders } from "@/bknd-types";
import { getApi } from "@/bknd";
// import { TypeSchema, SizeSchema } from "@/alpine/store";

export const bknd = {
  createOrder: defineAction({
    accept: "form",
    input: z.object({
      artwork: z.instanceof(File),
      designConfig: z.string().optional(),
      type: z.enum(["popsicle", "shovel"]),
      size: z.enum(['8.0 inches', '8.125 inches', '8.25 inches', '8.375 inches', '8.5 inches', '8.75 inches', '9.0 inches'])
    }),
    handler: async ({ artwork, type, size, designConfig }, context) => {
      const api = await getApi(context.request.headers, { mode: "dynamic" });

      const order = await api.data.createOne("orders", {
        designConfig,
        status: "pending",
        type,
        size,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Orders)

      await api.media.uploadToEntity(
        "orders", // entity name
        order.id, // entity id
        "artwork", // entity media field
        artwork // url, file, stream
      );

      return { order: order.toJSON() };
    }
  }),

  attachStripeSessionIdToOrder: defineAction({
    input: z.object({
      stripeSessionId: z.string(),
      orderId: z.number().min(1),
    }),
    handler: async ({ stripeSessionId, orderId }, context) => {
      const api = await getApi(context.request.headers, { mode: "dynamic" });
      const { data: order, error } = await api.data.updateOne("orders", orderId, {
        stripeOrderId: stripeSessionId
      });

      // For some reason, when there isn't an order to update with
      // that given id, then the error I get is something like
      // `{ meta: { items: 0, time: 0.11, count: 0, total: 1 } }`
      if (order?.meta?.items === 0 || error) {
        throw new ActionError({
          message: "Failed to attach the Stripe Session ID to the Order",
          code: "NOT_FOUND"
        })
      }

      return { order } as { order: Orders }
    },
  }),
};
