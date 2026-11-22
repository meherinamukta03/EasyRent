"use client"

import { useState, type FormEvent } from "react"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { showError, showSuccess } from "@/components/ui/toast"
import type { ContactFormValues } from "@/types/contact"

const EMPTY_FORM: ContactFormValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
}

type FieldErrors = Partial<Record<keyof ContactFormValues, string>>

function validate(values: ContactFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (values.name.trim().length < 2) {
    errors.name = "Please enter your full name (at least 2 characters)."
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address."
  }

  if (values.subject.trim().length < 3) {
    errors.subject = "Please enter a subject (at least 3 characters)."
  }

  if (values.message.trim().length < 10) {
    errors.message = "Please write at least 10 characters."
  }

  return errors
}

export default function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field: keyof ContactFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Guard against double clicks while a request is in flight.
    if (isSubmitting) return

    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      showError("Please fix the highlighted fields and try again.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : "Failed to send your message. Please try again."
        )
      }

      setValues(EMPTY_FORM)
      setErrors({})
      showSuccess("Message sent! We will get back to you soon.")
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Failed to send your message. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03] sm:p-8"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Send us a message
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Fill in the form below and our team will get back to you as soon as
          possible.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Full Name</Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            className="mt-2 h-11"
          />
          {errors.name ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="contact-email">Email Address</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            className="mt-2 h-11"
          />
          {errors.email ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          name="subject"
          placeholder="What is this about?"
          value={values.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          aria-invalid={Boolean(errors.subject)}
          className="mt-2 h-11"
        />
        {errors.subject ? (
          <p className="mt-1.5 text-xs text-red-600">{errors.subject}</p>
        ) : null}
      </div>

      <div className="mt-5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          placeholder="Tell us how we can help..."
          value={values.message}
          onChange={(event) => updateField("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          className="mt-2 min-h-36 resize-y"
        />
        {errors.message ? (
          <p className="mt-1.5 text-xs text-red-600">{errors.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 h-11 w-full rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 focus-visible:ring-emerald-600/40 sm:w-auto"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <Send aria-hidden="true" />
        )}
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
