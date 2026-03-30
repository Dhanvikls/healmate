import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status:400 });
  }

  const db = getDb();
  const patient = db.patients.find(p => p.code === code);

  if (!patient) {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }

  return NextResponse.json({ patientId: patient.id });
}
