export type BarterStatus = 'active' | 'completed' | 'cancelled';

export interface BarterPartner {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  gstin: string;
  createdAt: string;
}

export interface BarterSiteGiven {
  siteId: string;       // OOHSite.id
  siteCode: string;     // for display
  siteName: string;
  months: number;
  monthlyValueInr: number;
  totalValueInr: number;
}

export interface BarterProductReceived {
  id: string;
  description: string;  // "Newspaper ads", "Radio spots", "Digital banners"
  quantity: number;
  unit: string;         // "insertions", "spots", "months"
  valueInr: number;
}

export interface BarterDeal {
  id: string;
  partnerId: string;
  partnerName: string;  // denormalized for quick display

  sitesGiven: BarterSiteGiven[];
  totalGivenValueInr: number;

  productsReceived: BarterProductReceived[];
  totalReceivedValueInr: number;

  // Difference: positive = partner owes you cash
  balanceInr: number;

  startDate: string;    // ISO date
  endDate: string;
  status: BarterStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
