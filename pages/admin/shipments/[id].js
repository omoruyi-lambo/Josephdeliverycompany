import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import ShipmentMap from '../../../components/ShipmentMap';
import { requireAdmin } from '../../../lib/adminAuth';

export async function getServerSideProps({ req, res }) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin/shipments' : '/admin/shipments', permanent: false } };
  return { props: {} };
}

export default function ShipmentDetailPage() {
  const router = useRouter(); const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { if (!router.query.id) return; fetch(`/api/admin/shipments/${router.query.id}`).then(async (r) => { const result = await r.json(); if (!r.ok) throw new Error(result.error); setData(result); }).catch((err) => setError(err.message)); }, [router.query.id]);
  if (error) return <AdminLayout title="Shipment unavailable"><p className="admin-error">{error}</p></AdminLayout>;
  if (!data) return <AdminLayout title="Shipment detail"><p className="admin-muted">Loading shipment from Supabase…</p></AdminLayout>;
  const { shipment, events } = data;
  const hasOrigin = shipment.origin_lat !== null && shipment.origin_lng !== null;
  const hasDestination = shipment.destination_lat !== null && shipment.destination_lng !== null;
  const hasCurrent = shipment.current_lat !== null && shipment.current_lng !== null;
  const mapData = { originCity: shipment.origin_city, destinationCity: shipment.destination_city, currentCity: shipment.current_city, originCoords: hasOrigin ? { lat: Number(shipment.origin_lat), lng: Number(shipment.origin_lng) } : null, destinationCoords: hasDestination ? { lat: Number(shipment.destination_lat), lng: Number(shipment.destination_lng) } : null, currentCoords: hasCurrent ? { lat: Number(shipment.current_lat), lng: Number(shipment.current_lng) } : null, currentPosition: Number(shipment.current_position || 0) };
  return <AdminLayout title={shipment.tracking_number} description="Live shipment record and tracking history."><div className="admin-detail-actions"><Link className="admin-primary" href={`/admin/shipments/${shipment.id}/edit`}>Edit shipment <i className="fa-solid fa-pen" /></Link><Link className="admin-secondary" href={`/admin/shipments/${shipment.id}/events`}>Add tracking event <i className="fa-solid fa-plus" /></Link><Link className="admin-secondary" href={`/track?tracking=${shipment.tracking_number}`}>View public tracking <i className="fa-solid fa-arrow-up-right-from-square" /></Link><Link className="admin-secondary" href="/admin/shipments">Back to shipments</Link></div><div className="admin-detail-grid"><section className="admin-card"><div className="admin-card-heading"><h2>Shipment overview</h2><span className="admin-status">{shipment.status_code}</span></div><Detail label="Customer" value={shipment.customer_name} /><Detail label="Customer email" value={shipment.customer_email} /><Detail label="Customer phone" value={shipment.customer_phone} /><Detail label="Origin" value={shipment.origin} /><Detail label="Destination" value={shipment.destination} /><Detail label="Current location" value={shipment.current_location} /><Detail label="Estimated delivery" value={shipment.estimated_delivery} /><Detail label="Service" value={shipment.service} /><Detail label="Package type" value={shipment.package_type} /></section><section className="admin-card"><h2>Shipment map</h2>{Number.isFinite(Number(shipment.origin_lat)) && Number.isFinite(Number(shipment.destination_lat)) ? <ShipmentMap mapData={mapData} statusCode={shipment.status_code} /> : <p className="admin-muted">No valid origin and destination coordinates were stored.</p>}</section></div><section className="admin-card"><div className="admin-card-heading"><h2>Tracking history</h2><span className="admin-muted">{events.length} event{events.length === 1 ? '' : 's'}</span></div><div className="admin-events">{events.slice().reverse().map((event, index) => <div className={`admin-event${index === 0 ? ' newest' : ''}`} key={event.id}><span className="admin-event-dot" /><div><strong>{event.status}</strong><p>{event.description}</p><small>{event.location} · {event.event_date ? new Date(event.event_date).toLocaleString() : 'No date'}</small></div></div>)}</div></section></AdminLayout>;
}

function Detail({ label, value }) { return <div className="admin-detail-row"><span>{label}</span><strong>{value || '—'}</strong></div>; }
