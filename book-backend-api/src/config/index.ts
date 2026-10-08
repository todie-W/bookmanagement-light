import { z } from "zod";

const envSchema = z.object({
  MONGO_URI: z.string(),
  DB_NAME: z.string().default('bookstore'),
  CLIENT_BASE_URL: z.url().default('https://book-management-0rrv.onrender.com'),
  PORT: z.coerce.number().int().default(3000)
});
// CLIENT_BASE_URL: z.string().url().default('http://localhost:5173'), erlaubt Zugriff vom Frontend auf das Backend;
// dieser Wert kann auch in der .env festgelegt werden, z.B. für die Produktion, wenn das Frontend auf einem anderen Server liegt.
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:\n', z.prettifyError(parsedEnv.error));
  process.exit(1);
}

export const {
  //ACCESS_JWT_SECRET,
 // ACCESS_TOKEN_TTL,
  DB_NAME,
  CLIENT_BASE_URL,
  MONGO_URI,
//   REFRESH_TOKEN_TTL,
//   SALT_ROUNDS,
  PORT
} = parsedEnv.data;