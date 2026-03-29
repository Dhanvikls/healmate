import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb, writeDb, Checkin, Alert } from "../../../lib/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDummy");

export async function POST(req: NextRequest) {
  try {
    const { patientId, symptoms, painLevel, qsofa, patientName } = await req.json();

    if (!patientId) return NextResponse.json({ error: "Patient ID required" }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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

    const db = getDb();
    
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