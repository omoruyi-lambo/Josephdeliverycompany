import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';
import { requireAdmin } from '../../../../lib/adminAuth';

export async function getServerSideProps({ req, res }) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin/shipments' : '/admin/shipments', permanent: false } };
  return { props: {} };
}

const statuses = ['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED', 'ON_HOLD', 'OUT_FOR_DELIVERY', 'DELIVERED'];
export default function AddEventPage() {
  const router = useRouter(); const [form, setForm] = useState({ status: 'IN_TRANSIT', location: '', country: '', city: '', address: '', latitude: '', longitude: '', eventDate: '', description: '' }); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  async function submit(event) { event.preventDefault(); setSaving(true); setError(''); try { const payload = { ...form, eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : '' }; const r = await fetch(`/api/admin/shipments/${router.query.id}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const data = await r.json(); if (!r.ok) throw new Error(data.error); router.push(`/admin/shipments/${router.query.id}`); } catch (e) { setError(e.message); setSaving(false); } }
  return <AdminLayout title="Add tracking event" description="Write the event to Supabase and update the shipment status/location together."><form className="admin-form" onSubmit={submit}><section className="admin-form-section"><h2>Event details</h2><div className="admin-form-grid three"><label className="admin-field"><span>Status *</span><select value={form.status} onChange={(e) => set('status', e.target.value)}>{statuses.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}</select></label><Field label="Event date/time" name="eventDate" type="datetime-local" form={form} set={set} required /><Field label="Location label" name="location" form={form} set={set} required /></div><Field label="Description" name="description" form={form} set={set} required textarea /></section><section className="admin-form-section"><h2>Location data (optional)</h2><div className="admin-form-grid three"><Field label="Country" name="country" form={form} set={set} /><Field label="City" name="city" form={form} set={set} /><Field label="Address" name="address" form={form} set={set} /><Field label="Latitude" name="latitude" type="number" form={form} set={set} /><Field label="Longitude" name="longitude" type="number" form={form} set={set} /></div></section>{error && <p className="admin-error">{error}</p>}<div className="admin-form-actions"><button className="admin-secondary" type="button" onClick={() => router.back()}>Cancel</button><button className="admin-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save tracking event'} <i className="fa-solid fa-check" /></button></div></form></AdminLayout>;
}
function Field({ label, name, type = 'text', form, set, required, textarea }) { return <label className="admin-field"><span>{label}{required ? ' *' : ''}</span>{textarea ? <textarea rows="5" value={form[name]} onChange={(e) => set(name, e.target.value)} required={required} /> : <input type={type} step={type === 'number' ? 'any' : undefined} value={form[name]} onChange={(e) => set(name, e.target.value)} required={required} />}</label>; }
