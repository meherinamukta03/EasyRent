import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { authClient } from "./auth-client"

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session
}


export const getClientSession = async () => {
  const session = await authClient.getSession()

  return session.data
}