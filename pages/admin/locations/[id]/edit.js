import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';
import { requireAdmin } from '../../../../lib/adminAuth';

const PRIMARY_COUNTRIES = [
  'United States',
  'Brazil',
  'Japan',
  'India',
  'South Korea',
  'France',
];

const REGIONS = ['Americas', 'Asia-Pacific', 'Europe', 'Africa', 'Middle East'];

const OFFICE_TYPES = ['Regional Office', 'Headquarters', 'Distribution Center', 'Warehouse', 'Cargo Terminal'];

export async function getServerSideProps({ req, res }) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin/locations' : '/admin', permanent: false } };
  return { props: {} };
}

export default function EditLocation() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  
  const [formData, setFormData] = useState({
    country: '',
    country_code: '',
    region: '',
    city: '',
    office_name: '',
    office_type: 'Regional Office',
    address: '',
    phone: '',
    email: '',
    opening_hours: '',
    latitude: '',
    longitude: '',
    image_url: '',
    image_alt: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    if (id) fetchLocation();
  }, [id]);

  async function fetchLocation() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/locations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const location = data.locations?.find(l => l.id === id);
      if (!location) {
        setNotFound(true);
        return;
      }

      setFormData({
        country: location.country || '',
        country_code: location.country_code || '',
        region: location.region || '',
        city: location.city || '',
        office_name: location.office_name || '',
        office_type: location.office_type || 'Regional Office',
        address: location.address || '',
        phone: location.phone || '',
        email: location.email || '',
        opening_hours: location.opening_hours || '',
        latitude: location.latitude !== null ? location.latitude : '',
        longitude: location.longitude !== null ? location.longitude : '',
        image_url: location.image_url || '',
        image_alt: location.image_alt || '',
        description: location.description || '',
        is_active: location.is_active !== undefined ? location.is_active : true,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-set country code when country changes
    if (name === 'country') {
      const countryCodeMap = {
        'United States': 'US',
        'Brazil': 'BR',
        'Japan': 'JP',
        'India': 'IN',
        'South Korea': 'KR',
        'France': 'FR',
      };
      setFormData(prev => ({
        ...prev,
        country_code: countryCodeMap[value] || '',
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        id,
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      const res = await fetch('/api/admin/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push('/admin/locations');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Edit Location" description="Update office location details.">
        <p className="admin-muted">Loading location...</p>
      </AdminLayout>
    );
  }

  if (notFound) {
    return (
      <AdminLayout title="Location Not Found" description="">
        <p className="admin-error">Location not found.</p>
        <button onClick={() => router.push('/admin/locations')} className="admin-secondary">
          Back to Locations
        </button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Location" description="Update office location details.">
      <form onSubmit={handleSubmit} className="admin-form">
        {error && <p className="admin-error" role="alert">{error}</p>}

        <div className="admin-form-section">
          <h3>Basic Information</h3>
          
          <div className="admin-form-row">
            <div className="admin-form-field">
              <label htmlFor="country">Country *</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="">Select country</option>
                {PRIMARY_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="">─────────</option>
                <option value={formData.country || ''}>{formData.country || 'Other'}</option>
              </select>
            </div>

            <div className="admin-form-field">
              <label htmlFor="country_code">Country Code *</label>
              <input
                id="country_code"
                name="country_code"
                type="text"
                value={formData.country_code}
                onChange={handleChange}
                required
                maxLength={2}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-field">
              <label htmlFor="region">Region *</label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
              >
                <option value="">Select region</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                <option value={formData.region || ''}>{formData.region || 'Other'}</option>
              </select>
            </div>

            <div className="admin-form-field">
              <label htmlFor="city">City *</label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-field">
              <label htmlFor="office_name">Office Name</label>
              <input
                id="office_name"
                name="office_name"
                type="text"
                value={formData.office_name}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="office_type">Office Type</label>
              <select
                id="office_type"
                name="office_type"
                value={formData.office_type}
                onChange={handleChange}
              >
                {OFFICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="admin-form-section">
          <h3>Contact Information</h3>
          
          <div className="admin-form-field">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="admin-form-field">
            <label htmlFor="opening_hours">Opening Hours</label>
            <input
              id="opening_hours"
              name="opening_hours"
              type="text"
              value={formData.opening_hours}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="admin-form-section">
          <h3>Location & Coordinates</h3>
          
          <div className="admin-form-row">
            <div className="admin-form-field">
              <label htmlFor="latitude">Latitude (-90 to 90)</label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                min="-90"
                max="90"
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="longitude">Longitude (-180 to 180)</label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                min="-180"
                max="180"
              />
            </div>
          </div>
        </div>

        <div className="admin-form-section">
          <h3>Image & Description</h3>
          
          <div className="admin-form-field">
            <label htmlFor="image_url">Image URL</label>
            <input
              id="image_url"
              name="image_url"
              type="url"
              value={formData.image_url}
              onChange={handleChange}
            />
            <p className="admin-muted">Use a real photographic image of a logistics facility.</p>
          </div>

          <div className="admin-form-field">
            <label htmlFor="image_alt">Image Alt Text</label>
            <input
              id="image_alt"
              name="image_alt"
              type="text"
              value={formData.image_alt}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        <div className="admin-form-section">
          <div className="admin-form-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Active (visible on public locations page)</span>
            </label>
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="button" onClick={() => router.push('/admin/locations')} className="admin-secondary">
            Cancel
          </button>
          <button type="submit" className="admin-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
