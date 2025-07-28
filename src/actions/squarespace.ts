import { createSquarespaceService } from "@/services/squarespace";
import { defineAction, ActionError } from "astro:actions";
import { type Content } from "@/types/squarespace"
import { SQUARESPACE_API_KEY, SQUARESPACE_PRODUCT_ID } from "astro:env/server";

export const squarespace = {
  getSkateboardProduct: defineAction({
    accept: "json",
    handler: async () => {
      const squarespaceService = createSquarespaceService(
        SQUARESPACE_API_KEY,
        SQUARESPACE_PRODUCT_ID
      );
      const skateboardProduct = await squarespaceService.getProduct<Content>();
      if (!skateboardProduct?.products) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Skateboard product requested was not found",
        });
      }
      return skateboardProduct.products.at(0);
    },
  }),
};
