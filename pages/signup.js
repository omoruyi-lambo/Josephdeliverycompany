import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase/client';

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    accountType: 'personal',
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required.';
    if (!form.lastName.trim()) e.lastName = 'Last name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'A valid email is required.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    if (!form.agree) e.agree = 'You must accept the terms to continue.';
    return e;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setAuthError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setAuthError(null);

    try {
      // Map account type to database value
      const accountTypeValue = form.accountType === 'personal' ? 'customer' : 'business';

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
            account_type: accountTypeValue,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      // If email confirmation is enabled, show success message
      // Otherwise, redirect to signin
      if (data.user && !data.session) {
        // Email confirmation required
        setErrors({});
        setForm((prev) => ({ ...prev, _success: true }));
      } else if (data.session) {
        // Auto-signed in, redirect based on account type
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', data.user.id)
          .single();

        if (profile?.account_type === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.');
      console.error('[SignUp] Error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Create Account — Josephdeliverycompany</title>
        <meta name="description" content="Sign up for a Josephdeliverycompany account to manage shipments, track parcels, and request quotes." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main style={{ position: 'relative', backgroundColor: '#f4f5f7', minHeight: '80vh', overflow: 'hidden' }}>
        {/* Background hero strip behind the form */}
        <div aria-hidden style={{
          position: 'absolute',
          inset: 0,
          bottom: '55%',
          zIndex: 0,
          backgroundColor: '#0a1f3c',
          overflow: 'hidden',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2000&q=80"
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', opacity: 0.3 }}
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,31,60,0.78)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>

          {/* Eyebrow */}
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c0392b', marginBottom: '8px' }}>
            Get Started
          </p>
          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, color: '#0a1f3c', marginBottom: '6px', letterSpacing: '-0.3px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '36px' }}>
            Already have an account?{' '}
            <Link href="/signin" style={{ color: '#c0392b', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>

          {authError && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="fa-solid fa-exclamation-circle" style={{ color: '#c0392b', fontSize: 16 }} />
              <p style={{ color: '#c0392b', fontSize: 13, margin: 0 }}>{authError}</p>
            </div>
          )}

          {form._success ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '48px 40px',
              textAlign: 'center',
              border: '1px solid #e2e6ea',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#c0392b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <i className="fa-solid fa-envelope" style={{ color: '#fff', fontSize: '26px' }} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0a1f3c', marginBottom: '12px' }}>
                Check your email
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '28px' }}>
                We've sent a confirmation link to <strong>{form.email}</strong>. Click the link to activate your account.
              </p>
              <Link
                href="/signin"
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  backgroundColor: '#c0392b',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                padding: 'clamp(24px, 5vw, 40px)',
                border: '1px solid #e2e6ea',
              }}
            >
              {/* Account type toggle */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Account Type
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['personal', 'business'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, accountType: type }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '6px',
                        border: form.accountType === type ? '2px solid #c0392b' : '2px solid #e2e6ea',
                        backgroundColor: form.accountType === type ? '#fff5f4' : '#fff',
                        color: form.accountType === type ? '#c0392b' : '#6b7280',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        transition: 'all 0.15s',
                      }}
                    >
                      <i className={type === 'personal' ? 'fa-solid fa-user' : 'fa-solid fa-building'} style={{ marginRight: 7 }} />
                    {type === 'personal' ? 'Personal' : 'Business'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} placeholder="John" />
                <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} placeholder="Doe" />
              </div>

              <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="john@example.com" mb="20px" />
              <Field label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="+1 (305) 555-0100" mb="20px" />
              <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Min. 8 characters" mb="20px" />
              <Field label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={handleChange} error={errors.confirm} placeholder="Re-enter password" mb="24px" />

              {/* Terms */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '28px' }}>
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  style={{ marginTop: '2px', accentColor: '#c0392b', width: '16px', height: '16px', flexShrink: 0 }}
                />
                <span style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <Link href="/terms" style={{ color: '#c0392b', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" style={{ color: '#c0392b', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>
                </span>
              </label>
              {errors.agree && <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '-20px', marginBottom: '20px' }}>{errors.agree}</p>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: loading ? '#e2e6ea' : '#c0392b',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '15px',
                  letterSpacing: '0.5px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s',
                }}
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#a93226'; }}
                onMouseOut={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#c0392b'; }}
              >
                {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}
        </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ── Reusable field ──────────────────────────────────────────────────────── */
function Field({ label, name, type = 'text', value, onChange, error, placeholder, mb = '0' }) {
  return (
    <div style={{ marginBottom: mb }}>
      <label htmlFor={name} style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          display: 'block',
          width: '100%',
          padding: '11px 14px',
          fontSize: '14px',
          color: '#1a1a2e',
          backgroundColor: '#fff',
          border: `1px solid ${error ? '#c0392b' : '#d1d5db'}`,
          borderRadius: '6px',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#0a1f3c')}
        onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#c0392b' : '#d1d5db')}
      />
      {error && <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '5px' }}>{error}</p>}
    </div>
  );
}
