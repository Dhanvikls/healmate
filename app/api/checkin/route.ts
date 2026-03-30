import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb, writeDb, Checkin, Alert } from "../../../lib/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDummy");

export async function POST(req: NextRequest) {
  try {
    const { patientId, symptoms, painLevel, qsofa, patientName, medications } = await req.json();

    if (!patientId) return NextResponse.json({ error: "Patient ID required" }, { status: 400 });

    const db = getDb();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // If medications are provided (e.g. from ASHA worker), update them
    if (medications && Array.isArray(medications)) {
      db.medications[patientId] = [
        ...(db.medications[patientId] || []),
        ...medications.map((m: any) => ({
          name: m.name,
          time: m.time,
          taken: false,
          icon: m.icon || "💊"
        }))
      ];
    }

    // Auto-create patient if it's a new ASHA-TMP ID
    if (patientId.startsWith("ASHA-TMP-") && !db.patients.find(p => p.id === patientId)) {
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      db.patients.push({
        id: patientId,
        code: newCode,
        name: patientName || "New Patient",
        age: 50, // Default
        condition: symptoms?.join(", ") || "General Follow-up",
        status: "good",
        lastCheckin: "Just now",
        painLevel: painLevel || 0,
        temp: "98.6",
        qsofa: qsofa || 0,
        day: 1,
        totalDays: 14,
        adherence: 100,
        trend: "stable",
        doctorName: "Dr. Meera Shah", // Default
        caregiver: "Assigned by ASHA"
      });
      // Initialize empty tasks if not present
      if (!db.tasks[patientId]) db.tasks[patientId] = [];
    }

    const prompt = `You are a medical AI assistant for HealMate, a post-hospital recovery app.

A patient named ${patientName || "the patient"} has submitted their daily check-in:
- Pain Level: ${painLevel}/10
- Symptoms reported: ${symptoms?.length > 0 ? symptoms.join(", ") : "None"}
- qSOFA Score: ${qsofa}/3

Please provide:
1. A brief assessment (2-3 sentences, simple language)
2. One immediate recommendation
3. Risk level: LOW, MODERATE, or HIGH
4. Should doctor be alerted: YES or NO

Keep it simple and clear — the patient may not have medical knowledge.
Format your response as plain text, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const riskLevel = text.includes("HIGH") ? "critical" : text.includes("MODERATE") ? "moderate" : "low";
    const alertDoctor = text.includes("YES") || qsofa >= 2 || painLevel >= 8;

    const newCheckin: Checkin = {
      id: Date.now(),
      patientId,
      date: new Date().toLocaleDateString('en-IN'),
      painLevel,
      temp: "N/A", // From qSOFA logic
      status: riskLevel === "critical" ? "critical" : riskLevel === "moderate" ? "mild" : "good",
      notes: text.substring(0, 50) + "...",
      symptoms,
      qsofaScore: qsofa,
    };
    db.checkins.push(newCheckin);
    
    const patientIndex = db.patients.findIndex(p => p.id === patientId);
    if (patientIndex !== -1) {
       db.patients[patientIndex].painLevel = painLevel;
       db.patients[patientIndex].lastCheckin = "Just now";
       db.patients[patientIndex].qsofa = qsofa;
       db.patients[patientIndex].status = riskLevel === "critical" ? "critical" : riskLevel === "moderate" ? "mild" : "good";
    }

    if (alertDoctor) {
      const newAlert: Alert = {
        id: Date.now(),
        patientId,
        patient: patientName || "Patient",
        type: riskLevel === "critical" ? "critical" : "moderate",
        message: `High risk daily check-in detected. Pain: ${painLevel}/10, qSOFA: ${qsofa}/3. Check patient.`,
        time: "Just now",
        resolved: false
      };
      db.alerts.unshift(newAlert);
    }

    writeDb(db);

    return NextResponse.json({
      analysis: text,
      riskLevel,
      alertDoctor,
      success: true
    });
  } catch (error) {
    console.error("Checkin API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze check-in. Please try again." },
      { status: 500 }
    );
  }
}