import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import { requireAdmin } from '../../../lib/adminAuth';

const statuses = ['NEW', 'READ', 'IN_PROGRESS', 'RESOLVED'];

export async function getServerSideProps({ req, res }) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin/messages' : '/admin/messages', permanent: false } };
  return { props: {} };
}

export default function AdminMessageDetail() {
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState('NEW');
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!router.query.id) return; fetch(`/api/admin/messages/${router.query.id}`).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setMessage(data.message); setStatus(data.message.status); setReply(data.message.admin_reply || ''); }).catch(e => setError(e.message)); }, [router.query.id]);
  async function save(event) { event.preventDefault(); setSaving(true); setError(''); try { const r = await fetch(`/api/admin/messages/${router.query.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, adminReply: reply }) }); const data = await r.json(); if (!r.ok) throw new Error(data.error); setMessage(data.message); } catch (e) { setError(e.message); } finally { setSaving(false); } }
  if (!message) return <AdminLayout title="Message" description="Loading support message…">{error && <p className="admin-error">{error}</p>}</AdminLayout>;
  return <AdminLayout title="Message detail" description="Review and update this customer enquiry."><div className="admin-detail-actions"><Link className="admin-secondary" href="/admin/messages">Back to messages</Link>{message.tracking_number && <Link className="admin-primary" href={`/track?tracking=${encodeURIComponent(message.tracking_number)}`}>View tracking</Link>}</div><div className="admin-detail-grid"><section className="admin-card"><p className="admin-kicker">Customer information</p><div className="admin-detail-row"><span>Name</span><strong>{message.full_name}</strong></div><div className="admin-detail-row"><span>Email</span><strong>{message.email}</strong></div><div className="admin-detail-row"><span>Phone</span><strong>{message.phone || '—'}</strong></div><div className="admin-detail-row"><span>Tracking number</span><strong>{message.tracking_number || '—'}</strong></div><div className="admin-detail-row"><span>Created</span><strong>{new Date(message.created_at).toLocaleString()}</strong></div><div className="admin-detail-row"><span>Updated</span><strong>{new Date(message.updated_at).toLocaleString()}</strong></div></section><section className="admin-card"><p className="admin-kicker">Enquiry</p><h2>{message.subject}</h2><p className="admin-message-body">{message.message}</p><form onSubmit={save} className="admin-form-compact"><label className="admin-field"><span>Status</span><select value={status} onChange={e => setStatus(e.target.value)}>{statuses.map(value => <option key={value}>{value}</option>)}</select></label><label className="admin-field"><span>Admin reply (stored internally)</span><textarea rows="7" value={reply} onChange={e => setReply(e.target.value)} placeholder="Add an internal response note…" /></label>{error && <p className="admin-error">{error}</p>}<button className="admin-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></form></section></div></AdminLayout>;
}
