import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BarterPartner, BarterDeal, BarterProduct } from '@/types';
import { generateId } from '@/lib/utils';

interface BarterStore {
  partners: BarterPartner[];
  deals: BarterDeal[];
  selectedPartnerId: string | null;
  selectedDealId: string | null;

  addPartner: (partner: Omit<BarterPartner, 'id' | 'createdAt'>) => BarterPartner;
  updatePartner: (id: string, updates: Partial<BarterPartner>) => void;
  deletePartner: (id: string) => void;
  setSelectedPartner: (id: string | null) => void;

  addDeal: (deal: Omit<BarterDeal, 'id' | 'createdAt' | 'updatedAt'>) => BarterDeal;
  updateDeal: (id: string, updates: Partial<BarterDeal>) => void;
  deleteDeal: (id: string) => void;
  setSelectedDeal: (id: string | null) => void;

  getActiveDeals: () => BarterDeal[];
  getDealsByPartner: (partnerId: string) => BarterDeal[];
  getPartnerBalance: (partnerId: string) => number;
  calculateDealValue: (products: BarterProduct[]) => number;
}

export const useBarterStore = create<BarterStore>()(
  persist(
    (set, get) => ({
      partners: [],
      deals: [],
      selectedPartnerId: null,
      selectedDealId: null,

      addPartner: (partnerData) => {
        const newPartner: BarterPartner = {
          ...partnerData,
          id: generateId(),
          createdAt: new Date().toISOString()
        };
        set((state) => ({ partners: [...state.partners, newPartner] }));
        return newPartner;
      },

      updatePartner: (id, updates) => {
        set((state) => ({
          partners: state.partners.map(p =>
            p.id === id ? { ...p, ...updates } : p
          )
        }));
      },

      deletePartner: (id) => {
        set((state) => ({
          partners: state.partners.filter(p => p.id !== id),
          selectedPartnerId: state.selectedPartnerId === id ? null : state.selectedPartnerId
        }));
      },

      setSelectedPartner: (id) => {
        set({ selectedPartnerId: id });
      },

      addDeal: (dealData) => {
        const newDeal: BarterDeal = {
          ...dealData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({ deals: [...state.deals, newDeal] }));
        return newDeal;
      },

      updateDeal: (id, updates) => {
        set((state) => ({
          deals: state.deals.map(d =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
          )
        }));
      },

      deleteDeal: (id) => {
        set((state) => ({
          deals: state.deals.filter(d => d.id !== id),
          selectedDealId: state.selectedDealId === id ? null : state.selectedDealId
        }));
      },

      setSelectedDeal: (id) => {
        set({ selectedDealId: id });
      },

      getActiveDeals: () => {
        return get().deals.filter(d => d.status === 'active');
      },

      getDealsByPartner: (partnerId) => {
        return get().deals.filter(d => d.partnerId === partnerId);
      },

      getPartnerBalance: (partnerId) => {
        const deals = get().getDealsByPartner(partnerId);
        return deals.reduce((sum, d) => sum + d.balance, 0);
      },

      calculateDealValue: (products) => {
        return products.reduce((sum, p) => sum + p.totalValue, 0);
      }
    }),
    {
      name: 'atlas-barter'
    }
  )
);
