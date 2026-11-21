import type { Metadata } from "next";

import ProfileForm, { type ProfileUser } from "@/components/profile/ProfileForm";
import { requireUser } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "My Profile | EasyRent",
  description: "View and update your EasyRent profile.",
};

export default async function ProfilePage() {
  const session = await requireUser();
  const user = session.user as typeof session.user & {
    phone?: string | null;
    address?: string | null;
  };

  const profileUser: ProfileUser = {
    name: user.name || "",
    email: user.email || "",
    image: user.image ?? null,
    phone: user.phone ?? "",
    address: user.address ?? "",
    role: typeof user.role === "string" ? user.role : "",
  };

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header>
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-600 uppercase">
            Account settings
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your personal information and profile photo.
          </p>
        </header>

        <ProfileForm user={profileUser} />
      </div>
    </main>
  );
}
