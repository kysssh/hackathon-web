import { z } from 'zod';

const envSchema = z.object({
    SUPABASE_URL: z.string().url(),
    SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    SUPABASE_SECRET_KEY: z.string().min(1),
    SUPABASE_JWKS_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);