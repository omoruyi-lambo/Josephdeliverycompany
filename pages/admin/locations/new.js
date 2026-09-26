import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import { requireAdmin } from '../../../lib/adminAuth';

export async function getServerSideProps({ req, res }) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return { redirect: { destination: auth.status === 401 ? '/signin?next=/admin/locations/new' : '/admin', permanent: false } };
  return { props: {} };
}

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

export default function NewLocation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
    setLoading(true);

    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push('/admin/locations');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout title="Add Location" description="Create a new office location or logistics facility.">
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
                <option value="Other">Other (enter country code manually)</option>
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
                placeholder="US, BR, JP, etc."
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
                placeholder="e.g., New York, São Paulo, Tokyo"
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
                placeholder="e.g., Miami Regional Office"
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
              placeholder="Full street address"
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
                placeholder="+1 555-123-4567"
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
                placeholder="office@example.com"
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
              placeholder="Mon–Fri 9 am – 6 pm"
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
                placeholder="e.g., 25.7617"
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
                placeholder="e.g., -80.1918"
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
              placeholder="https://example.com/location-photo.jpg"
              required
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
              placeholder="e.g., Cargo terminal at US port"
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
              placeholder="Brief description of this location's role in the network"
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
          <button type="button" onClick={() => router.back()} className="admin-secondary">
            Cancel
          </button>
          <button type="submit" className="admin-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Location'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
