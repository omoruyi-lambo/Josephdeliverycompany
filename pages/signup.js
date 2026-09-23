import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SignUpPage() {
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
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

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
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitted(true);
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

      <main style={{ backgroundColor: '#f4f5f7', minHeight: '80vh', padding: '56px 24px 80px' }}>
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

          {submitted ? (
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
                <i className="fa-solid fa-check" style={{ color: '#fff', fontSize: '26px' }} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0a1f3c', marginBottom: '12px' }}>
                Account created!
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '28px' }}>
                Welcome to Josephdeliverycompany. A confirmation email has been sent to <strong>{form.email}</strong>.
              </p>
              <Link
                href="/"
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
                Go to Homepage
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
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#c0392b',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '15px',
                  letterSpacing: '0.5px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#a93226')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#c0392b')}
              >
                CREATE ACCOUNT
              </button>
            </form>
          )}
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
