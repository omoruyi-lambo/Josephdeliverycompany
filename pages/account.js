import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthShell from '../components/AuthShell';
import { supabase } from '../lib/supabase/client';

export default function AccountPage() {
  const [state, setState] = useState({ loading: true, user: null, profile: null, error: '' });

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!active) return;
      if (userError || !user) {
        setState({ loading: false, user: null, profile: null, error: '' });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, account_type, created_at')
        .eq('id', user.id)
        .maybeSingle();

      if (!active) return;
      setState({ loading: false, user, profile: profile || null, error: profileError?.message || '' });
    }

    loadAccount();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        if (active) setState({ loading: false, user: null, profile: null, error: '' });
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/signin';
  }

  if (state.loading) {
    return <AccountFrame><div className="account-loading">Loading your secure workspace…</div></AccountFrame>;
  }

  if (!state.user) {
    return <AccountFrame><div className="account-empty"><i className="fa-solid fa-lock" /><h2>Sign in required</h2><p>Your session is no longer active. Sign in to view your profile.</p><Link href="/signin">Return to sign in</Link></div></AccountFrame>;
  }

  const profile = state.profile;
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Josephdelivery customer';

  return (
    <AccountFrame>
      <div className="account-header"><div><p className="auth-eyebrow">Customer workspace</p><h1>Welcome, {profile?.first_name || 'there'}</h1><p>Manage your account details and keep your delivery journey close.</p></div><button className="account-signout" onClick={signOut}>Sign out <i className="fa-solid fa-arrow-right-from-bracket" /></button></div>
      {state.error && <p className="account-notice" role="alert">Your account is signed in, but the profile could not be loaded: {state.error}</p>}
      {!state.profile && !state.error && <p className="account-notice">Your account is active. Your profile is still being prepared.</p>}
      <div className="account-grid">
        <section className="account-card account-identity"><div className="account-avatar">{name.charAt(0).toUpperCase()}</div><div><p className="account-label">Signed in as</p><h2>{name}</h2><p>{state.user.email}</p></div><span className="account-badge">{profile?.account_type || 'customer'}</span></section>
        <section className="account-card"><p className="account-label">Profile details</p><div className="account-detail"><span>Phone</span><strong>{profile?.phone || 'Not provided'}</strong></div><div className="account-detail"><span>Email</span><strong>{state.user.email}</strong></div><div className="account-detail"><span>Member since</span><strong>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}</strong></div></section>
      </div>
      <div className="account-actions"><Link href="/track"><i className="fa-solid fa-location-crosshairs" /> Track a shipment</Link><Link href="/quote"><i className="fa-solid fa-file-invoice" /> Request a quote</Link><Link href="/contact"><i className="fa-solid fa-headset" /> Contact support</Link></div>
    </AccountFrame>
  );
}

function AccountFrame({ children }) {
  return <><Head><title>My Account — Josephdeliverycompany</title><meta name="description" content="Manage your Josephdeliverycompany profile and shipment workspace." /></Head><main className="account-page"><div className="account-shell"><Link href="/" className="account-logo"><span className="auth-brand-dot" /> JOSEPH<span>DELIVERY</span></Link>{children}<Link href="/" className="account-back"><i className="fa-solid fa-arrow-left" /> Back to website</Link></div></main></>;
}
