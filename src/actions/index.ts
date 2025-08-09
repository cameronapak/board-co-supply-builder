import { validate } from "@/actions/validate";
import { squarespace } from "@/actions/squarespace"
import { stripe } from "@/actions/stripe"
import { bknd } from "@/actions/bknd";

export const server = {
  squarespace,
  stripe,
  validate,
  bknd
};
