import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { requireAdmin } from '../../../lib/adminAuth';

export async function getServerSideProps({ req, res }) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin/locations' : '/admin', permanent: false } };
  return { props: {} };
}

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/locations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLocations(data.locations || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id, currentStatus) {
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLocations(locations.map(loc => loc.id === id ? { ...loc, is_active: !currentStatus } : loc));
    } catch (e) {
      setError(e.message);
    }
  }

  const countries = [...new Set(locations.map(l => l.country))].sort();
  
  const filtered = locations.filter(loc => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      loc.country.toLowerCase().includes(searchLower) ||
      loc.city.toLowerCase().includes(searchLower) ||
      loc.office_name.toLowerCase().includes(searchLower);
    
    const matchesCountry = !countryFilter || loc.country === countryFilter;
    const matchesActive = activeFilter === 'ALL' || 
      (activeFilter === 'ACTIVE' && loc.is_active) ||
      (activeFilter === 'INACTIVE' && !loc.is_active);
    
    return matchesSearch && matchesCountry && matchesActive;
  });

  return (
    <AdminLayout title="Locations" description="Manage international office locations and logistics facilities.">
      <div className="admin-toolbar">
        <input
          aria-label="Search locations"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search country, city, or office name..."
        />
        <select
          aria-label="Filter by country"
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
        >
          <option value="">All Countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          aria-label="Filter by status"
          value={activeFilter}
          onChange={e => setActiveFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <Link className="admin-primary" href="/admin/locations/new">
          Add Location <i className="fa-solid fa-plus" />
        </Link>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      {loading ? (
        <p className="admin-muted">Loading locations...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>City</th>
                <th>Office</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-empty">No locations found.</td>
                </tr>
              ) : (
                filtered.map(location => (
                  <tr key={location.id}>
                    <td>{location.country}</td>
                    <td>{location.city}</td>
                    <td>{location.office_name || '—'}</td>
                    <td>
                      <span className={`admin-status ${location.is_active ? 'active' : 'inactive'}`}>
                        {location.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(location.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Link className="admin-secondary" href={`/admin/locations/${location.id}/edit`}>
                          Edit
                        </Link>
                        <button
                          onClick={() => toggleActive(location.id, location.is_active)}
                          className={location.is_active ? 'admin-secondary' : 'admin-primary'}
                          style={{ padding: '6px 12px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', backgroundColor: location.is_active ? '#fff' : '#fbd0cc', color: location.is_active ? '#0a1f3c' : '#c0392b' }}
                        >
                          {location.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
