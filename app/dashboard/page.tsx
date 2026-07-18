"use client";

import { authClient } from "@/lib/auth-client";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const role = (session.user as any).role;

  if (role === "admin") {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
}
