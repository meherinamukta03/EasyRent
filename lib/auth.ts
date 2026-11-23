import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

const databaseUri = process.env.BETTER_AUTH_DB_URI ?? process.env.MONGODB_URI

if (!databaseUri) {
  throw new Error("BETTER_AUTH_DB_URI (or MONGODB_URI) is not configured")
}

const client = new MongoClient(databaseUri)
const db = client.db("EasyRent")

/** Shared connection for server-side checks (no new client/collection). */
export const easyrentDb = db

// Strip inline-comment fragments (e.g. "url# comment") and fall back to the
// Vercel host so cookies use the correct protocol/domain in every environment.
const configuredBaseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

const baseURL = configuredBaseURL?.split("#")[0].trim()

export const auth = betterAuth({
  baseURL,

  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

  /**
   * Keep `role` accepted at signup (the register form lets users choose
   * customer/owner), but never let an update — including a direct call to
   * /api/auth/update-user — change it. Profile updates only touch the fields
   * whitelisted in the profile server action.
   */
  databaseHooks: {
    user: {
      /**
       * Registration never decides the role. Every new account — including
       * Google sign-ins — starts as a customer; only an admin can promote.
       */
      create: {
        before: async (user) => ({
          data: { ...user, role: "customer" },
        }),
      },
      update: {
        before: async (user) => {
          // Hook results are merged back into the payload, so a field can only
          // be blocked by rejecting the whole update.
          if ("role" in (user as Record<string, unknown>)) {
            return false
          }
        },
      },
    },
  },

  user: {
    /**
     * Google sign-in is only allowed for emails that already exist in the
     * EasyRent users collection. This runs on the server during the OAuth
     * callback, before any user row or session is created, so it cannot be
     * bypassed by client-side checks. Existing users are unaffected: Better
     * Auth links the Google identity to their existing account instead.
     */
    validateUserInfo: async ({ user, source }) => {
      if (source.method !== "oauth" || source.action !== "create-user") return
      if (source.oauth?.providerId !== "google") return

      const email = String(user.email || "")
        .trim()
        .toLowerCase()
      if (!email) return

      const existingUser = await db.collection("user").findOne({ email })

      if (existingUser) return

      return {
        error: "registration_required",
        errorDescription:
          "Please register first before signing in with Google.",
      }
    },
    additionalFields: {
      role: {
        type: ["customer", "owner", "admin"],
        input: true,
        defaultValue: "customer",
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      address: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
    trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
})
