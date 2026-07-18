import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const myRegistrations = await db
      .select({
        registrationId: registrations.id,
        status: registrations.status,
        checkedIn: registrations.checkedIn,
        checkedInAt: registrations.checkedInAt,
        registeredAt: registrations.registeredAt,
        eventId: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        endDate: events.endDate,
        venue: events.venue,
        category: events.category,
        imageUrl: events.imageUrl,
        registrationDeadline: events.registrationDeadline,
        maxParticipants: events.maxParticipants,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(eq(registrations.userId, session.user.id))
      .orderBy(desc(events.date));

    return NextResponse.json(myRegistrations);
  } catch (error) {
    console.error("My registrations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
