import Link from "next/link"
import { Mail, MapPin } from "lucide-react"
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTools,
  FaYoutube,
} from "react-icons/fa"

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Equipment", href: "/all-equipment" },
  { label: "Categories", href: "/#categories-heading" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
]

const INFORMATION_LINKS = [
  { label: "How It Works", href: "/#how-it-works-heading" },
  { label: "Why Choose EasyRent?", href: "/#why-choose-heading" },
]

// These pages do not exist yet, so they stay non-interactive placeholders
// instead of pointing at a route that would 404.
const COMING_SOON_LINKS = ["Privacy Policy", "Terms & Conditions"]

const SOCIALS = [
  { label: "Facebook", icon: FaFacebookF },
  { label: "Instagram", icon: FaInstagram },
  { label: "LinkedIn", icon: FaLinkedinIn },
  { label: "YouTube", icon: FaYoutube },
]

const linkClass =
  "inline-block text-sm text-slate-400 transition-colors duration-200 hover:text-emerald-400 focus-visible:text-emerald-400 focus-visible:outline-none"

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold tracking-[0.14em] text-white uppercase">
      {children}
    </h2>
  )
}

function ComingSoonLink({ label }: { label: string }) {
  return (
    <span
      title={`${label} — coming soon`}
      className="cursor-not-allowed text-sm text-slate-400/70"
    >
      {label}
    </span>
  )
}

export default function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="relative isolate z-20 overflow-hidden bg-slate-950 text-slate-300"
    >
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -z-10 size-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-16">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              aria-label="EasyRent home"
              className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-900/40 transition-colors duration-200 group-hover:bg-emerald-500">
                <FaTools aria-hidden="true" className="size-[18px]" />
              </span>
              <span className="text-[1.35rem] leading-none font-bold tracking-[-0.02em] text-white">
                Easy<span className="text-emerald-400">Rent</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
              EasyRent makes equipment rental simple and convenient. Find the
              right equipment, connect with trusted owners, and rent with
              confidence.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  role="img"
                  aria-label={`${label} (coming soon)`}
                  title={`${label} — coming soon`}
                  className="flex size-9 cursor-not-allowed items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors duration-200 hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>

          <nav aria-label="Quick links" className="lg:col-span-2">
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="mt-5 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Information" className="lg:col-span-3">
            <FooterHeading>Information</FooterHeading>
            <ul className="mt-5 space-y-3">
              {INFORMATION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              {COMING_SOON_LINKS.map((label) => (
                <li key={label}>
                  <ComingSoonLink label={label} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <FooterHeading>Get in Touch</FooterHeading>
            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3">
                <Mail
                  className="mt-0.5 size-4 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <a
                    href="mailto:easyrent@gmail.com"
                    className="text-sm text-slate-300 transition-colors duration-200 hover:text-emerald-400"
                  >
                    easyrent@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-sm text-slate-300">Bangladesh</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-slate-500">
            © 2026 EasyRent. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 sm:justify-end">
            <ComingSoonLink label="Privacy Policy" />
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
            <ComingSoonLink label="Terms & Conditions" />
          </div>
        </div>
      </div>
    </footer>
  )
}
