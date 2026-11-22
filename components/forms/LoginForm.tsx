"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  FaTools,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaSpinner,
} from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { getDashboardPath } from "@/lib/roles"
import { toast } from "../ui/toast"

export default function LoginForm() {
  const router = useRouter()
  const [values, setValues] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle input changes
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Ignore repeated clicks while the first request is still in flight.
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const data = Object.fromEntries(formData.entries())

      // No callbackURL here: the redirect is decided only after we have a
      // verified session and know the user's actual role.
      const { error } = await authClient.signIn.email({
        email: data.email as string,
        password: data.password as string,
        rememberMe: true,
      })

      if (error) {
        toast.add({
          title: error.message || "Invalid email or password.",
          type: "error",
        })
        return
      }

      const session = await authClient.getSession()
      const dashboardPath = getDashboardPath(session.data?.user?.role)

      if (!dashboardPath) {
        toast.add({
          title:
            "We couldn't determine your account role. Please contact support.",
          type: "error",
        })
        return
      }

      toast.add({ title: "Login successful!", type: "success" })
      router.push(dashboardPath)
      router.refresh()
    } catch (loginError) {
      toast.add({
        title:
          loginError instanceof Error
            ? loginError.message
            : "Login failed. Please try again.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleGoogleLogin = async () => {
    if (isSubmitting) return

    try {
      // Use the configured client so baseURL/plugins match the rest of the app.
      const result = await authClient.signIn.social({
        provider: "google",
        // Existing users land on a role-aware redirect handler. New users are
        // rejected by Better Auth before account/session creation and sent
        // to the register page with an explanation.
        callbackURL: "/dashboard/redirect",
        errorCallbackURL: "/register",
      })

      if (result.error) {
        toast.add({
          title:
            result.error.message || "Google login failed. Please try again.",
          type: "error",
        })
        return
      }

      toast.add({
        title: "Redirecting to Google...",
        type: "info",
      })
    } catch (error) {
      console.error(error)

      toast.add({
        title: "Google login failed. Please try again.",
        type: "error",
      })
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <FaTools />
        </span>

        <h2 className="text-xl font-bold text-slate-900">
          Easy<span className="text-emerald-600">Rent</span>
        </h2>
      </Link>

      {/* Heading */}
      <div className="mt-7">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Member Access
        </span>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Welcome Back!
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Log in to EasyRent and manage your equipment rentals.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>

          <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500">
            <FaEnvelope className="text-slate-400" />

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange}
              required
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500">
            <FaLock className="text-slate-400" />

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={values.password}
              onChange={handleChange}
              required
              className="w-full bg-transparent text-sm outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-slate-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-emerald-600 font-semibold hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <FaSpinner className="mr-2 animate-spin" aria-hidden="true" />
          ) : null}
          {isSubmitting ? "Logging in..." : "Login"}
          {!isSubmitting ? <FaArrowRight className="ml-2" /> : null}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <hr className="flex-1 border-slate-200" />
        <span className="text-xs font-medium text-slate-400">OR</span>
        <hr className="flex-1 border-slate-200" />
      </div>

      {/* Google Button - UI only */}
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full rounded-xl"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
      >
        <FcGoogle className="text-xl" />
        Continue with Google
      </Button>

      {/* Register Link */}
      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-600 hover:underline"
        >
          Register
        </Link>
      </p>

      {/* Footer */}
      <p className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
        <FaLock className="mr-1 inline" />
        Secure access to your EasyRent account.
      </p>
    </motion.div>
  )
}
