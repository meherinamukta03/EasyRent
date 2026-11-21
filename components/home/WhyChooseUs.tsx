"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  BadgeDollarSign,
  CalendarRange,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Benefit {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
}

const BENEFITS: Benefit[] = [
  {
    title: "Affordable Rental Prices",
    description: "Find equipment at competitive and reasonable rental prices.",
    icon: BadgeDollarSign,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Verified Equipment Owners",
    description: "Connect with trusted equipment owners.",
    icon: BadgeCheck,
    iconClass: "bg-sky-50 text-sky-600",
  },
  {
    title: "Flexible Rental Periods",
    description: "Choose Daily, Weekly, or Monthly rental options.",
    icon: CalendarRange,
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    title: "Secure Payments",
    description: "Enjoy a convenient and secure payment experience.",
    icon: CreditCard,
    iconClass: "bg-violet-50 text-violet-600",
  },
];

export default function WhyChooseUs() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="why-choose-heading"
      className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-40 -z-10 size-[26rem] rounded-full bg-emerald-50/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-40 -z-10 size-[24rem] rounded-full bg-slate-100/80 blur-3xl"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
        >
          <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase">
            The EasyRent Advantage
          </span>

          <h2
            id="why-choose-heading"
            className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Why Choose EasyRent?
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Everything you need to rent with confidence — fair prices, trusted
            owners, flexible terms and a secure checkout.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.article
                key={benefit.title}
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
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03] transition-colors duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/[0.06]"
              >
                <span
                  className={`flex size-12 items-center justify-center rounded-xl ${benefit.iconClass}`}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </span>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {benefit.description}
                </p>

                <div className="mt-auto pt-6">
                  <span
                    aria-hidden="true"
                    className="block h-0.5 w-10 rounded-full bg-emerald-500/70 transition-all duration-300 group-hover:w-16"
                  />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
