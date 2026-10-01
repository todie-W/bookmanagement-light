import { z } from 'zod';

const isbnPattern =
  /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;

export const bookSchemas = z.strictObject({
  author: z.string().max(500).optional(),
  title: z.string().max(500).optional(),
  description: z.string().max(10000).optional(),
  pageNumber: z.number().min(0).optional(),
  year: z.number().min(-2000).max(3000).optional(),
  isbn: z.string().regex(isbnPattern).optional(),
  genre: z.array(z.string().max(50)).optional()
});