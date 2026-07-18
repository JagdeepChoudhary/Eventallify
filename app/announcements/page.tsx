"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";
import { format } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
}

function getPriorityColor(p: string) {
  if (p === "urgent")
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  if (p === "important")
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) setAnnouncements(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest news
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-20 rounded-xl border bg-card">
          <Megaphone className="mx-auto size-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="rounded-xl border bg-card p-6 space-y-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getPriorityColor(ann.priority)}>
                    {ann.priority}
                  </Badge>
                  <h2 className="font-semibold text-lg">{ann.title}</h2>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(ann.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
              <p className="text-muted-foreground whitespace-pre-line">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
