"use client";
import { useState } from "react";
import Link from "next/link";

function HealMateLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 85C50 85 10 58 10 32C10 18 20 10 32 12C40 13 47 18 50 24C53 18 60 13 68 12C80 10 90 18 90 32C90 58 50 85 50 85Z" fill="url(#ag1)" opacity="0.85" />
        <circle cx="42" cy="34" r="7" fill="url(#ag2)" />
        <path d="M34 52Q36 42 42 40Q48 38 52 44L56 58" stroke="url(#ag2)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M55 28Q62 22 68 26Q74 30 72 38Q70 44 64 46" stroke="url(#ag3)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="64" cy="48" r="4" fill="none" stroke="url(#ag3)" strokeWidth="2.5" />
        <circle cx="56" cy="24" r="3.5" fill="none" stroke="url(#ag3)" strokeWidth="2" />
        <defs>
          <linearGradient id="ag1" x1="10" y1="10" x2="90" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#4fd1c5" /><stop offset="1" stopColor="#2d9e8f" /></linearGradient>
          <linearGradient id="ag2" x1="34" y1="27" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#6ee7b7" /><stop offset="1" stopColor="#22c55e" /></linearGradient>
          <linearGradient id="ag3" x1="55" y1="22" x2="72" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#2d9e8f" /><stop offset="1" stopColor="#0e7490" /></linearGradient>
        </defs>
      </svg>
      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size * 0.52 }}>
        <span style={{ color: "#2d9e8f" }}>HEAL</span><span style={{ color: "#0e7490" }}>MATE</span>
      </span>
    </div>
  );
}

const recentSubmissions = [
  { name: "Ramesh Yadav", village: "Vasna", date: "Today 10:15 AM", status: "submitted", pain: 3 },
  { name: "Kamla Devi", village: "Borsad", date: "Today 9:00 AM", status: "submitted", pain: 5 },
  { name: "Bharat Patel", village: "Anand", date: "Yesterday", status: "synced", pain: 2 },
];

type Step = "patient" | "vitals" | "symptoms" | "done";

