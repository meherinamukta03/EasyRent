"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { showSuccess } from "@/components/ui/toast"

/** One-time toast after a successful Google sign-in/registration. */
export default function AuthSuccessNotice() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shownRef = useRef(false)
  const auth = searchParams.get("auth")

  useEffect(() => {
    if (shownRef.current || auth !== "success") return
    shownRef.current = true

    showSuccess("Signed in successfully with Google.")

    // Remove the one-time flag so a refresh does not show the toast again.
    const url = new URL(window.location.href)
    url.searchParams.delete("auth")
    router.replace(`${url.pathname}${url.search}`)
  }, [auth, router])

  return null
}
