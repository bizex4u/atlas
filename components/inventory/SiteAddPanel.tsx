'use client';

import { useState } from 'react';
import { useSiteStore, useAppStore } from '@/lib/stores';
import { INDIAN_STATES, FORMAT_LABELS, type SiteFormat, type SiteStatus, type SiteType } from '@/types';

export default function SiteAddPanel() {
  const { addSite } = useSiteStore();
  const { closeDrawer, setMapCenter } = useAppStore();

  const [form, setForm] = useState({
    name: '',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '',
    format: 'HRD' as SiteFormat,
    type: 'owned' as SiteType,
    status: 'available' as SiteStatus,
    width: 40,
    height: 20,
    rent: 25000,
    electricity: 2000,
    municipal: 1000,
    lat: 26.8467,
    lng: 80.9462,
    address: '',
    landmark: '',
    landlordName: '',
    landlordPhone: '',
    visibility: 'good' as const,
    trafficType: 'arterial' as const,
    lighting: 'frontlit' as const
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const sqft = form.width * form.height;

    addSite({
      name: form.name,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      format: form.format,
      type: form.type,
      status: form.status,
      dimensions: {
        width: form.width,
        height: form.height,
        sqft
      },
      location: {
        lat: form.lat,
        lng: form.lng,
        address: form.address,
        landmark: form.landmark || undefined
      },
      financial: {
        rent: form.rent,
        electricity: form.electricity,
        municipal: form.municipal,
        currency: 'INR'
      },
      landlord: form.landlordName ? {
        name: form.landlordName,
        phone: form.landlordPhone
      } : undefined,
      visibility: form.visibility,
      trafficType: form.trafficType,
      lighting: form.lighting
    });

    setTimeout(() => {
      setSaving(false);
      closeDrawer();
    }, 300);
  };

  const handleUseMapCenter = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }));
      },
      () => {
        // Use default Lucknow coordinates
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="label">Site Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Hazratganj Main Road"
          className="input"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="label">City *</label>
          <select
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="select"
          >
            <option value="Lucknow">Lucknow</option>
            <option value="Kanpur">Kanpur</option>
            <option value="Varanasi">Varanasi</option>
            <option value="Agra">Agra</option>
            <option value="Patna">Patna</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Format *</label>
          <select
            value={form.format}
            onChange={(e) => handleChange('format', e.target.value as SiteFormat)}
            className="select"
          >
            {Object.entries(FORMAT_LABELS).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="label">Width (ft)</label>
          <input
            type="number"
            value={form.width}
            onChange={(e) => handleChange('width', parseInt(e.target.value) || 0)}
            className="input"
            min={1}
          />
        </div>
        <div className="form-group">
          <label className="label">Height (ft)</label>
          <input
            type="number"
            value={form.height}
            onChange={(e) => handleChange('height', parseInt(e.target.value) || 0)}
            className="input"
            min={1}
          />
        </div>
      </div>

      <div className="card bg-dark-100/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Total Area</span>
          <span className="text-lg font-medium text-white">{form.width * form.height} sqft</span>
        </div>
      </div>

      <div className="form-group">
        <label className="label">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Full address"
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="label">Latitude</label>
          <input
            type="number"
            value={form.lat}
            onChange={(e) => handleChange('lat', parseFloat(e.target.value) || 0)}
            className="input"
            step="0.0001"
          />
        </div>
        <div className="form-group">
          <label className="label">Longitude</label>
          <input
            type="number"
            value={form.lng}
            onChange={(e) => handleChange('lng', parseFloat(e.target.value) || 0)}
            className="input"
            step="0.0001"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="label">Monthly Rent (₹) *</label>
          <input
            type="number"
            value={form.rent}
            onChange={(e) => handleChange('rent', parseInt(e.target.value) || 0)}
            className="input"
            min={0}
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Electricity (₹)</label>
          <input
            type="number"
            value={form.electricity}
            onChange={(e) => handleChange('electricity', parseInt(e.target.value) || 0)}
            className="input"
            min={0}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="label">Type</label>
          <select
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value as SiteType)}
            className="select"
          >
            <option value="owned">Owned</option>
            <option value="leased">Leased</option>
            <option value="barter">Barter</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Status</label>
          <select
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value as SiteStatus)}
            className="select"
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="booked">Booked</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="h-px bg-dark-100 my-4" />

      <div className="text-sm text-gray-400 mb-2">Landlord Details (Optional)</div>

      <div className="form-group">
        <label className="label">Landlord Name</label>
        <input
          type="text"
          value={form.landlordName}
          onChange={(e) => handleChange('landlordName', e.target.value)}
          className="input"
        />
      </div>

      <div className="form-group">
        <label className="label">Landlord Phone</label>
        <input
          type="text"
          value={form.landlordPhone}
          onChange={(e) => handleChange('landlordPhone', e.target.value)}
          className="input"
        />
      </div>

      <button
        type="submit"
        disabled={saving || !form.name}
        className="btn btn-primary w-full mt-4"
      >
        {saving ? 'Adding...' : 'Add Site'}
      </button>
    </form>
  );
}
