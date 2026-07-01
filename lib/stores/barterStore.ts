import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BarterDeal, BarterPartner } from '@/types/barter';
import { useInventoryStore } from './inventoryStore';

function uuid() { return crypto.randomUUID(); }
function now()  { return new Date().toISOString(); }

interface BarterStore {
  partners: BarterPartner[];
  deals:    BarterDeal[];

  addPartner:    (data: Omit<BarterPartner, 'id' | 'createdAt'>) => BarterPartner;
  updatePartner: (id: string, data: Partial<BarterPartner>) => void;
  removePartner: (id: string) => void;

  addDeal:    (data: Omit<BarterDeal, 'id' | 'createdAt' | 'updatedAt'>) => BarterDeal;
  updateDeal: (id: string, data: Partial<BarterDeal>) => void;
  removeDeal: (id: string) => void;

  // Balance per partner: positive = they owe you
  partnerBalance: (partnerId: string) => number;
}

export const useBarterStore = create<BarterStore>()(
  persist(
    (set, get) => ({
      partners: [],
      deals:    [],

      addPartner: (data) => {
        const partner: BarterPartner = { ...data, id: uuid(), createdAt: now() };
        set((s) => ({ partners: [partner, ...s.partners] }));
        return partner;
      },
      updatePartner: (id, data) =>
        set((s) => ({ partners: s.partners.map((p) => p.id === id ? { ...p, ...data } : p) })),
      removePartner: (id) =>
        set((s) => ({ partners: s.partners.filter((p) => p.id !== id) })),

      addDeal: (data) => {
        const deal: BarterDeal = { ...data, id: uuid(), createdAt: now(), updatedAt: now() };
        set((s) => ({ deals: [deal, ...s.deals] }));

        // Mark given sites as occupied in inventory
        if (deal.status === 'active') {
          const inv = useInventoryStore.getState();
          deal.sitesGiven.forEach(({ siteId }) => {
            inv.updateSite(siteId, {
              status: 'occupied',
              clientName: `Barter — ${deal.partnerName}`,
              campaignEndDate: deal.endDate,
            });
          });
        }

        return deal;
      },

      updateDeal: (id, data) => {
        set((s) => ({
          deals: s.deals.map((d) => d.id === id ? { ...d, ...data, updatedAt: now() } : d),
        }));

        // If completing/cancelling, free up the sites
        if (data.status && data.status !== 'active') {
          const deal = get().deals.find((d) => d.id === id);
          if (deal) {
            const inv = useInventoryStore.getState();
            deal.sitesGiven.forEach(({ siteId }) => {
              inv.updateSite(siteId, { status: 'available', clientName: '', campaignEndDate: '' });
            });
          }
        }
      },

      removeDeal: (id) =>
        set((s) => ({ deals: s.deals.filter((d) => d.id !== id) })),

      partnerBalance: (partnerId) => {
        return get().deals
          .filter((d) => d.partnerId === partnerId && d.status !== 'cancelled')
          .reduce((sum, d) => sum + d.balanceInr, 0);
      },
    }),
    { name: 'atlas-barter' },
  ),
);
