import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { requireAdmin } from '../../../lib/adminAuth';

const statuses = ['ALL', 'NEW', 'READ', 'IN_PROGRESS', 'RESOLVED'];

export async function getServerSideProps({ req, res }) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin/messages' : '/admin', permanent: false } };
  return { props: {} };
}

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [error, setError] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status !== 'ALL') params.set('status', status);
      fetch(`/api/admin/messages?${params}`).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setMessages(data.messages || []); }).catch(e => setError(e.message));
    }, 180);
    return () => clearTimeout(timer);
  }, [search, status]);
  return <AdminLayout title="Messages" description="Review customer enquiries stored in the support inbox.">
    <div className="admin-toolbar"><input aria-label="Search messages" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer, email, subject, tracking…" /><select aria-label="Filter message status" value={status} onChange={e => setStatus(e.target.value)}>{statuses.map(value => <option key={value} value={value}>{value === 'ALL' ? 'All statuses' : value.replace('_', ' ')}</option>)}</select></div>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Customer</th><th>Subject</th><th>Email</th><th>Tracking Number</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{messages.length ? messages.map(message => <tr key={message.id}><td>{message.full_name}</td><td>{message.subject}</td><td>{message.email}</td><td>{message.tracking_number || '—'}</td><td><span className={`admin-status ${message.status.toLowerCase()}`}>{message.status.replace('_', ' ')}</span></td><td>{new Date(message.created_at).toLocaleDateString()}</td><td><Link className="admin-secondary" href={`/admin/messages/${message.id}`}>View</Link></td></tr>) : <tr><td colSpan="7" className="admin-empty">No messages found.</td></tr>}</tbody></table></div>
  </AdminLayout>;
}
