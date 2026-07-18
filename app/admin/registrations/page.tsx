"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Calendar,
  Users,
  Search,
  ScanLine,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

interface RegistrationData {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  registeredAt: string;
  userName: string;
  userEmail: string;
}

interface EventData {
  id: string;
  title: string;
  date: string;
  registrations: RegistrationData[];
}

export default function AdminRegistrationsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [checkinMode, setCheckinMode] = useState(false);
  const [checkinInput, setCheckinInput] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);
  const checkinInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const eventsRes = await fetch("/api/events?limit=100");
      if (!eventsRes.ok) return;

      const { events: eventsList } = await eventsRes.json();

      const eventsWithRegs = await Promise.all(
        eventsList.map(async (event: any) => {
          const regRes = await fetch(
            `/api/events/${event.id}/registrations`
          );
          const registrations = regRes.ok ? await regRes.json() : [];
          return { ...event, registrations };
        })
      );

      setEvents(eventsWithRegs);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (checkinMode && checkinInputRef.current) {
      checkinInputRef.current.focus();
    }
  }, [checkinMode]);

  const handleCheckin = async (eventId: string, registrationId?: string) => {
    setCheckinLoading(true);
    try {
      const body: any = {};
      if (registrationId) {
        body.registrationId = registrationId;
      } else if (checkinInput) {
        try {
          const parsed = JSON.parse(checkinInput);
          body.registrationQrData = parsed;
        } catch {
          body.registrationId = checkinInput.trim();
        }
      }

      if (!body.registrationId && !body.registrationQrData) {
        toast.error("Enter a registration ID or scan QR code");
        setCheckinLoading(false);
        return;
      }

      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Check-in failed");
      } else {
        toast.success(data.message || "Checked in!");
        setCheckinInput("");
        fetchData();
      }
    } catch {
      toast.error("Check-in failed");
    } finally {
      setCheckinLoading(false);
    }
  };

  const filteredEvents = events
    .filter((e) => selectedEvent === "all" || e.id === selectedEvent)
    .filter(
      (e) =>
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.registrations.some(
          (r) =>
            r.userName.toLowerCase().includes(search.toLowerCase()) ||
            r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
            r.id.toLowerCase().includes(search.toLowerCase())
        )
    );

  const totalRegs = events.reduce(
    (sum, e) => sum + e.registrations.length,
    0
  );
  const totalCheckedIn = events.reduce(
    (sum, e) =>
      sum + e.registrations.filter((r) => r.checkedIn).length,
    0
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
          <p className="text-muted-foreground">
            {totalRegs} registrations &middot; {totalCheckedIn} checked in
          </p>
        </div>
        <Button
          variant={checkinMode ? "destructive" : "default"}
          onClick={() => {
            setCheckinMode(!checkinMode);
            setCheckinInput("");
          }}
        >
          <ScanLine className="size-4 mr-2" />
          {checkinMode ? "Exit Check-in" : "Check-in Mode"}
        </Button>
      </div>

      {checkinMode && (
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ScanLine className="size-5 text-primary" />
            Check-in Mode Active
          </div>
          <div className="flex gap-3">
            <input
              ref={checkinInputRef}
              type="text"
              value={checkinInput}
              onChange={(e) => setCheckinInput(e.target.value)}
              placeholder="Paste registration ID or QR data, then press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter" && checkinInput && selectedEvent !== "all") {
                  handleCheckin(selectedEvent);
                }
              }}
              className="flex h-10 flex-1 rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              onClick={() => {
                if (selectedEvent !== "all") {
                  handleCheckin(selectedEvent);
                } else {
                  toast.error("Select an event first");
                }
              }}
              disabled={checkinLoading || !checkinInput}
            >
              {checkinLoading ? "Checking in..." : "Check In"}
            </Button>
          </div>
          {selectedEvent === "all" && (
            <p className="text-sm text-muted-foreground">
              Select a specific event from the filter above to enable check-in.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or registration ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="flex h-10 rounded-lg border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Events</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title} ({e.registrations.length})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.date), "MMM dd, yyyy")} &middot;{" "}
                  {event.registrations.length} registrations &middot;{" "}
                  {event.registrations.filter((r) => r.checkedIn).length}{" "}
                  checked in
                </p>
              </div>
              <Badge variant="secondary">
                <Users className="size-3 mr-1" />
                {event.registrations.length}
              </Badge>
            </div>

            {event.registrations.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No registrations yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Registered</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Check-in</th>
                      {checkinMode && (
                        <th className="p-4 font-medium">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {event.registrations.map((reg) => (
                      <tr
                        key={reg.id}
                        className="border-b last:border-b-0"
                      >
                        <td className="p-4 font-medium">{reg.userName}</td>
                        <td className="p-4 text-muted-foreground">
                          {reg.userEmail}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {format(
                            new Date(reg.registeredAt),
                            "MMM dd, yyyy"
                          )}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              reg.status === "confirmed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {reg.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {reg.checkedIn ? (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="size-4" />
                              <span className="text-xs">
                                {reg.checkedInAt
                                  ? format(
                                      new Date(reg.checkedInAt),
                                      "HH:mm"
                                    )
                                  : "Yes"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <XCircle className="size-4" />
                              <span className="text-xs">No</span>
                            </div>
                          )}
                        </td>
                        {checkinMode && (
                          <td className="p-4">
                            {!reg.checkedIn && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleCheckin(event.id, reg.id)
                                }
                                disabled={checkinLoading}
                              >
                                Check In
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
