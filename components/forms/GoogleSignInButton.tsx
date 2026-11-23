"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaSpinner } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

import { Button } from "@/components/ui/button"
import { showError } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

interface GoogleSignInButtonProps {
  className?: string
}

/**
 * Shared Google entry point for both Login and Register pages. The redirect
 * target is the server-side role router, so no client-side role data is used
 * to decide where the user lands.
 */
export default function GoogleSignInButton({
  className,
}: GoogleSignInButtonProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleClick() {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard/redirect?auth=success",
        errorCallbackURL: "/register",
      })

      if (result.error) {
        const code = result.error.code || "oauth_error"
        const description =
          result.error.message || "Google sign-in failed. Please try again."

        router.push(
          `/register?error=${encodeURIComponent(code)}&error_description=${encodeURIComponent(description)}`
        )
        return
      }

      const url = (result.data as { url?: string } | null)?.url

      if (url) {
        // Explicit navigation: a swallowed fetch-plugin navigation must not
        // leave the user stuck on the auth page.
        window.location.href = url
        return
      }

      showError("Could not start Google sign-in. Please try again.")
    } catch (error) {
      // Only a generic message is shown to the user; details stay in logs.
      console.error("Google sign-in could not be started:", error)
      router.push("/register?error=oauth_error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isSubmitting}
      aria-label="Continue with Google"
      className={cn("h-12 w-full rounded-xl", className)}
    >
      {isSubmitting ? (
        <FaSpinner className="animate-spin" aria-hidden="true" />
      ) : (
        <FcGoogle className="text-xl" aria-hidden="true" />
      )}
      {isSubmitting ? "Connecting to Google..." : "Continue with Google"}
    </Button>
  )
}
