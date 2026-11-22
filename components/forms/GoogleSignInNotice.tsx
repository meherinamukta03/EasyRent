"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"

import { showError } from "@/components/ui/toast"

const messages: Record<string, string> = {
  registration_required:
    "This Google email is not registered on EasyRent. Register with this email first, then sign in with Google.",
  state_not_found:
    "Your Google sign-in session expired. Please try again from the login page.",
  no_code: "Google did not return an authorization code. Please try again.",
  provider_not_found: "Google sign-in is not configured. Please contact support.",
  access_denied: "Google sign-in was cancelled. Please try again.",
  social_account_exist:
    "This Google account is already linked to another EasyRent account.",
  "unable to link account":
    "Your Google account was linked to a removed account. Please contact support to repair it.",
  unable_to_link_account:
    "Your Google account was linked to a removed account. Please contact support to repair it.",
  "account not linked":
    "This Google email needs to be linked to your EasyRent account first. Please contact support.",
  email_not_found: "Google did not return an email address. Please try again.",
  email_not_verified: "Please verify your Google email and try again.",
  invalid_code: "Your Google sign-in code expired. Please try again.",
}

/**
 * Better Auth redirects failed Google sign-ins to /register with ?error=... and
 * an optional error_description. Show the real reason once, including the raw
 * code when there is no description, so failures are diagnosable.
 */
export default function GoogleSignInNotice() {
  const searchParams = useSearchParams()
  const shownRef = useRef(false)

  const error = searchParams.get("error")
  const description = searchParams.get("error_description")

  useEffect(() => {
    if (shownRef.current || !error) return

    shownRef.current = true

    const message =
      description ||
      messages[error] ||
      `Google sign-in failed (${error}). Please try again.`

    showError(message)
  }, [error, description])

  return null
}
