import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { requireAdmin } from '../../../lib/adminAuth';

const statuses = ['ALL', 'NEW', 'READ', 'IN_PROGRESS', 'QUOTED', 'RESOLVED'];
export async function getServerSideProps({ req, res }) { const auth = await requireAdmin(req, res); if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin/quotes' : '/admin', permanent: false } }; return { props: {} }; }

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]); const [search, setSearch] = useState(''); const [status, setStatus] = useState('ALL'); const [error, setError] = useState('');
  useEffect(() => { const timer = setTimeout(() => { const params = new URLSearchParams(); if (search.trim()) params.set('search', search.trim()); if (status !== 'ALL') params.set('status', status); fetch(`/api/admin/quotes?${params}`).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setQuotes(data.quotes || []); }).catch(e => setError(e.message)); }, 160); return () => clearTimeout(timer); }, [search, status]);
  return <AdminLayout title="Quote requests" description="Review live quote requests submitted by customers."><div className="admin-toolbar"><input aria-label="Search quote requests" placeholder="Search name, email, origin, destination…" value={search} onChange={e => setSearch(e.target.value)} /><select aria-label="Filter quote status" value={status} onChange={e => setStatus(e.target.value)}>{statuses.map(value => <option key={value}>{value}</option>)}</select></div>{error && <p className="admin-error">{error}</p>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Customer</th><th>Route</th><th>Service</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody>{quotes.length ? quotes.map(quote => <tr key={quote.id}><td>{quote.full_name}<small className="admin-table-subline">{quote.email}</small></td><td>{quote.origin_city} → {quote.destination_city}</td><td>{quote.service_type}</td><td><span className={`admin-status ${quote.status.toLowerCase()}`}>{quote.status.replace('_', ' ')}</span></td><td>{new Date(quote.created_at).toLocaleDateString()}</td><td><Link className="admin-secondary" href={`/admin/quotes/${quote.id}`}>View</Link></td></tr>) : <tr><td colSpan="6" className="admin-empty">No quote requests yet.</td></tr>}</tbody></table></div></AdminLayout>;
}
