import { validate } from "@/actions/validate";
import { squarespace } from "@/actions/squarespace"
import { stripe } from "@/actions/stripe"
import { bknd } from "@/actions/bknd";
import { email } from "@/actions/email";

export const server = {
  email,
  squarespace,
  stripe,
  validate,
  bknd
};
