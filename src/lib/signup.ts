import { z } from 'zod';

export const signupRequestSchema = z.object({
  email: z.string().trim().email(),
});

export const signupVerifySchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6),
});

export const passwordAccountSignupSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  password: z.string().min(8).max(128),
});
