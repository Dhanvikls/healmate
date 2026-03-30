import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb, writeDb, Patient } from "../../../lib/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { pdfText, patientName, condition, age, dob, city } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `You are a medical AI assistant for HealMate, a post-hospital recovery app.

Based on this discharge summary for ${patientName || "a patient"} with condition: ${condition || "post-surgery"}:

${pdfText || "Standard post-surgery discharge"}

Create a simple, personalized recovery plan with:
1. Daily medications (name, dosage, timing)
2. Physical activities (what to do, what to avoid)
3. Diet recommendations (3-4 simple points)
4. Warning signs to watch for (3-4 points)
5. Follow-up schedule

Use simple language. Format as plain text with clear sections.
Keep it practical and easy to follow for a patient at home.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Create a new patient in the database
    const db = getDb();
    const newId = `HM-${Date.now().toString().slice(-4)}`;
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    const newPatient: Patient = {
      id: newId,
      code: newCode,
      name: patientName || "Unknown Patient",
      age: age ? parseInt(age) : 50,
      dob: dob || undefined,
      city: city || undefined,
      condition: condition || "Recovery",
      day: 1,
      totalDays: 14,
      status: "good",
      painLevel: 0,
      lastCheckin: "Just now",
      caregiver: "Primary Caregiver",
      temp: "98.6°F",
      qsofa: 0,
      adherence: 100,
      trend: "stable",
      doctorName: "Dr. Meera Shah"
    };

    db.patients.push(newPatient);
    db.medications[newId] = [
       { name: "Prescribed Med 1", time: "8:00 AM", taken: false, icon: "💊" },
       { name: "Prescribed Med 2", time: "8:00 PM", taken: false, icon: "💊" }
    ];
    db.tasks[newId] = [
       { task: "Read AI Recovery Plan", done: false, category: "Education" },
       { task: "First Check-in", done: false, category: "Health" }
    ];
    db.checkins = db.checkins || [];
    db.wounds[newId] = [];

    writeDb(db);

    return NextResponse.json({
      patientId: newId,
      recoveryPlan: text,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recovery plan API error:", error);
    return NextResponse.json(
      { error: "AI Error: " + ((error as Error).message || "Unknown error") },
      { status: 500 }
    );
  }
}