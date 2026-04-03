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
}

export interface TeamData {
  goal: number;
  ytdProduction: number;
}

export interface DashboardData {
  team: TeamData;
  agents: AgentData[];
  lastUpdated: string;
}

export const initialData: DashboardData = {
  team: {
    goal: 50000000, // $50M goal
    ytdProduction: 18500000, // $18.5M YTD
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
    },
  ],
  lastUpdated: new Date().toISOString(),
};
