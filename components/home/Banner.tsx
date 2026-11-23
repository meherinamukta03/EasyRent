"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import {
  FaArrowRight,
  FaCheckCircle,
  FaHeadset,
  FaInfoCircle,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MotionLink = motion.create(Link)

const EASE = [0.22, 1, 0.36, 1] as const

export default function Banner() {
  const shouldReduceMotion = useReducedMotion()

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.09,
        delayChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  }

  const itemVariants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: EASE },
        },
      }

  const imageVariants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 1, x: 0 },
        visible: { opacity: 1, x: 0 },
      }
    : {
        hidden: { opacity: 0, x: 48 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.75, delay: 0.15, ease: EASE },
        },
      }

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.07)_1px,transparent_0)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] [background-size:22px_22px]"
      />
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-32 -z-10 size-[30rem] rounded-full bg-emerald-100/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-40 -z-10 size-[26rem] rounded-full bg-slate-100/80 blur-3xl"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-8 lg:pt-20 lg:pb-24 xl:gap-20">
        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          variants={containerVariants}
          className="max-w-2xl min-w-0"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3.5 py-2 text-xs font-semibold text-emerald-700 shadow-sm shadow-emerald-600/5 sm:text-sm">
              <FaShieldAlt aria-hidden="true" className="size-3.5" />
              Trusted Equipment Rental Marketplace
            </span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            variants={itemVariants}
            className="mt-6 text-[2.6rem] leading-[1.06] font-bold tracking-[-0.04em] text-balance text-slate-900 sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]"
          >
            Rent Smarter.{" "}
            <span className="relative inline-block whitespace-nowrap text-emerald-600">
              <span className="relative z-10">Work Better.</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 h-3 -rotate-1 rounded-full bg-emerald-100/90 sm:bottom-1.5 sm:h-4"
              />
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-xl text-base leading-7 text-pretty text-slate-600 sm:mt-6 sm:text-lg sm:leading-8"
          >
            Find and rent reliable equipment for your projects. From
            construction tools to photography gear, get the right equipment at
            the right price.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <MotionLink
              href="/all-equipment"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                buttonVariants({ size: "lg" }),
                "group h-12 w-full rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 focus-visible:ring-emerald-600/40 sm:w-auto"
              )}
            >
              Explore Equipment
              <FaArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </MotionLink>

            <MotionLink
              href="/about"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "group h-12 w-full rounded-full border-emerald-600 bg-white px-6 text-sm font-semibold text-emerald-700 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:ring-emerald-600/40 sm:w-auto"
              )}
            >
              Learn More
              <FaInfoCircle
                aria-hidden="true"
                className="size-3.5 transition-transform duration-200 group-hover:scale-110"
              />
            </MotionLink>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-6"
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FaCheckCircle aria-hidden="true" className="size-3" />
              </span>
              Verified listings
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FaTruck aria-hidden="true" className="size-3" />
              </span>
              Pickup or delivery
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FaHeadset aria-hidden="true" className="size-3" />
              </span>
              Local support
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          variants={imageVariants}
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
        >
          <div
            aria-hidden="true"
            className="absolute -top-5 -right-5 h-32 w-32 rounded-[2rem] border border-emerald-200/70 bg-emerald-50/50"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-emerald-600/5"
          />

          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-[0_32px_70px_-30px_rgba(15,23,42,0.45)]">
            <div className="relative aspect-[16/11] w-full">
              <Image
                src="/images/banner.png"
                alt="Construction tools, a ladder, camera equipment, and a toolbox ready for rent"
                fill
                fetchPriority="high"
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-slate-950/35 via-slate-950/5 to-transparent"
              />
            </div>

            <div className="absolute inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-5 sm:left-5">
              <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-3.5 shadow-lg shadow-slate-950/10 backdrop-blur-md sm:w-64 sm:p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/25">
                  <FaCheckCircle aria-hidden="true" className="size-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Quality checked
                  </p>
                  <p className="text-xs leading-5 text-slate-500">
                    Every listing is verified and ready to rent
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/5 backdrop-blur">
              <FaTruck aria-hidden="true" className="size-3 text-emerald-600" />
              Pickup or delivery
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
