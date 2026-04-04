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
  volumeClosed: number;
  volumePending: number;
  listingsVolume: number;
  buyers: number;
  sellers: number;
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
  onboardingCompleted: boolean;
}

export interface DashboardData {
  tenant: TenantSettings;
  team: TeamData;
  agents: AgentData[];
  lastUpdated: string;
}

export const initialData: DashboardData = {
  tenant: {
    id: 'new-team',
    name: 'Your Real Estate Team',
    subdomain: 'demo',
    primaryColor: '#2563eb',
    onboardingCompleted: false,
  },
  team: {
    goal: 50000000, 
    ytdProduction: 0,
  },
  agents: [],
  lastUpdated: new Date().toISOString(),
};
