import DashBoardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { requireUser } from "@/lib/auth-server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Every route under /dashboard requires a verified Better Auth session.
  await requireUser();

  return (
    <SidebarProvider className="min-h-[calc(100svh-4rem)]! lg:min-h-[calc(100svh-4.5rem)]!">
      <DashBoardSidebar />
      <main>{children}</main>
    </SidebarProvider>
  );
}
