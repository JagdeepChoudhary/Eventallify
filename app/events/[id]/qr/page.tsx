"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, Calendar, MapPin, Shield, Lock } from "lucide-react";
import { format } from "date-fns";
import { authClient } from "@/lib/auth-client";

interface EventData {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  imageUrl?: string | null;
  description: string;
}

export default function EventQRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const { data: session, isPending: sessionPending } = authClient.useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    if (!event) return;
    setGenerating(true);
    const baseUrl = window.location.origin;
    const eventUrl = `${baseUrl}/events/${event.id}?qr=1`;

    QRCode.toDataURL(eventUrl, {
      width: 512,
      margin: 3,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        setQrDataUrl(url);
        setGenerating(false);
      })
      .catch(() => setGenerating(false));
  }, [event]);

  const handleDownload = () => {
    if (!qrDataUrl || !event) return;
    const link = document.createElement("a");
    link.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!event) return;
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/events/${event.id}?qr=1`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Register for ${event.title}!`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (loading || sessionPending || !event) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="aspect-square rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="p-12 text-center space-y-6">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="size-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Access Restricted</h2>
              <p className="text-muted-foreground mt-2">
                Event QR codes can only be viewed and shared by administrators.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact an admin to get the QR code for this event.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/events/${id}`}>View Event Details</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <Badge variant="secondary" className="capitalize">
            {event.category}
          </Badge>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-4" />
              {format(new Date(event.date), "MMM dd, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-4" />
              {event.venue}
            </span>
          </div>
        </div>

        <div className="border-t p-8 flex flex-col items-center space-y-6">
          <p className="text-sm text-muted-foreground font-medium">
            Scan to register
          </p>

          {generating ? (
            <div className="size-64 rounded-xl bg-muted animate-pulse flex items-center justify-center">
              <span className="text-sm text-muted-foreground">
                Generating QR...
              </span>
            </div>
          ) : qrDataUrl ? (
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <img
                src={qrDataUrl}
                alt="Event registration QR code"
                className="size-56 sm:size-64"
              />
            </div>
          ) : (
            <div className="size-64 rounded-xl bg-muted flex items-center justify-center">
              <span className="text-sm text-destructive">
                Failed to generate QR
              </span>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1"
              disabled={!qrDataUrl}
            >
              <Download className="size-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleShare} className="flex-1">
              <Share2 className="size-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
