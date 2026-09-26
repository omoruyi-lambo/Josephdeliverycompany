import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { requireAdmin } from '../../lib/adminAuth';

export async function getServerSideProps({ req, res }) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin' : '/', permanent: false } };
  return { props: {} };
}

function Metric({ label, value, detail, icon, href, tone = 'navy' }) {
  return <Link href={href} className={`admin-metric admin-metric-${tone}`}><div className="admin-metric-icon"><i className={icon} /></div><div><span>{label}</span><strong>{value === null ? '—' : value}</strong><small>{detail}</small></div><i className="fa-solid fa-arrow-up-right admin-metric-arrow" /></Link>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ shipments: null, newMessages: null, quoteRequests: null, activeLocations: null });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/shipments').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/messages?status=NEW').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/quotes?status=NEW').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/locations').then(r => r.ok ? r.json() : null),
    ]).then(([shipments, messages, quotes, locations]) => setStats({ shipments: shipments?.shipments?.length ?? 0, newMessages: messages?.count ?? 0, quoteRequests: quotes?.count ?? 0, activeLocations: (locations?.locations || []).filter(location => location.is_active).length })).catch(() => setStats({ shipments: 0, newMessages: 0, quoteRequests: 0, activeLocations: 0 })).finally(() => setLoading(false));
  }, []);

  return <AdminLayout title="Admin dashboard" description="A live view of your delivery operation, support inbox, and international network.">
    <section className="admin-welcome"><div><span className="admin-overline">Good morning, admin</span><h2>Keep every delivery moving.</h2><p>Monitor your operation and take action from one focused workspace.</p></div><Link href="/admin/shipments/new" className="admin-primary admin-welcome-action"><i className="fa-solid fa-plus" /> Create shipment</Link></section>
    <section className="admin-metrics" aria-label="Live operation metrics"><Metric label="Total shipments" value={loading ? null : stats.shipments} detail="All shipment records" icon="fa-solid fa-boxes-stacked" href="/admin/shipments" /><Metric label="New messages" value={loading ? null : stats.newMessages} detail="Awaiting review" icon="fa-solid fa-inbox" href="/admin/messages" tone="red" /><Metric label="Quote requests" value={loading ? null : stats.quoteRequests} detail="Awaiting review" icon="fa-solid fa-file-invoice" href="/admin/quotes" tone="blue" /><Metric label="Active locations" value={loading ? null : stats.activeLocations} detail="Visible to customers" icon="fa-solid fa-location-dot" href="/admin/locations" tone="blue" /></section>
    <section className="admin-dashboard-grid"><div className="admin-panel admin-command-panel"><div className="admin-panel-heading"><div><span className="admin-overline">Quick actions</span><h3>What would you like to do?</h3></div><span className="admin-panel-dot" /></div><div className="admin-command-list"><Link href="/admin/shipments/new"><span className="admin-command-icon navy"><i className="fa-solid fa-plus" /></span><span><strong>Create a shipment</strong><small>Generate a tracking number and publish its first event.</small></span><i className="fa-solid fa-arrow-right" /></Link><Link href="/admin/messages"><span className="admin-command-icon red"><i className="fa-solid fa-inbox" /></span><span><strong>Review customer messages</strong><small>Read enquiries and update their status.</small></span><i className="fa-solid fa-arrow-right" /></Link><Link href="/admin/locations/new"><span className="admin-command-icon blue"><i className="fa-solid fa-location-dot" /></span><span><strong>Add a network location</strong><small>Publish a verified location with a real photograph.</small></span><i className="fa-solid fa-arrow-right" /></Link></div></div><div className="admin-panel admin-spotlight"><div className="admin-panel-heading"><div><span className="admin-overline">Operations console</span><h3>Shipment control center</h3></div><i className="fa-solid fa-arrow-up-right admin-panel-link-icon" /></div><div className="admin-spotlight-art"><div className="admin-route-line"><span /><span /><span /></div><div className="admin-route-point origin"><i className="fa-solid fa-location-dot" /></div><div className="admin-route-point destination"><i className="fa-solid fa-flag-checkered" /></div><div className="admin-route-label origin-label">Origin</div><div className="admin-route-label destination-label">Destination</div></div><p>Open a shipment to edit its route, update its current position, or add a tracking event.</p><Link href="/admin/shipments" className="admin-text-link">Open shipment list <i className="fa-solid fa-arrow-right" /></Link></div></section>
    <section className="admin-bottom-row"><div className="admin-panel admin-note"><span className="admin-note-icon"><i className="fa-solid fa-shield-halved" /></span><div><strong>Protected operations</strong><p>Admin actions are verified on the server and written directly to Supabase.</p></div><i className="fa-solid fa-check admin-note-check" /></div><div className="admin-panel admin-support-link"><div><span className="admin-overline">Need help?</span><strong>Open the public website</strong></div><Link href="/" aria-label="Open public website"><i className="fa-solid fa-arrow-up-right-from-square" /></Link></div></section>
  </AdminLayout>;
}
