"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Megaphone,
  BarChart3,
  Settings,
  ArrowLeft,
  Shield,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/registrations", label: "Registrations", icon: Users },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-card/50">
      {/* Back link */}
      <div className="border-b px-4 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Admin badge */}
      <div className="border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
            <Shield className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Admin Panel</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.name || user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {adminNav.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon
                className={`size-4 transition-transform duration-150 group-hover:scale-110 ${
                  active ? "text-primary-foreground" : ""
                }`}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className="border-t px-4 py-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Admin actions are logged for audit purposes.
        </p>
      </div>
    </aside>
  );
}
