import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { requireAdmin } from '../../../lib/adminAuth';

export async function getServerSideProps({ req, res }) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin/shipments' : '/admin', permanent: false } };
  return { props: {} };
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]); const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [error, setError] = useState('');
  useEffect(() => { fetch('/api/admin/shipments').then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setShipments(data.shipments || []); }).catch((err) => setError(err.message)); }, []);
  const filtered = useMemo(() => shipments.filter((s) => (!search || s.tracking_number.toLowerCase().includes(search.toLowerCase())) && (!status || s.status_code === status)), [shipments, search, status]);
  return <AdminLayout title="Shipments" description="Live shipment records from Supabase."><div className="admin-toolbar"><input placeholder="Search tracking number" value={search} onChange={(e) => setSearch(e.target.value)} /><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED', 'ON_HOLD', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}</select><Link className="admin-primary" href="/admin/shipments/new">Create shipment</Link></div>{error && <p className="admin-error">{error}</p>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tracking number</th><th>Customer</th><th>Origin</th><th>Destination</th><th>Current location</th><th>Status</th><th>Estimated delivery</th><th>Updated</th></tr></thead><tbody>{filtered.map((shipment) => <tr key={shipment.id}><td><Link href={`/admin/shipments/${shipment.id}`}>{shipment.tracking_number}</Link></td><td>{shipment.customer_name || '—'}</td><td>{shipment.origin || '—'}</td><td>{shipment.destination || '—'}</td><td>{shipment.current_location || '—'}</td><td><span className="admin-status">{shipment.status_code}</span></td><td>{shipment.estimated_delivery || '—'}</td><td>{shipment.updated_at ? new Date(shipment.updated_at).toLocaleDateString() : '—'}</td></tr>)}</tbody></table>{!filtered.length && !error && <p className="admin-empty">No shipments found.</p>}</div></AdminLayout>;
}
