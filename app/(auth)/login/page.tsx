import type { Metadata } from "next"
import Image from "next/image"

import {
  FaCheckCircle,
  FaHeadset,
  FaShieldAlt,
  FaTools,
} from "react-icons/fa"

import LoginForm from "@/components/forms/LoginForm"


export const metadata: Metadata = {
  title: "Login | EasyRent",
  description:
    "Log in to EasyRent to manage your equipment rentals, bookings, and account.",
}

const highlights = [
  "Verified equipment",
  "Secure bookings",
  "Role-based access",
] as const

export default async function LoginPage() {
  //const session = await getServerSession()

//   if (session?.user) {
//     redirect(getDashboardPath(session.user.role))
//   }

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

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-14 lg:px-8 lg:py-14">
        <section aria-labelledby="login-heading" className="min-w-0">
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <LoginForm />
          </div>
        </section>

        <aside className="hidden min-w-0 lg:block">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950 shadow-[0_36px_80px_-40px_rgba(15,23,42,0.6)]">
            <div className="relative aspect-[5/6] max-h-[34rem] w-full">
              <Image
                src="/images/signin.jpeg"
                alt="Tools and equipment available to rent on EasyRent"
                fill
                priority
                sizes="(max-width: 1023px) 0px, 46vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/55 to-slate-950/10"
              />
              <div
                aria-hidden="true"
                className="absolute -top-16 -right-10 size-48 rounded-full bg-emerald-500/20 blur-3xl"
              />

              <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 backdrop-blur">
                <FaShieldAlt aria-hidden="true" className="text-emerald-600" />
                Trusted by renters &amp; owners
              </div>

              <div className="absolute inset-x-5 bottom-5">
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-emerald-300 uppercase">
                  EasyRent marketplace
                </p>
                <p className="mt-2 text-2xl leading-snug font-semibold text-balance text-white">
                  Gear up for what&apos;s next.
                </p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">
                  Sign in to manage rentals, keep track of bookings, and move
                  your projects forward.
                </p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.7rem] font-medium text-white/85 backdrop-blur"
                    >
                      <FaCheckCircle
                        aria-hidden="true"
                        className="size-2.5 text-emerald-400"
                      />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FaTools aria-hidden="true" className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Built for every project
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Reliable equipment, fair pricing, and flexible rental terms.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FaHeadset aria-hidden="true" className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Here when you need us
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Local support before, during, and after your rental.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
