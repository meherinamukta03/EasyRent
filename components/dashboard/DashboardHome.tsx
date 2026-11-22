import Link from "next/link"
import { ArrowUpRight, type LucideIcon } from "lucide-react"

export interface DashboardLink {
  label: string
  description: string
  href: string
  icon: LucideIcon
}

export default function DashboardHome({
  eyebrow,
  title,
  description,
  links,
}: {
  eyebrow: string
  title: string
  description: string
  links: DashboardLink[]
}) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div
        aria-hidden="true"
        className="absolute -top-32 right-0 -z-10 size-[30rem] rounded-full bg-emerald-100/50 blur-3xl"
      />

      <div className="mx-auto w-full max-w-7xl space-y-6">
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

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(
            ({ label, description: linkDescription, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <ArrowUpRight
                    className="size-5 text-slate-300 transition-colors group-hover:text-emerald-600"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="mt-4 text-base font-bold text-slate-900">
                  {label}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {linkDescription}
                </p>
              </Link>
            )
          )}
        </section>
      </div>
    </main>
  )
}
