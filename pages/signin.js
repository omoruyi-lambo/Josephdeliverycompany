import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SignInPage() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

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
  }

  function submit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
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

      <main style={{ backgroundColor: '#f4f5f7', minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '56px 24px' }}>
        <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>
          <p style={eyebrow}>My Account</p>
          <h1 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 800, color: '#0a1f3c', marginBottom: 6, letterSpacing: '-0.3px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#c0392b', fontWeight: 600, textDecoration: 'none' }}>Create one for free</Link>
          </p>

          {submitted ? (
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <i className="fa-solid fa-check" style={{ color: '#fff', fontSize: 22 }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0a1f3c', marginBottom: 10 }}>Signed in!</h2>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Redirecting you to your dashboard…</p>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', borderRadius: 6 }}>
                Go to Homepage
              </Link>
            </div>
          ) : (
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

              <button type="submit" style={{ width: '100%', padding: 14, backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.4px' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#a93226'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#c0392b'}>
                SIGN IN
              </button>
            </form>
          )}
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
