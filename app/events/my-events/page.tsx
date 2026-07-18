"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventSkeleton } from "@/components/skeletons";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  QrCode,
  ArrowRight,
  Download,
  Ticket,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface MyRegistration {
  registrationId: string;
  status: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  registeredAt: string;
  eventId: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  venue: string;
  category: string;
  imageUrl: string | null;
  registrationDeadline: string;
  maxParticipants: number | null;
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    workshop: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    seminar: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    cultural: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    sports: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    tech: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    social: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    hackathon: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    general: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  };
  return colors[category] || colors.general;
}

export default function MyEventsPage() {
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [showQR, setShowQR] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await fetch("/api/my-registrations");
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const now = new Date();
  const filtered = registrations.filter((r) => {
    const eventDate = new Date(r.date);
    if (filter === "upcoming") return eventDate >= now;
    if (filter === "past") return eventDate < now;
    return true;
  });

  const upcomingCount = registrations.filter(
    (r) => new Date(r.date) >= now
  ).length;
  const pastCount = registrations.filter(
    (r) => new Date(r.date) < now
  ).length;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <EventSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
        <p className="text-muted-foreground">
          Events you&apos;ve registered for
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-xl border p-4 text-left transition-colors ${
            filter === "all"
              ? "border-primary bg-primary/5"
              : "hover:bg-muted/50"
          }`}
        >
          <p className="text-2xl font-bold">{registrations.length}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </button>
        <button
          onClick={() => setFilter("upcoming")}
          className={`rounded-xl border p-4 text-left transition-colors ${
            filter === "upcoming"
              ? "border-primary bg-primary/5"
              : "hover:bg-muted/50"
          }`}
        >
          <p className="text-2xl font-bold">{upcomingCount}</p>
          <p className="text-sm text-muted-foreground">Upcoming</p>
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`rounded-xl border p-4 text-left transition-colors ${
            filter === "past"
              ? "border-primary bg-primary/5"
              : "hover:bg-muted/50"
          }`}
        >
          <p className="text-2xl font-bold">{pastCount}</p>
          <p className="text-sm text-muted-foreground">Past</p>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Ticket className="mx-auto size-12 mb-4 opacity-40" />
          <p className="text-lg">
            {registrations.length === 0
              ? "You haven't registered for any events yet"
              : "No events in this category"}
          </p>
          {registrations.length === 0 && (
            <Button asChild variant="link" className="mt-2">
              <Link href="/events">
                Browse Events <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((reg) => {
            const isPast = new Date(reg.date) < now;

            return (
              <div
                key={reg.registrationId}
                className="group rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/20"
              >
                <div className="relative h-44 overflow-hidden bg-muted">
                  {reg.imageUrl ? (
                    <img
                      src={reg.imageUrl}
                      alt={reg.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Calendar className="size-12 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="secondary" className={getCategoryColor(reg.category)}>
                      {reg.category}
                    </Badge>
                    {isPast && (
                      <Badge variant="destructive">Past</Badge>
                    )}
                  </div>
                  {reg.checkedIn && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                        <CheckCircle2 className="size-3 mr-1" />
                        Checked In
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {reg.title}
                  </h3>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 shrink-0" />
                      <span>{format(new Date(reg.date), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 shrink-0" />
                      <span>{format(new Date(reg.date), "hh:mm a")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0" />
                      <span className="truncate">{reg.venue}</span>
                    </div>
                  </div>

                  <div className="pt-1 text-xs text-muted-foreground">
                    Registered {format(new Date(reg.registeredAt), "MMM dd, yyyy")}
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1" size="sm">
                      <Link href={`/events/${reg.eventId}`}>
                        View Details <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                    >
                      <Link
                        href={`/events/${reg.eventId}/qr`}
                        title="Event QR Code"
                      >
                        <QrCode className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
