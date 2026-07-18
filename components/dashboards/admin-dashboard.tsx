"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Calendar,
  Users,
  Megaphone,
  TrendingUp,
  Plus,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const CATEGORIES = [
  "workshop",
  "seminar",
  "cultural",
  "sports",
  "tech",
  "hackathon",
  "social",
  "general",
];

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalUsers: number;
  totalAnnouncements: number;
  registrationsByEvent: { eventTitle: string; count: number }[];
  categoryCounts: { category: string; count: number }[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [showEventForm, setShowEventForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    category: "general",
    registrationDeadline: "",
  });

  const [annForm, setAnnForm] = useState({
    title: "",
    content: "",
    priority: "normal",
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) setStats(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...eventForm,
          endDate: null,
          imageUrl: null,
          maxParticipants: null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }
      toast.success("Event created!");
      setEventForm({
        title: "",
        description: "",
        date: "",
        venue: "",
        category: "general",
        registrationDeadline: "",
      });
      setShowEventForm(false);
      fetchStats();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setEventLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(annForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create announcement");
      }
      toast.success("Announcement published!");
      setAnnForm({ title: "", content: "", priority: "normal" });
      setShowAnnouncementForm(false);
      fetchStats();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAnnouncementLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your events platform</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="size-4 mr-2" />
            New Event
          </Link>
        </Button>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Events", value: stats.totalEvents, icon: Calendar, color: "text-blue-500" },
              { label: "Upcoming", value: stats.upcomingEvents, icon: TrendingUp, color: "text-green-500" },
              { label: "Registrations", value: stats.totalRegistrations, icon: Users, color: "text-purple-500" },
              { label: "Users", value: stats.totalUsers, icon: Users, color: "text-orange-500" },
              { label: "Announcements", value: stats.totalAnnouncements, icon: Megaphone, color: "text-pink-500" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`size-8 ${stat.color} opacity-30`} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="flex w-full items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Calendar className="size-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Event</h3>
                    <p className="text-sm text-muted-foreground">Add a new event</p>
                  </div>
                </div>
                {showEventForm ? <ChevronUp className="size-5 text-muted-foreground" /> : <ChevronDown className="size-5 text-muted-foreground" />}
              </button>
              {showEventForm && (
                <form onSubmit={handleCreateEvent} className="border-t p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title *</label>
                    <input
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Event title"
                      required
                      className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description *</label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Describe your event..."
                      required
                      rows={3}
                      className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date & Time *</label>
                      <input
                        type="datetime-local"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        required
                        className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Deadline *</label>
                      <input
                        type="datetime-local"
                        value={eventForm.registrationDeadline}
                        onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                        required
                        className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Venue *</label>
                      <input
                        value={eventForm.venue}
                        onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                        placeholder="e.g., Main Auditorium"
                        required
                        className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category *</label>
                      <select
                        value={eventForm.category}
                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                        className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c} className="capitalize">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={eventLoading} size="sm">
                      {eventLoading ? "Creating..." : "Create Event"}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowEventForm(false)}>Cancel</Button>
                  </div>
                </form>
              )}
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                className="flex w-full items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-pink-500/10">
                    <Megaphone className="size-5 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Announcement</h3>
                    <p className="text-sm text-muted-foreground">Publish a new announcement</p>
                  </div>
                </div>
                {showAnnouncementForm ? <ChevronUp className="size-5 text-muted-foreground" /> : <ChevronDown className="size-5 text-muted-foreground" />}
              </button>
              {showAnnouncementForm && (
                <form onSubmit={handleCreateAnnouncement} className="border-t p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title *</label>
                    <input
                      value={annForm.title}
                      onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                      placeholder="Announcement title"
                      required
                      className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content *</label>
                    <textarea
                      value={annForm.content}
                      onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                      placeholder="Write your announcement..."
                      required
                      rows={4}
                      className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select
                      value={annForm.priority}
                      onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}
                      className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={announcementLoading} size="sm">
                      {announcementLoading ? "Publishing..." : "Publish Announcement"}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAnnouncementForm(false)}>Cancel</Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <BarChart3 className="size-5" />
                Top Events by Registration
              </h2>
              {stats.registrationsByEvent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No registrations yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.registrationsByEvent.map((item) => {
                    const maxCount = stats.registrationsByEvent[0]?.count || 1;
                    return (
                      <div key={item.eventTitle} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate font-medium">{item.eventTitle}</span>
                          <span className="text-muted-foreground">{item.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Calendar className="size-5" />
                Events by Category
              </h2>
              {stats.categoryCounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.categoryCounts.map((item) => {
                    const maxCount = Math.max(...stats.categoryCounts.map((c) => c.count));
                    return (
                      <div key={item.category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize font-medium">{item.category}</span>
                          <span className="text-muted-foreground">{item.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all"
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/admin/events", label: "Manage Events", icon: Calendar, desc: "Create, edit, delete events" },
              { href: "/admin/registrations", label: "Registrations", icon: Users, desc: "View all registrations" },
              { href: "/admin/announcements", label: "Announcements", icon: Megaphone, desc: "Publish announcements" },
              { href: "/admin/analytics", label: "Analytics", icon: BarChart3, desc: "View detailed analytics" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20"
              >
                <item.icon className="size-8 text-primary/40 group-hover:text-primary transition-colors mb-3" />
                <h3 className="font-semibold">{item.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
