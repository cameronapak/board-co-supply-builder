// board-co-supply-builder/src/actions/validate.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { validateArtwork as validateArtworkUtil } from "@/utils/index.ts";

export const validate = {
  validateArtwork: defineAction({
    accept: "form",
    input: z.object({
      artwork: z.instanceof(File)
    }),
    handler: async ({ artwork }) => {
      const result = await validateArtworkUtil(artwork);
      return result;
    }
  })
};
