import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

import type { auth } from "@/lib/auth"

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BETTER_AUTH_URL,
    /** Exposes server-only additional user fields (e.g. `role`) to the client types */
    plugins: [inferAdditionalFields<typeof auth>()],
})


export const { signIn, signUp, useSession } = createAuthClient()
