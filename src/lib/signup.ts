import { z } from 'zod';

export const signupRequestSchema = z.object({
  email: z.string().trim().email(),
});

export const signupVerifySchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6),
});
