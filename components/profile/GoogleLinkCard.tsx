"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FaLink, FaSpinner } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

import { Button } from "@/components/ui/button"
import { showError, showSuccess } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"

/**
 * Explicit, signed-in account linking. Better Auth keeps the current user ID
 * and role untouched — it only adds a Google identity to this account.
 */
export default function GoogleLinkCard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLinked, setIsLinked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const noticeShown = useRef(false)

  useEffect(() => {
    let active = true

    authClient
      .listAccounts()
      .then(({ data }) => {
        if (!active) return
        setIsLinked(Boolean(data?.some((account) => account.providerId === "google")))
      })
      .catch(() => {
        // The button stays available if the lookup fails.
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (noticeShown.current) return
    noticeShown.current = true

    if (searchParams.get("linked") === "success") {
      showSuccess("Google account linked successfully.")
    }

    const error = searchParams.get("link_error") || searchParams.get("error")
    if (error) {
      showError(
        error === "account_ownership_conflict" || error === "social_account_exist"
          ? "This Google account is already linked to another EasyRent account."
          : "We couldn't link your Google account. Please try again."
      )
    }

    if (
      searchParams.has("linked") ||
      searchParams.has("error") ||
      searchParams.has("link_error")
    ) {
      const url = new URL(window.location.href)
      url.searchParams.delete("linked")
      url.searchParams.delete("error")
      url.searchParams.delete("link_error")
      router.replace(`${url.pathname}${url.search}`)
    }
  }, [router, searchParams])

  async function handleLink() {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const result = await authClient.linkSocial({
        provider: "google",
        callbackURL: "/dashboard/profile?linked=success",
        errorCallbackURL: "/dashboard/profile?link_error=oauth_error",
      })

      if (result.error) {
        showError(result.error.message || "We couldn't link your Google account.")
        return
      }

      const url = (result.data as { url?: string } | null)?.url
      if (url) {
        window.location.href = url
        return
      }

      showError("Could not start Google account linking. Please try again.")
    } catch (error) {
      console.error("Google account linking could not be started:", error)
      showError("Could not start Google account linking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">
            Google account
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
            {isLinked
              ? "Your Google account is linked. You can sign in with it anytime."
              : "Link Google to sign in faster. Your EasyRent role and profile stay unchanged."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isLinked ? (
            <span className="inline-flex h-10 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700">
              <FcGoogle className="text-lg" aria-hidden="true" />
              Linked
            </span>
          ) : isLoading ? (
            <div className="h-10 w-36 animate-pulse rounded-full bg-slate-100" />
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleLink}
              disabled={isSubmitting}
              className="h-10 rounded-full px-4"
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin" aria-hidden="true" />
              ) : (
                <FaLink aria-hidden="true" />
              )}
              {isSubmitting ? "Connecting..." : "Link Google"}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
