import { betterAuth } from "better-auth"
import { MongoClient, type Collection, type Db } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

const databaseUri = process.env.BETTER_AUTH_DB_URI ?? process.env.MONGODB_URI

if (!databaseUri) {
  throw new Error("BETTER_AUTH_DB_URI (or MONGODB_URI) is not configured")
}

const uri: string = databaseUri

type MongoState = { client: MongoClient; db: Db }

// One connection per runtime. `globalThis` keeps it shared across Next.js
// module reloads and route bundles instead of creating a new client per file.
const globalForMongo = globalThis as typeof globalThis & {
  __easyRentMongo?: MongoState
}

function createMongoState(): MongoState {
  const client = new MongoClient(uri, {
    appName: "EasyRent",
    retryWrites: true,
    retryReads: true,
    // Fail fast instead of holding a serverless invocation for 30s when the
    // Atlas replica set cannot elect a primary.
    serverSelectionTimeoutMS: 10_000,
  })

  return { client, db: client.db("EasyRent") }
}

/**
 * The MongoDB driver closes its topology when the very first connect attempt
 * fails (e.g. an Atlas failover). A module-level client would then be broken
 * for every later request in that warm lambda — "MongoTopologyClosedError".
 * Detect that state and build a fresh client on the next access.
 */
function isClosed(client: MongoClient) {
  const internal = client as unknown as {
    topology?: { s?: { state?: string } }
    s?: { hasBeenClosed?: boolean }
  }

  // A failed initial connect leaves the topology in "closed"; an explicit
  // close() removes it and sets hasBeenClosed. Both make the client unusable.
  return (
    internal.topology?.s?.state === "closed" ||
    internal.s?.hasBeenClosed === true
  )
}

function getMongoState(): MongoState {
  const current = globalForMongo.__easyRentMongo

  if (current && !isClosed(current.client)) {
    return current
  }

  const next = createMongoState()
  globalForMongo.__easyRentMongo = next
  return next
}

const RETRYABLE_ERRORS = new Set([
  "MongoTopologyClosedError",
  "MongoNotConnectedError",
  "MongoClientClosedError",
  "MongoServerSelectionError",
])

function isRetryable(error: unknown) {
  const name = (error as { name?: string } | null)?.name
  return Boolean(name && RETRYABLE_ERRORS.has(name))
}

/**
 * Calls a method on the current live object. If the driver reports that its
 * topology was closed, replace the client and retry once inside the same
 * request — so even the first request after a failed connect recovers.
 */
function delegate(resolve: () => object, key: PropertyKey) {
  return (...args: unknown[]) => {
    const run = () => {
      const target = resolve()
      const value = Reflect.get(target, key, target)

      if (typeof value !== "function") return value
      return value.apply(target, args)
    }

    const result = run()

    if (result && typeof (result as Promise<unknown>).then === "function") {
      return (result as Promise<unknown>).catch((error: unknown) => {
        if (!isRetryable(error)) throw error
        globalForMongo.__easyRentMongo = createMongoState()
        return run()
      })
    }

    return result
  }
}

function liveProxy<T extends object>(resolve: () => T): T {
  return new Proxy({} as T, {
    get(_target, key) {
      const value = Reflect.get(resolve() as object, key, resolve())
      if (typeof value !== "function") return value
      return delegate(resolve as () => object, key)
    },
  })
}

// Stable objects handed to Better Auth. All access is delegated to the current
// live connection, so a closed topology is transparently replaced without
// touching the auth config or any consumer import.
const db = new Proxy({} as Db, {
  get(_target, key) {
    if (key === "collection") {
      return (name: string) =>
        new Proxy({} as Collection, {
          get(_collectionTarget, collectionKey) {
            const value = Reflect.get(
              getMongoState().db.collection(name),
              collectionKey,
              getMongoState().db.collection(name)
            )
            if (typeof value !== "function") return value
            return delegate(
              () => getMongoState().db.collection(name),
              collectionKey
            )
          },
        })
    }

    return delegate(() => getMongoState().db, key)
  },
}) as Db

const client = liveProxy<MongoClient>(() => getMongoState().client)

/** Shared connection for server-side checks (no new client/collection). */
export const easyrentDb = db

// Strip inline-comment fragments (e.g. "url# comment") and fall back to the
// Vercel host so cookies use the correct protocol/domain in every environment.
const configuredBaseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

const baseURL = configuredBaseURL?.split("#")[0].trim()

/** Localhost URLs copied from `.env` must never win over a Vercel deployment. */
function isLocalOrigin(url?: string) {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return hostname === "localhost" || hostname === "127.0.0.1"
  } catch {
    return false
  }
}

const vercelBaseURL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined

// A stale `BETTER_AUTH_URL=http://localhost:3000` on Vercel would make Better
// Auth trust the wrong origin and generate localhost callback URLs.
const resolvedBaseURL =
  isLocalOrigin(baseURL) && vercelBaseURL ? vercelBaseURL : baseURL

export const auth = betterAuth({
  baseURL: resolvedBaseURL,

  /**
   * Better Auth validates every request's Origin against `baseURL` plus this
   * list. Vercel gives each deployment its own `*.vercel.app` host, so the
   * whole namespace is trusted along with local development origins.
   * Custom domains should be set as `BETTER_AUTH_URL` in Vercel instead.
   */
  trustedOrigins: [
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://*.vercel.app",
  ],

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
     * Google is a trusted provider: it verifies the email address before
     * Better Auth receives it, so a first-time Google sign-in may create a
     * user. The `databaseHooks.user.create.before` hook above still forces the
     * trusted `customer` role, and existing users are matched by verified
     * email / linked account instead of being duplicated.
     */
    additionalFields: {
      role: {
        // Never accept a role from the browser — not even on sign-up.
        type: ["customer", "owner", "admin"],
        input: false,
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
      // Google already proves ownership of the email, so implicit linking is
      // safe even when a legacy local account has no verified flag.
      requireLocalEmailVerified: false,
      // Never overwrite a manually edited profile on a later Google login.
      updateUserInfoOnLink: false,
    },
  },
})
