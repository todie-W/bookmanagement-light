import { z } from "zod";

const envSchema = z.object({
  MONGO_URI: z.string(),
  CLIENT_BASE_URL: z.url().default('http://localhost:5173'),
  PORT: z.coerce.number().int().default(3000)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:\n', z.prettifyError(parsedEnv.error));
  process.exit(1);
}

export const {
  //ACCESS_JWT_SECRET,
 // ACCESS_TOKEN_TTL,
 // DB_NAME,
  CLIENT_BASE_URL,
  MONGO_URI,
//   REFRESH_TOKEN_TTL,
//   SALT_ROUNDS,
  PORT
} = parsedEnv.data;