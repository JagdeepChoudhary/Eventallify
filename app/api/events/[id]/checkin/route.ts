import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, events } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { registrationId, registrationQrData } = body;

    if (!registrationId && !registrationQrData) {
      return NextResponse.json(
        { error: "Provide registrationId or QR data" },
        { status: 400 }
      );
    }

    let resolvedRegId = registrationId;

    if (registrationQrData && !registrationId) {
      try {
        const qrData =
          typeof registrationQrData === "string"
            ? JSON.parse(registrationQrData)
            : registrationQrData;
        resolvedRegId = qrData.registrationId;
      } catch {
        return NextResponse.json(
          { error: "Invalid QR code data" },
          { status: 400 }
        );
      }
    }

    if (!resolvedRegId) {
      return NextResponse.json(
        { error: "Could not resolve registration ID" },
        { status: 400 }
      );
    }

    const reg = await db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.id, resolvedRegId),
          eq(registrations.eventId, id)
        )
      )
      .limit(1);

    if (!reg.length) {
      return NextResponse.json(
        { error: "Registration not found for this event" },
        { status: 404 }
      );
    }

    if (reg[0].checkedIn) {
      return NextResponse.json(
        {
          error: "Already checked in",
          checkedInAt: reg[0].checkedInAt,
        },
        { status: 400 }
      );
    }

    const updated = await db
      .update(registrations)
      .set({
        checkedIn: true,
        checkedInAt: new Date(),
      })
      .where(eq(registrations.id, resolvedRegId))
      .returning();

    return NextResponse.json({
      success: true,
      registration: updated[0],
      message: "Checked in successfully",
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Check-in failed" },
      { status: 500 }
    );
  }
}
