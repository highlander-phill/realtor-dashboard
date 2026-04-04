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
    id: 'nspg-group',
    name: 'Nik Shehu Property Group',
    subdomain: 'nspg',
    primaryColor: '#000000',
    onboardingCompleted: false, // Set to false to trigger onboarding flow for new users
  },
  team: {
    goal: 50000000, 
    ytdProduction: 18500000,
  },
  agents: [],
  lastUpdated: new Date().toISOString(),
};
