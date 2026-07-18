"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Calendar,
  LayoutDashboard,
  Shield,
  Settings,
  Users,
  BarChart3,
  User,
  LogOut,
  Sun,
  Moon,
  Megaphone,
  ChevronDown,
  Loader2,
  Ticket,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";

type IconType = React.ComponentType<{ className?: string }>;

interface NavLink {
  href: string;
  label: string;
  icon: IconType;
  highlight?: boolean;
}

// Links every signed-in user sees, regardless of role
const primaryLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
];

// Admin dropdown links — these now route through the admin layout with sidebar
const adminLinks: NavLink[] = [
  { href: "/admin", label: "Admin Overview", icon: LayoutDashboard },
  { href: "/admin/events", label: "Manage Events", icon: Settings },
  { href: "/admin/registrations", label: "Registrations", icon: Users },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const guestLinks: NavLink[] = [
  { href: "/events", label: "Events", icon: Calendar, highlight: false },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

function getInitials(name?: string | null, email?: string | null) {
  if (name && name.trim().length > 0) {
    return name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email && email.trim().length > 0) {
    return email.trim().charAt(0).toUpperCase();
  }
  return "U";
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const isAdmin = (user as any)?.role === "admin";

  // Close mobile menu automatically on navigation
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
    setAdminMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile panel is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(e.target as Node)
      ) {
        setAdminMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close dropdowns/mobile panel on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAccountOpen(false);
        setAdminMenuOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Check if any admin link is active
  const isOnAdminPage = adminLinks.some((l) => isActive(l.href));
  const links = user ? primaryLinks : guestLinks;

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Calendar className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">Eventallify</span>
        </Link>

        {/* Desktop primary nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {link.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* Admin dropdown */}
          {user && isAdmin && (
            <div className="relative ml-2" ref={adminMenuRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={adminMenuOpen}
                onClick={() => setAdminMenuOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  adminMenuOpen || isOnAdminPage
                    ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                }`}
              >
                <Shield className="size-4" />
                Admin
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${adminMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {adminMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border bg-popover shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
                >
                  <div className="border-b bg-gradient-to-r from-amber-500/5 to-orange-500/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Admin Tools
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    {adminLinks.map((link) => {
                      const Icon = link.icon;
                      const active = isActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          role="menuitem"
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            active
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <Icon className="size-4 shrink-0" />
                          {link.label}
                          {active && (
                            <div className="ml-auto size-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            onClick={toggle}
            className="rounded-lg"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isPending ? (
            <div className="size-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label="Account menu"
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm font-medium hover:bg-muted transition-all duration-150"
              >
                <div className="relative flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xs ring-2 ring-background transition-shadow hover:ring-primary/20">
                  {getInitials(user.name, user.email)}
                  {isAdmin && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-amber-500 ring-2 ring-background">
                      <Shield className="size-2 text-white" />
                    </span>
                  )}
                </div>
                <span className="max-w-[100px] truncate hidden xl:inline">
                  {user.name || user.email}
                </span>
                <ChevronDown
                  className={`size-3.5 text-muted-foreground transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border bg-popover shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
                >
                  <div className="border-b px-4 py-3">
                    <p className="truncate text-sm font-semibold">
                      {user.name || "Unnamed user"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground mt-0.5">
                      {user.email}
                    </p>
                    {isAdmin && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <Shield className="size-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="size-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </div>
                  <div className="border-t py-1">
                    <button
                      type="button"
                      role="menuitem"
                      disabled={loggingOut}
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-60"
                    >
                      {loggingOut ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <LogOut className="size-4" />
                      )}
                      {loggingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="px-4">
                <Link href="/register">
                  Get Started
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            onClick={toggle}
            className="rounded-lg"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg"
          >
            {mobileOpen ? (
              <X className="size-5 transition-transform" />
            ) : (
              <Menu className="size-5 transition-transform" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        className={`md:hidden overflow-hidden border-t bg-background/95 backdrop-blur-xl transition-[max-height] duration-300 ease-out ${
          mobileOpen
            ? "max-h-[calc(100vh-4rem)] overflow-y-auto"
            : "max-h-0 border-t-0"
        }`}
      >
        <div className="px-4 pb-6 pt-4 space-y-4">
          {/* User card (logged in) */}
          {user && (
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 border border-border/50">
              <div className="relative flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                {getInitials(user.name, user.email)}
                {isAdmin && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-amber-500 ring-2 ring-background">
                    <Shield className="size-2 text-white" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user.name || user.email}
                </p>
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      <Shield className="size-2.5" />
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main navigation */}
          <div>
            <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Navigation
            </p>
            <div className="space-y-0.5">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    {link.label}
                    {active && (
                      <div className="ml-auto size-1.5 rounded-full bg-primary-foreground/50" />
                    )}
                  </Link>
                );
              })}

              {!user && (
                <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
                >
                  <User className="size-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Admin tools (mobile) */}
          {user && isAdmin && (
            <div>
              <div className="flex items-center gap-2 px-1 pb-1.5">
                <Shield className="size-3 text-amber-600 dark:text-amber-400" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Admin Tools
                </p>
              </div>
              <div className="space-y-0.5 rounded-xl border bg-muted/20 p-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="size-4" />
                      {link.label}
                      {active && (
                        <div className="ml-auto size-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          {user ? (
            <div className="space-y-2 pt-2 border-t">
              <Button
                variant="outline"
                asChild
                className="w-full justify-start gap-2"
              >
                <Link href="/profile">
                  <User className="size-4" />
                  Profile
                </Link>
              </Button>
              <Button
                variant="destructive"
                disabled={loggingOut}
                onClick={handleLogout}
                className="w-full justify-start gap-2"
              >
                {loggingOut ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                {loggingOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          ) : (
            !isPending && (
              <div className="space-y-2 pt-2 border-t">
                <Button asChild className="w-full">
                  <Link href="/register">
                    <Sparkles className="size-4 mr-2" />
                    Get Started Free
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
