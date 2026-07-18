import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, registrations, announcements, user } from "@/db/schema";
import { sql, eq, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalEvents = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events);

    const upcomingEvents = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(gte(events.date, new Date()));

    const totalRegistrations = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(registrations);

    const totalUsers = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user);

    const totalAnnouncements = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(announcements);

    const registrationsByEvent = await db
      .select({
        eventTitle: events.title,
        count: sql<number>`count(*)::int`,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .groupBy(events.title)
      .orderBy(sql`count(*) desc`)
      .limit(5);

    const categoryCounts = await db
      .select({
        category: events.category,
        count: sql<number>`count(*)::int`,
      })
      .from(events)
      .groupBy(events.category);

    return NextResponse.json({
      totalEvents: totalEvents[0]?.count || 0,
      upcomingEvents: upcomingEvents[0]?.count || 0,
      totalRegistrations: totalRegistrations[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      totalAnnouncements: totalAnnouncements[0]?.count || 0,
      registrationsByEvent,
      categoryCounts,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
