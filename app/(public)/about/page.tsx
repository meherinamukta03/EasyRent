import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  BadgeDollarSign,
  CalendarCheck,
  CalendarRange,
  Eye,
  LayoutDashboard,
  Package,
  Sparkles,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "About Us | EasyRent",
  description:
    "Learn about EasyRent — the online equipment rental platform connecting equipment owners with people who need gear for temporary use.",
}

const HIGHLIGHTS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Zap,
    title: "Easy Rental Process",
    description:
      "A simple flow from browsing to booking, with no unnecessary steps.",
  },
  {
    icon: BadgeDollarSign,
    title: "Affordable Options",
    description: "Compare prices and choose equipment that fits your budget.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted Owners",
    description: "Connect with reliable equipment owners across Bangladesh.",
  },
  {
    icon: CalendarCheck,
    title: "Convenient Booking",
    description: "Book online and manage your rentals from one place.",
  },
]

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: CalendarCheck,
    title: "Easy Booking",
    description: "Book equipment through a simple online process.",
  },
  {
    icon: BadgeDollarSign,
    title: "Affordable Pricing",
    description: "Find equipment according to your budget.",
  },
  {
    icon: Package,
    title: "Wide Equipment Collection",
    description: "Explore different equipment categories in one place.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted Owners",
    description: "Connect with equipment owners you can rely on.",
  },
  {
    icon: CalendarRange,
    title: "Flexible Rental Duration",
    description: "Choose rental periods that suit your needs.",
  },
  {
    icon: LayoutDashboard,
    title: "Convenient Experience",
    description: "Manage bookings from your account, anytime.",
  },
]

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string
  title: string
  description?: string
  centered?: boolean
}) {
  return (
    <div className={cn("max-w-2xl", centered && "mx-auto text-center")}>
      <span className="text-xs font-bold tracking-[0.18em] text-emerald-700 uppercase">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      ) : null}
    </div>
  )
}

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section
        aria-labelledby="about-heading"
        className="relative isolate overflow-hidden bg-slate-900"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(15,23,42,0.94) 0%, rgba(15,23,42,0.82) 45%, rgba(15,23,42,0.2) 100%), url('/images/banner.png')",
          }}
        />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3.5 py-2 text-xs font-semibold tracking-[0.16em] text-emerald-300 uppercase">
              <Sparkles className="size-3.5" aria-hidden="true" />
              About EasyRent
            </span>
            <h1
              id="about-heading"
              className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              About EasyRent
            </h1>
            <p className="mt-4 text-xl font-medium text-emerald-300 sm:text-2xl">
              Making Equipment Rental Simple, Affordable, and Accessible.
            </p>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-200">
              EasyRent is built for people who need the right equipment at the
              right time. Browse trusted listings, compare options, and rent
              with confidence — all from one convenient online platform.
            </p>
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Who We Are"
              title="Connecting owners with renters"
            />
            <p className="mt-6 text-base leading-7 text-slate-600">
              EasyRent is an online equipment rental platform connecting
              equipment owners with customers who need equipment for temporary
              use. We make it easier to find the right gear without the hassle
              of traditional rental processes.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              From construction tools to cameras and vehicles, our growing
              catalogue brings verified equipment and straightforward booking
              together in one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] transition-colors duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/[0.06]"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative isolate overflow-hidden bg-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What Drives Us"
            title="Our mission and vision"
            centered
          />

          <div className="mt-10 grid gap-6 sm:mt-12 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm shadow-slate-900/[0.03] transition-colors duration-300 hover:border-emerald-200">
              <span className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Target className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Our Mission
              </h3>
              <p className="mt-3 text-base leading-7 text-slate-600">
                &ldquo;Our mission is to make equipment rental accessible,
                convenient, and affordable for everyone.&rdquo;
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm shadow-slate-900/[0.03] transition-colors duration-300 hover:border-emerald-200">
              <span className="flex size-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Eye className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Our Vision
              </h3>
              <p className="mt-3 text-base leading-7 text-slate-600">
                &ldquo;Our vision is to become a trusted platform where people
                can easily rent and share equipment.&rdquo;
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why EasyRent"
            title="Why Choose EasyRent?"
            description="Everything you need for a smooth rental experience, from first search to final return."
            centered
          />

          <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03] transition-colors duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/[0.06]"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-emerald-700 py-16 sm:py-20">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-24 -z-10 size-[28rem] rounded-full bg-emerald-500/40 blur-3xl"
        />
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Find the Equipment You Need?
          </h2>
          <p className="max-w-2xl text-base leading-7 text-emerald-50">
            Explore our equipment collection and find the right equipment for
            your next project.
          </p>
          <Link
            href="/all-equipment"
            className={cn(
              buttonVariants(),
              "h-12 rounded-full bg-white px-7 text-sm font-semibold text-emerald-700 shadow-lg shadow-emerald-900/20 hover:bg-emerald-50 focus-visible:ring-white/50"
            )}
          >
            Explore Equipment
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </main>
  )
}
