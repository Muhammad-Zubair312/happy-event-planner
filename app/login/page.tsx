'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="flex flex-col md:flex-row w-full max-w-3xl shadow-lg rounded-2xl overflow-hidden bg-white">

        {/* Left panel — now visible on mobile too, stacked on top */}
        <div className="flex w-full md:w-64 flex-col justify-between p-6 md:p-8 gap-5"
          style={{ background: 'linear-gradient(145deg,#6C47C9 0%,#3B2891 40%,#1D9E75 100%)' }}>
          <div className="bg-white rounded-2xl px-6 py-5 w-fit shadow-sm">
            <img src="/logo.svg" alt="Happy Event Planner" className="h-18 w-auto" />
          </div>
          <p className="text-white/90 text-lg font-medium leading-relaxed">
            Lahore&apos;s <span className="text-teal-300">#1 choice</span> for balloons, candles & event decor — good to see you again
          </p>
          <div className="space-y-2">
            {[['🚚', 'Same-day delivery across Lahore'], ['🔒', 'Secure JazzCash & EasyPaisa checkout'], ['💬', 'Real support on WhatsApp, always']]
              .map(([icon, text]) => (
                <div key={text} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-white/85 text-xs">
                  <span>{icon}</span>{text}
                </div>
              ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center min-w-0">
          <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden w-fit mb-6">
            <span className="px-5 py-2 text-sm font-medium text-white" style={{ background: '#6C47C9' }}>Login</span>
            <Link href="/signup" className="px-5 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">Sign up</Link>
          </div>

          <h1 className="text-xl font-medium text-gray-900 mb-1">Welcome back 👋</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to track your orders, reorder favourites & unlock member-only WhatsApp deals</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white" />
            </div>
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-purple-600 hover:underline">Forgot password?</Link>
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-60"
              style={{ background: 'linear-gradient(90deg,#6C47C9,#1D9E75)' }}>
              {loading ? 'Logging in...' : 'Login to my account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            No account? <Link href="/signup" className="text-purple-600 font-medium">Create one free</Link>
          </p>
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-xs text-purple-800 flex items-center gap-2">
            🔐 Admin access is restricted. Use your assigned credentials.
          </div>
        </div>
      </div>
    </div>
  );
}