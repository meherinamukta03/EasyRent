/**
 * Read-only diagnostic for Better Auth account records.
 *
 * Reports account rows whose `userId` no longer points to an existing user
 * (the "removed account" Google linking error) and duplicate provider
 * identities. It NEVER modifies or deletes anything.
 *
 * Run with: npm run check:orphans
 */
import fs from "node:fs"
import path from "node:path"
import { MongoClient } from "mongodb"

const envPath = path.resolve(process.cwd(), ".env")
const envText = fs.readFileSync(envPath, "utf8")
const env = {}

for (const line of envText.split(/\r?\n/)) {
  if (!line || line.trimStart().startsWith("#")) continue
  const separator = line.indexOf("=")
  if (separator === -1) continue
  env[line.slice(0, separator).trim()] = line.slice(separator + 1).trim()
}

const uri = env.BETTER_AUTH_DB_URI || env.MONGODB_URI

if (!uri) {
  console.error("BETTER_AUTH_DB_URI (or MONGODB_URI) is not configured in .env")
  process.exit(1)
}

const client = new MongoClient(uri)

try {
  await client.connect()
  const db = client.db("EasyRent")
  const accounts = await db.collection("account").find({}).toArray()

  const orphaned = []
  const identities = new Map()

  for (const account of accounts) {
    const key = `${account.providerId}:${account.accountId}`
    identities.set(key, (identities.get(key) || 0) + 1)

    const user = await db
      .collection("user")
      .findOne({ _id: account.userId }, { projection: { _id: 1 } })

    if (!user) {
      orphaned.push({
        accountId: account._id,
        providerId: account.providerId,
        providerAccountId: account.accountId,
        missingUserId: account.userId,
      })
    }
  }

  const duplicates = [...identities.entries()].filter(([, count]) => count > 1)

  console.log(`Checked ${accounts.length} account record(s).`)

  if (orphaned.length === 0) {
    console.log("OK: no orphaned account records found.")
  } else {
    console.log("Orphaned account records (manual review required):")
    for (const row of orphaned) {
      console.log(
        `- account ${row.accountId} | provider ${row.providerId} | providerAccountId ${row.providerAccountId} | missing user ${row.missingUserId}`
      )
    }
  }

  if (duplicates.length > 0) {
    console.log("Duplicate provider identities (manual review required):")
    for (const [key, count] of duplicates) {
      console.log(`- ${key}: ${count} rows`)
    }
  }

  console.log("This script is read-only; nothing was changed.")
} finally {
  await client.close()
}
