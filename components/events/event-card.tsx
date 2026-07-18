"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, ArrowRight, QrCode, Ticket } from "lucide-react";
import { format } from "date-fns";
import { authClient } from "@/lib/auth-client";

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string | null;
  venue: string;
  category: string;
  imageUrl?: string | null;
  registrationDeadline: string;
  maxParticipants?: number | null;
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

export function EventCard({ event }: { event: EventData }) {
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const isPast = new Date(event.date) < new Date();
  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();

  return (
    <div className="group rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden bg-muted">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
            <Calendar className="size-12 text-primary/30" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isPast && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <Badge variant="destructive" className="text-sm px-4 py-1.5">Past Event</Badge>
          </div>
        )}
      </div>
      <div className="p-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className={getCategoryColor(event.category)}>
            {event.category}
          </Badge>
          {isDeadlinePassed ? (
            <Badge variant="outline" className="text-destructive border-destructive/30">
              Registration Closed
            </Badge>
          ) : (
            <Badge variant="outline" className="text-green-600 border-green-300 dark:text-green-400 dark:border-green-700">
              Open
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {event.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" />
            <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" />
            <span>{format(new Date(event.date), "hh:mm a")}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          {event.maxParticipants && (
            <div className="flex items-center gap-2">
              <Users className="size-4 shrink-0" />
              <span>Max {event.maxParticipants} participants</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button asChild className="flex-1 group/btn" size="sm">
            <Link href={`/events/${event.id}`}>
              <Ticket className="size-4 mr-2" />
              View Details
              <ArrowRight className="size-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
          {isAdmin && (
            <Button asChild variant="outline" size="icon" className="shrink-0" title="Admin: View Event QR">
              <Link href={`/events/${event.id}/qr`}>
                <QrCode className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
