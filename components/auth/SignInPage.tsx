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

      if (result?.url?.includes("verify-email")) {
        router.push(result.url);
        router.refresh();
      } else if (result?.error) {
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">

      <div className="relative max-w-sm w-full border border-white/10 rounded-2xl px-8 py-8 bg-black-900/70 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-linear-to-r from-transparent via-lime-400/70 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />
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
          <p className="mt-2 text-xs font-mono uppercase tracking-[0.22em] text-white">
            Welcome back
          </p>
          <p className="mt-3 text-xl font-semibold tracking-tight">
            Sign in to vixle
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
            <span className="text-sm px-2 uppercase text-muted-foreground/80">or</span>
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
                        placeholder="you@gmail.com"
                        className="w-full bg-white/5 border-white/10"
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
                        placeholder="Password"
                        className="w-full bg-white/5 border-white/10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full text-slate-950 font-medium cursor-pointer"
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
                className="ml-1 underline underline-offset-4 text-foreground/90 transition-colors"
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
