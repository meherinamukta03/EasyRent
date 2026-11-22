"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FaTools,
  FaUser,
  FaEnvelope,
  FaImage,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaSpinner,
} from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"

interface AuthFormData {
  name: string
  email: string
  image: string
  password: string
}

export default function RegisterForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    image: "",
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

    if (isSubmitting) return
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    const data: AuthFormData = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      image: String(formData.get("image") || "").trim(),
      password: String(formData.get("password") || ""),
    }

    try {
      const { error } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        image: data.image || undefined,

        // Role is never sent by the browser. The server assigns "customer" to
        // every new account; only an admin can promote a user to owner/admin.
        callbackURL: "/dashboard/redirect",
      })

      if (error) {
        toast.add({
          title: error.message || "Could not create the account. Please try again.",
          type: "error",
        })
        return
      }

      toast.add({ title: "Account created successfully!", type: "success" })

      // Full navigation makes sure the new session cookie is picked up.
      window.location.href = "/dashboard/redirect"
    } catch (signupError) {
      toast.add({
        title:
          signupError instanceof Error
            ? signupError.message
            : "Could not create the account. Please try again.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
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
          Free to Join
        </span>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Create Your Account
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Join EasyRent and find the right equipment for your projects.
        </p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {/* Role is server-assigned: every new account starts as a customer.
            An admin can promote an account to owner or admin later. */}
        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <FaUser aria-hidden="true" className="size-4" />
          </span>
          <p className="text-xs leading-5 text-slate-600">
            <span className="font-semibold text-slate-900">Customer account</span>
            <br />
            All new accounts start as customers. Owner and admin roles are
            assigned by an administrator.
          </p>
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>

          <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500">
            <FaUser className="text-slate-400" />

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={values.name}
              onChange={handleChange}
              required
              minLength={2}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

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

        {/* Profile Photo */}
        <div>
          <label
            htmlFor="image"
            className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700"
          >
            Profile Photo URL
            <span className="text-xs font-normal text-slate-400">Optional</span>
          </label>

          <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500">
            <FaImage className="text-slate-400" />

            <input
              id="image"
              name="image"
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={values.image}
              onChange={handleChange}
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
              placeholder="Create a password"
              value={values.password}
              onChange={handleChange}
              required
              minLength={6}
              pattern="(?=.*[a-z])(?=.*[A-Z]).{6,}"
              title="Password must contain at least 6 characters, one uppercase and one lowercase letter."
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

          <p className="mt-2 text-xs text-slate-500">
            Minimum 6 characters, including uppercase and lowercase letters.
          </p>
        </div>

        {/* Register Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-emerald-600 font-semibold hover:bg-emerald-700 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            <>
              Create Account
              <FaArrowRight className="ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <hr className="flex-1 border-slate-200" />
        <span className="text-xs font-medium text-slate-400">OR</span>
        <hr className="flex-1 border-slate-200" />
      </div>

      {/* Login Link */}
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 hover:underline"
        >
          Login
        </Link>
      </p>
    </motion.div>
  )
}
