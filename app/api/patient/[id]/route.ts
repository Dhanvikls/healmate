import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const db = getDb();
  const patient = db.patients.find(p => p.id === params.id);
  
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  return NextResponse.json({
    patient,
    medications: db.medications[params.id] || [],
    tasks: db.tasks[params.id] || [],
    wounds: db.wounds[params.id] || [],
    checkins: db.checkins.filter(c => c.patientId === params.id).slice(-3)
  });
}
