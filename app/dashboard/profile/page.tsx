import type { Metadata } from "next"
import { Suspense } from "react"
import { ShieldCheck } from "lucide-react"

import GoogleLinkCard from "@/components/profile/GoogleLinkCard"
import ProfileForm, { type ProfileUser } from "@/components/profile/ProfileForm"
import { requireUser } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "My Profile | EasyRent",
  description: "View and update your EasyRent profile.",
}

export default async function ProfilePage() {
  const session = await requireUser()
  const user = session.user as typeof session.user & {
    phone?: string | null
    address?: string | null
  }

  const profileUser: ProfileUser = {
    name: user.name || "",
    email: user.email || "",
    image: user.image ?? null,
    phone: user.phone ?? "",
    address: user.address ?? "",
    role: typeof user.role === "string" ? user.role : "",
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div
        aria-hidden="true"
        className="absolute -top-32 right-0 -z-10 size-[28rem] rounded-full bg-emerald-100/50 blur-3xl"
      />

      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-linear-to-r from-white via-emerald-50/60 to-white px-5 py-6 shadow-sm sm:px-8 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[0.68rem] font-bold tracking-[0.16em] text-emerald-700 uppercase">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Account settings
              </span>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Profile
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Keep your personal details up to date so owners and support can
                reach you when it matters.
              </p>
            </div>

            <div className="hidden size-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 sm:flex">
              <ShieldCheck className="size-8" aria-hidden="true" />
            </div>
          </div>
        </header>

        <ProfileForm user={profileUser} />
        <Suspense fallback={null}>
          <GoogleLinkCard />
        </Suspense>
      </div>
    </main>
  )
}
