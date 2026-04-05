import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const demoData = {
    tenant: {
      id: "demo-tenant",
      name: "Demo Sales Team",
      subdomain: "demo",
      primaryColor: "#6366f1",
      theme: "realtor",
      onboardingCompleted: true,
      showTimeToClose: true,
      showPriceDelta: true,
      hasViewerPassword: false,
      billingStatus: "active"
    },
    team: {
      goal: 50000000,
      ytdProduction: 22450000,
      ratios: {
        listingToClose: "0.85",
        buyerToSeller: "1.20",
        avgDealSize: "850000"
      }
    },
    subTeams: [],
    agents: [
      {
        id: "demo-agent-1",
        name: "Alice Thompson",
        goal: 10000000,
        volumeClosed: 4500000,
        volumePending: 1200000,
        listingsVolume: 2500000,
        status: "active",
        countInTotal: true,
        bsRatio: "1.10",
        transactions: [
          { id: "t1", address: "123 Ocean Drive", price: 1200000, listPrice: 1250000, status: "Sold", side: "Buyer", date: "2026-03-15", year: 2026 },
          { id: "t2", address: "456 Mountain View", price: 3300000, listPrice: 3200000, status: "Sold", side: "Seller", date: "2026-01-20", year: 2026 }
        ]
      },
      {
        id: "demo-agent-2",
        name: "Bob Roberts",
        goal: 8000000,
        volumeClosed: 3200000,
        volumePending: 800000,
        listingsVolume: 1500000,
        status: "active",
        countInTotal: true,
        bsRatio: "0.90",
        transactions: [
          { id: "t3", address: "789 Pine Street", price: 3200000, listPrice: 3100000, status: "Sold", side: "Buyer", date: "2026-02-10", year: 2026 }
        ]
      }
    ],
    lastUpdated: new Date().toISOString(),
    year: 2026
  };

  return NextResponse.json(demoData);
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Demo mode is read-only" }, { status: 403 });
}
