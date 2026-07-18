import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const { id } = await params;
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", `/events/${id}?qr=1`);
      return NextResponse.json(
        {
          error: "Please sign in to register",
          loginUrl: loginUrl.toString(),
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event.length) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (new Date(event[0].registrationDeadline) < new Date()) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 }
      );
    }

    if (new Date(event[0].date) < new Date()) {
      return NextResponse.json(
        { error: "This event has already ended" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.userId, session.user.id),
          eq(registrations.eventId, id)
        )
      )
      .limit(1);

    if (existing.length) {
      return NextResponse.json(
        {
          error: "You are already registered for this event",
          registration: existing[0],
        },
        { status: 400 }
      );
    }

    if (event[0].maxParticipants) {
      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(registrations)
        .where(eq(registrations.eventId, id));

      if (countResult[0].count >= event[0].maxParticipants) {
        return NextResponse.json(
          { error: "This event is full" },
          { status: 400 }
        );
      }
    }

    const newReg = await db
      .insert(registrations)
      .values({
        userId: session.user.id,
        eventId: id,
      })
      .returning();

    return NextResponse.json(
      {
        registration: newReg[0],
        message: `Successfully registered for ${event[0].title}!`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("QR register error:", error);
    return NextResponse.json(
      { error: "Failed to register" },
      { status: 500 }
    );
  }
}
