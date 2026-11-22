"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"

import { showError } from "@/components/ui/toast"

const DEFAULT_MESSAGE = "Please register first before signing in with Google."

/**
 * Better Auth redirects rejected Google sign-ins to /register with
 * ?error=registration_required&error_description=... . Show that message once
 * as a toast so the user knows why they landed on the registration page.
 */
export default function GoogleSignInNotice() {
  const searchParams = useSearchParams()
  const shownRef = useRef(false)

  useEffect(() => {
    if (shownRef.current) return

    if (searchParams.get("error") !== "registration_required") return

    shownRef.current = true
    showError(searchParams.get("error_description") || DEFAULT_MESSAGE)
  }, [searchParams])

  return null
}
