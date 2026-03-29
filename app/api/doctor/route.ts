import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

export async function GET() {
  const db = getDb();
  
  return NextResponse.json({
    patients: db.patients,
    alerts: db.alerts.filter(a => !a.resolved),
    wounds: db.wounds
  });
}
