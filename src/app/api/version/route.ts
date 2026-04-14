import { NextResponse } from 'next/server';

export const runtime = 'edge';

// This will be replaced at build time or we can use a hardcoded value that changes per deploy
const DEPLOY_ID = "v2.2.20-" + new Date().toISOString();

export async function GET() {
  return NextResponse.json({ 
    version: DEPLOY_ID,
    timestamp: Date.now()
  });
}
