// board-co-supply-builder/src/actions/index.ts
import { validate } from "@/actions/validate";
import { squarespace } from "@/actions/squarespace"

export const server = {
  squarespace,
  validate
};
