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
import { CheckCircle2, X, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

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
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-4">
      <Card className="relative w-full max-w-md border border-white/10 bg-black animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-linear-to-r from-transparent via-lime-400/70 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-xl">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email verified"}
            {status === "error" && "Verification failed"}
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
          {status === "error" && (
            <Button
              onClick={() => router.push("/signup")}
              className="w-full text-slate-950 font-medium transition-all duration-200"
            >
              Retry Authentication
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
