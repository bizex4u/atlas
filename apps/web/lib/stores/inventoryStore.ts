import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OOHSite, SiteStatus, OOHFormat } from '@/types/inventory';

function uuid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

export function nextSiteCode(sites: OOHSite[], city: string, format: OOHFormat): string {
  const cityCode = city.slice(0, 3).toUpperCase();
  const fmtCode: Record<OOHFormat, string> = {
    hoarding: 'HRD', unipole: 'UNI', gantry: 'GNT',
    'led-display': 'LED', 'bus-shelter': 'BUS',
    'transit-media': 'TRN', 'wall-wrap': 'WRP',
    kiosk: 'KSK', other: 'OTH',
  };
  const prefix = `${cityCode}-${fmtCode[format] ?? 'OTH'}-`;
  const existing = sites
    .map((s) => s.siteCode)
    .filter((c) => c.startsWith(prefix))
    .map((c) => parseInt(c.slice(prefix.length), 10))
    .filter((n) => !isNaN(n));
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

interface InventoryFilters {
  city: string;
  status: SiteStatus | '';
  format: OOHFormat | '';
}

interface InventoryStore {
  sites: OOHSite[];
  filters: InventoryFilters;

  addSite: (data: Omit<OOHSite, 'id' | 'siteCode' | 'createdAt' | 'updatedAt'>) => OOHSite;
  updateSite: (id: string, data: Partial<OOHSite>) => void;
  removeSite: (id: string) => void;
  setFilters: (f: Partial<InventoryFilters>) => void;
  filteredSites: () => OOHSite[];
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      sites: [],
      filters: { city: '', status: '', format: '' },

      addSite: (data) => {
        const sites = get().sites;
        const site: OOHSite = {
          ...data,
          id: uuid(),
          siteCode: nextSiteCode(sites, data.city, data.format),
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ sites: [site, ...s.sites] }));
        return site;
      },

      updateSite: (id, data) =>
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, ...data, updatedAt: now() } : site,
          ),
        })),

      removeSite: (id) =>
        set((s) => ({ sites: s.sites.filter((site) => site.id !== id) })),

      setFilters: (f) =>
        set((s) => ({ filters: { ...s.filters, ...f } })),

      filteredSites: () => {
        const { sites, filters } = get();
        return sites.filter((s) => {
          if (filters.city && !s.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
          if (filters.status && s.status !== filters.status) return false;
          if (filters.format && s.format !== filters.format) return false;
          return true;
        });
      },
    }),
    { name: 'atlas-inventory' },
  ),
);
