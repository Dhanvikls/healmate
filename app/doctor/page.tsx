"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function HealMateLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 85C50 85 10 58 10 32C10 18 20 10 32 12C40 13 47 18 50 24C53 18 60 13 68 12C80 10 90 18 90 32C90 58 50 85 50 85Z" fill="url(#dg1)" opacity="0.85" />
        <circle cx="42" cy="34" r="7" fill="url(#dg2)" />
        <path d="M34 52Q36 42 42 40Q48 38 52 44L56 58" stroke="url(#dg2)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M55 28Q62 22 68 26Q74 30 72 38Q70 44 64 46" stroke="url(#dg3)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="64" cy="48" r="4" fill="none" stroke="url(#dg3)" strokeWidth="2.5" />
        <circle cx="56" cy="24" r="3.5" fill="none" stroke="url(#dg3)" strokeWidth="2" />
        <defs>
          <linearGradient id="dg1" x1="10" y1="10" x2="90" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#4fd1c5" /><stop offset="1" stopColor="#2d9e8f" /></linearGradient>
          <linearGradient id="dg2" x1="34" y1="27" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#6ee7b7" /><stop offset="1" stopColor="#22c55e" /></linearGradient>
          <linearGradient id="dg3" x1="55" y1="22" x2="72" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#2d9e8f" /><stop offset="1" stopColor="#0e7490" /></linearGradient>
        </defs>
      </svg>
      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size * 0.52 }}>
        <span style={{ color: "#2d9e8f" }}>HEAL</span><span style={{ color: "#0e7490" }}>MATE</span>
      </span>
    </div>
  );
}

const woundPhotos = [
  { patient: "Rajesh Patel", day: "Day 1", status: "Baseline", color: "#94a3b8" },
  { patient: "Rajesh Patel", day: "Day 5", status: "Improving", color: "#f59e0b" },
  { patient: "Rajesh Patel", day: "Day 10", status: "Healing Well", color: "#22c55e" },
];

const recoveryFingerprint = [
  { label: "Medication", value: 85 },
  { label: "Check-ins", value: 92 },
  { label: "Exercise", value: 60 },
  { label: "Sleep", value: 75 },
  { label: "Wound Care", value: 80 },
  { label: "Diet", value: 70 },
];

const behaviourData = [
  { day: "Mon", steps: 1200, sleep: 6.5, screen: 3.2 },
  { day: "Tue", steps: 1450, sleep: 7, screen: 2.8 },
  { day: "Wed", steps: 980, sleep: 5.5, screen: 4.1 },
  { day: "Thu", steps: 1600, sleep: 7.5, screen: 2.5 },
  { day: "Fri", steps: 1350, sleep: 6, screen: 3.8 },
  { day: "Sat", steps: 800, sleep: 8, screen: 5.2 },
  { day: "Sun", steps: 1100, sleep: 7, screen: 3.0 },
];

