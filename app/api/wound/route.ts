import { NextRequest, NextResponse } from "next/server";
import { getDb, writeDb, WoundPhoto } from "../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const { patientId, imageUrl } = await req.json();

    if (!patientId || !imageUrl) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const db = getDb();
    const dayCount = (db.wounds[patientId] || []).length + 1;
    
    // Simulate AI analysis delay/result
    const newWound: WoundPhoto = {
      day: `Photo ${dayCount}`,
      status: dayCount === 1 ? "Baseline" : "Improving",
      color: dayCount === 1 ? "#94a3b8" : "#22c55e",
      notes: "AI analyzed image and detected ongoing healing."
    };
    
    if (!db.wounds[patientId]) db.wounds[patientId] = [];
    db.wounds[patientId].push(newWound);
    
    writeDb(db);

    return NextResponse.json({ success: true, wound: newWound });
  } catch (error) {
    console.error("Wound API error:", error);
    return NextResponse.json({ error: "Failed to upload photo." }, { status: 500 });
  }
}
