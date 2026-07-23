'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Notice = { kind: 'error' | 'info'; text: string } | null;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const supabase = () => createClient();
  const redirectTo = () => `${window.location.origin}/auth/callback`;

  async function run<T>(tag: string, fn: () => Promise<T>) {
    setBusy(tag);
    setNotice(null);
    try {
      await fn();
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : 'Something went wrong.' });
    } finally {
      setBusy(null);
    }
  }

  const passkey = () =>
    run('passkey', async () => {
      const { error } = await supabase().auth.signInWithPasskey();
      if (error) throw error;
      window.location.href = '/';
    });

  const google = () =>
    run('google', async () => {
      const { error } = await supabase().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectTo() },
      });
      if (error) throw error;
    });

  const emailLink = () =>
    run('email', async () => {
      const { error } = await supabase().auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo() },
      });
      if (error) throw error;
      setNotice({ kind: 'info', text: `We sent a sign-in link to ${email}.` });
    });

  const sendPhone = () =>
    run('phone', async () => {
      const { error } = await supabase().auth.signInWithOtp({ phone });
      if (error) throw error;
      setOtpSent(true);
      setNotice({ kind: 'info', text: `We sent a code to ${phone}.` });
    });

  const verifyPhone = () =>
    run('verify', async () => {
      const { error } = await supabase().auth.verifyOtp({ phone, token: otp, type: 'sms' });
      if (error) throw error;
      window.location.href = '/';
    });

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold text-charcoal">Sign in to Chommie</h1>
      <p className="mt-1 text-sm text-charcoal-800/60">
        Use a passkey, Google, your email, or your phone number.
      </p>

      {!configured && (
        <p className="mt-4 rounded-sm border border-dashed border-beige-200 bg-white p-4 text-sm text-charcoal-800/70">
          Auth isn&apos;t configured yet — set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code>.
        </p>
      )}

      {notice && (
        <p
          className={`mt-4 rounded-sm p-3 text-sm ${
            notice.kind === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-brand/10 text-brand-600'
          }`}
        >
          {notice.text}
        </p>
      )}

      <fieldset disabled={!configured} className="mt-6 space-y-3">
        <button
          onClick={passkey}
          className="w-full rounded-sm bg-charcoal px-4 py-2.5 font-semibold text-beige hover:bg-charcoal-800 disabled:opacity-50"
        >
          {busy === 'passkey' ? 'Waiting for passkey…' : '🔑 Continue with a passkey'}
        </button>
        <button
          onClick={google}
          className="w-full rounded-sm border border-charcoal/20 px-4 py-2.5 font-semibold text-charcoal hover:border-charcoal disabled:opacity-50"
        >
          {busy === 'google' ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 py-1 text-xs text-charcoal-800/40">
          <span className="h-px flex-1 bg-beige-200" /> or <span className="h-px flex-1 bg-beige-200" />
        </div>

        <div className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-sm border border-beige-200 bg-white px-3 py-2 text-sm"
          />
          <button
            onClick={emailLink}
            className="w-full rounded-sm bg-brand px-4 py-2 font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50"
          >
            {busy === 'email' ? 'Sending…' : 'Email me a sign-in link'}
          </button>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+27…"
              className="w-full rounded-sm border border-beige-200 bg-white px-3 py-2 text-sm"
            />
            <button
              onClick={sendPhone}
              className="whitespace-nowrap rounded-sm border border-charcoal/20 px-3 py-2 text-sm font-semibold text-charcoal hover:border-charcoal disabled:opacity-50"
            >
              {busy === 'phone' ? '…' : 'Send code'}
            </button>
          </div>
          {otpSent && (
            <div className="flex gap-2">
              <input
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                className="w-full rounded-sm border border-beige-200 bg-white px-3 py-2 text-sm"
              />
              <button
                onClick={verifyPhone}
                className="whitespace-nowrap rounded-sm bg-brand px-3 py-2 text-sm font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50"
              >
                {busy === 'verify' ? '…' : 'Verify'}
              </button>
            </div>
          )}
        </div>
      </fieldset>

      <p className="mt-6 text-xs text-charcoal-800/50">
        New here? Any of the above creates your account. See{' '}
        <Link href="/membership" className="text-brand-600 hover:underline">
          membership
        </Link>
        .
      </p>
    </div>
  );
}
