"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import {
  FaArrowRight,
  FaCheck,
  FaCircleNotch,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaImage,
  FaLock,
  FaTools,
  FaUser,
} from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const EASE = [0.22, 1, 0.36, 1] as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const FIELD_ORDER = ["name", "email", "image", "password"] as const

type FieldName = (typeof FIELD_ORDER)[number]

type FormValues = Record<FieldName, string>

type FormErrors = Partial<Record<FieldName, string>>

const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 6 characters",
    test: (value: string) => value.length >= 6,
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "One lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
] as const

const INPUT_GROUP_CLASS =
  "h-11 rounded-xl border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03] has-[[data-slot=input-group-control]:focus-visible]:border-emerald-500 has-[[data-slot=input-group-control]:focus-visible]:ring-emerald-500/20"

const ADDON_CLASS =
  "text-slate-400 transition-colors group-focus-within/input-group:text-emerald-600"

function isValidImageUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function validateField(field: FieldName, value: string) {
  const trimmed = value.trim()

  switch (field) {
    case "name":
      if (!trimmed) {
        return "Enter your full name."
      }

      return trimmed.length < 2 ? "Your name is too short." : undefined

    case "email":
      if (!trimmed) {
        return "Enter your email address."
      }

      return EMAIL_PATTERN.test(trimmed)
        ? undefined
        : "Enter a valid email address."

    case "image":
      if (!trimmed) {
        return undefined
      }

      return isValidImageUrl(trimmed)
        ? undefined
        : "Enter a valid image URL starting with http:// or https://"

    case "password":
      if (!value) {
        return "Create a password."
      }

      return PASSWORD_RULES.every((rule) => rule.test(value))
        ? undefined
        : "Use at least 6 characters with one uppercase and one lowercase letter."
  }
}

function getFriendlyError(message?: string): {
  message: string
  field?: FieldName
} {
  const raw = message?.trim()

  if (!raw) {
    return {
      message: "We couldn't create your account. Please try again.",
    }
  }

  if (/already exists|already registered|user with this email/i.test(raw)) {
    return {
      message:
        "An account with this email already exists. Try logging in instead.",
      field: "email",
    }
  }

  if (/invalid email/i.test(raw)) {
    return { message: "Enter a valid email address.", field: "email" }
  }

  if (/password/i.test(raw)) {
    return { message: raw, field: "password" }
  }

  return { message: raw }
}

