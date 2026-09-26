import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase/client';

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  function validate() {
    const e = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  }

  function handle(e) {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setErrors(p => ({ ...p, [name]: undefined }));
    setAuthError(null);
  }

  async function submit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if user has admin profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('[SignIn] Profile lookup error:', profileError);
      }

      // Redirect based on account type
      if (profile?.account_type === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/account';
      }
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.');
      console.error('[SignIn] Error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign In — Josephdeliverycompany</title>
        <meta name="description" content="Sign in to your Josephdeliverycompany account to track shipments, manage deliveries, and view invoices." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <main style={{ position: 'relative', backgroundColor: '#f4f5f7', minHeight: '80vh', overflow: 'hidden' }}>
        {/* Background hero strip behind the form */}
        <div aria-hidden style={{
          position: 'absolute',
          inset: 0,
          bottom: '40%',
          zIndex: 0,
          backgroundColor: '#0a1f3c',
          overflow: 'hidden',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80"
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', opacity: 0.3 }}
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,31,60,0.78)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', padding: '56px 24px' }}>
        <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>
          <p style={eyebrow}>My Account</p>
          <h1 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 800, color: '#0a1f3c', marginBottom: 6, letterSpacing: '-0.3px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#c0392b', fontWeight: 600, textDecoration: 'none' }}>Create one for free</Link>
          </p>

          {authError && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="fa-solid fa-exclamation-circle" style={{ color: '#c0392b', fontSize: 16 }} />
              <p style={{ color: '#c0392b', fontSize: 13, margin: 0 }}>{authError}</p>
            </div>
          )}

          <form onSubmit={submit} noValidate style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: 'clamp(24px,5vw,40px)' }}>

              {/* Social sign-in buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                <button type="button" style={socialBtn}>
                  <i className="fa-brands fa-google" style={{ color: '#ea4335' }} /> Continue with Google
                </button>
                <button type="button" style={socialBtn}>
                  <i className="fa-brands fa-apple" style={{ color: '#000' }} /> Continue with Apple
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 1, backgroundColor: '#e2e6ea' }} />
                <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>or sign in with email</span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#e2e6ea' }} />
              </div>

              <Field label="Email Address" name="email" type="email" value={form.email} onChange={handle} error={errors.email} placeholder="john@example.com" mb={16} />
              <Field label="Password" name="password" type="password" value={form.password} onChange={handle} error={errors.password} placeholder="Your password" mb={16} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" name="remember" checked={form.remember} onChange={handle} style={{ accentColor: '#c0392b' }} />
                  Remember me
                </label>
                <Link href="/forgot-password" style={{ fontSize: 13, color: '#c0392b', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, backgroundColor: loading ? '#e2e6ea' : '#c0392b', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.4px' }}
                onMouseOver={e => { if (!loading) e.currentTarget.style.backgroundColor = '#a93226'; }}
                onMouseOut={e => { if (!loading) e.currentTarget.style.backgroundColor = '#c0392b'; }}>
                {loading ? 'Signing in...' : 'SIGN IN'}
              </button>
            </form>
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, name, type = 'text', value, onChange, error, placeholder, mb = 0 }) {
  return (
    <div style={{ marginBottom: mb }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ display: 'block', width: '100%', padding: '11px 14px', fontSize: 14, color: '#1a1a2e', backgroundColor: '#fff', border: `1px solid ${error ? '#c0392b' : '#d1d5db'}`, borderRadius: 6, outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => e.currentTarget.style.borderColor = '#0a1f3c'}
        onBlur={e => e.currentTarget.style.borderColor = error ? '#c0392b' : '#d1d5db'} />
      {error && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
const socialBtn = { width: '100%', padding: '11px 16px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 };
