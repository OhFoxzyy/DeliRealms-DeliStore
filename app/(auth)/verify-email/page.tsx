'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          setTimeout(() => router.push('/signin'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#020617,_#020617_45%,_#020617)] p-4">
      {/* floating gradient orbs */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 -top-32 h-60 w-60 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#22d3ee,#a855f7,#22c55e,#22d3ee)] blur-3xl animate-[spin_32s_linear_infinite]" />
        <div className="absolute -right-32 bottom-[-6rem] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_30%_30%,#0ea5e9,#4f46e5,_transparent_70%)] blur-3xl opacity-80 animate-[spin_46s_linear_infinite_reverse]" />
      </div>

      <Card className="relative w-full max-w-md border border-white/10 bg-slate-900/70 backdrop-blur-2xl shadow-[0_22px_70px_rgba(15,23,42,0.9)] animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="pointer-events-none absolute inset-x-16 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />

        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-1">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-rose-400 animate-shake" />
            )}
          </div>
          <CardTitle className="text-xl">
            {status === 'loading' && 'Verifying your email...'}
            {status === 'success' && 'Email verified'}
            {status === 'error' && 'Verification failed'}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground/90">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pb-6">
          {status === 'success' && (
            <p className="text-xs text-center text-muted-foreground">
              You&apos;re all set. Redirecting you to sign in...
            </p>
          )}
          {status === 'error' && (
            <Button
              onClick={() => router.push('/signup')}
              className="w-full bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300 text-slate-950 font-medium shadow-[0_18px_45px_rgba(248,113,113,0.55)] hover:shadow-[0_22px_60px_rgba(248,113,113,0.75)] transition-all duration-200"
            >
              Back to Sign Up
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
