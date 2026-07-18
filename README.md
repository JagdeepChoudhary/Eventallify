# Eventallify

A college event management platform built with Next.js 16, allowing students to discover, register for, and track campus events while providing admins with tools to create events, manage registrations, and send announcements.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (base-nova style)
- **Auth:** Better Auth (email/password + Google OAuth)
- **Database:** PostgreSQL (Neon) via Drizzle ORM
- **Email:** Resend (verification emails, registration confirmations with QR codes)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- A [Resend](https://resend.com) API key (for emails)
- Optional: Google OAuth credentials (for Google sign-in)

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://..."

BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional — Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional — Resend email
RESEND_API_KEY=""
EMAIL_FROM="Eventallify <onboarding@resend.dev>"
```

### Install & Run

```bash
# Install dependencies
npm install

# Push the schema to the database
npm run db:push

# Seed sample data (optional)
npm run db:seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test Credentials (after seeding)

| Role    | Email               | Password    |
| ------- | ------------------- | ----------- |
| Admin   | admin@college.edu   | password123 |
| Student | student@college.edu | password123 |

> You must register via the UI first, then set the role to `admin` in the database (or use `npm run db:make-admin`).

## Available Scripts

| Script                  | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start the Next.js dev server         |
| `npm run build`         | Production build                     |
| `npm run start`         | Start the production server          |
| `npm run lint`          | Run ESLint                           |
| `npm run db:push`       | Push Drizzle schema to the database  |
| `npm run db:generate`   | Generate migration files from schema |
| `npm run db:migrate`    | Run pending database migrations      |
| `npm run db:seed`       | Seed the database with sample data   |
| `npm run db:make-admin` | Promote a user to admin role         |

## Project Structure

```
Eventallify/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Auth route group (no layout)
│   │   ├── login/              #   Login page
│   │   └── register/           #   Registration page
│   ├── admin/                  # Admin panel
│   │   ├── analytics/          #   Analytics dashboard
│   │   ├── announcements/      #   Manage announcements
│   │   ├── events/             #   Manage events (CRUD)
│   │   └── registrations/      #   View/manage registrations
│   ├── announcements/          # Public announcements feed
│   ├── api/                    # API route handlers
│   │   ├── auth/               #   Better Auth endpoints
│   │   ├── announcements/      #   Announcements API
│   │   ├── dashboard/          #   Dashboard data API
│   │   ├── events/             #   Events API
│   │   ├── registrations/      #   Registration API
│   │   ├── my-registrations/   #   Current user's registrations
│   │   └── user/               #   User profile API
│   ├── calendar/               # Event calendar view
│   ├── dashboard/              # Student dashboard
│   ├── events/                 # Public event listing & detail
│   │   ├── [id]/               #   Single event page
│   │   └── my-events/          #   User's registered events
│   ├── profile/                # User profile page
│   ├── layout.tsx              # Root layout (navbar, theme, toaster)
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles + Tailwind config
│
├── components/                 # React components
│   ├── dashboards/             # Dashboard views
│   │   ├── admin-dashboard.tsx
│   │   └── student-dashboard.tsx
│   ├── events/                 # Event-related components
│   │   └── event-card.tsx
│   ├── layout/                 # Layout components
│   │   ├── navbar.tsx
│   │   └── admin-sidebar.tsx
│   ├── skeletons.tsx           # Loading skeleton components
│   ├── theme-provider.tsx      # Dark/light theme provider
│   └── ui/                     # shadcn/ui primitives (60 components)
│
├── db/                         # Database layer
│   ├── schema.ts               # Drizzle schema (events, registrations, announcements, users)
│   ├── drizzle.config.ts       # Drizzle Kit config
│   ├── drizzle/                # Generated migration files
│   ├── seed.ts                 # Database seeder
│   └── make-admin.ts           # Promote a user to admin
│
├── hooks/                      # Custom React hooks
│   └── use-mobile.ts           # Mobile viewport detection
│
├── lib/                        # Shared utilities & config
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Better Auth client config
│   ├── db.ts                   # Drizzle + postgres client singleton
│   ├── email.ts                # Resend email templates (verification, registration w/ QR)
│   ├── session.ts              # Session helpers (getSession, requireAuth, requireAdmin)
│   └── utils.ts                # Utility functions (cn, etc.)
│
├── public/                     # Static assets
└── proxy.ts                    # Middleware route protection logic
```

## Key Features

- **Two user roles:** Students and Admins with different dashboards and permissions
- **Event management:** Create, browse, and register for events with category filtering
- **QR code tickets:** Registration confirmation emails include scannable QR codes for check-in
- **Calendar view:** Visual calendar of upcoming events
- **Announcements:** Admin-published announcements with priority levels (low/normal/high)
- **Email verification:** Account verification via Resend
- **Google OAuth:** Optional Google sign-in alongside email/password
- **Dark mode:** Theme toggle via next-themes
- **Rate limiting:** Database-backed rate limiting via Better Auth
- **Responsive UI:** Mobile-friendly with 60 shadcn/ui components

## Database Schema

The app uses 7 tables:

| Table           | Purpose                                   |
| --------------- | ----------------------------------------- |
| `user`          | User accounts (id, name, email, role)     |
| `session`       | Active sessions                           |
| `account`       | OAuth / password credentials              |
| `verification`  | Email verification tokens                 |
| `rate_limit`    | Rate limiting counter store               |
| `events`        | Event details (title, date, venue, etc.)  |
| `registrations` | User-to-event registrations with QR codes |
| `announcements` | Admin announcements with priority         |

## Route Protection

Route protection is handled in `proxy.ts`:

| Route Group                                   | Access                                        |
| --------------------------------------------- | --------------------------------------------- |
| `/`, `/events`, `/calendar`, `/announcements` | Public                                        |
| `/dashboard`, `/profile`, `/my-events`        | Authenticated users                           |
| `/admin/*`                                    | Authenticated users                           |
| `/login`, `/register`                         | Redirect to `/dashboard` if already logged in |