export default function RegisterForm() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()

  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    image: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {}
  )
  const [showPassword, setShowPassword] = useState(false)
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  const isBusy = isSubmitting || isGoogleSubmitting
  const trimmedImage = values.image.trim()
  const previewUrl =
    trimmedImage && isValidImageUrl(trimmedImage) && !imagePreviewFailed
      ? trimmedImage
      : null

  const passwordDescribedBy =
    errors.password !== undefined
      ? "password-requirements password-error"
      : "password-requirements"

  const staggerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
        delayChildren: shouldReduceMotion ? 0 : 0.04,
      },
    },
  }

  const itemVariants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: EASE },
        },
      }

  function handleChange(field: FieldName, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))

    if (field === "image") {
      setImagePreviewFailed(false)
    }

    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
    }
  }

  function handleBlur(field: FieldName) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, values[field]),
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isBusy) {
      return
    }

    const nextErrors: FormErrors = {}

    for (const field of FIELD_ORDER) {
      const error = validateField(field, values[field])

      if (error) {
        nextErrors[field] = error
      }
    }

    setErrors(nextErrors)
    setTouched({ name: true, email: true, image: true, password: true })

    const firstInvalidField = FIELD_ORDER.find((field) => nextErrors[field])

    if (firstInvalidField) {
      toast.add({
        type: "error",
        title: "Check your details",
        description: "Please fix the highlighted fields before continuing.",
      })
      document.getElementById(firstInvalidField)?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        image: trimmedImage || undefined,
        callbackURL: "/",
      })

      if (error) {
        const friendlyError = getFriendlyError(error.message)

        toast.add({
          type: "error",
          title: "Registration failed",
          description: friendlyError.message,
        })

        if (friendlyError.field) {
          setErrors((prev) => ({
            ...prev,
            [friendlyError.field as FieldName]: friendlyError.message,
          }))
        }

        setIsSubmitting(false)
        return
      }

      toast.add({
        type: "success",
        title: "Account created",
        description:
          "Welcome to EasyRent! Your customer account is ready to use.",
      })

      router.push("/")
      router.refresh()
    } catch {
      toast.add({
        type: "error",
        title: "Something went wrong",
        description: "We couldn't create your account. Please try again.",
      })
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    if (isBusy) {
      return
    }

    setIsGoogleSubmitting(true)

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        newUserCallbackURL: "/",
        errorCallbackURL: "/register",
      })

      if (error) {
        toast.add({
          type: "error",
          title: "Google sign-up failed",
          description:
            error.message || "We couldn't connect to Google. Please try again.",
        })
        setIsGoogleSubmitting(false)
      }

      // A successful social sign-in redirects the browser, so the loading
      // state stays active until the page unloads.
    } catch {
      toast.add({
        type: "error",
        title: "Google sign-up failed",
        description: "We couldn't connect to Google. Please try again.",
      })
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      variants={staggerVariants}
      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.4)] sm:p-8"
    >
      <motion.div variants={itemVariants}>
        <Link
          href="/"
          aria-label="EasyRent home"
          className="group inline-flex items-center gap-2.5 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 transition-colors duration-200 group-hover:bg-emerald-700">
            <FaTools aria-hidden="true" className="size-4" />
          </span>
          <span className="text-xl leading-none font-bold tracking-[-0.02em] text-slate-900">
            Easy<span className="text-emerald-600">Rent</span>
          </span>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-7">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[0.7rem] font-semibold tracking-wide text-emerald-700 uppercase">
          Free to join
        </span>
        <h1
          id="register-heading"
          className="mt-3 text-3xl leading-tight font-bold tracking-[-0.03em] text-balance text-slate-900 sm:text-[2.15rem]"
        >
          Create Your Account
        </h1>
        <p className="mt-2 text-sm leading-6 text-pretty text-slate-600 sm:text-base">
          Join EasyRent and find the right equipment for your projects.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isBusy}
          className="h-11 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/[0.03] transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
        >
          {isGoogleSubmitting ? (
            <FaCircleNotch aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <FcGoogle aria-hidden="true" className="size-[18px]" />
          )}
          {isGoogleSubmitting
            ? "Connecting to Google..."
            : "Continue with Google"}
        </Button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="my-6 flex items-center gap-3"
      >
        <span aria-hidden="true" className="h-px flex-1 bg-slate-200" />
        <span className="text-[0.7rem] font-semibold tracking-[0.18em] text-slate-400">
          OR
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-slate-200" />
      </motion.div>

      <motion.form
        noValidate
        onSubmit={handleSubmit}
        aria-busy={isBusy}
        variants={staggerVariants}
        className="flex flex-col gap-4"
      >
        <motion.div variants={itemVariants}>
          <Field>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <InputGroup className={INPUT_GROUP_CLASS}>
              <InputGroupAddon className={ADDON_CLASS}>
                <FaUser aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jordan Smith"
                value={values.name}
                onChange={(event) => handleChange("name", event.target.value)}
                onBlur={() => handleBlur("name")}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
                disabled={isBusy}
              />
            </InputGroup>
            <FieldError id="name-error">{errors.name}</FieldError>
          </Field>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Field>
            <FieldLabel htmlFor="email">Email address</FieldLabel>
            <InputGroup className={INPUT_GROUP_CLASS}>
              <InputGroupAddon className={ADDON_CLASS}>
                <FaEnvelope aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={(event) => handleChange("email", event.target.value)}
                onBlur={() => handleBlur("email")}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isBusy}
              />
            </InputGroup>
            <FieldError id="email-error">{errors.email}</FieldError>
          </Field>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Field>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor="image">Profile photo</FieldLabel>
              <span className="text-xs font-medium text-slate-400">
                Optional
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Profile photo preview"
                    className="size-full object-cover"
                    onError={() => setImagePreviewFailed(true)}
                  />
                ) : (
                  <FaUser
                    aria-hidden="true"
                    className="size-4 text-slate-400"
                  />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <InputGroup className={INPUT_GROUP_CLASS}>
                  <InputGroupAddon className={ADDON_CLASS}>
                    <FaImage aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="image"
                    name="image"
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="https://example.com/photo.jpg"
                    value={values.image}
                    onChange={(event) =>
                      handleChange("image", event.target.value)
                    }
                    onBlur={() => handleBlur("image")}
                    aria-invalid={errors.image ? true : undefined}
                    aria-describedby={
                      errors.image
                        ? "image-help image-error"
                        : "image-help"
                    }
                    disabled={isBusy}
                  />
                </InputGroup>
              </div>
            </div>

            <p id="image-help" className="text-xs leading-5 text-slate-500">
              Paste a direct image link to personalise your profile.
            </p>
            <FieldError id="image-error">{errors.image}</FieldError>
          </Field>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup className={INPUT_GROUP_CLASS}>
              <InputGroupAddon className={ADDON_CLASS}>
                <FaLock aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                value={values.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                onBlur={() => handleBlur("password")}
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={passwordDescribedBy}
                disabled={isBusy}
              />
              <InputGroupAddon align="inline-end" className="pr-2.5">
                <InputGroupButton
                  size="icon-sm"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={isBusy}
                  className="text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {showPassword ? (
                    <FaEyeSlash aria-hidden="true" />
                  ) : (
                    <FaEye aria-hidden="true" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            <ul
              id="password-requirements"
              className="flex flex-wrap gap-x-4 gap-y-1.5"
            >
              {PASSWORD_RULES.map((rule) => {
                const isPassed = rule.test(values.password)

                return (
                  <li
                    key={rule.id}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium transition-colors duration-200",
                      isPassed ? "text-emerald-700" : "text-slate-500"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                        isPassed
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      )}
                    >
                      {isPassed ? (
                        <FaCheck className="size-2" />
                      ) : (
                        <span className="size-1 rounded-full bg-slate-300" />
                      )}
                    </span>
                    {rule.label}
                  </li>
                )
              })}
            </ul>

            <FieldError id="password-error">{errors.password}</FieldError>
          </Field>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-1">
          <motion.div
            whileHover={
              shouldReduceMotion || isBusy ? undefined : { scale: 1.01 }
            }
            whileTap={
              shouldReduceMotion || isBusy ? undefined : { scale: 0.995 }
            }
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Button
              type="submit"
              disabled={isBusy}
              className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700 focus-visible:border-emerald-700 focus-visible:ring-emerald-600/30"
            >
              {isSubmitting ? (
                <>
                  <FaCircleNotch
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <FaArrowRight aria-hidden="true" className="size-3.5" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </motion.form>

      <motion.p
        variants={itemVariants}
        className="mt-6 text-center text-sm text-slate-600"
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-700 underline-offset-4 transition-colors hover:text-emerald-800 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Login
        </Link>
      </motion.p>
    </motion.div>
  )
}
