import { NextResponse } from 'next/server';
import { getDb, writeDb } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = getDb();

    // Generate a new ID (e.g. HM-003)
    const nextIdNum = db.patients.length + 1;
    const newId = `HM-${String(nextIdNum).padStart(3, '0')}`;

    const newPatient = {
      id: newId,
      name: data.name,
      age: parseInt(data.age) || 30,
      condition: data.condition,
      surgeryDate: data.surgeryDate || new Date().toISOString().split('T')[0],
      status: 'stable',
      riskScore: 0,
      recoveryDay: 0,
      totalDays: parseInt(data.totalDays) || 30,
      lastUpdate: new Date().toISOString()
    };

    db.patients.push(newPatient as any);
    db.medications[newId] = [];
    db.tasks[newId] = [];
    db.wounds[newId] = [];
    
    writeDb(db);

    return NextResponse.json({ success: true, patient: newPatient });
  } catch (error: any) {
    console.error('Failed to create patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
