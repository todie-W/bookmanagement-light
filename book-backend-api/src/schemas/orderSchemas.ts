import { z } from "zod";
//import type { bookSchemas } from "./bookSchemas.ts";


const orderItemSchema = z.object({
  quantity: z.number().int().positive(),
});

const orderFields = {
  bookSchemas: z.array(orderItemSchema).min(1),
};

export const createOrderSchema = z.object(orderFields);

export const updateOrderSchema = z
  .object(orderFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
