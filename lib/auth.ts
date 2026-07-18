import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import { sendVerificationEmail } from "./email";

const requiredEnv = ["BETTER_AUTH_SECRET"] as const;
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

// Google OAuth only works if both are set — fail at boot instead of a
// confusing runtime error the first time someone clicks "Sign in with Google"
if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_ID is set but GOOGLE_CLIENT_SECRET is missing",
  );
}

const APP_URL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: APP_URL,

  // Google's OAuth redirect must land on a trusted origin, and this also
  // guards email/password endpoints against being hit from other origins.
  // VERCEL_URL covers preview deployments, which each get their own
  // unpredictable *.vercel.app host — without it every preview branch
  // hits the same invalid-origin error production did.
  trustedOrigins: [
    APP_URL,
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3001"] : []),
  ],

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
    autoSelect: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Leave off until sendVerificationEmail is confirmed working end-to-end —
    // flipping this on before that means new users can get locked out
    // entirely if verification email delivery has any issue.
    // requireEmailVerification: true,
  },

  emailVerification: {
    sendVerificationEmail,
    sendOnSignUp: true,
    expiresIn: 60 * 60 * 24, // 24 hours
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  user: {
    changeEmail: { enabled: false },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false,
      },
    },
  },

  // In-memory rate limiting doesn't hold up across multiple stateless
  // instances — same class of problem you're already solving in quizlar
  // with Redis. Database-backed here so it's consistent regardless of
  // which instance handles the request.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
    storage: "database",
  },

  advanced: {
    cookiePrefix: "eventhub",
    defaultCookieAttributes: {
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  // Required for cookies to be set correctly when calling auth.api.* from
  // Next.js Server Actions — must be last in the plugins array
  plugins: [nextCookies()],

  onAPIError: {
    throw: false,
    onError: (error) => {
      console.error("[better-auth]", error);
    },
  },
});

export type Session = typeof auth.$Infer.Session;
