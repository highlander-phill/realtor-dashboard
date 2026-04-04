export interface Transaction {
  id: string;
  agentId: string;
  address: string;
  price: number;
  status: 'Active' | 'Pending' | 'Sold';
  side: 'Buyer' | 'Seller';
  date: string;
}

export interface AgentData {
  id: string;
  name: string;
  goal: number;
  closings: number;
  volumePending: number;
  buyers: number;
  sellers: number;
  listings: number;
  mlsLink?: string;
  transactions?: Transaction[];
}

export interface TeamData {
  goal: number;
  ytdProduction: number;
}

export interface TenantSettings {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
  primaryColor: string;
}

export interface DashboardData {
  tenant: TenantSettings;
  team: TeamData;
  agents: AgentData[];
  lastUpdated: string;
}

export const initialData: DashboardData = {
  tenant: {
    id: 'nspg-group',
    name: 'Nik Shehu Property Group',
    subdomain: 'nspg',
    primaryColor: '#000000',
  },
  team: {
    goal: 50000000, 
    ytdProduction: 18500000,
  },
  agents: [
    {
      id: '1',
      name: 'Nik Shehu',
      goal: 10000000,
      closings: 12,
      volumePending: 2500000,
      buyers: 5,
      sellers: 7,
      listings: 4,
      mlsLink: 'https://nspgrealty.com/listings',
      transactions: [
        { id: 't1', agentId: '1', address: '123 Maple St', price: 450000, status: 'Sold', side: 'Seller', date: '2026-03-15' },
        { id: 't2', agentId: '1', address: '456 Oak Ave', price: 620000, status: 'Pending', side: 'Buyer', date: '2026-04-01' },
      ]
    },
    {
      id: '2',
      name: 'Agent Two',
      goal: 8000000,
      closings: 8,
      volumePending: 1200000,
      buyers: 3,
      sellers: 5,
      listings: 2,
      mlsLink: 'https://nspgrealty.com/listings',
      transactions: []
    },
    {
      id: '3',
      name: 'Agent Three',
      goal: 6000000,
      closings: 5,
      volumePending: 800000,
      buyers: 4,
      sellers: 1,
      listings: 3,
      mlsLink: 'https://nspgrealty.com/listings',
      transactions: []
    },
  ],
  lastUpdated: new Date().toISOString(),
};
