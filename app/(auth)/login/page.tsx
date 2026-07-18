"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Calendar,
  ArrowRight,
  Sparkles,
  Mail,
  Lock,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error: googleError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: redirect,
    });
    if (googleError) {
      setError(googleError.message || "Google sign-in failed");
      toast.error(googleError.message || "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: signInData, error: signInError } =
      await authClient.signIn.email({
        email,
        password,
      });

    if (signInError) {
      const message = signInError.message || "Invalid email or password";
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    const destination = redirect;

    toast.success("Welcome back!");
    router.push(destination);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-center gap-2">
          <div className="size-2 rounded-full bg-destructive animate-pulse" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium flex items-center gap-2"
        >
          <Mail className="size-4 text-muted-foreground" />
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@college.edu"
          required
          className="flex h-12 w-full rounded-xl border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium flex items-center gap-2"
        >
          <Lock className="size-4 text-muted-foreground" />
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="flex h-12 w-full rounded-xl border bg-background px-4 py-3 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Signing in...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            Sign In
            <ArrowRight className="size-4" />
          </div>
        )}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-12 hover:bg-muted/50 transition-all"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <div className="flex items-center gap-2">
            <div className="size-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            Signing in with Google...
          </div>
        ) : (
          <>
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-2">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary hover:underline font-semibold"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-background/90 to-background/80">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-20 size-72 rounded-full bg-foreground/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 size-96 rounded-full bg-foreground/10 blur-3xl" />

        <div className="relative flex flex-col justify-center px-12 text-foreground h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground/20 backdrop-blur-sm">
              <Calendar className="size-7" />
            </div>
            <span className="text-2xl font-bold">Eventallify</span>
          </div>

          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Welcome back to
            <br />
            your campus hub
          </h1>

          <p className="text-foreground/80 text-lg mb-8 max-w-md">
            Sign in to access your events, registrations, and stay connected
            with your campus community.
          </p>

          <div className="space-y-4">
            {[
              "Discover exciting campus events",
              "Register with QR code tickets",
              "Stay updated with announcements",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-foreground/20">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-foreground/90 hover:text-foreground/90">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Calendar className="size-8 text-primary" />
              <span className="text-2xl font-bold">Eventallify</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your Eventallify account
            </p>
          </div>

          <Suspense
            fallback={
              <div className="rounded-2xl border bg-card p-8 animate-pulse">
                <div className="space-y-4">
                  <div className="h-12 rounded-xl bg-muted" />
                  <div className="h-12 rounded-xl bg-muted" />
                  <div className="h-12 rounded-xl bg-muted" />
                </div>
              </div>
            }
          >
            <div className="rounded-2xl border bg-card p-8 shadow-lg">
              <LoginForm />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
