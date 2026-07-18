"use client";

import { useEffect, useState, useCallback } from "react";

interface AnalyticsData {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalUsers: number;
  totalAnnouncements: number;
  registrationsByEvent: { eventTitle: string; count: number }[];
  categoryCounts: { category: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) setData(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 rounded-xl bg-muted" />
            <div className="h-80 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxReg = Math.max(...data.registrationsByEvent.map((r) => r.count), 1);
  const maxCat = Math.max(...data.categoryCounts.map((c) => c.count), 1);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Platform insights and statistics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Events", value: data.totalEvents },
          { label: "Upcoming", value: data.upcomingEvents },
          { label: "Registrations", value: data.totalRegistrations },
          { label: "Users", value: data.totalUsers },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-6 text-center">
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Registrations per Event</h2>
          {data.registrationsByEvent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-4">
              {data.registrationsByEvent.map((item) => (
                <div key={item.eventTitle} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate">{item.eventTitle}</span>
                    <span className="text-muted-foreground font-mono">{item.count}</span>
                  </div>
                  <div className="h-8 rounded-lg bg-muted overflow-hidden relative">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-primary/60 to-primary transition-all duration-500 flex items-center justify-end pr-3"
                      style={{
                        width: `${Math.max((item.count / maxReg) * 100, 8)}%`,
                      }}
                    >
                      {item.count > 0 && (
                        <span className="text-xs font-medium text-primary-foreground">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Events by Category</h2>
          {data.categoryCounts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-4">
              {data.categoryCounts.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{item.category}</span>
                    <span className="text-muted-foreground font-mono">{item.count}</span>
                  </div>
                  <div className="h-8 rounded-lg bg-muted overflow-hidden relative">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-purple-500/60 to-purple-500 transition-all duration-500 flex items-center justify-end pr-3"
                      style={{
                        width: `${Math.max((item.count / maxCat) * 100, 8)}%`,
                      }}
                    >
                      {item.count > 0 && (
                        <span className="text-xs font-medium text-white">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold text-lg mb-4">Registration Funnel</h2>
        <div className="flex items-end justify-center gap-8 h-48">
          {[
            { label: "Total Users", value: data.totalUsers, color: "bg-blue-500" },
            { label: "Total Events", value: data.totalEvents, color: "bg-green-500" },
            { label: "Registrations", value: data.totalRegistrations, color: "bg-purple-500" },
            { label: "Announcements", value: data.totalAnnouncements, color: "bg-orange-500" },
          ].map((bar) => {
            const maxVal = Math.max(
              data.totalUsers,
              data.totalEvents,
              data.totalRegistrations,
              data.totalAnnouncements,
              1
            );
            return (
              <div key={bar.label} className="flex flex-col items-center gap-2">
                <span className="text-sm font-mono font-bold">{bar.value}</span>
                <div
                  className={`w-16 rounded-t-lg ${bar.color} transition-all duration-500`}
                  style={{
                    height: `${Math.max((bar.value / maxVal) * 150, 4)}px`,
                  }}
                />
                <span className="text-xs text-muted-foreground text-center">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
