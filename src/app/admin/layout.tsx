"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { adminNavigation } from "@/config/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "280px",
          "--sidebar-width-mobile": "280px",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        navigation={adminNavigation}
        logo={{ name: "Devakent LMS", subtitle: "Hastane Yönetimi" }}
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.department || "Admin",
          avatarUrl: session.user.avatarUrl || undefined,
        }}
      />
      <SidebarInset>
        <Topbar
          title="Yönetim Paneli"
          user={{
            name: session.user.name,
            email: session.user.email,
            avatarUrl: session.user.avatarUrl || undefined,
            role: session.user.role,
          }}
        />
        <main className="app-bg flex-1 px-6 py-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