type Tab = "overview" | "patients" | "alerts" | "wounds" | "behaviour" | "brief" | "add";

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [patients, setPatients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [resolvedAlerts, setResolvedAlerts] = useState<number[]>([]);
  const [briefLoading, setBriefLoading] = useState(false);
  const [brief, setBrief] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPass, setLoginPass] = useState("");

  // QR Modal State
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);
  const [qrModalLoading, setQrModalLoading] = useState(false);

  // Add Patient Flow State
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientDob, setNewPatientDob] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientCity, setNewPatientCity] = useState("");
  const [newPatientCond, setNewPatientCond] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [manualMeds, setManualMeds] = useState<{ name: string; time: string }[]>([]);
  const [newMedName, setNewMedName] = useState("");
  const [newMedTime, setNewMedTime] = useState("");

  const addManualMed = () => {
    if (newMedName && newMedTime) {
      setManualMeds(prev => [...prev, { name: newMedName, time: newMedTime }]);
      setNewMedName("");
      setNewMedTime("");
    }
  };

  const removeManualMed = (index: number) => {
    setManualMeds(prev => prev.filter((_, i) => i !== index));
  };
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [newPatientUrl, setNewPatientUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
    // Poll every 10s for new alerts/checkins
    const intv = setInterval(fetchData, 10000);
    return () => clearInterval(intv);
  }, []);

  const fetchData = () => {
    fetch('/api/doctor')
      .then(r => r.json())
      .then(d => {
         setPatients(d.patients || []);
         setAlerts(d.alerts || []);
         setIsLoading(false);
      })
      .catch(e => { console.error(e); setIsLoading(false); });
  };

  const handleAddPatient = async () => {
    if (!newPatientName || !selectedFile) {
        alert("Please enter a patient name and select a PDF file.");
        return;
    }
    setIsUploading(true);
    
    try {
      const pdfText = "Simulated Discharge Summary text for: " + newPatientName;
      
      // 1. Generate Recovery Plan & DB record
      const res = await fetch('/api/recovery-plan', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
           pdfText, 
           patientName: newPatientName, 
           dob: newPatientDob,
           age: newPatientAge,
           city: newPatientCity,
           condition: newPatientCond,
           manualMedications: manualMeds
         })
      });
      const planData = await res.json();
      
      if (!res.ok) {
        throw new Error(planData.error || "Failed to generate recovery plan");
      }
      
      // 2. Generate QR code
      const qrRes = await fetch('/api/qr', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ patientId: planData.patientId, patientName: newPatientName, condition: newPatientCond })
      });
      const qrData = await qrRes.json();
      
      if (!qrRes.ok) {
        throw new Error(qrData.error || "Failed to generate QR code");
      }
      
      setGeneratedQR(qrData.qrDataUrl);
      setNewPatientUrl(qrData.url);
      fetchData(); // Refresh list
    } catch (e: any) {
      console.error(e);
      alert("Error adding patient: " + e.message + "\n\n(Tip: Ensure you have added GEMINI_API_KEY to your .env.local file)");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(loginPass === "admin") setIsLoggedIn(true);
    else alert("Incorrect password. Use 'admin' for demo.");
  };

  const handleShowQR = async (p: any) => {
    try {
      setQrModalLoading(true);
      setQrModalUrl(""); // open modal with loading state
      const res = await fetch('/api/qr', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ patientId: p.id, patientName: p.name, condition: p.condition })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setQrModalUrl(data.qrDataUrl);
    } catch(e) {
      alert("Failed to generate QR. Ensure server is running.");
    } finally {
      setQrModalLoading(false);
    }
  };

  const criticalCount = patients.filter(p => p.status === "critical").length;
  const mildCount = patients.filter(p => p.status === "mild").length;
  const goodCount = patients.filter(p => p.status === "good").length;
  const unresolvedAlerts = alerts.filter(a => !resolvedAlerts.includes(a.id)).length;

  const statusColor = (s: string) => s === "critical" ? "#ef4444" : s === "mild" ? "#f59e0b" : "#22c55e";
  const statusBg = (s: string) => s === "critical" ? "#fee2e2" : s === "mild" ? "#fef3c7" : "#dcfce7";
  const trendIcon = (t: string) => t === "improving" ? "↑" : t === "worsening" ? "↓" : "→";
  const trendColor = (t: string) => t === "improving" ? "#22c55e" : t === "worsening" ? "#ef4444" : "#f59e0b";

  const generateBrief = () => {
    if(!selectedPatient) return;
    setBriefLoading(true);
    setBrief("");
    setTimeout(() => {
      setBrief(`PRE-VISIT BRIEF — ${selectedPatient.name}
Generated: ${new Date().toLocaleString("en-IN")}
──────────────────────────────────────
PATIENT SUMMARY
• ${selectedPatient.name}, ${selectedPatient.age}y ${selectedPatient.city ? `[${selectedPatient.city}]` : ''} | ${selectedPatient.condition}
• Recovery: Day ${selectedPatient.day} of ${selectedPatient.totalDays}
• Caregiver: ${selectedPatient.caregiver}

CURRENT STATUS: ${selectedPatient.status.toUpperCase()}
• Pain Level: ${selectedPatient.painLevel}/10
• Temperature: ${selectedPatient.temp || "N/A"}
• qSOFA Score: ${selectedPatient.qsofa || 0}/3
• Medication Adherence: ${selectedPatient.adherence || 100}%
• Last Check-in: ${selectedPatient.lastCheckin}

AI ASSESSMENT
${selectedPatient.status === "critical"
  ? "⚠️ HIGH RISK: Elevated concerns flagged. Immediate clinical review recommended."
  : selectedPatient.status === "mild"
  ? "⚠️ MODERATE CONCERN: Pain levels have been variable. Medication adherence below target."
  : "✅ RECOVERY ON TRACK: Patient is progressing well. Pain levels low, adherence high."}

RECOMMENDED ACTIONS
• Review recent check-ins
• Follow up with caregiver
──────────────────────────────────────
Generated by HealMate AI`);
      setBriefLoading(false);
    }, 1800);
  };

  if (isLoading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "white" }}>Loading live dashboard...</div>;

  if (!isLoggedIn) {
    return (
      <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="card-dark" style={{ padding: 48, borderRadius: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 460, width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}><HealMateLogo size={48} /></div>
          <h2 className="syne" style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8 }}>Doctor Portal</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 32 }}>Login to access your patient dashboard and live recovery feeds.</p>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8, display: "block" }}>Password (Demo: admin)</label>
              <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} style={{ width: "100%", padding: "16px 20px", borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", fontSize: 16 }} required />
            </div>
            <button type="submit" style={{ padding: "16px", borderRadius: 14, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", marginTop: 8 }}>Login Securely →</button>
          </form>
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
             <Link href="/" style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>← Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#0f172a", minHeight: "100vh", display: "flex", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .syne{font-family:'Syne',sans-serif;}
        .card-dark{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;}
        .card-light{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:16px;}
        .tab-btn{transition:all 0.2s;cursor:pointer;border:none;}
        .tab-btn:hover{background:rgba(255,255,255,0.06)!important;}
        .patient-row{transition:all 0.2s;cursor:pointer;}
        .patient-row:hover{background:rgba(45,158,143,0.08)!important;}
        .alert-row{transition:all 0.2s;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fade-in{animation:fadeUp 0.4s ease forwards;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fade-in{animation:fadeUp 0.4s ease forwards;}
        .spin{animation:spin 1s linear infinite;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#334155;border-radius:4px;}

        /* RESPONSIVE DOCTOR DASHBOARD */
        .dashboard-container { display: flex; min-height: 100vh; }
        .sidebar { width: 240px; position: fixed; height: 100vh; z-index: 50; flex-shrink: 0; }
        .main-content { margin-left: 240px; flex: 1; padding: 32px 36px; min-height: 100vh; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .patient-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

        @media (max-width: 1024px) {
          .sidebar { width: 70px; padding: 24px 10px !important; }
          .sidebar span { display: none; }
          .main-content { margin-left: 70px; padding: 24px; }
          .sidebar-logo-text { display: none; }
        }
        @media (max-width: 768px) {
          .dashboard-container { flex-direction: column; }
          .sidebar { 
            width: 100%; height: auto; position: sticky; top: 0; 
            padding: 12px 16px !important; display: flex !important; 
            flex-direction: row !important; overflow-x: auto; gap: 8px;
            border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06);
          }
          .sidebar > div:first-of-type { border-bottom: none !important; padding: 0 !important; margin-bottom: 0 !important; }
          .sidebar nav { flex-direction: row !important; padding: 0 !important; margin-top: 0 !important; gap: 4px; }
          .sidebar button { padding: 8px 12px !important; border-left: none !important; }
          .main-content { margin-left: 0; padding: 20px; }
          .stats-grid { grid-template-columns: 1fr; }
          .patient-grid { grid-template-columns: 1fr; }
          .header-actions { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
        }
      `}</style>

      <div className="dashboard-container">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar" style={{ background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: "24px 0" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <HealMateLogo size={36} />
          <div className="sidebar-logo-text" style={{ marginTop: 12, padding: "8px 12px", borderRadius: 10, background: "rgba(45,158,143,0.12)", border: "1px solid rgba(45,158,143,0.2)" }}>
            <div style={{ fontSize: 12, color: "#5eead4", fontWeight: 600 }}>👨‍⚕️ Dr. Meera Shah</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>Cardiologist · AIIMS Delhi</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { id: "overview", icon: "🏠", label: "Overview" },
            { id: "patients", icon: "👥", label: "My Patients" },
            { id: "add", icon: "➕", label: "Add Patient / PDF" },
            { id: "alerts", icon: "🔔", label: "Alerts", badge: unresolvedAlerts },
            { id: "wounds", icon: "🩹", label: "Wound Timeline" },
            { id: "behaviour", icon: "📊", label: "Behaviour Panel" },
            { id: "brief", icon: "📋", label: "Pre-Visit Brief" },
          ].map(item => (
            <button key={item.id} className="tab-btn" onClick={() => { setActiveTab(item.id as Tab); if(item.id === "patients" && !selectedPatient && patients.length > 0) setSelectedPatient(patients[0]); }}
              style={{ padding: "11px 14px", borderRadius: 12, textAlign: "left", display: "flex", alignItems: "center", gap: 10, background: activeTab === item.id ? "rgba(45,158,143,0.15)" : "transparent", borderLeft: `3px solid ${activeTab === item.id ? "#2d9e8f" : "transparent"}`, width: "100%" }}>
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: activeTab === item.id ? 700 : 500, color: activeTab === item.id ? "#5eead4" : "#94a3b8", flex: 1 }}>{item.label}</span>
              {item.badge ? <span style={{ fontSize: 11, fontWeight: 700, background: "#ef4444", color: "white", borderRadius: 20, padding: "1px 7px" }}>{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, textDecoration: "none" }}>
            <span style={{ fontSize: 14 }}>←</span>
            <span style={{ fontSize: 13, color: "#475569" }}>Back to Home</span>
          </Link>
        </div>
      </aside>

        {/* ── MAIN ── */}
        <main className="main-content">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 2 }}>Doctor Dashboard</div>
            <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, color: "white" }}>
              {activeTab === "overview" ? "Patient Overview" :
               activeTab === "patients" ? "My Patients" :
               activeTab === "add" ? "Add New Patient via PDF" :
               activeTab === "alerts" ? "Alert Feed" :
               activeTab === "wounds" ? "Wound Photo Timeline" :
               activeTab === "behaviour" ? "Passive Behaviour Panel" :
               "Pre-Visit Brief Generator"}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {criticalCount > 0 && (
              <div style={{ padding: "8px 16px", borderRadius: 40, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>{criticalCount} Critical Patient{criticalCount > 1 ? "s" : ""}</span>
              </div>
            )}
            <div style={{ padding: "8px 16px", borderRadius: 40, background: "rgba(45,158,143,0.12)", border: "1px solid rgba(45,158,143,0.2)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#5eead4" }}>{patients.length} Active Patients</span>
            </div>
          </div>
        </div>

        {/* ═══════════════ ADD PATIENT ═══ */}
        {activeTab === "add" && (
          <div className="fade-in card-dark" style={{ padding: 32, maxWidth: 640 }}>
            <h3 className="syne" style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Upload Discharge PDF</h3>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>Upload a discharge summary. HealMate AI will parse it, generate a personalized plan, register the patient, and produce their unique login QR code.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
               <input type="text" placeholder="Patient Name" value={newPatientName} onChange={e=>setNewPatientName(e.target.value)} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} />
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                 <input type="date" placeholder="Date of Birth" value={newPatientDob} onChange={e=>setNewPatientDob(e.target.value)} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} />
                 <input type="number" placeholder="Age" value={newPatientAge} onChange={e=>setNewPatientAge(e.target.value)} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} />
                 <input type="text" placeholder="City" value={newPatientCity} onChange={e=>setNewPatientCity(e.target.value)} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} />
               </div>
               <input type="text" placeholder="Condition (e.g. Post Cardiac Surgery)" value={newPatientCond} onChange={e=>setNewPatientCond(e.target.value)} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} />
               
               {/* Manual Medications Section */}
               <div style={{ padding: "20px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <h4 style={{ color: "white", fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>💊</span> Prescribed Medications (Optional)
                  </h4>
                  
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input 
                      type="text" 
                      placeholder="Med Name" 
                      value={newMedName} 
                      onChange={e => setNewMedName(e.target.value)} 
                      style={{ flex: 2, padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 13, outline: "none" }} 
                    />
                    <input 
                      type="text" 
                      placeholder="Time (e.g. 9 AM)" 
                      value={newMedTime} 
                      onChange={e => setNewMedTime(e.target.value)} 
                      style={{ flex: 1, padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 13, outline: "none" }} 
                    />
                    <button 
                      onClick={addManualMed}
                      style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(45,158,143,0.2)", color: "#5eead4", border: "1px solid rgba(45,158,143,0.3)", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
                    >
                      +
                    </button>
                  </div>

                  {manualMeds.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {manualMeds.map((m, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize: 13, color: "#e2e8f0" }}>
                            <span style={{ fontWeight: 700 }}>{m.name}</span> · <span style={{ color: "#94a3b8" }}>{m.time}</span>
                          </div>
                          <button 
                            onClick={() => removeManualMed(idx)}
                            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, padding: 4 }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>

               <div 
                 onClick={() => fileInputRef.current?.click()}
                 style={{ padding: 24, border: `2px dashed ${selectedFile ? "rgba(34,197,94,0.5)" : "rgba(45,158,143,0.3)"}`, borderRadius: 12, textAlign: "center", background: selectedFile ? "rgba(34,197,94,0.05)" : "rgba(45,158,143,0.05)", cursor: "pointer", transition: "all 0.2s" }}
               >
                  <input 
                    type="file" 
                    accept=".pdf" 
                    ref={fileInputRef} 
                    style={{ display: "none" }} 
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }} 
                  />
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{selectedFile ? "✅" : "📄"}</div>
                  <div style={{ color: "white", fontSize: 14, fontWeight: 600 }}>{selectedFile ? "File Selected" : "Select PDF File"}</div>
                  <div style={{ color: selectedFile ? "#4ade80" : "#64748b", fontSize: 12, marginTop: 4 }}>{selectedFile ? selectedFile.name : "discharge_summary.pdf (simulated)"}</div>
               </div>
            </div>

            {!generatedQR && (
               <button onClick={handleAddPatient} disabled={isUploading || !newPatientName || !selectedFile} style={{ padding: "14px 24px", borderRadius: 12, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", opacity: (isUploading || !newPatientName || !selectedFile) ? 0.4 : 1, color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: (isUploading || !newPatientName || !selectedFile) ? "not-allowed" : "pointer", width: "100%", transition: "opacity 0.2s" }}>
                  {isUploading ? "Generating Plan & QR..." : "Upload & Generate AI Recovery Plan"}
               </button>
            )}

            {generatedQR && (
                <div style={{ padding: 24, borderRadius: 16, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                  <h4 style={{ color: "white", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Patient Added Successfully!</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 12 }}>Scan QR to login as {newPatientName}</p>
                  <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px 16px", borderRadius: 10, marginBottom: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>Patient ID: </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#5eead4" }}>{newPatientUrl?.split('/').pop()}</span>
                  </div>
                  <img src={generatedQR} alt="Patient QR Code" style={{ width: 180, height: 180, borderRadius: 12, margin: "0 auto", display: "block", marginBottom: 16 }} />
                  <a href={newPatientUrl!} target="_blank" style={{ color: "#5eead4", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Open Dashboard directly →</a>
                  <button onClick={() => { setGeneratedQR(null); setNewPatientName(""); setNewPatientDob(""); setNewPatientAge(""); setNewPatientCity(""); setNewPatientCond(""); setNewPatientUrl(null); setSelectedFile(null); }} style={{ marginTop: 24, padding: "12px 20px", borderRadius: 8, background: "transparent", border: "1px solid #22c55e", color: "#22c55e", fontWeight: 600, cursor: "pointer", width: "100%", transition: "all 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.background = "rgba(34,197,94,0.1)")} onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>+ Add Another Patient</button>
               </div>
            )}
          </div>
        )}

        {/* ═══════════════ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <div className="fade-in">
            {/* Stat cards */}
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              {[
                { label: "Total Patients", value: patients.length, icon: "👥", color: "#5eead4", sub: "Active" },
                { label: "Critical", value: criticalCount, icon: "🚨", color: "#ef4444", sub: "Need attention" },
                { label: "Mild Concern", value: mildCount, icon: "⚠️", color: "#f59e0b", sub: "Monitor closely" },
                { label: "Recovering Well", value: goodCount, icon: "✅", color: "#22c55e", sub: "On track" },
              ].map(s => (
                <div key={s.label} className="card-dark" style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#475569", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                      <div className="syne" style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{s.sub}</div>
                    </div>
                    <div style={{ fontSize: 28 }}>{s.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Patient status feed */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
              <div className="card-dark" style={{ padding: "24px 28px" }}>
                <h3 className="syne" style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 20 }}>Live Patient Status Feed</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {patients.length === 0 && <p style={{ color: "#64748b" }}>No active patients.</p>}
                  {patients.map(p => (
                    <div key={p.id} className="patient-row" onClick={() => { setSelectedPatient(p); setActiveTab("patients"); }}
                      style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${p.status === "critical" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${statusColor(p.status)}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {p.status === "critical" ? "🚨" : p.status === "mild" ? "⚠️" : "✅"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{p.name} <span style={{fontSize: 12, color: '#475569'}}>({p.id})</span></span>
                          <span style={{ fontSize: 12, color: "#475569" }}>{p.lastCheckin}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{p.condition} · Day {p.day}/{p.totalDays}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: statusBg(p.status), color: statusColor(p.status), fontWeight: 700 }}>{p.status.toUpperCase()}</span>
                          <span style={{ fontSize: 12, color: trendColor(p.trend), fontWeight: 700 }}>{trendIcon(p.trend)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right col */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Recent alerts */}
                <div className="card-dark" style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 className="syne" style={{ fontSize: 16, fontWeight: 800, color: "white" }}>Recent Alerts</h3>
                    <button onClick={() => setActiveTab("alerts")} style={{ fontSize: 12, color: "#5eead4", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View All →</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {alerts.length === 0 && <p style={{ color: "#64748b" }}>No alerts pending.</p>}
                    {alerts.filter(a => !resolvedAlerts.includes(a.id)).slice(0, 3).map(a => (
                      <div key={a.id} style={{ padding: "12px 14px", borderRadius: 12, background: a.type === "critical" ? "rgba(239,68,68,0.1)" : a.type === "moderate" ? "rgba(245,158,11,0.1)" : "rgba(148,163,184,0.08)", border: `1px solid ${a.type === "critical" ? "rgba(239,68,68,0.25)" : a.type === "moderate" ? "rgba(245,158,11,0.25)" : "rgba(148,163,184,0.15)"}` }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 14 }}>{a.type === "critical" ? "🔴" : a.type === "moderate" ? "🟡" : "🔵"}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{a.patient}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, lineHeight: 1.4 }}>{a.message}</div>
                            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{a.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ PATIENTS ═══ */}
        {activeTab === "patients" && (
          <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24 }}>
            <div className="card-dark" style={{ padding: "24px" }}>
              <h3 className="syne" style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16 }}>Patient List</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {patients.length === 0 && <p style={{ color: "#64748b" }}>No patients found.</p>}
                {patients.map(p => (
                  <div key={p.id} className="patient-row" onClick={() => setSelectedPatient(p)}
                    style={{ padding: "14px 16px", borderRadius: 14, background: selectedPatient?.id === p.id ? "rgba(45,158,143,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedPatient?.id === p.id ? "rgba(45,158,143,0.4)" : "rgba(255,255,255,0.06)"}`, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: `${statusColor(p.status)}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        {p.status === "critical" ? "🚨" : p.status === "mild" ? "⚠️" : "✅"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>ID: {p.id} · Code: <span style={{ color: "#5eead4", fontWeight: 700 }}>{p.code}</span></div>
                      </div>
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: statusBg(p.status), color: statusColor(p.status), fontWeight: 700 }}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPatient && <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card-dark" style={{ padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <h2 className="syne" style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{selectedPatient.name}</h2>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{selectedPatient.condition} · {selectedPatient.age} years old</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ padding: "6px 14px", borderRadius: 20, background: statusBg(selectedPatient.status), color: statusColor(selectedPatient.status), fontWeight: 700, fontSize: 13 }}>{selectedPatient.status.toUpperCase()}</span>
                    <button onClick={() => handleShowQR(selectedPatient)} style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 700, fontSize: 13, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>QR Code</button>
                    <button onClick={() => { setActiveTab("brief"); generateBrief(); }} style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(45,158,143,0.2)", color: "#5eead4", fontWeight: 700, fontSize: 13, border: "1px solid rgba(45,158,143,0.3)", cursor: "pointer" }}>📋 Brief</button>
                    <a href={`/patient/${selectedPatient.id}`} target="_blank" style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 700, fontSize: 13, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>Open Dashboard</a>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
                  {[
                    { label: "Pain Level", value: `${selectedPatient.painLevel}/10`, color: selectedPatient.painLevel >= 7 ? "#ef4444" : selectedPatient.painLevel >= 4 ? "#f59e0b" : "#22c55e" },
                    { label: "Temperature", value: selectedPatient.temp || "N/A", color: parseFloat(selectedPatient.temp) >= 100.4 ? "#ef4444" : "#22c55e" },
                    { label: "qSOFA Score", value: `${selectedPatient.qsofa || 0}/3`, color: selectedPatient.qsofa >= 2 ? "#ef4444" : selectedPatient.qsofa === 1 ? "#f59e0b" : "#22c55e" },
                    { label: "Access Code", value: selectedPatient.code, color: "#5eead4" },
                    { label: "Adherence", value: `${selectedPatient.adherence || 100}%`, color: selectedPatient.adherence >= 80 ? "#22c55e" : selectedPatient.adherence >= 60 ? "#f59e0b" : "#ef4444" },
                    { label: "Recovery Day", value: `${selectedPatient.day}/${selectedPatient.totalDays}`, color: "#5eead4" },
                    { label: "Last Check-in", value: selectedPatient.lastCheckin, color: "#94a3b8" },
                  ].map(v => (
                    <div key={v.label} className="card-light" style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>{v.label}</div>
                      <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: v.color }}>{v.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>}
          </div>
        )}

        {qrModalUrl !== null && (
          <div className="fade-in" style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
             <div className="card-dark" style={{ padding: 40, borderRadius: 24, background: "rgba(30,41,59,0.95)", border: "1px solid rgba(255,255,255,0.1)", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
                <h2 className="syne" style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 8 }}>Patient QR Code</h2>
                <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>Scan this QR code to login as {selectedPatient?.name} directly on any device.</p>
                
                {qrModalLoading ? (
                   <div style={{ width: 220, height: 220, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }}>
                      <div className="spin" style={{ fontSize: 40 }}>⟳</div>
                   </div>
                ) : (
                   <img src={qrModalUrl} alt="Patient Login QR" style={{ width: 220, height: 220, borderRadius: 16, margin: "0 auto 24px", display: "block", background: "white", padding: 12 }} />
                )}
                
                <button onClick={() => setQrModalUrl(null)} style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%" }}>Close</button>
             </div>
          </div>
        )}

        {/* ═══════════════ ALERTS ═══ */}
        {activeTab === "alerts" && (
          <div className="fade-in">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Critical", count: alerts.filter(a => a.type === "critical" && !resolvedAlerts.includes(a.id)).length, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
                { label: "Moderate", count: alerts.filter(a => a.type === "moderate" && !resolvedAlerts.includes(a.id)).length, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                { label: "Resolved", count: resolvedAlerts.length, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
              ].map(s => (
                <div key={s.label} style={{ padding: "18px 22px", borderRadius: 16, background: s.bg, border: `1px solid ${s.color}30` }}>
                  <div className="syne" style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{s.label} Alerts</div>
                </div>
              ))}
            </div>

            <div className="card-dark" style={{ padding: "24px 28px" }}>
              <h3 className="syne" style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 20 }}>All Alerts</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {alerts.length === 0 && <p style={{ color: "#64748b" }}>Good news, no alerts found.</p>}
                {alerts.map(a => (
                  <div key={a.id} className="alert-row" style={{ padding: "18px 20px", borderRadius: 16, background: resolvedAlerts.includes(a.id) ? "rgba(255,255,255,0.02)" : a.type === "critical" ? "rgba(239,68,68,0.08)" : a.type === "moderate" ? "rgba(245,158,11,0.08)" : "rgba(148,163,184,0.05)", border: `1px solid ${resolvedAlerts.includes(a.id) ? "rgba(255,255,255,0.05)" : a.type === "critical" ? "rgba(239,68,68,0.25)" : a.type === "moderate" ? "rgba(245,158,11,0.2)" : "rgba(148,163,184,0.15)"}`, opacity: resolvedAlerts.includes(a.id) ? 0.5 : 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ fontSize: 24, flexShrink: 0 }}>{a.type === "critical" ? "🔴" : a.type === "moderate" ? "🟡" : "🔵"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{a.patient}</span>
                            <span style={{ fontSize: 12, color: "#475569", marginLeft: 8 }}>{a.patientId}</span>
                          </div>
                          <span style={{ fontSize: 12, color: "#475569" }}>{a.time}</span>
                        </div>
                        <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4, lineHeight: 1.5 }}>{a.message}</div>
                        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                          {!resolvedAlerts.includes(a.id) ? (
                            <>
                              <button onClick={() => setResolvedAlerts(prev => [...prev, a.id])} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>✓ Resolve</button>
                              <button onClick={() => { setSelectedPatient(patients.find(p => p.id === a.patientId)); setActiveTab("patients"); }} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(45,158,143,0.15)", border: "1px solid rgba(45,158,143,0.25)", color: "#5eead4", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>View Patient</button>
                            </>
                          ) : (
                            <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>✓ Resolved</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ WOUNDS / BEHAVIOUR / BRIEF ═══ */}
        {activeTab === "wounds" && (
          <div className="fade-in card-dark" style={{ padding: 28 }}>
            <h3 className="syne" style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 24 }}>Wound Photo Timeline (Demo)</h3>
            <div style={{ display: "flex", gap: 20, overflowX: "auto" }}>
              {woundPhotos.map((w, i) => (
                <div key={i} style={{ minWidth: 200, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ width: "100%", height: 140, borderRadius: 8, background: w.color, opacity: 0.8, marginBottom: 12 }} />
                  <div style={{ fontSize: 13, color: "white", fontWeight: 700 }}>{w.patient}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                     <span>{w.day}</span>
                     <span style={{ color: w.color, fontWeight: 700 }}>{w.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 24 }}>* Patients upload wound photos in their dashboard. AI analyzes healing progress over time.</p>
          </div>
        )}

        {/* ═══════════════ BEHAVIOUR ═══ */}
        {activeTab === "behaviour" && (
          <div className="fade-in card-dark" style={{ padding: 28 }}>
            <h3 className="syne" style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Passive Behaviour Panel (Demo)</h3>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>Background phone telemetry to track recovery mobility and sleep.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div style={{ padding: 20, borderRadius: 16, background: "rgba(45,158,143,0.1)", border: "1px solid rgba(45,158,143,0.2)" }}>
                 <div style={{ fontSize: 24, marginBottom: 8 }}>👣</div>
                 <div style={{ fontSize: 13, color: "#5eead4", fontWeight: 700 }}>Avg Daily Steps</div>
                 <div className="syne" style={{ fontSize: 28, color: "white", fontWeight: 800 }}>1,210</div>
                 <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>+12% from last week</div>
              </div>
              <div style={{ padding: 20, borderRadius: 16, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                 <div style={{ fontSize: 24, marginBottom: 8 }}>😴</div>
                 <div style={{ fontSize: 13, color: "#c084fc", fontWeight: 700 }}>Avg Sleep</div>
                 <div className="syne" style={{ fontSize: 28, color: "white", fontWeight: 800 }}>6.8 hrs</div>
                 <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Stable</div>
              </div>
              <div style={{ padding: 20, borderRadius: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                 <div style={{ fontSize: 24, marginBottom: 8 }}>📱</div>
                 <div style={{ fontSize: 13, color: "#f87171", fontWeight: 700 }}>Screen Time</div>
                 <div className="syne" style={{ fontSize: 28, color: "white", fontWeight: 800 }}>3.5 hrs</div>
                 <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Phone usage normalized</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
               {behaviourData.map(d => (
                 <div key={d.day} style={{ flex: 1, height: 160, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", position: "relative", display: "flex", alignItems: "flex-end", padding: "0 10px 30px" }}>
                    <div style={{ width: "100%", height: `${(d.steps / 2000) * 100}%`, background: "rgba(45,158,143,0.6)", borderRadius: 4 }} />
                    <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#64748b" }}>{d.day}</div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* ═══════════════ BRIEF ═══ */}
        {activeTab === "brief" && (
          <div className="fade-in">
            {!selectedPatient ? (
              <div className="card-dark" style={{ padding: "60px 40px", textAlign: "center" }}>
                 <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
                 <h3 className="syne" style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Select a Patient</h3>
                 <p style={{ color: "#94a3b8", fontSize: 14 }}>Please select a patient from the 'My Patients' tab to generate a pre-visit brief.</p>
                 <button onClick={() => setActiveTab("patients")} style={{ marginTop: 20, padding: "10px 20px", borderRadius: 8, background: "rgba(45,158,143,0.15)", color: "#5eead4", border: "1px solid rgba(45,158,143,0.3)", cursor: "pointer", fontWeight: 600 }}>Go to Patients</button>
              </div>
            ) : (
              <div className="card-dark" style={{ padding: "28px", maxWidth: 800 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <h2 className="syne" style={{ fontSize: 20, fontWeight: 800, color: "white" }}>Pre-Visit Brief</h2>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Auto-generated AI summary for {selectedPatient.name}</div>
                  </div>
                  <button onClick={generateBrief} disabled={briefLoading}
                    style={{ padding: "12px 24px", borderRadius: 12, background: briefLoading ? "rgba(45,158,143,0.3)" : "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: briefLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    {briefLoading ? <><span className="spin" style={{ display: "inline-block" }}>⟳</span> Generating...</> : "🤖 Generate Brief"}
                  </button>
                </div>

                {!brief && !briefLoading && (
                  <div style={{ textAlign: "center", padding: "60px 40px" }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
                    <div style={{ fontSize: 16, color: "#475569", marginBottom: 8 }}>No brief generated yet</div>
                    <div style={{ fontSize: 13, color: "#334155" }}>Click "Generate Brief" to create an AI-powered summary for {selectedPatient.name}</div>
                  </div>
                )}

                {briefLoading && (
                  <div style={{ textAlign: "center", padding: "60px 40px" }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }} className="spin">⟳</div>
                    <div style={{ fontSize: 15, color: "#5eead4" }}>Analyzing patient data...</div>
                  </div>
                )}

                {brief && !briefLoading && (
                  <div>
                    <pre style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 24px" }}>
                      {brief}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  </div>
  );
}