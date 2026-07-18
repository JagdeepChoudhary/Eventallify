import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  uniqueIndex,
  index,
  bigint,
} from "drizzle-orm/pg-core";

// ─── Enums ─────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["student", "admin"]);
export const registrationStatusEnum = pgEnum("registration_status", [
  "confirmed",
  "waitlisted",
  "cancelled",
]);
export const priorityEnum = pgEnum("priority", ["low", "normal", "high"]);

// ─── Better Auth Tables ───────────────────────────────────────────────
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: roleEnum("role").notNull().default("student"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  password: text("password"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idTokenExpiresAt: timestamp("id_token_expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

// ─── Application Tables ───────────────────────────────────────────────

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    date: timestamp("date").notNull(),
    endDate: timestamp("end_date"),
    venue: text("venue").notNull(),
    category: text("category").notNull().default("general"),
    imageUrl: text("image_url"),
    registrationDeadline: timestamp("registration_deadline").notNull(),
    maxParticipants: integer("max_participants"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Speeds up "upcoming events" / calendar queries, which sort or
    // filter by date on nearly every page load
    dateIdx: index("events_date_idx").on(table.date),
  }),
);

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    status: registrationStatusEnum("status").notNull().default("confirmed"),
    qrCode: text("qr_code"),
    checkedIn: boolean("checked_in").notNull().default(false),
    checkedInAt: timestamp("checked_in_at"),
    registeredAt: timestamp("registered_at").notNull().defaultNow(),
  },
  (table) => ({
    // Prevents the same user registering twice for the same event
    uniqueUserEvent: uniqueIndex("unique_user_event").on(
      table.userId,
      table.eventId,
    ),
    // "My registrations" (userId) and "who's registered" / admin
    // attendee list (eventId) are the two most common lookups
    userIdIdx: index("registrations_user_id_idx").on(table.userId),
    eventIdIdx: index("registrations_event_id_idx").on(table.eventId),
  }),
);

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    eventId: uuid("event_id").references(() => events.id, {
      onDelete: "set null",
    }),
    priority: priorityEnum("priority").notNull().default("normal"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    eventIdIdx: index("announcements_event_id_idx").on(table.eventId),
  }),
);
