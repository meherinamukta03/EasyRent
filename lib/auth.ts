import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"

const mongoUri = process.env.MONGODB_URI ?? process.env.DATABASE_URL

if (!mongoUri) {
  throw new Error(
    "Missing MongoDB connection string. Add MONGODB_URI to your .env file to enable authentication."
  )
}

const client = new MongoClient(mongoUri)
const db = client.db("EasyReant")

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  database: mongodbAdapter(db, {
    client,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
    },
  },
})
