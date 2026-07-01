import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Site, SiteFormat, SiteStatus } from '@/types';
import { generateId, generateSiteCode } from '@/lib/utils';

interface SiteStore {
  sites: Site[];
  selectedSiteId: string | null;
  siteCounter: number;

  addSite: (site: Omit<Site, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => Site;
  updateSite: (id: string, updates: Partial<Site>) => void;
  deleteSite: (id: string) => void;
  setSelectedSite: (id: string | null) => void;
  getSitesByCity: (city: string) => Site[];
  getSitesByStatus: (status: SiteStatus) => Site[];
  getSitesByFormat: (format: SiteFormat) => Site[];
  getAvailableSites: () => Site[];
  searchSites: (query: string) => Site[];
}

export const useSiteStore = create<SiteStore>()(
  persist(
    (set, get) => ({
      sites: [],
      selectedSiteId: null,
      siteCounter: 0,

      addSite: (siteData) => {
        const state = get();
        const citySites = state.sites.filter(s => s.city === siteData.city);
        const code = generateSiteCode(siteData.city, siteData.format, citySites.length);

        const newSite: Site = {
          ...siteData,
          id: generateId(),
          code,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          sites: [...state.sites, newSite],
          siteCounter: state.siteCounter + 1
        }));

        return newSite;
      },

      updateSite: (id, updates) => {
        set((state) => ({
          sites: state.sites.map(site =>
            site.id === id
              ? { ...site, ...updates, updatedAt: new Date().toISOString() }
              : site
          )
        }));
      },

      deleteSite: (id) => {
        set((state) => ({
          sites: state.sites.filter(site => site.id !== id),
          selectedSiteId: state.selectedSiteId === id ? null : state.selectedSiteId
        }));
      },

      setSelectedSite: (id) => {
        set({ selectedSiteId: id });
      },

      getSitesByCity: (city) => {
        return get().sites.filter(site => site.city.toLowerCase() === city.toLowerCase());
      },

      getSitesByStatus: (status) => {
        return get().sites.filter(site => site.status === status);
      },

      getSitesByFormat: (format) => {
        return get().sites.filter(site => site.format === format);
      },

      getAvailableSites: () => {
        return get().sites.filter(site => site.status === 'available');
      },

      searchSites: (query) => {
        const q = query.toLowerCase();
        return get().sites.filter(site =>
          site.name.toLowerCase().includes(q) ||
          site.code.toLowerCase().includes(q) ||
          site.city.toLowerCase().includes(q) ||
          site.location.address?.toLowerCase().includes(q)
        );
      }
    }),
    {
      name: 'atlas-sites'
    }
  )
);
