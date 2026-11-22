"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  FaArrowRight,
  FaBars,
  FaCalendarAlt,
  FaChevronRight,
  FaHeart,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTimes,
  FaTools,
} from "react-icons/fa"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authClient } from "@/lib/auth-client"
import { PROFILE_UPDATED_EVENT } from "@/lib/profile-events"
import { cn } from "@/lib/utils"
import { getDashboardPath } from "@/lib/roles"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "All Equipment", href: "/all-equipment" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const

function isActivePath(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`)
}

function getInitials(name?: string | null) {
  if (!name) {
    return "ER"
  }

  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ER"
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending, refetch } = authClient.useSession()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const user = session?.user
  const displayName = user?.name || user?.email || "EasyRent user"
  const initials = getInitials(user?.name || user?.email)
  const dashboardHref = getDashboardPath(user?.role) ?? "/login"

  // Profile edits happen in a Server Action, so refresh the client session
  // here to show the new picture immediately (desktop + mobile avatars).
  useEffect(() => {
    function handleProfileUpdated() {
      void refetch()
    }

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated)

    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated)
    }
  }, [refetch])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMobileMenuOpen])

  async function handleLogout() {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await authClient.signOut()
      setIsMobileMenuOpen(false)
      router.push("/")
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        <div className="flex min-w-0 flex-1 items-center">
          <Link
            href="/"
            aria-label="EasyRent home"
            onClick={() => setIsMobileMenuOpen(false)}
            className="group inline-flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 transition-colors duration-200 group-hover:bg-emerald-700">
              <FaTools aria-hidden="true" className="size-[18px]" />
            </span>
            <span className="truncate text-[1.35rem] leading-none font-bold tracking-[-0.02em] text-slate-900">
              Easy<span className="text-emerald-600">Rent</span>
            </span>
          </Link>
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {navLinks.map((link) => {
            const isActive = isActivePath(pathname, link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden flex-1 items-center justify-end gap-2.5 lg:flex">
          {isPending ? (
            <div className="flex items-center gap-2.5" aria-hidden="true">
              <div className="h-10 w-28 animate-pulse rounded-full bg-slate-100" />
              <div className="size-10 animate-pulse rounded-full bg-slate-100" />
            </div>
          ) : user ? (
            <>
              <Link
                href={dashboardHref}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <FaTachometerAlt aria-hidden="true" className="size-3.5" />
                Dashboard
              </Link>

              <Link
                href="/dashboard/profile"
                aria-label={`View ${displayName}'s profile`}
                title={displayName}
                className="relative rounded-full transition-shadow duration-200 hover:ring-2 hover:ring-emerald-600/25 hover:ring-offset-2 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Avatar className="size-10 border border-slate-200">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-emerald-50 text-xs font-bold text-emerald-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500"
                />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSignOutAlt aria-hidden="true" className="size-3.5" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-colors duration-200 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Register
                <FaArrowRight aria-hidden="true" className="size-3" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={
            isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none lg:hidden"
        >
          {isMobileMenuOpen ? (
            <FaTimes aria-hidden="true" className="size-[18px]" />
          ) : (
            <FaBars aria-hidden="true" className="size-[18px]" />
          )}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-slate-200/80 bg-white shadow-lg shadow-slate-900/5 lg:hidden"
        >
          <div className="mx-auto flex max-h-[calc(100dvh-4rem)] w-full max-w-7xl flex-col overflow-y-auto px-4 py-4 sm:px-6">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = isActivePath(pathname, link.href)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-[0.95rem] font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none",
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {link.label}
                    {isActive ? (
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-emerald-600"
                      />
                    ) : (
                      <FaChevronRight
                        aria-hidden="true"
                        className="size-3 text-slate-300"
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="my-3 h-px w-full bg-slate-100" />

            {isPending ? (
              <div className="flex items-center gap-3" aria-hidden="true">
                <div className="size-10 animate-pulse rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-2.5 w-44 animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
            ) : user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 transition-colors duration-200 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                >
                  <Avatar className="size-10 border border-slate-200">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="bg-emerald-50 text-xs font-bold text-emerald-700">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </span>
                    {user.email ? (
                      <span className="block truncate text-xs text-slate-500">
                        {user.email}
                      </span>
                    ) : null}
                  </span>
                  <FaChevronRight
                    aria-hidden="true"
                    className="size-3 shrink-0 text-slate-400"
                  />
                </Link>

                <Link
                  href={dashboardHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-colors duration-200 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <FaTachometerAlt aria-hidden="true" className="size-3.5" />
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaSignOutAlt aria-hidden="true" className="size-3.5" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-colors duration-200 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Register
                  <FaArrowRight aria-hidden="true" className="size-3" />
                </Link>
              </div>
            )}

            <div className="mt-4 flex items-center gap-4 px-1 text-[0.7rem] font-medium tracking-wide text-slate-400 uppercase">
              <span className="inline-flex items-center gap-1.5">
                <FaCalendarAlt aria-hidden="true" className="size-3" />
                Flexible rentals
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FaHeart aria-hidden="true" className="size-3" />
                Trusted gear
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
