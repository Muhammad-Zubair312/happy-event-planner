'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: `${form.firstName} ${form.lastName}`,
          role: 'customer',  // always customer — never admin via signup
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Update phone in profiles table
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ phone: form.phone, whatsapp_number: form.phone })
        .eq('id', user.id);
    }

    router.push('/account');
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="flex w-full max-w-3xl shadow-lg rounded-2xl overflow-hidden bg-white">
        
        {/* Left panel */}
        <div className="hidden md:flex w-64 flex-col justify-between p-8"
          style={{ background: 'linear-gradient(145deg,#6C47C9 0%,#3B2891 40%,#1D9E75 100%)' }}>
          <div className="bg-white rounded-2xl px-6 py-5 w-fit shadow-sm">
  <img src="/logo.svg" alt="Happy Event Planner" className="h-18 w-auto" />
</div>
<p className="text-white/90 text-lg font-medium leading-relaxed">
  Join the Lahore families who trust us to make <span className="text-teal-300">every celebration</span> unforgettable
</p>
<div className="space-y-2">
  {[['🎁','Free delivery on your first order'],['📦','Track every order in real time'],['⭐','Early access to Eid & seasonal sales']]
              .map(([icon,text]) => (
              <div key={text} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-white/85 text-xs">
                <span>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden w-fit mb-6">
            <Link href="/login" className="px-5 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">Login</Link>
            <span className="px-5 py-2 text-sm font-medium text-white" style={{background:'#6C47C9'}}>Sign up</span>
          </div>

          <h1 className="text-xl font-medium text-gray-900 mb-1">Create your free account</h1>
          <p className="text-sm text-gray-500 mb-6">Takes 30 seconds — start planning your next event today</p>

          <form onSubmit={handleSignup} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">First name</label>
                <input type="text" required value={form.firstName} onChange={set('firstName')} placeholder="Ali"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Last name</label>
                <input type="text" required value={form.lastName} onChange={set('lastName')} placeholder="Khan"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Email address</label>
              <input type="email" required value={form.email} onChange={set('email')} placeholder="ali@example.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">WhatsApp number</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="03XX-XXXXXXX"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Password</label>
              <input type="password" required minLength={8} value={form.password} onChange={set('password')} placeholder="Min. 8 characters"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white" />
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-60"
              style={{background:'linear-gradient(90deg,#6C47C9,#1D9E75)'}}>
              {loading ? 'Creating account...' : 'Create my account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-3">
            By signing up you agree to our <Link href="/terms" className="text-purple-600">Terms</Link> & <Link href="/privacy" className="text-purple-600">Privacy Policy</Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            Already have an account? <Link href="/login" className="text-purple-600 font-medium">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}