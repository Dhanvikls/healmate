"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ── All patients data
const allPatients: Record<string, any> = {
  "HM-001": {
    id: "HM-001", name: "Rajesh Patel", age: 54,
    condition: "Post Cardiac Surgery", dischargeDate: "2024-03-18",
    doctorName: "Dr. Meera Shah", caregiverName: "Sunita Patel (Wife)",
    recoveryDay: 10, totalDays: 21, painLevel: 3,
    medications: [
      { name: "Aspirin 75mg", time: "8:00 AM", taken: true },
      { name: "Metoprolol 25mg", time: "2:00 PM", taken: true },
      { name: "Atorvastatin 40mg", time: "9:00 PM", taken: false },
      { name: "Ramipril 5mg", time: "9:00 PM", taken: false },
    ],
  },
  "HM-002": {
    id: "HM-002", name: "Priya Sharma", age: 42,
    condition: "Post Appendectomy", dischargeDate: "2024-03-22",
    doctorName: "Dr. Meera Shah", caregiverName: "Rohit Sharma (Husband)",
    recoveryDay: 5, totalDays: 14, painLevel: 5,
    medications: [
      { name: "Paracetamol 500mg", time: "8:00 AM", taken: true },
      { name: "Amoxicillin 500mg", time: "2:00 PM", taken: false },
    ],
  },
  "HM-003": {
    id: "HM-003", name: "Mohan Das", age: 67,
    condition: "Hip Replacement", dischargeDate: "2024-03-14",
    doctorName: "Dr. Meera Shah", caregiverName: "Kavita Das (Daughter)",
    recoveryDay: 14, totalDays: 30, painLevel: 7,
    medications: [
      { name: "Tramadol 50mg", time: "8:00 AM", taken: true },
      { name: "Warfarin 5mg", time: "2:00 PM", taken: true },
      { name: "Pantoprazole 40mg", time: "9:00 PM", taken: false },
    ],
  },
};

const defaultPatient = allPatients["HM-001"];

function HealMateLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 85C50 85 10 58 10 32C10 18 20 10 32 12C40 13 47 18 50 24C53 18 60 13 68 12C80 10 90 18 90 32C90 58 50 85 50 85Z" fill="url(#pg1)" opacity="0.85" />
        <circle cx="42" cy="34" r="7" fill="url(#pg2)" />
        <path d="M34 52Q36 42 42 40Q48 38 52 44L56 58" stroke="url(#pg2)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M55 28Q62 22 68 26Q74 30 72 38Q70 44 64 46" stroke="url(#pg3)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="64" cy="48" r="4" fill="none" stroke="url(#pg3)" strokeWidth="2.5" />
        <circle cx="56" cy="24" r="3.5" fill="none" stroke="url(#pg3)" strokeWidth="2" />
        <defs>
          <linearGradient id="pg1" x1="10" y1="10" x2="90" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#4fd1c5" /><stop offset="1" stopColor="#2d9e8f" /></linearGradient>
          <linearGradient id="pg2" x1="34" y1="27" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#6ee7b7" /><stop offset="1" stopColor="#22c55e" /></linearGradient>
          <linearGradient id="pg3" x1="55" y1="22" x2="72" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#2d9e8f" /><stop offset="1" stopColor="#0e7490" /></linearGradient>
        </defs>
      </svg>
      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size * 0.52 }}>
        <span style={{ color: "#2d9e8f" }}>HEAL</span><span style={{ color: "#0e7490" }}>MATE</span>
      </span>
    </div>
  );
}

