"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "check-email" | "unverified">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const type = searchParams.get("type");
  const error = searchParams.get("error");

  useEffect(() => {
    if (type === "check-email") {
      setStatus("check-email");
      setMessage("We sent a verification link to your email. Please check your inbox and click the link to verify your account.");
      return;
    }
    if (error === "unverified") {
      setStatus("unverified");
      setMessage("Please verify your email before signing in. Check your inbox for the verification link.");
      return;
    }
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message);
          setTimeout(() => router.push("/signin"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error);
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verifyEmail();
  }, [token, type, error, router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-4">
      <Card className="relative w-full max-w-md border border-white/10 bg-black animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-linear-to-r from-transparent via-lime-400/70 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-xl">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email verified"}
            {status === "error" && "Verification failed"}
            {status === "check-email" && "Check your email"}
            {status === "unverified" && "Verify your email"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground/90">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pb-6">
          {status === "success" && (
            <p className="text-xs text-center text-muted-foreground">
              All set. Redirecting...
            </p>
          )}
          {(status === "error" || status === "check-email" || status === "unverified") && (
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full text-slate-950 font-medium transition-all duration-200">
                <Link href="/signin">Go to Sign in</Link>
              </Button>
              {status === "error" && (
                <Button variant="outline" asChild className="w-full">
                  <Link href="/signup">Retry sign up</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
