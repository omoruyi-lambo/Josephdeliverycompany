import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import AuthShell from '../components/AuthShell';
import { supabase } from '../lib/supabase/client';

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Enter your password.';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
      if (error) {
        setSubmitError(error.message || 'Unable to sign in. Please check your details.');
      } else {
        await router.push('/account');
      }
    } catch (error) {
      setSubmitError(error?.message || 'Unable to connect to the account service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Welcome back" eyebrow="Account access" description="Sign in to see your shipments, delivery activity, and account details in one place." footerText="New to Josephdeliverycompany?" footerLinkText="Create an account" footerHref="/signup">
      {signedIn ? (
        <div className="auth-success"><div className="auth-success-icon"><i className="fa-solid fa-check" /></div><h2>You’re signed in</h2><p>Your account is ready. Continue to your customer workspace.</p><Link href="/account">Open my account <i className="fa-solid fa-arrow-right" /></Link></div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthField label="Email address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" icon="fa-envelope" autoComplete="email" />
          <AuthField label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Your password" icon="fa-lock" autoComplete="current-password" />
          <div className="auth-check-row"><label><input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} /> Remember me</label><Link className="auth-inline-link" href="/contact">Need help signing in?</Link></div>
          {submitError && <p className="auth-error" role="alert" style={{ marginBottom: 16 }}>{submitError}</p>}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'SIGNING IN…' : 'SIGN IN'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} /></button>
        </form>
      )}
    </AuthShell>
  );
}

function AuthField({ label, name, type, value, onChange, error, placeholder, icon, autoComplete }) {
  return <div className="auth-field"><label htmlFor={name}>{label}</label><div className="auth-input-wrap"><i className={`fa-solid ${icon}`} /><input className={`auth-input${error ? ' has-error' : ''}`} id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} /></div>{error && <p className="auth-error">{error}</p>}</div>;
}
