import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/db/schema";
import { eq, desc, and, gte, like, sql, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const upcoming = searchParams.get("upcoming") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    const conditions = [];

    if (search) {
      conditions.push(ilike(events.title, `%${search}%`));
    }
    if (category) {
      conditions.push(eq(events.category, category));
    }
    if (upcoming) {
      conditions.push(gte(events.date, new Date()));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allEvents = await db
      .select()
      .from(events)
      .where(whereClause)
      .orderBy(desc(events.date))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      events: allEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Events fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      endDate,
      venue,
      category,
      imageUrl,
      registrationDeadline,
      maxParticipants,
    } = body;

    if (!title || !description || !date || !venue || !registrationDeadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newEvent = await db
      .insert(events)
      .values({
        title,
        description,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        venue,
        category: category || "general",
        imageUrl: imageUrl || null,
        registrationDeadline: new Date(registrationDeadline),
        maxParticipants: maxParticipants || null,
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
