
"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FaTools,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

import { Button } from "@/components/ui/button"
import { authClient, signIn } from "@/lib/auth-client"
import { toast } from "../ui/toast"

interface AuthFormData {
  email: string
  password: string
}

export default function LoginForm() {
  const [values, setValues] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)

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

  const formData = new FormData(event.currentTarget)

  const data = Object.fromEntries(formData.entries())

  const { data: SignInResponse, error } = await authClient.signIn.email({
    email: data.email as string,
    password: data.password as string,
    rememberMe: true,
    callbackURL: "/",
  })

  if (error) {
    console.log(error.message)
    return
  }

  console.log("Login successful:", SignInResponse)
}
const handleGoogleLogin = async () => {
  try {
    const result = await signIn.social({
      provider: "google",
      callbackURL: "/",
      // errorCallbackURL: "/login",
    });

    if (result.error) {
      toast.add({
        title: "Google login failed!",
        type: "error",
      });
    } else {
      toast.add({
        title: "Google login successful!",
        type: "success",
      });
    }
  } catch (error) {
    console.log(error);

    toast.add({
      title: "Google login failed!",
      type: "error",
    });
  }
};
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
          className="h-12 w-full rounded-xl bg-emerald-600 font-semibold hover:bg-emerald-700"
        >
          Login
          <FaArrowRight className="ml-2" />
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
