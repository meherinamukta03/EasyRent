"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  PackageSearch,
  RotateCcw,
} from "lucide-react"

import EquipmentCard from "@/components/equipment/EquipmentCard"
import { buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import type { Equipment } from "@/types/equipment"

// The backend endpoint filters status "Approved", sorts by createdAt
// descending and applies MongoDB .limit(4). This only sizes the skeleton.
const RECENT_LIMIT = 4
const EASE = [0.22, 1, 0.36, 1] as const

function RecentlyAddedSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      {Array.from({ length: RECENT_LIMIT }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse rounded-xl bg-slate-100" />
          <div className="space-y-3 p-2">
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ViewAllButton({ className }: { className?: string }) {
  return (
    <Link
      href="/all-equipment"
      className={cn(
        buttonVariants(),
        "group h-11 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 focus-visible:ring-emerald-600/40",
        className
      )}
    >
      View All Equipment
      <ArrowRight
        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  )
}

export default function RecentlyAddedEquipment() {
  const shouldReduceMotion = useReducedMotion()
  const { data: session, isPending: isSessionPending } = authClient.useSession()

  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/public-recent-equipments", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            typeof data?.message === "string"
              ? data.message
              : "We could not load recently added equipment right now."
          )
        }

        if (controller.signal.aborted) return

        setEquipment(Array.isArray(data) ? (data as Equipment[]) : [])
        setError(null)
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) return

        setEquipment([])
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "We could not load recently added equipment right now."
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [reloadKey])

  function retry() {
    setIsLoading(true)
    setError(null)
    setReloadKey((key) => key + 1)
  }

  // Wait for the session so View Details links are correct on first paint.
  const isBusy = isLoading || isSessionPending
  const isAuthenticated = Boolean(session?.user)

  return (
    <section
      aria-labelledby="recent-equipment-heading"
      className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute -top-40 right-1/2 -z-10 size-[28rem] translate-x-1/2 rounded-full bg-emerald-100/40 blur-3xl"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-10 flex flex-col gap-6 sm:mb-12 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-700 uppercase">
              <Clock3 className="size-3.5" aria-hidden="true" />
              Just Listed
            </span>

            <h2
              id="recent-equipment-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Recently Added Equipment
            </h2>

            <p className="mt-3 text-base leading-7 text-slate-600">
              The newest approved listings from trusted owners — fresh gear for
              your next project, added to EasyRent just now.
            </p>
          </div>

          <ViewAllButton className="w-full sm:w-auto" />
        </motion.div>

        {error ? (
          <div
            role="alert"
            className="flex flex-col items-center rounded-2xl border border-red-100 bg-white px-6 py-14 text-center shadow-sm"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Couldn&apos;t load recently added equipment
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-600">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : isBusy ? (
          <RecentlyAddedSkeleton />
        ) : equipment.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <PackageSearch className="size-7" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No recent equipment yet
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-600">
              New approved listings will appear here as soon as they are added.
              In the meantime, explore the full catalogue.
            </p>
            <ViewAllButton className="mt-5" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {equipment.map((item, index) => (
              <motion.div
                key={item._id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 1.02,
                        transition: {
                          duration: 0.2,
                          delay: 0,
                          ease: "easeOut",
                        },
                      }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.45,
                  delay: shouldReduceMotion ? 0 : index * 0.07,
                  ease: EASE,
                }}
                className="h-full"
              >
                <EquipmentCard
                  equipment={item}
                  requireAuth
                  isAuthenticated={isAuthenticated}
                  showNewBadge
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
