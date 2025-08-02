import { validate } from "@/actions/validate";
import { squarespace } from "@/actions/squarespace"
import { stripe } from "@/actions/stripe"

export const server = {
  squarespace,
  stripe,
  validate,
};
