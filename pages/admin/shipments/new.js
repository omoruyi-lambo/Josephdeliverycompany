import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import { requireAdmin } from '../../../lib/adminAuth';

export async function getServerSideProps({ req, res }) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin/shipments/new' : '/admin', permanent: false } };
  return { props: {} };
}

const initial = { customerName: '', customerEmail: '', customerPhone: '', originCountry: '', originCity: '', originAddress: '', originLat: '', originLng: '', destinationCountry: '', destinationCity: '', destinationAddress: '', destinationLat: '', destinationLng: '', shipmentType: '', service: '', packageType: '', shipmentDate: '', estimatedDelivery: '', currentCountry: '', currentCity: '', currentAddress: '', currentLat: '', currentLng: '', currentPosition: '0', status: 'BOOKED', eventDescription: 'Shipment booked and prepared for transportation.', eventLocation: '', eventDate: '' };
const statuses = ['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED', 'ON_HOLD', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function NewShipmentPage() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError('');
    const payload = { ...form, eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : '' };
    try {
      const response = await fetch('/api/admin/shipments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || 'Shipment creation failed.'); setSaving(false); return; }
      router.push(`/admin/shipments/${result.shipment.id}`);
    } catch (err) { setError(err.message || 'Shipment creation failed.'); setSaving(false); }
  }

  return <AdminLayout title="Create shipment" description="Create a live shipment record and its first tracking event."><form className="admin-form" onSubmit={submit}><FormSection title="Customer information"><div className="admin-form-grid three"><Field label="Customer name" value={form.customerName} onChange={(v) => set('customerName', v)} required /><Field label="Customer email" type="email" value={form.customerEmail} onChange={(v) => set('customerEmail', v)} /><Field label="Customer phone" value={form.customerPhone} onChange={(v) => set('customerPhone', v)} /></div></FormSection><FormSection title="Origin"><div className="admin-form-grid three"><Field label="Country" value={form.originCountry} onChange={(v) => set('originCountry', v)} required /><Field label="City" value={form.originCity} onChange={(v) => set('originCity', v)} required /><Field label="Address" value={form.originAddress} onChange={(v) => set('originAddress', v)} /><Field label="Latitude" type="number" step="any" value={form.originLat} onChange={(v) => set('originLat', v)} required /><Field label="Longitude" type="number" step="any" value={form.originLng} onChange={(v) => set('originLng', v)} required /></div></FormSection><FormSection title="Destination"><div className="admin-form-grid three"><Field label="Country" value={form.destinationCountry} onChange={(v) => set('destinationCountry', v)} required /><Field label="City" value={form.destinationCity} onChange={(v) => set('destinationCity', v)} required /><Field label="Address" value={form.destinationAddress} onChange={(v) => set('destinationAddress', v)} /><Field label="Latitude" type="number" step="any" value={form.destinationLat} onChange={(v) => set('destinationLat', v)} required /><Field label="Longitude" type="number" step="any" value={form.destinationLng} onChange={(v) => set('destinationLng', v)} required /></div></FormSection><FormSection title="Shipment information"><div className="admin-form-grid three"><Field label="Shipment type" value={form.shipmentType} onChange={(v) => set('shipmentType', v)} required /><Field label="Service" value={form.service} onChange={(v) => set('service', v)} required /><Field label="Package type" value={form.packageType} onChange={(v) => set('packageType', v)} required /><Field label="Shipment date" type="date" value={form.shipmentDate} onChange={(v) => set('shipmentDate', v)} /><Field label="Estimated delivery" type="date" value={form.estimatedDelivery} onChange={(v) => set('estimatedDelivery', v)} /></div></FormSection><FormSection title="Current shipment location"><div className="admin-form-grid three"><Field label="Country" value={form.currentCountry} onChange={(v) => set('currentCountry', v)} /><Field label="City" value={form.currentCity} onChange={(v) => set('currentCity', v)} /><Field label="Address" value={form.currentAddress} onChange={(v) => set('currentAddress', v)} /><Field label="Latitude" type="number" step="any" value={form.currentLat} onChange={(v) => set('currentLat', v)} /><Field label="Longitude" type="number" step="any" value={form.currentLng} onChange={(v) => set('currentLng', v)} /><Field label="Route position (0–1)" type="number" min="0" max="1" step="0.01" value={form.currentPosition} onChange={(v) => set('currentPosition', v)} /></div></FormSection><FormSection title="Status and initial tracking event"><div className="admin-form-grid three"><label className="admin-field"><span>Status *</span><select value={form.status} onChange={(e) => set('status', e.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label><Field label="Event location" value={form.eventLocation} onChange={(v) => set('eventLocation', v)} required /><Field label="Event date" type="datetime-local" value={form.eventDate} onChange={(v) => set('eventDate', v)} required /></div><label className="admin-field"><span>Event description *</span><textarea rows="4" value={form.eventDescription} onChange={(e) => set('eventDescription', e.target.value)} required /></label></FormSection>{error && <p className="admin-error" role="alert">{error}</p>}<div className="admin-form-actions"><button className="admin-secondary" type="button" onClick={() => router.back()}>Cancel</button><button className="admin-primary" disabled={saving} type="submit">{saving ? 'Creating…' : 'Create shipment'} <i className="fa-solid fa-arrow-right" /></button></div></form></AdminLayout>;
}

function FormSection({ title, children }) { return <section className="admin-form-section"><h2>{title}</h2>{children}</section>; }
function Field({ label, type = 'text', value, onChange, required, step }) { return <label className="admin-field"><span>{label}{required ? ' *' : ''}</span><input type={type} step={step} value={value} onChange={(e) => onChange(e.target.value)} required={required} /></label>; }
