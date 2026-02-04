/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/logo";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { Github, Chrome } from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const SignInPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        });
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (
    provider: "google" | "github" | "discord",
  ) => {
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to sign in with ${provider}`,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#020617,_#020617_45%,_#020617)]">
      {/* floating gradient orbs */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 -top-40 h-64 w-64 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#22d3ee,#a855f7,#22c55e,#22d3ee)] blur-3xl animate-[spin_30s_linear_infinite]" />
        <div className="absolute -right-32 bottom-[-6rem] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_30%_30%,#0ea5e9,#4f46e5,_transparent_70%)] blur-3xl opacity-80 animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      <div className="relative max-w-sm w-full border border-white/10 rounded-2xl px-8 py-8 shadow-[0_22px_70px_rgba(15,23,42,0.9)] bg-slate-900/70 backdrop-blur-2xl">
        {/* subtle animated top accent */}
        <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />

        {/* inner grid + content */}
        <div className="absolute inset-0 -z-10 opacity-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, color-mix(in srgb, var(--card-foreground) 8%, transparent) 1px, transparent 1px),
                linear-gradient(to bottom, color-mix(in srgb, var(--card-foreground) 8%, transparent) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 0",
              maskImage: `
                radial-gradient(circle at top, black 0%, transparent 60%)
              `,
              WebkitMaskImage: `
                radial-gradient(circle at top, black 0%, transparent 60%)
              `,
            }}
          />
        </div>

        <div className="relative isolate flex flex-col items-center animate-in fade-in-0 zoom-in-95 duration-500">
          <p className="mt-2 text-xs font-mono uppercase tracking-[0.22em] text-cyan-300/70">
            Welcome back
          </p>
          <p className="mt-3 text-xl font-semibold tracking-tight">
            Sign in to DeliStore
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80 text-center">
            Access your DeliRealms storefront, deployments and dashboards.
          </p>

          <div className="mt-7 space-y-2 w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-3 border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/60 transition-all duration-200"
              onClick={() => handleOAuthSignIn("github")}
              disabled={isLoading}
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-3 border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-400/60 transition-all duration-200"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
            >
              <Chrome className="h-4 w-4" />
              Continue with Google
            </Button>
          </div>

          <div className="my-7 w-full flex items-center justify-center overflow-hidden">
            <Separator className="bg-white/10" />
            <span className="text-xs px-2 text-muted-foreground/80">or</span>
            <Separator className="bg-white/10" />
          </div>

          <Form {...form}>
            <form
              className="w-full space-y-5"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    z.infer<typeof formSchema>,
                    "email"
                  >;
                }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs tracking-wide text-muted-foreground">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@delirealms.net"
                        className="w-full bg-white/5 border-white/10 focus-visible:ring-cyan-400/60 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs tracking-wide text-muted-foreground">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-white/5 border-white/10 focus-visible:ring-cyan-400/60 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 text-slate-950 font-medium shadow-[0_18px_45px_rgba(6,182,212,0.55)] hover:shadow-[0_22px_60px_rgba(6,182,212,0.75)] transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Continue with Email"}
              </Button>
            </form>
          </Form>

          <div className="mt-5 space-y-4 w-full">
            <Link
              href="#"
              className="text-xs block text-muted-foreground text-center hover:text-foreground transition-colors"
            >
              Forgot your password?
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              Don&apos;t have an account?
              <Link
                href="/signup"
                className="ml-1 underline underline-offset-4 text-foreground/90 hover:text-cyan-300 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
