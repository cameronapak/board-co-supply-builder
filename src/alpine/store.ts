import Alpine from "alpinejs";
import { type Variant } from "@/types/squarespace";
import { z } from "astro:schema";

export const TypeSchema = z.enum(["popsicle", "shovel"]);
export const SizeSchema = z.enum(['8.0 inches', '8.125 inches', '8.25 inches', '8.375 inches', '8.5 inches', '8.75 inches', '9.0 inches']);

export type SkateboardType = z.infer<typeof TypeSchema>;
export type SkateboardSize = z.infer<typeof SizeSchema>;

const orderStore = {
  skateboardVariant: null as Variant | null,
  size: "" as SkateboardSize,
  shape: "" as SkateboardType,
  artwork: null as File | null,
}

export type OrderStore = typeof orderStore;
export const STORE_KEY = "order";

export const getStore = () => Alpine.store(STORE_KEY) as OrderStore;
export const instantiateStore = () => Alpine.store(STORE_KEY, orderStore);
