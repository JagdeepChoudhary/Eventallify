"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";

interface EventData {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events?limit=100&upcoming=true");
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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.date), day));

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">View events on a calendar</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7">
          {weekdays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-medium text-muted-foreground border-b"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={i}
                className={`min-h-[100px] border-b border-r p-2 last:border-r-0 ${
                  !inMonth ? "bg-muted/30" : ""
                } ${today ? "bg-primary/5" : ""}`}
              >
                <span
                  className={`text-sm ${
                    today
                      ? "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold"
                      : inMonth
                        ? ""
                        : "text-muted-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block rounded px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors truncate"
                    >
                      {event.title}
                    </Link>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="block text-xs text-muted-foreground px-1.5">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="font-semibold">
          Events in {format(currentMonth, "MMMM yyyy")}
        </h3>
        {events.filter((e) => isSameMonth(new Date(e.date), currentMonth))
          .length === 0 ? (
          <p className="text-sm text-muted-foreground">No events this month</p>
        ) : (
          <div className="space-y-3">
            {events
              .filter((e) => isSameMonth(new Date(e.date), currentMonth))
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[40px]">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.date), "MMM")}
                      </p>
                      <p className="text-lg font-bold">
                        {format(new Date(event.date), "dd")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {event.venue}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {event.category}
                  </Badge>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
