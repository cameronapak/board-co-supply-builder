// board-co-supply-builder/src/actions/validate.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Orders } from "@/bknd-types";
import { getApi } from "@/bknd";
import { TypeSchema, SizeSchema } from "@/alpine/store";

export const bknd = {
  createOrder: defineAction({
    accept: "form",
    input: z.object({
      artwork: z.instanceof(File),
      designConfig: z.string().optional(),
      type: TypeSchema,
      size: SizeSchema
    }),
    handler: async ({ artwork, type, size }, context) => {
      const api = await getApi(context.request.headers, { mode: "dynamic" });

      const order = await api.data.createOne("orders", {
        artwork,
        designConfig: JSON.stringify({}),
        status: "pending",
        type,
        size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Orders)

      return { order };
    }
  })
};
