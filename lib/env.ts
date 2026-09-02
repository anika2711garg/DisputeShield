import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().optional().default("gpt-4.1-mini"),
  RAZORPAY_MODE: z.enum(["mock", "test", "live"]).optional().default("mock"),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(""),
  ENABLE_RAZORPAY_WRITES: z.string().optional().default("false"),
  CRON_SECRET: z.string().optional().default(""),
  DEMO_AUTH_SECRET: z.string().optional().default("disputeshield-demo-secret"),
});

export type AppEnv = z.infer<typeof envSchema>;

function readEnv(): AppEnv {
  return envSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    RAZORPAY_MODE: process.env.RAZORPAY_MODE,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    ENABLE_RAZORPAY_WRITES: process.env.ENABLE_RAZORPAY_WRITES,
    CRON_SECRET: process.env.CRON_SECRET,
    DEMO_AUTH_SECRET: process.env.DEMO_AUTH_SECRET,
  });
}

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  cached ??= readEnv();
  return cached;
}

export function isSupabaseConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function isOpenAiConfigured(): boolean {
  return Boolean(getEnv().OPENAI_API_KEY);
}

export function isRazorpayConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

export function razorpayWritesEnabled(): boolean {
  return getEnv().ENABLE_RAZORPAY_WRITES === "true";
}

export function getOpenAiModel(): string {
  return getEnv().OPENAI_MODEL;
}
