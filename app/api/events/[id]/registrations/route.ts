import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const regs = await db
      .select({
        id: registrations.id,
        userId: registrations.userId,
        eventId: registrations.eventId,
        status: registrations.status,
        checkedIn: registrations.checkedIn,
        checkedInAt: registrations.checkedInAt,
        registeredAt: registrations.registeredAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(registrations)
      .innerJoin(user, eq(registrations.userId, user.id))
      .where(eq(registrations.eventId, id));

    return NextResponse.json(regs);
  } catch (error) {
    console.error("Registrations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
