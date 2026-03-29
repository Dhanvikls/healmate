import { NextRequest, NextResponse } from "next/server";
import { getDb, writeDb, Alert } from "../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const { patientId, patientName, type = "sos" } = await req.json();

    if (!patientId) {
       return NextResponse.json({ error: "Missing patient ID" }, { status: 400 });
    }

    const db = getDb();
    
    // Explicit SOS emergency alert from UI
    if (type === "sos") {
        const newAlert: Alert = {
            id: Date.now(),
            patientId,
            patient: patientName || "Patient",
            type: "critical",
            message: `🚨 EMERGENCY SOS triggered by patient. Immediate review required!`,
            time: "Just now",
            resolved: false
        };
        db.alerts.unshift(newAlert);
        
        const patientIndex = db.patients.findIndex(p => p.id === patientId);
        if(patientIndex !== -1) {
           db.patients[patientIndex].status = "critical";
        }
        
        writeDb(db);
        
        return NextResponse.json({
          level: "critical",
          message: "Emergency SOS sent to Doctor and Caregiver.",
          action: "Stay calm, help is notified.",
          shouldAlert: true,
          success: true
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Alerts API error:", error);
    return NextResponse.json(
      { error: "Failed to process alert." },
      { status: 500 }
    );
  }
}