function PatientDashboardInner() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");
  const patient = patientId && allPatients[patientId] ? allPatients[patientId] : defaultPatient;

  const [activeTab, setActiveTab] = useState("overview");
  const [medsTaken, setMedsTaken] = useState(patient.medications.map((m: any) => m.taken));
  const [painLevel, setPainLevel] = useState(patient.painLevel);
  const [checkinStep, setCheckinStep] = useState("pain");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [qsofa, setQsofa] = useState({ rr: false, mental: false, bp: false });
  const [sosActive, setSosActive] = useState(false);
  const [checkinDone, setCheckinDone] = useState(false);

  const progressPct = Math.round((patient.recoveryDay / patient.totalDays) * 100);
  const medsDone = medsTaken.filter(Boolean).length;
  const symptoms = ["Chest Pain", "Shortness of Breath", "Dizziness", "Nausea", "Fatigue", "Swelling", "Fever", "Palpitations"];
  const qsofaScore = [qsofa.rr, qsofa.mental, qsofa.bp].filter(Boolean).length;

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#f0f9ff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .syne{font-family:'Syne',sans-serif;}
        .card{background:white;border-radius:20px;box-shadow:0 2px 16px rgba(0,0,0,0.06);padding:20px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-sos{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 0 20px rgba(239,68,68,0)}}
        .fade-in{animation:fadeUp 0.4s ease forwards;}
        .sos-btn{animation:pulse-sos 1.5s ease-in-out infinite;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
      `}</style>

      {/* MOBILE HEADER */}
      <header style={{ background: "white", borderBottom: "1px solid rgba(45,158,143,0.1)", padding: "14px 20px", position: "sticky", top: 0, zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <HealMateLogo size={34} />
        <div style={{ padding: "6px 12px", borderRadius: 20, background: "rgba(45,158,143,0.1)", fontSize: 12, fontWeight: 700, color: "#2d9e8f" }}>
          {patient.id}
        </div>
      </header>

      {/* PATIENT HERO CARD */}
      <div style={{ background: "linear-gradient(135deg,#2d9e8f,#0e7490)", padding: "24px 20px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>Welcome back 👋</div>
            <div className="syne" style={{ fontSize: 24, fontWeight: 800 }}>{patient.name}</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{patient.condition}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="syne" style={{ fontSize: 28, fontWeight: 800 }}>Day {patient.recoveryDay}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>of {patient.totalDays} days</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, opacity: 0.8 }}>
            <span>Recovery Progress</span>
            <span>{progressPct}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.25)", borderRadius: 8 }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "white", borderRadius: 8 }} />
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 16 }}>
          {[
            { label: "Pain", value: `${painLevel}/10`, icon: "🩺" },
            { label: "Meds", value: `${medsDone}/${patient.medications.length}`, icon: "💊" },
            { label: "Doctor", value: "Dr. Shah", icon: "👨‍⚕️" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid rgba(45,158,143,0.1)", display: "flex", zIndex: 50, padding: "8px 0" }}>
        {[
          { id: "overview", icon: "🏠", label: "Home" },
          { id: "checkin", icon: "✅", label: "Check-in" },
          { id: "medications", icon: "💊", label: "Meds" },
          { id: "wound", icon: "🩹", label: "Wound" },
          { id: "sos", icon: "🚨", label: "SOS" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, border: "none", background: "none", cursor: "pointer", padding: "6px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: activeTab === tab.id ? "#2d9e8f" : "#94a3b8" }}>{tab.label}</span>
            {activeTab === tab.id && <div style={{ width: 16, height: 3, borderRadius: 2, background: "#2d9e8f" }} />}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: "20px 16px 100px" }}>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="fade-in">
            {/* Care team */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="syne" style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Your Care Team</div>
              {[
                { name: patient.doctorName, role: "Your Doctor", icon: "👨‍⚕️", online: true },
                { name: patient.caregiverName, role: "Caregiver", icon: "🤝", online: true },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i === 0 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, position: "relative" }}>
                    {p.icon}
                    <div style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid white" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{p.role}</div>
                  </div>
                  <button style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(45,158,143,0.2)", background: "transparent", fontSize: 12, color: "#2d9e8f", cursor: "pointer", fontWeight: 600 }}>Message</button>
                </div>
              ))}
            </div>

            {/* Today's tasks */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="syne" style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Today's Tasks</div>
              {[
                { task: "Morning walk (10 min)", done: true },
                { task: "Breathing exercises", done: true },
                { task: "Take evening medications", done: false },
                { task: "Upload wound photo", done: false },
                { task: "Complete daily check-in", done: checkinDone },
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 4 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${t.done ? "#22c55e" : "#e2e8f0"}`, background: t.done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {t.done && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 14, color: t.done ? "#94a3b8" : "#374151", textDecoration: t.done ? "line-through" : "none" }}>{t.task}</span>
                </div>
              ))}
            </div>

            {/* Start check-in CTA */}
            {!checkinDone && (
              <button onClick={() => setActiveTab("checkin")}
                style={{ width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", marginBottom: 16 }}>
                ✅ Start Today's Check-in →
              </button>
            )}

            {/* Discharge info */}
            <div className="card">
              <div className="syne" style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>Discharge Info</div>
              {[
                { label: "Discharged", value: patient.dischargeDate },
                { label: "Condition", value: patient.condition },
                { label: "Age", value: `${patient.age} years` },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
                  <span style={{ color: "#94a3b8" }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHECK-IN ── */}
        {activeTab === "checkin" && (
          <div className="fade-in">
            {checkinStep === "pain" && (
              <div className="card">
                <div className="syne" style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>How's your pain today?</div>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>Tap a number from 0 (no pain) to 10 (worst)</p>
                <div className="syne" style={{ fontSize: 64, fontWeight: 800, textAlign: "center", color: painLevel <= 3 ? "#22c55e" : painLevel <= 6 ? "#f59e0b" : "#ef4444", marginBottom: 8 }}>{painLevel}</div>
                <div style={{ textAlign: "center", fontSize: 14, color: "#64748b", marginBottom: 24 }}>
                  {painLevel <= 3 ? "Mild — feeling okay" : painLevel <= 6 ? "Moderate — noticeable" : "Severe — needs attention"}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
                  {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                    <div key={n} onClick={() => setPainLevel(n)}
                      style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, cursor: "pointer", background: painLevel === n ? (n <= 3 ? "#22c55e" : n <= 6 ? "#f59e0b" : "#ef4444") : "#f1f5f9", color: painLevel === n ? "white" : "#64748b" }}>
                      {n}
                    </div>
                  ))}
                </div>
                <button onClick={() => setCheckinStep("symptoms")}
                  style={{ width: "100%", padding: 16, borderRadius: 14, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>
                  Next →
                </button>
              </div>
            )}

            {checkinStep === "symptoms" && (
              <div className="card">
                <div className="syne" style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Any symptoms?</div>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Tap all that apply today</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                  {symptoms.map(s => (
                    <div key={s} onClick={() => toggleSymptom(s)}
                      style={{ padding: "12px", borderRadius: 12, border: `2px solid ${selectedSymptoms.includes(s) ? "#2d9e8f" : "#e2e8f0"}`, background: selectedSymptoms.includes(s) ? "rgba(45,158,143,0.08)" : "white", cursor: "pointer", fontSize: 13, fontWeight: 500, textAlign: "center", color: selectedSymptoms.includes(s) ? "#2d9e8f" : "#374151" }}>
                      {s}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setCheckinStep("pain")} style={{ flex: 1, padding: 14, borderRadius: 12, border: "2px solid #e2e8f0", background: "white", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>← Back</button>
                  <button onClick={() => setCheckinStep("qsofa")} style={{ flex: 2, padding: 14, borderRadius: 12, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Next →</button>
                </div>
              </div>
            )}

            {checkinStep === "qsofa" && (
              <div className="card">
                <div className="syne" style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Quick Health Check</div>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Answer these 3 questions honestly</p>
                {[
                  { key: "rr", label: "Is your breathing faster than normal?", val: qsofa.rr },
                  { key: "mental", label: "Feeling confused or disoriented?", val: qsofa.mental },
                  { key: "bp", label: "Very dizzy when you stand up?", val: qsofa.bp },
                ].map(q => (
                  <div key={q.key} onClick={() => setQsofa(prev => ({ ...prev, [q.key]: !prev[q.key as keyof typeof qsofa] }))}
                    style={{ padding: "16px", borderRadius: 14, border: `2px solid ${q.val ? "#ef4444" : "#e2e8f0"}`, background: q.val ? "#fff5f5" : "white", cursor: "pointer", marginBottom: 12, fontSize: 14, fontWeight: 500, color: "#374151" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${q.val ? "#ef4444" : "#cbd5e1"}`, background: q.val ? "#ef4444" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {q.val && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>
                      {q.label}
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button onClick={() => setCheckinStep("symptoms")} style={{ flex: 1, padding: 14, borderRadius: 12, border: "2px solid #e2e8f0", background: "white", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>← Back</button>
                  <button onClick={() => { setCheckinStep("done"); setCheckinDone(true); }}
                    style={{ flex: 2, padding: 14, borderRadius: 12, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
                    Submit ✓
                  </button>
                </div>
              </div>
            )}

            {checkinStep === "done" && (
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(34,197,94,0.3)" }}>✓</div>
                <div className="syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Check-in Done!</div>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>Shared with {patient.doctorName} & {patient.caregiverName}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
                  {[
                    { label: "Pain", value: `${painLevel}/10` },
                    { label: "Symptoms", value: selectedSymptoms.length || "None" },
                    { label: "qSOFA", value: `${qsofaScore}/3` },
                  ].map(s => (
                    <div key={s.label} style={{ padding: 12, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setActiveTab("overview")}
                  style={{ width: "100%", padding: 14, borderRadius: 14, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
                  Back to Home →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MEDICATIONS ── */}
        {activeTab === "medications" && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="syne" style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Today's Medications</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>{medsDone}/{patient.medications.length} taken</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {patient.medications.map((med: any, i: number) => (
                  <div key={i} onClick={() => setMedsTaken(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px", borderRadius: 14, background: medsTaken[i] ? "rgba(34,197,94,0.06)" : "#f8fafc", border: `1px solid ${medsTaken[i] ? "#bbf7d0" : "#e2e8f0"}`, cursor: "pointer" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: medsTaken[i] ? "#dcfce7" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>💊</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", textDecoration: medsTaken[i] ? "line-through" : "none" }}>{med.name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>⏰ {med.time}</div>
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: medsTaken[i] ? "#22c55e" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {medsTaken[i] && <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ textAlign: "center", padding: "20px", background: "linear-gradient(135deg,#0f172a,#0c4a6e)" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Next Dose</div>
              <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: "#5eead4" }}>9:00 PM</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Tonight</div>
            </div>
          </div>
        )}

        {/* ── WOUND ── */}
        {activeTab === "wound" && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="syne" style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Upload Today's Wound Photo</div>
              <div style={{ border: "2px dashed rgba(45,158,143,0.3)", borderRadius: 16, padding: "40px 20px", textAlign: "center", background: "rgba(45,158,143,0.03)", cursor: "pointer" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>Tap to take or upload photo</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>AI will compare with your previous photos</div>
                <button style={{ padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>Choose Photo</button>
              </div>
            </div>
            <div className="card">
              <div className="syne" style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Healing Timeline</div>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { day: "Day 1", status: "Baseline", color: "#94a3b8" },
                  { day: "Day 5", status: "Improving", color: "#f59e0b" },
                  { day: "Day 10", status: "Good", color: "#22c55e" },
                ].map((p, i) => (
                  <div key={i} style={{ flex: 1, borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <div style={{ height: 64, background: `${p.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🩹</div>
                    <div style={{ padding: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{p.day}</div>
                      <div style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SOS ── */}
        {activeTab === "sos" && (
          <div className="fade-in" style={{ textAlign: "center" }}>
            <div className="card">
              {!sosActive ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🚨</div>
                  <div className="syne" style={{ fontSize: 22, fontWeight: 800, color: "#dc2626", marginBottom: 8 }}>Emergency SOS</div>
                  <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.65 }}>
                    Instantly alerts <strong>{patient.doctorName}</strong> and <strong>{patient.caregiverName}</strong> with your location and last check-in data.
                  </p>
                  <button onClick={() => setSosActive(true)} className="sos-btn"
                    style={{ width: 160, height: 160, borderRadius: "50%", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", fontWeight: 800, fontSize: 22, border: "none", cursor: "pointer", fontFamily: "'Syne',sans-serif", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <span>SOS</span>
                    <span style={{ fontSize: 12, fontWeight: 500, marginTop: 4 }}>Tap to send</span>
                  </button>
                </>
              ) : (
                <>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>✓</div>
                  <div className="syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Alert Sent!</div>
                  <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Help is on the way.</p>
                  {[`✅ ${patient.doctorName} — Notified`, `✅ ${patient.caregiverName} — Notified`, "📞 Emergency: 108 — Ready"].map(item => (
                    <div key={item} style={{ padding: "12px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, color: "#16a34a", fontWeight: 600, marginBottom: 10, textAlign: "left" }}>{item}</div>
                  ))}
                  <button onClick={() => setSosActive(false)} style={{ padding: "12px 28px", borderRadius: 12, background: "#f1f5f9", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#374151", marginTop: 8 }}>Cancel Alert</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 16, background: "#f0f9ff" }}>
        <div style={{ fontSize: 48 }}>💚</div>
        <div style={{ fontSize: 16, color: "#2d9e8f", fontWeight: 600 }}>Loading HealMate...</div>
      </div>
    }>
      <PatientDashboardInner />
    </Suspense>
  );
}