// board-co-supply-builder/src/actions/validate.ts
import { defineAction } from "astro:actions";
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Orders)

      await api.media.uploadToEntity(
        "orders", // entity name
        order.id, // entity id
        "artwork", // entity media field
        artwork // url, file, stream
      );

      return { order: order.toJSON() };
    }
  })
};
