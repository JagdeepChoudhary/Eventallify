"use client";

import { useEffect, useState, useCallback, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  CheckCircle2,
  QrCode,
  XCircle,
  Share2,
  Download,
  ExternalLink,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { authClient } from "@/lib/auth-client";

interface EventDetail {
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
  createdBy: string;
  createdAt: string;
  registrationCount: number;
}

interface Registration {
  id: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string | null;
}

function EventDetailContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromQR = searchParams.get("qr") === "1";

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showPersonalQR, setShowPersonalQR] = useState(false);
  const [personalQR, setPersonalQR] = useState<string | null>(null);

  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const fetchEvent = useCallback(async () => {
    try {
      const [eventRes] = await Promise.all([fetch(`/api/events/${eventId}`)]);

      if (eventRes.ok) {
        const data = await eventRes.json();
        setEvent(data);
      }

      const regsRes = await fetch("/api/registrations");
      if (regsRes.ok) {
        const regs = await regsRes.json();
        const myReg = regs.find((r: any) => r.eventId === eventId);
        if (myReg) {
          setRegistration(myReg);
          if (isFromQR) {
            toast.info("You're already registered for this event!");
          }
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [eventId, isFromQR]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setRegistration(data);
      toast.success("Registered successfully! Your QR ticket is ready.");
      setShowPersonalQR(true);
      fetchEvent();
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setRegistering(false);
    }
  };

  const handleQuickRegister = async () => {
    setRegistering(true);
    try {
      const res = await fetch(`/api/events/${eventId}/qr-register`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.loginUrl) {
          toast.info("Please sign in first");
          router.push(data.loginUrl);
          return;
        }
        throw new Error(data.error || "Registration failed");
      }

      setRegistration(data.registration);
      toast.success(data.message || "Registered successfully!");
      setShowPersonalQR(true);
      fetchEvent();
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!registration) return;
    if (!confirm("Are you sure you want to cancel this registration?"))
      return;

    try {
      const res = await fetch(
        `/api/registrations?registrationId=${registration.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to cancel");

      setRegistration(null);
      setShowPersonalQR(false);
      toast.success("Registration cancelled");
      fetchEvent();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel");
    }
  };

  const handleShareEvent = async () => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/events/${eventId}?qr=1`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: `Check out this event: ${event?.title}`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Event link copied to clipboard!");
    }
  };

  const handleDownloadQR = () => {
    if (!personalQR || !event) return;
    const link = document.createElement("a");
    link.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}-ticket.png`;
    link.href = personalQR;
    link.click();
  };

  const fetchPersonalQR = async () => {
    if (!registration) return;
    try {
      const res = await fetch(`/api/registrations/${registration.id}/qr`);
      if (res.ok) {
        const data = await res.json();
        setPersonalQR(data.qrCode);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 text-center py-20">
        <p className="text-muted-foreground">Event not found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const isPast = new Date(event.date) < new Date();
  const isDeadlinePassed =
    new Date(event.registrationDeadline) < new Date();
  const isFull =
    event.maxParticipants !== null &&
    event.maxParticipants !== undefined &&
    event.registrationCount >= event.maxParticipants;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {isFromQR && !registration && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
          <QrCode className="size-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Scanned QR Code</p>
            <p className="text-sm text-muted-foreground">
              Register below to sign up for this event
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="rounded-xl overflow-hidden border bg-card">
        <div className="relative h-64 sm:h-80 bg-muted">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Calendar className="size-16 text-primary/30" />
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {event.category}
            </Badge>
            {isPast && <Badge variant="destructive">Past Event</Badge>}
            {isDeadlinePassed && !isPast && (
              <Badge
                variant="outline"
                className="text-destructive border-destructive/30"
              >
                Registration Closed
              </Badge>
            )}
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              {event.title}
            </h1>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShareEvent}
              className="shrink-0"
            >
              <Share2 className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="size-5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">
                  {format(
                    new Date(event.date),
                    "EEEE, MMMM dd, yyyy"
                  )}
                </p>
                <p>
                  {format(new Date(event.date), "hh:mm a")}
                  {event.endDate &&
                    ` - ${format(
                      new Date(event.endDate),
                      "hh:mm a"
                    )}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="size-5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">
                  {event.venue}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="size-5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">
                  Registration Deadline
                </p>
                <p>
                  {format(
                    new Date(event.registrationDeadline),
                    "MMM dd, yyyy 'at' hh:mm a"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="size-5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">
                  {event.registrationCount} registered
                  {event.maxParticipants
                    ? ` / ${event.maxParticipants} spots`
                    : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground">
            {event.description.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="border-t pt-6 space-y-4">
            {registration ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-3 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20">
                    <div className="flex size-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                      <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">
                        You&apos;re registered!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Registered on {format(new Date(registration.registeredAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!showPersonalQR) {
                        fetchPersonalQR();
                      }
                      setShowPersonalQR(!showPersonalQR);
                    }}
                    className="shrink-0"
                  >
                    <QrCode className="size-4 mr-2" />
                    {showPersonalQR ? "Hide" : "My"} Ticket
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    className="shrink-0"
                    disabled={registration.checkedIn}
                  >
                    <XCircle className="size-4 mr-2" />
                    Cancel
                  </Button>
                </div>

                {showPersonalQR && personalQR && (
                  <div className="flex justify-center p-6 rounded-xl border bg-card">
                    <div className="text-center space-y-4">
                      <p className="font-semibold text-lg">
                        Your Registration Ticket
                      </p>
                      <div className="rounded-xl bg-white p-4 shadow-lg inline-block">
                        <img
                          src={personalQR}
                          alt="Registration QR Code"
                          className="size-48"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Show this QR code at the event entrance
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Registration ID: {registration.id.slice(0, 8)}...
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadQR}
                      >
                        <Download className="size-4 mr-2" />
                        Download Ticket
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={isFromQR ? handleQuickRegister : handleRegister}
                  disabled={registering || isPast || isDeadlinePassed || isFull}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
                >
                  {registering
                    ? "Registering..."
                    : isPast
                      ? "Event Ended"
                      : isDeadlinePassed
                        ? "Registration Closed"
                        : isFull
                          ? "Event Full"
                          : isFromQR
                            ? "Quick Register via QR"
                            : "Register for This Event"}
                </Button>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/events/${eventId}/qr`}>
                        <Shield className="size-4 mr-2" />
                        Admin: Event QR Code
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 rounded bg-muted" />
            <div className="h-64 rounded-xl bg-muted" />
          </div>
        </div>
      }
    >
      <EventDetailContent eventId={id} />
    </Suspense>
  );
}
