"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import {
  CreditCard,
  PackageCheck,
  Search,
  Truck,
  type LucideIcon,
} from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

interface Step {
  number: string
  title: string
  description: string
  icon: LucideIcon
  iconClass: string
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Explore Equipment",
    description: "Browse available equipment from different categories.",
    icon: Search,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    number: "02",
    title: "Choose Equipment",
    description: "View equipment details and select the equipment you need.",
    icon: PackageCheck,
    iconClass: "bg-sky-50 text-sky-600",
  },
  {
    number: "03",
    title: "Book & Pay",
    description: "Submit your rental request and complete the payment process.",
    icon: CreditCard,
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    number: "04",
    title: "Receive Equipment",
    description:
      "Coordinate with the equipment owner and receive your rented equipment.",
    icon: Truck,
    iconClass: "bg-violet-50 text-violet-600",
  },
]

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion()

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.09,
      },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.45, ease: EASE },
    },
  }

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="relative isolate overflow-hidden bg-slate-50 py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-40 -z-10 size-[26rem] rounded-full bg-white blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-40 -z-10 size-[24rem] rounded-full bg-emerald-100/60 blur-3xl"
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
            Simple Process
          </span>

          <h2
            id="how-it-works-heading"
            className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            How EasyRent Works
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Renting the right equipment takes just four straightforward steps —
            from browsing to getting it in your hands.
          </p>
        </motion.div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-x-8 top-12 hidden h-px bg-linear-to-r from-emerald-200 via-emerald-300 to-emerald-200 lg:block"
          />

          <motion.div
            variants={containerVariants}
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {STEPS.map((step) => {
              const Icon = step.icon

              return (
                <motion.article
                  key={step.number}
                  variants={cardVariants}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -5,
                          transition: { duration: 0.2, ease: "easeOut" },
                        }
                  }
                  className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03] transition-colors duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/[0.06]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`flex size-12 items-center justify-center rounded-xl ${step.iconClass}`}
                    >
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-3xl leading-none font-black text-slate-100 transition-colors duration-300 group-hover:text-emerald-100"
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>

                  <div className="mt-auto pt-6">
                    <span
                      aria-hidden="true"
                      className="block h-0.5 w-10 rounded-full bg-emerald-500/70 transition-all duration-300 group-hover:w-16"
                    />
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
