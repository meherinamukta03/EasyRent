import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string);
const db = client.db("EasyRent");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

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
      update: {
        before: async (user) => {
          // Hook results are merged back into the payload, so a field can only
          // be blocked by rejecting the whole update.
          if ("role" in (user as Record<string, unknown>)) {
            return false;
          }
        },
      },
    },
  },

  user: {
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
});
