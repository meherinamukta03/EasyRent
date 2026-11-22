import { getAccessToken } from "@/lib/jwt"
import { getApiBaseUrl } from "@/services/equipment.service"

type BackendOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  searchParams?: Record<string, string | number | undefined>
  /** Public catalogue/contact endpoints do not need a JWT. */
  public?: boolean
}

/**
 * Single server-side entry point for every Express API call.
 *
 * The Better Auth session cookie is read from the incoming request, exchanged
 * for a short-lived JWT through Better Auth's JWT plugin, and forwarded as a
 * Bearer token. The token is never exposed to the browser or stored in
 * localStorage, so it cannot be stolen by client-side scripts.
 */
export async function backendFetch<T>(
  path: string,
  options: BackendOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    searchParams,
    public: isPublic = false,
  } = options

  const requestHeaders: Record<string, string> = {}

  if (!isPublic) {
    const token = await getAccessToken()
    requestHeaders.Authorization = `Bearer ${token}`
  }

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json"
  }

  let url = `${getApiBaseUrl()}${path}`

  if (searchParams) {
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null && String(value) !== "") {
        params.set(key, String(value))
      }
    }

    const query = params.toString()
    if (query) url += `?${query}`
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  })

  const data = await response.json().catch(() => null)

  if (response.status === 401) {
    throw new Error("Your session has expired. Please sign in again.")
  }

  if (response.status === 403) {
    throw new Error("You don't have permission to perform this action.")
  }

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "The request could not be completed"
    )
  }

  return data as T
}
