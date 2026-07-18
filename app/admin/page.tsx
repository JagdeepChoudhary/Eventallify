import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import {
  Calendar,
  Users,
  Megaphone,
  BarChart3,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const session = await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name || session.user.email}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your events, registrations, and announcements from here.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            href: "/admin/events/new",
            label: "Create Event",
            icon: Calendar,
            color: "from-blue-500 to-blue-600",
            description: "Add a new event",
          },
          {
            href: "/admin/registrations",
            label: "Registrations",
            icon: Users,
            color: "from-emerald-500 to-emerald-600",
            description: "Manage check-ins",
          },
          {
            href: "/admin/announcements",
            label: "Announce",
            icon: Megaphone,
            color: "from-amber-500 to-orange-500",
            description: "Post updates",
          },
          {
            href: "/admin/analytics",
            label: "Analytics",
            icon: BarChart3,
            color: "from-purple-500 to-purple-600",
            description: "View insights",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} text-white shadow-sm mb-3 transition-transform group-hover:scale-110`}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold text-sm">{card.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent activity hint */}
      <div className="rounded-xl border bg-muted/30 p-6">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="size-5 text-muted-foreground" />
          <h2 className="font-semibold">Quick Tips</h2>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="size-4 mt-0.5 text-green-500 shrink-0" />
            Use the sidebar to navigate between admin sections
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="size-4 mt-0.5 text-green-500 shrink-0" />
            Create events with all required fields for better discoverability
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="size-4 mt-0.5 text-green-500 shrink-0" />
            Use Check-in Mode in Registrations for quick QR scanning
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="size-4 mt-0.5 text-green-500 shrink-0" />
            Post announcements with priority levels for urgent updates
          </li>
        </ul>
      </div>
    </div>
  );
}
