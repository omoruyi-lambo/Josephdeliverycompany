import Link from 'next/link';
import { useState } from 'react';
import AuthShell from '../components/AuthShell';
import { supabase } from '../lib/supabase/client';

export default function SignUpPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '', accountType: 'personal', agree: false });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError('');
  }

  function validate() {
    const nextErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required.';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (form.password !== form.confirm) nextErrors.confirm = 'Passwords do not match.';
    if (!form.agree) nextErrors.agree = 'Accept the terms to continue.';
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(), password: form.password,
        options: { data: { first_name: form.firstName.trim(), last_name: form.lastName.trim(), phone: form.phone.trim(), account_type: form.accountType === 'business' ? 'business' : 'customer' } },
      });
      if (error) {
        setSubmitError(error.message || 'Unable to create your account. Please try again.');
        return;
      }

      if (!data?.user) {
        setSubmitError('The account service did not return a new user. Please try again.');
        return;
      }

      if (data.user.identities && data.user.identities.length === 0) {
        setSubmitError('An account with this email already exists. Try signing in instead.');
        return;
      }

      // Profile creation is handled by the database trigger on auth.users.
      // Keeping this server-side avoids exposing a profile-write path to the browser.
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error?.message || 'Unable to connect to the account service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Create your account" eyebrow="Get started" description="Join a clearer way to manage deliveries, request quotes, and stay close to every shipment." footerText="Already have an account?" footerLinkText="Sign in" footerHref="/signin">
      {submitted ? (
        <div className="auth-success"><div className="auth-success-icon"><i className="fa-solid fa-check" /></div><h2>Account created</h2><p>Your account is ready. Check your inbox if email confirmation is enabled for this project.</p><Link href="/signin">Continue to sign in <i className="fa-solid fa-arrow-right" /></Link></div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form-row"><AuthField label="First name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} placeholder="Avery" icon="fa-user" autoComplete="given-name" /><AuthField label="Last name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} placeholder="Morgan" icon="fa-user" autoComplete="family-name" /></div>
          <AuthField label="Email address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" icon="fa-envelope" autoComplete="email" />
          <AuthField label="Phone number" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="Your phone number" icon="fa-phone" autoComplete="tel" />
          <AuthField label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="At least 8 characters" icon="fa-lock" autoComplete="new-password" />
          <AuthField label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={handleChange} error={errors.confirm} placeholder="Repeat your password" icon="fa-lock" autoComplete="new-password" />
          <div className="auth-field" style={{ marginBottom: 20 }}><label>Account type</label><div className="auth-segmented">{['personal', 'business'].map((type) => <button key={type} type="button" className={form.accountType === type ? 'active' : ''} onClick={() => setForm((current) => ({ ...current, accountType: type }))}><i className={`fa-solid ${type === 'personal' ? 'fa-user' : 'fa-building'}`} /> {type}</button>)}</div></div>
          <label className="auth-terms"><input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} /><span>I agree to the <Link className="auth-inline-link" href="/terms">Terms of Service</Link> and <Link className="auth-inline-link" href="/privacy">Privacy Policy</Link>.</span></label>
          {errors.agree && <p className="auth-error" style={{ marginTop: -14, marginBottom: 14 }}>{errors.agree}</p>}
          {submitError && <p className="auth-error" role="alert" style={{ marginBottom: 16 }}>{submitError}</p>}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} /></button>
        </form>
      )}
    </AuthShell>
  );
}

function AuthField({ label, name, type = 'text', value, onChange, error, placeholder, icon, autoComplete }) {
  return <div className="auth-field"><label htmlFor={name}>{label}</label><div className="auth-input-wrap"><i className={`fa-solid ${icon}`} /><input className={`auth-input${error ? ' has-error' : ''}`} id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} /></div>{error && <p className="auth-error">{error}</p>}</div>;
}
