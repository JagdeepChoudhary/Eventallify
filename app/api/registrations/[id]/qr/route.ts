import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import QRCode from "qrcode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const reg = await db
      .select({
        registrationId: registrations.id,
        userId: registrations.userId,
        eventId: registrations.eventId,
        eventTitle: events.title,
        eventDate: events.date,
        venue: events.venue,
        userName: user.name,
        userEmail: user.email,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .innerJoin(user, eq(registrations.userId, user.id))
      .where(
        and(
          eq(registrations.id, id),
          eq(registrations.userId, session.user.id)
        )
      )
      .limit(1);

    if (!reg.length) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const r = reg[0];
    const qrData = JSON.stringify({
      type: "registration",
      registrationId: r.registrationId,
      eventId: r.eventId,
      userId: r.userId,
      eventTitle: r.eventTitle,
      userName: r.userName,
      userEmail: r.userEmail,
      venue: r.venue,
      date: r.eventDate,
    });

    const qrCode = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
