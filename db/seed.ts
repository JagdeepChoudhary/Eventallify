import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  const adminId = "admin-" + crypto.randomUUID();
  const studentId = "student-" + crypto.randomUUID();

  await db.insert(schema.user).values([
    {
      id: adminId,
      name: "Admin User",
      email: "admin@college.edu",
      emailVerified: true,
      role: "admin",
    },
    {
      id: studentId,
      name: "John Student",
      email: "student@college.edu",
      emailVerified: true,
      role: "student",
    },
  ]);

  const eventCategories = [
    "workshop",
    "seminar",
    "cultural",
    "sports",
    "tech",
    "hackathon",
    "social",
  ];
  const eventTitles = [
    "Web Development Workshop",
    "AI & Machine Learning Seminar",
    "Annual Cultural Fest",
    "Inter-College Cricket Tournament",
    "Hackathon 2025",
    "React Deep Dive",
    "Networking Meetup",
    "Cloud Computing Workshop",
    "Photography Contest",
    "Tech Talk: Future of Web3",
    "Startup Pitch Competition",
    "Music Night",
    "Blockchain Workshop",
    "Data Science Bootcamp",
    "Career Guidance Seminar",
  ];

  const venues = [
    "Main Auditorium",
    "Seminar Hall A",
    "Computer Lab 3",
    "Sports Ground",
    "Conference Room 201",
    "Open Air Theatre",
    "Mini Auditorium",
    "Innovation Center",
  ];

  const now = new Date();
  const events = [];

  for (let i = 0; i < eventTitles.length; i++) {
    const daysFromNow = Math.floor(Math.random() * 60) - 5;
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() + daysFromNow);
    eventDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);

    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1 + Math.floor(Math.random() * 4));

    const deadline = new Date(eventDate);
    deadline.setDate(deadline.getDate() - 2 - Math.floor(Math.random() * 5));

    events.push({
      title: eventTitles[i],
      description: `Join us for ${eventTitles[i]}! This exciting event brings together students, faculty, and industry experts for an enriching experience. Don't miss out on this opportunity to learn, network, and grow. Limited seats available, register now!`,
      date: eventDate,
      endDate,
      venue: venues[i % venues.length],
      category: eventCategories[i % eventCategories.length],
      registrationDeadline: deadline,
      maxParticipants: 50 + Math.floor(Math.random() * 200),
      createdBy: adminId,
    });
  }

  const insertedEvents = await db
    .insert(schema.events)
    .values(events)
    .returning();
  console.log(`Inserted ${insertedEvents.length} events`);

  // priority must match priorityEnum in schema.ts: "low" | "normal" | "high"
  const announcements = [
    {
      title: "Welcome to the New Semester!",
      content:
        "We're excited to announce the start of a new semester filled with amazing events. Stay tuned for workshops, seminars, and cultural programs. Check the events page regularly for updates!",
      priority: "high" as const,
      createdBy: adminId,
    },
    {
      title: "Campus Wi-Fi Maintenance",
      content:
        "The campus Wi-Fi will undergo maintenance this weekend. Please plan accordingly. The maintenance window is Saturday 2 AM to 6 AM.",
      priority: "high" as const,
      createdBy: adminId,
    },
    {
      title: "Hackathon Registration Open",
      content:
        "Registration for the annual hackathon is now open! Form teams of 2-4 members and register before the deadline. Prizes worth $5000 await the winners!",
      priority: "normal" as const,
      createdBy: adminId,
    },
    {
      title: "Library Hours Extended",
      content:
        "The central library will now be open until 11 PM on weekdays to support exam preparation. Weekend hours remain unchanged.",
      priority: "normal" as const,
      createdBy: adminId,
    },
  ];

  const insertedAnnouncements = await db
    .insert(schema.announcements)
    .values(announcements)
    .returning();
  console.log(`Inserted ${insertedAnnouncements.length} announcements`);

  console.log("\n--- Test Credentials ---");
  console.log("Admin:    admin@college.edu / password123");
  console.log("Student:  student@college.edu / password123");
  console.log(
    "(You must sign up first via the register page, then manually set role to admin in DB)",
  );

  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
