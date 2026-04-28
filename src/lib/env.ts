import { z } from 'zod';

const envSchema = z.object({
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().min(1),
  PAYSTACK_PLAN_CODE: z.string().optional(),
  PLUNK_API_KEY: z.string().optional(),
  PLUNK_FROM_EMAIL: z.string().email().optional(),
  PORTAL_CONTACT_EMAIL: z.string().email().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function readEnv(): AppEnv {
  return envSchema.parse({
    APP_URL: process.env.APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    PAYSTACK_PLAN_CODE: process.env.PAYSTACK_PLAN_CODE,
    PLUNK_API_KEY: process.env.PLUNK_API_KEY,
    PLUNK_FROM_EMAIL: process.env.PLUNK_FROM_EMAIL,
    PORTAL_CONTACT_EMAIL: process.env.PORTAL_CONTACT_EMAIL,
  });
}
