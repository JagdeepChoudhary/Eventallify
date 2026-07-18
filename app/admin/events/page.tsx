"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

interface EventData {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  registrationDeadline: string;
  maxParticipants?: number | null;
  createdAt: string;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events?limit=100");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Event deleted");
        setEvents(events.filter((e) => e.id !== id));
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Events</h1>
          <p className="text-muted-foreground">Create, edit, and manage your events</p>
        </div>
        <Button asChild className="shadow-sm">
          <Link href="/admin/events/new">
            <Plus className="size-4 mr-2" />
            New Event
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 rounded-xl border bg-card">
          <Calendar className="mx-auto size-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No events yet.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/events/new">Create Your First Event</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const isPast = new Date(event.date) < new Date();
            return (
              <div
                key={event.id}
                className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 sm:p-5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{event.title}</h3>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {event.category}
                    </Badge>
                    {isPast && <Badge variant="destructive" className="text-xs">Past</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {format(new Date(event.date), "MMM dd, yyyy")}
                    </span>
                    <span>{event.venue}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                  >
                    <Pencil className="size-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="size-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
