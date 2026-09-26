import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';
import { requireAdmin } from '../../../../lib/adminAuth';

export async function getServerSideProps({ req, res }) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin/shipments' : '/admin/shipments', permanent: false } };
  return { props: {} };
}

const statuses = ['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED', 'ON_HOLD', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const fields = [
  ['customer_name', 'Customer name'], ['customer_email', 'Customer email'], ['customer_phone', 'Customer phone'],
  ['origin_country', 'Origin country'], ['origin_city', 'Origin city'], ['origin_address', 'Origin address'], ['origin_lat', 'Origin latitude'], ['origin_lng', 'Origin longitude'],
  ['destination_country', 'Destination country'], ['destination_city', 'Destination city'], ['destination_address', 'Destination address'], ['destination_lat', 'Destination latitude'], ['destination_lng', 'Destination longitude'],
  ['shipment_type', 'Shipment type'], ['service', 'Service'], ['package_type', 'Package type'], ['shipment_date', 'Shipment date'], ['estimated_delivery', 'Estimated delivery'],
  ['current_country', 'Current country'], ['current_city', 'Current city'], ['current_address', 'Current address'], ['current_lat', 'Current latitude'], ['current_lng', 'Current longitude'], ['current_position', 'Route position (0–1)'],
];

export default function EditShipmentPage() {
  const router = useRouter(); const [form, setForm] = useState(null); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { if (!router.query.id) return; fetch(`/api/admin/shipments/${router.query.id}`).then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setForm(data.shipment); }).catch((e) => setError(e.message)); }, [router.query.id]);
  function set(name, value) { setForm((current) => ({ ...current, [name]: value })); }
  async function save(event) { event.preventDefault(); setSaving(true); setError(''); const payload = { ...form, status: undefined, origin: [form.origin_city, form.origin_country].filter(Boolean).join(', '), destination: [form.destination_city, form.destination_country].filter(Boolean).join(', '), current_location: [form.current_city, form.current_country].filter(Boolean).join(', ') }; delete payload.id; delete payload.tracking_number; try { const r = await fetch(`/api/admin/shipments/${router.query.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const data = await r.json(); if (!r.ok) throw new Error(data.error); router.push(`/admin/shipments/${router.query.id}`); } catch (e) { setError(e.message); setSaving(false); } }
  if (error && !form) return <AdminLayout title="Edit shipment"><p className="admin-error">{error}</p></AdminLayout>;
  if (!form) return <AdminLayout title="Edit shipment"><p className="admin-muted">Loading shipment from Supabase…</p></AdminLayout>;
  return <AdminLayout title={`Edit ${form.tracking_number}`} description="Tracking numbers are permanent and cannot be edited."><form className="admin-form" onSubmit={save}><Section title="Customer"><Grid items={fields.slice(0, 3)} form={form} set={set} /></Section><Section title="Origin"><Grid items={fields.slice(3, 8)} form={form} set={set} numeric /></Section><Section title="Destination"><Grid items={fields.slice(8, 13)} form={form} set={set} numeric /></Section><Section title="Shipment"><Grid items={fields.slice(13, 18)} form={form} set={set} /></Section><Section title="Current location"><Grid items={fields.slice(18)} form={form} set={set} numeric /></Section><section className="admin-form-section"><h2>Status</h2><label className="admin-field"><span>Status *</span><select value={form.status_code || ''} onChange={(e) => { set('status_code', e.target.value); set('status', e.target.value.replaceAll('_', ' ')); }}>{statuses.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}</select></label></section>{error && <p className="admin-error">{error}</p>}<div className="admin-form-actions"><button type="button" className="admin-secondary" onClick={() => router.back()}>Cancel</button><button type="submit" className="admin-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'} <i className="fa-solid fa-check" /></button></div></form></AdminLayout>;
}

function Section({ title, children }) { return <section className="admin-form-section"><h2>{title}</h2>{children}</section>; }
function Grid({ items, form, set, numeric }) { return <div className="admin-form-grid three">{items.map(([name, label]) => <label className="admin-field" key={name}><span>{label}</span><input type={name.includes('date') || name === 'estimated_delivery' ? 'date' : numeric || name.includes('_lat') || name.includes('_lng') || name === 'current_position' ? 'number' : name.includes('email') ? 'email' : 'text'} step={numeric || name.includes('_lat') || name.includes('_lng') || name === 'current_position' ? 'any' : undefined} value={form[name] ?? ''} onChange={(e) => set(name, e.target.value)} /></label>)}</div>; }