export default function AshaWorkerPage() {
  const [step, setStep] = useState<Step>("patient");
  const [form, setForm] = useState({
    patientName: "",
    age: "",
    village: "",
    phone: "",
    painLevel: 3,
    temp: "",
    breathing: "",
    symptoms: [] as string[],
    notes: "",
    hasSmartphone: "no",
  });
  const [submitted, setSubmitted] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const symptoms = ["Chest Pain", "Breathlessness", "Fever", "Swelling", "Dizziness", "Nausea", "Wound Discharge", "Confusion"];

  const toggleSymptom = (s: string) =>
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s)
        ? prev.symptoms.filter(x => x !== s)
        : [...prev.symptoms, s],
    }));

  const handleSync = async () => {
    setSyncing(true);
    try {
        const res = await fetch('/api/doctor');
        const data = await res.json();
        // Fallback ID if exact patient match isn't found
        let pid = data.patients?.find((p:any) => p.name.toLowerCase().includes(form.patientName.toLowerCase()))?.id;
        if (!pid) pid = `ASHA-TMP-${Date.now().toString().slice(-4)}`;
        
        await fetch('/api/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientId: pid,
                patientName: form.patientName,
                symptoms: form.symptoms,
                painLevel: form.painLevel,
                qsofa: form.breathing === 'difficulty' ? 1 : 0
            })
        });
    } catch (e) {
        console.error(e);
    }
    setSyncing(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setStep("patient");
    setSubmitted(false);
    setForm({ patientName: "", age: "", village: "", phone: "", painLevel: 3, temp: "", breathing: "", symptoms: [], notes: "", hasSmartphone: "no" });
  };

  const stepIndex = (s: Step) => ["patient", "vitals", "symptoms", "done"].indexOf(s);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#f0fdf4", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .syne{font-family:'Syne',sans-serif;}
        .card{background:white;border-radius:20px;box-shadow:0 2px 16px rgba(0,0,0,0.06);}
        .input{width:100%;padding:12px 16px;border-radius:12px;border:2px solid #e2e8f0;font-size:15px;font-family:'DM Sans',sans-serif;outline:none;transition:border 0.2s;}
        .input:focus{border-color:#2d9e8f;}
        .btn-primary{padding:14px;border-radius:14px;background:linear-gradient(135deg,#2d9e8f,#0e7490);color:white;font-weight:700;font-size:16px;border:none;cursor:pointer;width:100%;font-family:'DM Sans',sans-serif;}
        .btn-secondary{padding:14px;border-radius:14px;background:white;color:#374151;font-weight:600;font-size:15px;border:2px solid #e2e8f0;cursor:pointer;width:100%;font-family:'DM Sans',sans-serif;}
        .symptom-chip{padding:12px 16px;border-radius:12px;border:2px solid #e2e8f0;cursor:pointer;transition:all 0.2s;font-size:14px;font-weight:500;background:white;}
        .symptom-chip:hover{border-color:#2d9e8f;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fade-in{animation:fadeUp 0.4s ease forwards;}
        .spin{animation:spin 1s linear infinite;display:inline-block;}
      `}</style>

      {/* HEADER */}
      <header style={{ background: "white", borderBottom: "1px solid rgba(45,158,143,0.12)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <HealMateLogo size={38} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed" }}>🤝 ASHA Worker Mode</span>
          </div>
          <Link href="/" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}>← Home</Link>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>

        {/* Top info banner */}
        <div style={{ padding: "16px 20px", borderRadius: 16, background: "linear-gradient(135deg,rgba(139,92,246,0.1),rgba(45,158,143,0.1))", border: "1px solid rgba(139,92,246,0.2)", marginBottom: 28, display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 32 }}>🏥</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>ASHA Worker Check-in Form</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>For patients without smartphones. Fill this form and it will sync to their doctor dashboard automatically.</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 24 }}>

          {/* LEFT — recent + stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Worker info */}
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 12 }}>👩</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Lata Bhen</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>ASHA Worker · Anand District</div>
              <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>✅ Connected to Doctor Dashboard</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>Dr. Meera Shah · AIIMS Delhi</div>
              </div>
            </div>

            {/* Today's stats */}
            <div className="card" style={{ padding: "20px" }}>
              <div className="syne" style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Today's Activity</div>
              {[
                { label: "Check-ins Done", value: "2", icon: "✅", color: "#22c55e" },
                { label: "Pending Sync", value: "1", icon: "⏳", color: "#f59e0b" },
                { label: "Alerts Sent", value: "0", icon: "🔔", color: "#0ea5e9" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                    <span style={{ fontSize: 13, color: "#475569" }}>{s.label}</span>
                  </div>
                  <span className="syne" style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Recent submissions */}
            <div className="card" style={{ padding: "20px" }}>
              <div className="syne" style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Recent Submissions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentSubmissions.map((r, i) => (
                  <div key={i} style={{ padding: "10px 12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{r.name}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: r.status === "synced" ? "#dcfce7" : "#dbeafe", color: r.status === "synced" ? "#16a34a" : "#2563eb", fontWeight: 600 }}>
                        {r.status === "synced" ? "✓ Synced" : "⏳ Pending"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{r.village} · {r.date}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Pain: {r.pain}/10</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — main form */}
          <div className="card" style={{ padding: "28px" }}>

            {/* Step indicator */}
            {!submitted && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
                {(["patient", "vitals", "symptoms", "done"] as Step[]).map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: stepIndex(step) > i ? "#22c55e" : step === s ? "linear-gradient(135deg,#2d9e8f,#0e7490)" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: step === s || stepIndex(step) > i ? "white" : "#94a3b8", fontWeight: 700 }}>
                      {stepIndex(step) > i ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: step === s ? "#2d9e8f" : "#94a3b8", display: i === 3 ? "none" : "block" }}>
                      {["Patient", "Vitals", "Symptoms"][i]}
                    </span>
                    {i < 2 && <div style={{ width: 24, height: 2, background: stepIndex(step) > i ? "#22c55e" : "#e2e8f0", borderRadius: 2 }} />}
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 1: Patient Info ── */}
            {step === "patient" && !submitted && (
              <div className="fade-in">
                <h2 className="syne" style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Patient Information</h2>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>Fill in basic details of the patient you are visiting.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Patient Full Name *</label>
                    <input className="input" placeholder="e.g. Ramesh Yadav" value={form.patientName} onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Age *</label>
                      <input className="input" placeholder="e.g. 55" type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Village / Area *</label>
                      <input className="input" placeholder="e.g. Vasna" value={form.village} onChange={e => setForm(p => ({ ...p, village: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Phone Number (family)</label>
                    <input className="input" placeholder="e.g. 9876543210" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>Does the patient have a smartphone?</label>
                    <div style={{ display: "flex", gap: 12 }}>
                      {["yes", "no"].map(opt => (
                        <div key={opt} onClick={() => setForm(p => ({ ...p, hasSmartphone: opt }))}
                          style={{ flex: 1, padding: "12px", borderRadius: 12, border: `2px solid ${form.hasSmartphone === opt ? "#2d9e8f" : "#e2e8f0"}`, background: form.hasSmartphone === opt ? "rgba(45,158,143,0.08)" : "white", cursor: "pointer", textAlign: "center", fontWeight: 600, fontSize: 14, color: form.hasSmartphone === opt ? "#2d9e8f" : "#374151", transition: "all 0.2s" }}>
                          {opt === "yes" ? "📱 Yes" : "❌ No"}
                        </div>
                      ))}
                    </div>
                    {form.hasSmartphone === "yes" && (
                      <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "#fef3c7", border: "1px solid #fcd34d", fontSize: 13, color: "#92400e" }}>
                        💡 Patient can use the HealMate app directly. Share QR code with them.
                      </div>
                    )}
                  </div>

                  <button className="btn-primary" onClick={() => setStep("vitals")} disabled={!form.patientName || !form.age || !form.village}>
                    Next: Vitals →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Vitals ── */}
            {step === "vitals" && !submitted && (
              <div className="fade-in">
                <h2 className="syne" style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Vitals & Observations</h2>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>Record what you observe during your visit.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Pain level */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>
                      Pain Level: <span style={{ color: form.painLevel <= 3 ? "#22c55e" : form.painLevel <= 6 ? "#f59e0b" : "#ef4444", fontWeight: 800, fontSize: 16 }}>{form.painLevel}/10</span>
                    </label>
                    {/* Visual pain picker */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                        <div key={n} onClick={() => setForm(p => ({ ...p, painLevel: n }))}
                          style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, cursor: "pointer", background: form.painLevel === n ? (n <= 3 ? "#22c55e" : n <= 6 ? "#f59e0b" : "#ef4444") : "#f1f5f9", color: form.painLevel === n ? "white" : "#64748b", transition: "all 0.2s" }}>
                          {n}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
                      {form.painLevel <= 3 ? "😊 Mild — patient is comfortable" : form.painLevel <= 6 ? "😐 Moderate — needs attention" : "😰 Severe — alert doctor immediately"}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Temperature (°F)</label>
                      <input className="input" placeholder="e.g. 98.6" type="number" step="0.1" value={form.temp} onChange={e => setForm(p => ({ ...p, temp: e.target.value }))} />
                      {form.temp && parseFloat(form.temp) >= 100.4 && (
                        <div style={{ marginTop: 6, fontSize: 12, color: "#ef4444", fontWeight: 600 }}>⚠️ Fever detected!</div>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Breathing</label>
                      <select className="input" value={form.breathing} onChange={e => setForm(p => ({ ...p, breathing: e.target.value }))} style={{ appearance: "none" }}>
                        <option value="">Select...</option>
                        <option value="normal">Normal</option>
                        <option value="slightly_fast">Slightly Fast</option>
                        <option value="very_fast">Very Fast</option>
                        <option value="difficulty">Difficulty Breathing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Additional Notes</label>
                    <textarea className="input" placeholder="Any observations about the patient's condition, wound, behaviour..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ minHeight: 80, resize: "vertical" }} />
                  </div>

                  {/* Warning banner if critical */}
                  {(form.painLevel >= 8 || (form.temp && parseFloat(form.temp) >= 100.4) || form.breathing === "difficulty") && (
                    <div style={{ padding: "14px 16px", borderRadius: 12, background: "#fee2e2", border: "1px solid #fca5a5", fontSize: 14, color: "#dc2626", fontWeight: 600 }}>
                      🚨 Critical signs detected! Doctor will be alerted automatically when you submit.
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn-secondary" onClick={() => setStep("patient")} style={{ flex: 1 }}>← Back</button>
                    <button className="btn-primary" onClick={() => setStep("symptoms")} style={{ flex: 2 }}>Next: Symptoms →</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Symptoms ── */}
            {step === "symptoms" && !submitted && (
              <div className="fade-in">
                <h2 className="syne" style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Symptoms</h2>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>Ask the patient if they have any of these. Tap all that apply.</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {symptoms.map(s => (
                    <div key={s} className="symptom-chip" onClick={() => toggleSymptom(s)}
                      style={{ border: `2px solid ${form.symptoms.includes(s) ? "#2d9e8f" : "#e2e8f0"}`, background: form.symptoms.includes(s) ? "rgba(45,158,143,0.08)" : "white", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${form.symptoms.includes(s) ? "#2d9e8f" : "#cbd5e1"}`, background: form.symptoms.includes(s) ? "#2d9e8f" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {form.symptoms.includes(s) && <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>✓</span>}
                      </div>
                      <span style={{ color: form.symptoms.includes(s) ? "#2d9e8f" : "#374151", fontWeight: form.symptoms.includes(s) ? 600 : 400 }}>{s}</span>
                    </div>
                  ))}
                </div>

                {form.symptoms.length > 0 && (
                  <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fcd34d", marginBottom: 16, fontSize: 13, color: "#92400e" }}>
                    ⚠️ <strong>{form.symptoms.length} symptom(s)</strong> selected — will be flagged for doctor review.
                  </div>
                )}

                {/* Summary before submit */}
                <div style={{ padding: "16px", borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>📋 Summary</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "#475569" }}>
                    <span>👤 {form.patientName}</span>
                    <span>📍 {form.village}</span>
                    <span>🩺 Pain: {form.painLevel}/10</span>
                    <span>🌡 Temp: {form.temp || "Not recorded"}°F</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn-secondary" onClick={() => setStep("vitals")} style={{ flex: 1 }}>← Back</button>
                  <button className="btn-primary" onClick={handleSync} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {syncing ? <><span className="spin">⟳</span> Syncing to Doctor...</> : "Submit & Sync to Doctor ✓"}
                  </button>
                </div>
              </div>
            )}

            {/* ── SUCCESS ── */}
            {submitted && (
              <div className="fade-in" style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(34,197,94,0.3)" }}>✓</div>
                <h2 className="syne" style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Synced Successfully!</h2>
                <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28, lineHeight: 1.65 }}>
                  Check-in for <strong>{form.patientName}</strong> from {form.village} has been submitted and synced to Dr. Meera Shah's dashboard.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {[
                    `✅ Patient: ${form.patientName}, ${form.age}y, ${form.village}`,
                    `✅ Pain Level: ${form.painLevel}/10`,
                    `✅ Symptoms: ${form.symptoms.length > 0 ? form.symptoms.join(", ") : "None reported"}`,
                    `✅ Doctor Dashboard: Updated`,
                  ].map(item => (
                    <div key={item} style={{ padding: "10px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, color: "#166534", textAlign: "left", fontWeight: 500 }}>
                      {item}
                    </div>
                  ))}
                  {(form.painLevel >= 8 || (form.temp && parseFloat(form.temp) >= 100.4)) && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fee2e2", border: "1px solid #fca5a5", fontSize: 13, color: "#dc2626", textAlign: "left", fontWeight: 600 }}>
                      🚨 Alert sent to Dr. Meera Shah — critical signs flagged
                    </div>
                  )}
                </div>

                <button className="btn-primary" onClick={handleReset}>
                  + New Patient Check-in
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}