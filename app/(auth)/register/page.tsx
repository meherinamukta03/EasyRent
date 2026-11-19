import type { Metadata } from "next"
import Image from "next/image"
import { FaCheckCircle, FaHeadset, FaShieldAlt, FaTools } from "react-icons/fa"

import RegisterForm from "@/components/forms/RegisterForm"

export const metadata: Metadata = {
  title: "Create your account | EasyRent",
  description:
    "Join EasyRent and find the right equipment for your projects. Create a free customer account in seconds.",
}

const benefits = [
  "Verified equipment",
  "Flexible rental terms",
  "Secure bookings",
  "Local support",
] as const

export default function RegisterPage() {
  return (
    <main className="relative isolate min-h-[calc(100dvh-4rem)] overflow-hidden bg-slate-50 lg:min-h-[calc(100dvh-4.5rem)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] [mask-image:linear-gradient(to_bottom,black,transparent_92%)] [background-size:22px_22px]"
      />
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-32 -z-10 size-[28rem] rounded-full bg-emerald-100/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-44 -left-40 -z-10 size-[24rem] rounded-full bg-slate-200/60 blur-3xl"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-14 lg:px-8 lg:py-16">
        <section aria-labelledby="register-heading" className="min-w-0">
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <RegisterForm />
          </div>
        </section>

        <aside className="hidden min-w-0 lg:block">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 shadow-[0_36px_80px_-40px_rgba(15,23,42,0.55)]">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/images/signin.jpeg"
                alt="Construction tools, camera gear, and equipment ready to rent"
                fill
                sizes="(max-width: 1023px) 0px, 46vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/35 to-slate-950/10"
              />

              <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 backdrop-blur">
                <FaShieldAlt aria-hidden="true" className="text-emerald-600" />
                Trusted by renters &amp; owners
              </div>

              <div className="absolute inset-x-5 bottom-5">
                <p className="text-lg leading-snug font-semibold text-white">
                  From power tools to camera gear.
                </p>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  Rent what you need, when you need it.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FaTools aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Built for every project
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Join a marketplace designed around trust, fair pricing, and
                  reliable equipment.
                </p>
              </div>
            </div>

            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <FaCheckCircle
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-emerald-600"
                  />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
              <FaHeadset aria-hidden="true" className="text-emerald-600" />
              Here to help before, during, and after your rental.
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
