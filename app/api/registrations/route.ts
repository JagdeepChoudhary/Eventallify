import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get("registrationId");

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID required" },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(registrations)
      .where(
        and(
          eq(registrations.id, registrationId),
          eq(registrations.userId, session.user.id)
        )
      )
      .returning();

    if (!deleted.length) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel registration error:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const regs = await db
      .select({
        id: registrations.id,
        status: registrations.status,
        checkedIn: registrations.checkedIn,
        checkedInAt: registrations.checkedInAt,
        registeredAt: registrations.registeredAt,
        eventId: events.id,
        eventTitle: events.title,
        eventDate: events.date,
        eventVenue: events.venue,
        eventCategory: events.category,
        eventImageUrl: events.imageUrl,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(eq(registrations.userId, session.user.id));

    return NextResponse.json(regs);
  } catch (error) {
    console.error("User registrations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
