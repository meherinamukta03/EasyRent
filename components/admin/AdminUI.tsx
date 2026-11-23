"use client"

import { AlertCircle, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { MonthlyStat } from "@/types/admin"

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral"

const toneClasses: Record<BadgeTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
}

function normalize(value?: string) {
  return String(value || "").trim().toLowerCase()
}

export function equipmentStatusTone(status?: string): BadgeTone {
  const value = normalize(status)

  if (value === "approved") return "success"
  if (value === "rejected") return "danger"
  return "warning"
}

export function bookingStatusTone(status?: string): BadgeTone {
  const value = normalize(status)

  if (value === "confirmed") return "success"
  if (value === "active") return "info"
  if (value === "completed") return "neutral"
  if (value === "returned") return "success"
  if (value === "pending") return "warning"
  if (["rejected", "cancelled", "canceled"].includes(value)) return "danger"
  return "neutral"
}

export function paymentStatusTone(status?: string): BadgeTone {
  const value = normalize(status)

  if (["paid", "succeeded"].includes(value)) return "success"
  if (["pending", "processing"].includes(value)) return "warning"
  if (["failed", "unpaid"].includes(value)) return "danger"
  if (value === "refunded") return "info"
  return "neutral"
}

export function StatusBadge({
  value,
  tone,
}: {
  value?: string
  tone: BadgeTone
}) {
  return (
    <Badge
      variant="outline"
      className={`${toneClasses[tone]} px-2.5 py-0.5 text-[0.7rem] font-bold`}
    >
      {value || "Pending"}
    </Badge>
  )
}

export function AdminPageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-linear-to-r from-white via-emerald-50/60 to-white px-5 py-6 shadow-sm sm:px-8 sm:py-8">
      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[0.68rem] font-bold tracking-[0.16em] text-emerald-700 uppercase">
        {eyebrow}
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </header>
  )
}

export function formatDate(value?: string | null) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatCurrency(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—"

  return `৳${value.toLocaleString("en-US")}`
}

export function shortId(value?: string, length = 10) {
  if (!value) return "—"
  const text = String(value)
  return text.length > length ? `${text.slice(0, length)}…` : text
}

export function getInitials(name?: string | null) {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ER"
  )
}

export const adminSelectClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"

export function AdminTableSkeleton({
  rows = 5,
  columns = 6,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div aria-hidden="true" className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid min-w-[720px] gap-4 px-5 py-4 sm:px-6"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <div
              key={cellIndex}
              className="h-4 animate-pulse rounded-full bg-slate-100"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        {icon}
      </span>
      <h2 className="mt-4 text-base font-bold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  )
}

export function MonthlyBars({
  data,
  valueKey = "bookings",
  title,
}: {
  data: MonthlyStat[]
  valueKey?: "bookings" | "amount"
  title: string
}) {
  const max = Math.max(1, ...data.map((item) => item[valueKey]))

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-xs text-slate-500">Last 12 months</p>
      <div className="mt-6 flex h-40 items-end gap-1.5 sm:gap-2.5">
        {data.map((item) => {
          const value = item[valueKey]
          const height = Math.max(3, Math.round((value / max) * 100))

          return (
            <div
              key={item.month}
              className="group flex h-full min-w-0 flex-1 flex-col justify-end"
              title={`${item.label}: ${
                valueKey === "amount" ? formatCurrency(value) : value
              }`}
            >
              <div
                className="w-full rounded-t-md bg-emerald-500 transition-all duration-300 group-hover:bg-emerald-600"
                style={{ height: `${height}%` }}
              />
              <span className="mt-2 truncate text-center text-[0.6rem] font-medium text-slate-400">
                {item.label.split(" ")[0]}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function ErrorNotice({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="inline-flex items-center gap-2">
        <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
        {message}
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-1.5 self-start rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold transition hover:bg-red-50 sm:self-auto"
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Try again
      </button>
    </div>
  )
}
