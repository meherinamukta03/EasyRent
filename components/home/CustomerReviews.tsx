"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Quote, Star } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const EASE = [0.22, 1, 0.36, 1] as const
const MAX_RATING = 5

interface Review {
  name: string
  rating: number
  comment: string
  avatarClass: string
}

const REVIEWS: Review[] = [
  {
    name: "Rahim Ahmed",
    rating: 5,
    comment:
      "EasyRent made it easy to find affordable construction equipment. The booking process was simple.",
    avatarClass: "bg-emerald-50 text-emerald-700",
  },
  {
    name: "Nusrat Jahan",
    rating: 5,
    comment:
      "Great platform with flexible rental options. I found exactly what I needed.",
    avatarClass: "bg-sky-50 text-sky-700",
  },
  {
    name: "Tanvir Hasan",
    rating: 4,
    comment:
      "A convenient platform for renting equipment. The overall experience was smooth.",
    avatarClass: "bg-amber-50 text-amber-700",
  },
  {
    name: "Sadia Islam",
    rating: 5,
    comment:
      "Very helpful platform. I could easily connect with equipment owners.",
    avatarClass: "bg-violet-50 text-violet-700",
  },
]

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      role="img"
      aria-label={`${rating} out of ${MAX_RATING} stars`}
      className="flex items-center gap-0.5"
    >
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={`size-4 ${index < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  )
}

export default function CustomerReviews() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      aria-labelledby="reviews-heading"
      className="relative isolate overflow-hidden bg-slate-50 py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute -top-40 -left-40 -z-10 size-[26rem] rounded-full bg-emerald-100/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-40 -bottom-40 -z-10 size-[24rem] rounded-full bg-white blur-3xl"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
        >
          <span className="inline-flex items-center rounded-full border border-emerald-100 bg-white px-3.5 py-2 text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase">
            Customer Stories
          </span>

          <h2
            id="reviews-heading"
            className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            What Our Customers Say
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Real feedback from people who rent equipment on EasyRent — from
            simple bookings to finding the right gear for the job.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {REVIEWS.map((review, index) => (
            <motion.figure
              key={review.name}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -5, transition: { duration: 0.2, ease: "easeOut" } }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                delay: shouldReduceMotion ? 0 : index * 0.08,
                ease: EASE,
              }}
              className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03] transition-colors duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/[0.06] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-105">
                  <Quote className="size-5" aria-hidden="true" />
                </span>
                <StarRating rating={review.rating} />
              </div>

              <blockquote className="mt-5 flex-1 text-[15px] leading-7 text-slate-600">
                &ldquo;{review.comment}&rdquo;
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                <Avatar className="size-10 border border-slate-200">
                  <AvatarFallback
                    className={`text-xs font-bold ${review.avatarClass}`}
                  >
                    {getInitials(review.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {review.name}
                  </p>
                  <p className="text-xs text-slate-500">EasyRent customer</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
