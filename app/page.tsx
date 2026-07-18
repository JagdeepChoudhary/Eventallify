import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Megaphone,
  ArrowRight,
  Sparkles,
  Ticket,
  Shield,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-20 left-10 size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 size-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              <Sparkles className="size-4 text-primary animate-pulse" />
              Your campus, one platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Discover & Join
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Campus Events
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Never miss a workshop, seminar, or cultural event. Register for
              events, get QR code tickets, and stay updated with announcements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
              >
                <Link href="/events">
                  Browse Events <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="/register">Create Account</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <span>
                  <span className="font-semibold text-foreground">100+</span>{" "}
                  Events
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <span>
                  <span className="font-semibold text-foreground">500+</span>{" "}
                  Students
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="size-4 text-primary" />
                <span>
                  <span className="font-semibold text-foreground">1000+</span>{" "}
                  Registrations
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              Why Eventallify?
            </h2>
            <p className="text-muted-foreground mt-2">
              Everything you need for campus events
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: "Event Discovery",
                desc: "Browse upcoming workshops, seminars, cultural events, and more.",
                color: "from-blue-500/20 to-blue-600/20",
                iconColor: "text-blue-500",
              },
              {
                icon: Ticket,
                title: "Quick Registration",
                desc: "Register for events instantly and get a QR code ticket.",
                color: "from-green-500/20 to-green-600/20",
                iconColor: "text-green-500",
              },
              {
                icon: Megaphone,
                title: "Announcements",
                desc: "Stay updated with the latest campus news and event updates.",
                color: "from-orange-500/20 to-orange-600/20",
                iconColor: "text-orange-500",
              },
              {
                icon: Zap,
                title: "Instant Notifications",
                desc: "Get real-time updates on event changes and reminders.",
                color: "from-yellow-500/20 to-yellow-600/20",
                iconColor: "text-yellow-500",
              },
              {
                icon: Shield,
                title: "Secure Access",
                desc: "Admin-controlled events with verified registrations.",
                color: "from-purple-500/20 to-purple-600/20",
                iconColor: "text-purple-500",
              },
              {
                icon: Users,
                title: "Community Hub",
                desc: "Connect with fellow students and campus organizations.",
                color: "from-pink-500/20 to-pink-600/20",
                iconColor: "text-pink-500",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border bg-card p-8 text-center space-y-4 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1"
              >
                <div
                  className={`mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color}`}
                >
                  <f.icon className={`size-7 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Join?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start exploring campus events and never miss out on what matters.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link href="/register">
                Get Started <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <Calendar className="size-6 text-primary" />
                <span>Eventallify</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your one-stop platform for discovering and managing college
                events.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link
                  href="/events"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse Events
                </Link>
                <Link
                  href="/announcements"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Announcements
                </Link>
                <Link
                  href="/calendar"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Calendar
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            Eventallify - College Event Management Portal
          </div>
        </div>
      </footer>
    </div>
  );
}
