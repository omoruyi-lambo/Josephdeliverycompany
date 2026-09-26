/**
 * pages/account.js
 *
 * User profile page - View and edit profile information, view shipment history.
 */

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase/client';

const COLORS = {
  navy: '#0a1f3c',
  red: '#c0392b',
  redHover: '#a93226',
  gray: '#f4f5f7',
  border: '#e2e6ea',
  text: '#1a1a2e',
  muted: '#64748b',
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/signin');
      return;
    }

    setUser(session.user);
    await loadProfile(session.user.id);
    await loadShipments(session.user.id);
    setLoading(false);
  }

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Account] Error loading profile:', error);
      setError('Failed to load profile');
      return;
    }

    setProfile(data);
    setForm({
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      phone: data.phone || '',
    });
  }

  async function loadShipments(userId) {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[Account] Error loading shipments:', error);
    } else {
      setShipments(data || []);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...form });
      setEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('[Account] Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>My Account — Josephdeliverycompany</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Header />
        <main style={{ backgroundColor: COLORS.gray, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 16, color: COLORS.muted }}>Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Account — Josephdeliverycompany</title>
        <meta name="description" content="Manage your Josephdeliverycompany account and view shipment history." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main style={{ backgroundColor: COLORS.gray, minHeight: '80vh', padding: '56px 24px 80px' }}>
        <div style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          maxWidth: 900,
          margin: '0 auto 32px',
          backgroundColor: COLORS.navy,
        }}>
          {/* Hero background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1800&q=80"
            alt="Logistics courier carrying packages"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32 }}
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,31,60,0.72)' }} />

          <div style={{ position: 'relative', padding: 'clamp(32px,6vw,56px) clamp(24px,6vw,56px)' }}>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
              My Account
            </h1>
            <p style={{ fontSize: 15, color: '#cbd5e1', margin: 0, lineHeight: 1.6, maxWidth: 520 }}>
              Manage your profile and view your shipment history.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="fa-solid fa-exclamation-circle" style={{ color: COLORS.red, fontSize: 16 }} />
              <p style={{ color: COLORS.red, fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Profile Section */}
          <section style={{ backgroundColor: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '32px', marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Profile Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: COLORS.navy,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 14,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 6,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 14,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 6,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 14,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 6,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: saving ? '#e2e6ea' : COLORS.red,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setForm({
                        first_name: profile.first_name || '',
                        last_name: profile.last_name || '',
                        phone: profile.phone || '',
                      });
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#fff',
                      color: COLORS.text,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Email
                  </p>
                  <p style={{ fontSize: 15, color: COLORS.text, margin: 0 }}>{user?.email}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Name
                  </p>
                  <p style={{ fontSize: 15, color: COLORS.text, margin: 0 }}>
                    {profile?.first_name} {profile?.last_name}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Phone
                  </p>
                  <p style={{ fontSize: 15, color: COLORS.text, margin: 0 }}>{profile?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Account Type
                  </p>
                  <p style={{ fontSize: 15, color: COLORS.text, margin: 0, textTransform: 'capitalize' }}>
                    {profile?.account_type || 'Customer'}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Shipment History */}
          <section style={{ backgroundColor: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '32px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
              Recent Shipments
            </h2>

            {shipments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <i className="fa-solid fa-box-open" style={{ fontSize: 48, color: COLORS.border, marginBottom: 16 }} />
                <p style={{ fontSize: 15, color: COLORS.muted, marginBottom: 8 }}>No shipments yet</p>
                <p style={{ fontSize: 13, color: COLORS.muted }}>Your shipment history will appear here.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr style={{ backgroundColor: COLORS.gray, borderBottom: `1px solid ${COLORS.border}` }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Tracking Number
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Origin
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Destination
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Status
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((shipment) => (
                      <tr key={shipment.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: COLORS.navy }}>
                          <a href={`/track?tracking=${shipment.tracking_number}`} style={{ color: COLORS.navy, textDecoration: 'none' }}>
                            {shipment.tracking_number}
                          </a>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: COLORS.text }}>{shipment.origin}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: COLORS.text }}>{shipment.destination}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge status={shipment.status} />
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: COLORS.muted }}>
                          {formatDate(shipment.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

function StatusBadge({ status }) {
  const colors = {
    'In Transit': { bg: '#dbeafe', text: '#1e40af' },
    'On Hold': { bg: '#fef3c7', text: '#92400e' },
    'Out for Delivery': { bg: '#d1fae5', text: '#065f46' },
    'Delivered': { bg: '#d1fae5', text: '#065f46' },
    'Pending': { bg: '#f3f4f6', text: '#374151' },
    'Cancelled': { bg: '#fee2e2', text: '#991b1b' },
  };

  const style = colors[status] || { bg: '#f3f4f6', text: '#374151' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
