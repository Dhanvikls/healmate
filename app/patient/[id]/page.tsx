"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// ── HealMate Logo (shared component – extract to components/shared/Logo.tsx later)
function HealMateLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 85C50 85 10 58 10 32C10 18 20 10 32 12C40 13 47 18 50 24C53 18 60 13 68 12C80 10 90 18 90 32C90 58 50 85 50 85Z" fill="url(#hg1)" opacity="0.85" />
        <circle cx="42" cy="34" r="7" fill="url(#hg2)" />
        <path d="M34 52Q36 42 42 40Q48 38 52 44L56 58" stroke="url(#hg2)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M55 28Q62 22 68 26Q74 30 72 38Q70 44 64 46" stroke="url(#hg3)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="64" cy="48" r="4" fill="none" stroke="url(#hg3)" strokeWidth="2.5" />
        <circle cx="56" cy="24" r="3.5" fill="none" stroke="url(#hg3)" strokeWidth="2" />
        <defs>
          <linearGradient id="hg1" x1="10" y1="10" x2="90" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#4fd1c5" /><stop offset="1" stopColor="#2d9e8f" /></linearGradient>
          <linearGradient id="hg2" x1="34" y1="27" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#6ee7b7" /><stop offset="1" stopColor="#22c55e" /></linearGradient>
          <linearGradient id="hg3" x1="55" y1="22" x2="72" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#2d9e8f" /><stop offset="1" stopColor="#0e7490" /></linearGradient>
        </defs>
      </svg>
      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size * 0.52 }}>
        <span style={{ color: "#2d9e8f" }}>HEAL</span><span style={{ color: "#0e7490" }}>MATE</span>
      </span>
    </div>
  );
}

type CheckinStep = 'pain' | 'symptoms' | 'qsofa' | 'done';

export default function PatientDashboard() {
  const params = useParams();
  const router = useRouter();
  const [patientId, setPatientId] = useState<string | null>(params.id as string || null);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugLog, setDebugLog] = useState<string[]>(["Booting dashboard..."]);

  const addLog = (msg: string) => setDebugLog(prev => [...prev.slice(-10), `> ${msg}`]);
  
  // Sync patientId and verify session
  useEffect(() => {
    if (params.id) {
      const loggedInId = localStorage.getItem("healmate_patient_id");
      if (loggedInId !== params.id) {
        // Only redirect if we are on the client and not during SSR
        if (typeof window !== "undefined") {
          router.push("/patient");
        }
        return;
      }
      setPatientId(params.id as string);
    } else {
      if (typeof window !== "undefined") {
        router.push("/patient");
      }
    }
  }, [params.id, router]);


  
  // Failsafe Timeout
  useEffect(() => {
    const t = setTimeout(() => {
      if (isLoading && !errorLog) {
         addLog("Timeout reached!");
         setErrorLog(`System hung during loading phase. Check the debug logs below.`);
         setIsLoading(false);
      }
    }, 6000);
    return () => clearTimeout(t);
  }, [isLoading, errorLog]);
  
  // Data state
  const [patient, setPatient] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [recoveryTasks, setRecoveryTasks] = useState<any[]>([]);
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([
    { day: "D6", pain: 7, energy: 3 }, { day: "D7", pain: 6, energy: 4 }, { day: "D8", pain: 5, energy: 5 }, { day: "D9", pain: 4, energy: 6 }, { day: "D10", pain: 3, energy: 7 }
  ]);

  const [activeTab, setActiveTab] = useState<"overview" | "checkin" | "medications" | "wound" | "sos">("overview");
  const [checkinStep, setCheckinStep] = useState<CheckinStep>("pain");
  const [painLevel, setPainLevel] = useState(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [qsofa, setQsofa] = useState({ rr: false, mental: false, bp: false });
  const [sosActive, setSosActive] = useState(false);
  const [tasksDone, setTasksDone] = useState<boolean[]>([]);
  const [medsTaken, setMedsTaken] = useState<boolean[]>([]);

  const fetchData = async () => {
    if (!patientId) {
       addLog("No ID yet, can't fetch.");
       return;
    }
    const absoluteApiUrl = window.location.origin + `/api/patient/${patientId}`;
    addLog(`FETCH START: ${absoluteApiUrl}`);
    
    try {
      const r = await fetch(absoluteApiUrl);
      addLog(`STATUS: ${r.status}`);
      if (!r.ok) throw new Error("API Route responded with status: " + r.status);
      const d = await r.json();
      
      addLog("DATA JSON received.");
      if (d.patient) {
          setPatient(d.patient);
          setMedications(d.medications || []);
          setRecoveryTasks(d.tasks || []);
          setRecentCheckins(d.checkins || []);
          setTasksDone((d.tasks || []).map((t: any) => !!t.done));
          setMedsTaken((d.medications || []).map((m: any) => !!m.taken));
          addLog("STATE UPDATED.");
      } else if (d.error) {
           addLog(`ERROR: ${d.error}`);
           setErrorLog(d.error);
      }
      addLog("SETTING ISLOADING = FALSE");
      setIsLoading(false);
    } catch (e: any) {
      addLog(`FATAL CRASH: ${e.message}`);
      console.error(e);
      setErrorLog("Network fetch failed: " + e.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
       fetchData();
    }
  }, [patientId]);

  if (isLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", background: "#f0f9ff", padding: 20 }}>
      <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
      <div style={{ fontWeight: 600, color: "#0e7490", marginBottom: 20 }}>Loading patient data...</div>
      <div style={{ width: "100%", maxWidth: 320, padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.1)", fontSize: 11, color: "#64748b" }}>
      <div style={{ fontWeight: 800, textTransform: "uppercase", fontSize: 9, marginBottom: 6, opacity: 0.6 }}>System Logs:</div>
      {debugLog.map((log, i) => <div key={i} style={{ marginBottom: 4 }}>• {log}</div>)}
      <div style={{ marginTop: 8, fontSize: 10, color: "#94a3b8" }}>ID: {patientId || "Searching..."}</div>
      <button onClick={fetchData} style={{ marginTop: 20, padding: "10px 16px", borderRadius: 8, background: "#0e7490", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Force Reload Data ↺</button>
      </div>
    </div>
  );

  if (errorLog) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 24, textAlign: "center", color: "#dc2626", background: "#fef2f2" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Dashboard Error</div>
      <div style={{ fontSize: 14, marginBottom: 24 }}>{errorLog}</div>
      <div style={{ width: "100%", maxWidth: 360, padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.05)", fontSize: 11, color: "#991b1b", textAlign: "left" }}>
         <div style={{ fontWeight: 800, textTransform: "uppercase", fontSize: 9, marginBottom: 6 }}>Full Diagnostic Stack:</div>
         {debugLog.map((log, i) => <div key={i} style={{ marginBottom: 4 }}>• {log}</div>)}
         <div style={{ marginTop: 8 }}>• Patient ID: {patientId || "None"}</div>
         <div style={{ marginTop: 4 }}>• URL: {typeof window !== "undefined" ? window.location.href : "SSR"}</div>
      </div>
      <button onClick={() => window.location.reload()} style={{ marginTop: 32, padding: "12px 24px", borderRadius: 10, background: "#dc2626", color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}>Retry Connection</button>
    </div>
  );

  if (!patient) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", background: "#f0f9ff" }}>Patient not found for ID: {patientId}</div>;

  const progressPct = Math.round((patient.day / patient.totalDays) * 100);
  const tasksDoneCount = tasksDone.filter(Boolean).length;
  const medsDoneCount = medsTaken.filter(Boolean).length;

  const symptoms = ["Chest Pain", "Shortness of Breath", "Dizziness", "Nausea", "Fatigue", "Swelling", "Fever", "Palpitations"];
  const toggleSymptom = (s: string) => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const qsofaScore = [qsofa.rr, qsofa.mental, qsofa.bp].filter(Boolean).length;
  const alertLevel = qsofaScore >= 2 ? "critical" : painLevel >= 7 ? "moderate" : "good";

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#f0f9ff", minHeight: "100vh", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .syne{font-family:'Syne',sans-serif;}
        .glass{background:rgba(255,255,255,0.8);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.6);}
        .card{background:white;border-radius:20px;box-shadow:0 2px 16px rgba(0,0,0,0.06);}
        .tab-btn{transition:all 0.2s ease;cursor:pointer;border:none;background:none;}
        .tab-btn:hover{background:rgba(45,158,143,0.08)!important;}
        .med-row:hover{background:rgba(45,158,143,0.04);}
        .task-row:hover{background:rgba(45,158,143,0.04);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-sos{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 0 20px rgba(239,68,68,0)}}
        .fade-in{animation:fadeUp 0.4s ease forwards;}
        .sos-pulse{animation:pulse-sos 1.5s ease-in-out infinite;}
        .spin{animation:spin 1s linear infinite;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}

        /* RESPONSIVE PATIENT DASHBOARD */
        .dashboard-container { display: flex; min-height: 100vh; background: #f8fafc; }
        .sidebar { width: 240px; position: fixed; height: 100vh; z-index: 50; }
        .main-content { margin-left: 240px; flex: 1; padding: 32px 36px; min-height: 100vh; padding-bottom: 100px; }
        .bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid rgba(45,158,143,0.1); padding: 12px 10px; z-index: 100; box-shadow: 0 -4px 16px rgba(0,0,0,0.05); }
        .bottom-nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; border: none; background: none; cursor: pointer; color: #64748b; transition: all 0.2s; }
        .bottom-nav-btn.active { color: #2d9e8f; }
        
        @media (max-width: 1024px) {
           .sidebar { width: 80px; }
           .sidebar span:not(.icon) { display: none; }
           .sidebar .patient-card-full { display: none; }
           .sidebar .patient-avatar-only { display: flex !important; margin: 16px auto; }
           .main-content { margin-left: 80px; }
        }
        @media (max-width: 768px) {
           .sidebar { display: none !important; }
           .bottom-nav { display: flex !important; }
           .main-content { margin-left: 0; padding: 20px; padding-bottom: 120px; }
           .stats-grid { grid-template-columns: 1fr !important; }
           .header-row { flex-direction: column; align-items: flex-start !important; gap: 16px !important; }
        }
      `}</style>

      <div className="dashboard-container">
        {/* MOBILE BOTTOM NAV */}
        <div className="bottom-nav">
          {[
            { id: "overview", icon: "🏠", label: "Home" },
            { id: "checkin", icon: "✅", label: "Check-in" },
            { id: "medications", icon: "💊", label: "Meds" },
            { id: "wound", icon: "🩹", label: "Wound" },
            { id: "sos", icon: "🚨", label: "SOS" },
          ].map(item => (
            <button key={item.id} className={`bottom-nav-btn ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id as any)}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700 }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar" style={{ background: "white", borderRight: "1px solid rgba(45,158,143,0.1)", display: "flex", flexDirection: "column", padding: "24px 0" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(45,158,143,0.1)" }}>
          <HealMateLogo size={36} />
        </div>

        {/* Patient card (Full) */}
        <div className="patient-card-full" style={{ padding: "20px 16px", margin: "16px 12px", borderRadius: 16, background: "linear-gradient(135deg,#2d9e8f,#0e7490)" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 10 }}>👤</div>
          <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{patient.name}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>{patient.condition}</div>
          <div style={{ marginTop: 12, background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>Recovery</span>
              <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>Day {patient.day}/{patient.totalDays}</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.25)", borderRadius: 4 }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "white", borderRadius: 4, transition: "width 0.5s ease" }} />
            </div>
          </div>
        </div>

        {/* Patient card (Mini) */}
        <div className="patient-avatar-only" style={{ display: "none", width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
           👤
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { id: "overview", icon: "🏠", label: "Overview" },
            { id: "checkin", icon: "✅", label: "Daily Check-in" },
            { id: "medications", icon: "💊", label: "Medications" },
            { id: "wound", icon: "🩹", label: "Wound Tracker" },
            { id: "sos", icon: "🚨", label: "SOS Emergency" },
          ].map(item => (
            <button key={item.id} className="tab-btn" onClick={() => setActiveTab(item.id as any)}
              style={{ padding: "11px 14px", borderRadius: 12, textAlign: "left", display: "flex", alignItems: "center", gap: 10, background: activeTab === item.id ? "linear-gradient(135deg,rgba(45,158,143,0.12),rgba(14,116,144,0.08))" : "transparent", borderLeft: activeTab === item.id ? "3px solid #2d9e8f" : "3px solid transparent" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: activeTab === item.id ? 700 : 500, color: activeTab === item.id ? "#2d9e8f" : "#475569" }}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(45,158,143,0.1)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, textDecoration: "none" }}>
            <span style={{ fontSize: 16 }}>←</span>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Back to Home</span>
          </Link>
        </div>
      </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="main-content">

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 2 }}>Good morning 👋</div>
            <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
              {activeTab === "overview" ? "Recovery Overview" :
               activeTab === "checkin" ? "Daily Check-in" :
               activeTab === "medications" ? "My Medications" :
               activeTab === "wound" ? "Wound Tracker" : "SOS Emergency"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Alert badge */}
            <div style={{ padding: "8px 16px", borderRadius: 40, background: alertLevel === "critical" ? "#fee2e2" : alertLevel === "moderate" ? "#fef3c7" : "#dcfce7", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: alertLevel === "critical" ? "#ef4444" : alertLevel === "moderate" ? "#f59e0b" : "#22c55e" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: alertLevel === "critical" ? "#dc2626" : alertLevel === "moderate" ? "#d97706" : "#16a34a" }}>
                {alertLevel === "critical" ? "⚠️ Alert Active" : alertLevel === "moderate" ? "Mild Concern" : "All Clear"}
              </span>
            </div>
            {/* Patient Info Badge */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ padding: "8px 14px", borderRadius: 12, background: "white", border: "1px solid rgba(45,158,143,0.15)", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>ID:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0e7490" }}>{patient.id}</span>
              </div>
              <div style={{ padding: "8px 14px", borderRadius: 12, background: "rgba(45,158,143,0.08)", border: "1px solid rgba(45,158,143,0.2)", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: 13, color: "#2d9e8f" }}>CODE:</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#0e7490", letterSpacing: 1 }}>{patient.code}</span>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem("healmate_patient_id");
                  router.push("/patient");
                }}
                style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                onMouseOut={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.05)"}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <div className="fade-in">
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 28 }}>
              {[
                { label: "Recovery Day", value: `${patient.day}`, sub: `of ${patient.totalDays} days`, icon: "📅", color: "#2d9e8f", bg: "#f0fdfa" },
                { label: "Tasks Done", value: `${tasksDoneCount}/${recoveryTasks.length}`, sub: "today", icon: "✅", color: "#22c55e", bg: "#f0fdf4" },
                { label: "Meds Taken", value: `${medsDoneCount}/${medications.length}`, sub: "today", icon: "💊", color: "#f59e0b", bg: "#fffbeb" },
                { label: "Pain Level", value: `${painLevel}/10`, sub: "last check-in", icon: "🩺", color: "#0e7490", bg: "#f0f9ff" },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: "20px 22px", background: s.bg, border: `1px solid ${s.color}20` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                      <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: s.color, marginTop: 2 }}>{s.sub}</div>
                    </div>
                    <div style={{ fontSize: 26 }}>{s.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
              {/* Left col */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Recovery progress bar visual */}
                <div className="card" style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 className="syne" style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Recovery Journey</h3>
                    <span style={{ fontSize: 13, color: "#2d9e8f", fontWeight: 600 }}>{progressPct}% complete</span>
                  </div>
                  {/* Progress timeline */}
                  <div style={{ position: "relative", marginBottom: 24 }}>
                    <div style={{ height: 10, background: "#e2e8f0", borderRadius: 8 }}>
                      <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg,#2d9e8f,#22c55e)", borderRadius: 8, transition: "width 0.8s ease" }} />
                    </div>
                    {[0, 25, 50, 75, 100].map(p => (
                      <div key={p} style={{ position: "absolute", top: -4, left: `${p}%`, transform: "translateX(-50%)", width: 18, height: 18, borderRadius: "50%", background: progressPct >= p ? "#2d9e8f" : "white", border: "2px solid #2d9e8f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {progressPct >= p && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />}
                      </div>
                    ))}
                  </div>
                  {/* Mini vitals chart */}
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
                    {vitalsHistory.map((v, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
                          <div style={{ width: "70%", height: v.energy * 7, background: "linear-gradient(180deg,#2d9e8f,#4fd1c5)", borderRadius: "4px 4px 0 0", minHeight: 4 }} title={`Energy: ${v.energy}`} />
                          <div style={{ width: "70%", height: v.pain * 5, background: "linear-gradient(180deg,#fca5a5,#ef4444)", borderRadius: "4px 4px 0 0", minHeight: 4 }} title={`Pain: ${v.pain}`} />
                        </div>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{v.day}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#2d9e8f" }} /><span style={{ fontSize: 10, color: "#64748b" }}>Energy</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#ef4444" }} /><span style={{ fontSize: 10, color: "#64748b" }}>Pain</span></div>
                    </div>
                  </div>
                </div>

                {/* Today's tasks */}
                <div className="card" style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <h3 className="syne" style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Today's Tasks</h3>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{tasksDoneCount}/{recoveryTasks.length} done</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {recoveryTasks.map((task, i) => (
                      <div key={i} className="task-row" onClick={() => setTasksDone(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, cursor: "pointer", transition: "background 0.2s", background: tasksDone[i] ? "rgba(34,197,94,0.05)" : "transparent" }}>
                        <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${tasksDone[i] ? "#22c55e" : "#cbd5e1"}`, background: tasksDone[i] ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                          {tasksDone[i] && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 14, color: tasksDone[i] ? "#94a3b8" : "#374151", textDecoration: tasksDone[i] ? "line-through" : "none", flex: 1 }}>{task.task}</span>
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(45,158,143,0.1)", color: "#2d9e8f", fontWeight: 600 }}>{task.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right col */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Care team */}
                <div className="card" style={{ padding: "22px 24px" }}>
                  <h3 className="syne" style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Care Team</h3>
                  {[
                    { name: patient.doctorName, role: "Cardiologist", icon: "👨‍⚕️", online: true },
                    { name: patient.caregiverName, role: "Caregiver", icon: "🤝", online: true },
                    { name: "ASHA Worker - Lata", role: "Community Health", icon: "👩", online: false },
                  ].map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? "1px solid #f1f5f9" : "none" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, position: "relative" }}>
                        {p.icon}
                        <div style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: p.online ? "#22c55e" : "#cbd5e1", border: "2px solid white" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{p.role}</div>
                      </div>
                      <button style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(45,158,143,0.2)", background: "transparent", fontSize: 12, color: "#2d9e8f", cursor: "pointer", fontWeight: 600 }}>Message</button>
                    </div>
                  ))}
                </div>

                {/* Recent check-ins */}
                <div className="card" style={{ padding: "22px 24px" }}>
                  <h3 className="syne" style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Recent Check-ins</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {recentCheckins.map((c, i) => (
                      <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: c.status === "good" ? "#f0fdf4" : c.status === "mild" ? "#fffbeb" : "#fff7ed", border: `1px solid ${c.status === "good" ? "#bbf7d0" : c.status === "mild" ? "#fed7aa" : "#fdba74"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{c.date}</span>
                          <span style={{ fontSize: 12, color: "#64748b" }}>🌡 {c.temp}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 4 }}>
                            <div style={{ height: "100%", width: `${c.painLevel * 10}%`, background: c.painLevel <= 3 ? "#22c55e" : c.painLevel <= 6 ? "#f59e0b" : "#ef4444", borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 12, color: "#64748b" }}>Pain {c.painLevel}/10</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{c.notes}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab("checkin")} style={{ width: "100%", marginTop: 14, padding: "11px", borderRadius: 12, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
                    Start Today's Check-in →
                  </button>
                </div>

                {/* Quick SOS */}
                <div className="card" style={{ padding: "22px 24px", border: "1px solid rgba(239,68,68,0.15)", background: "#fff5f5" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626" }}>Emergency SOS</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Alerts your doctor & caregiver instantly</div>
                    </div>
                    <button onClick={() => setActiveTab("sos")} style={{ padding: "10px 18px", borderRadius: 12, background: "#ef4444", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
                      🚨 SOS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ CHECK-IN ═══ */}
        {activeTab === "checkin" && (
          <div className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
            {/* Step indicator */}
            <div style={{ display: "flex", gap: 8, marginBottom: 32, alignItems: "center" }}>
              {(["pain","symptoms","qsofa","done"] as CheckinStep[]).map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: checkinStep === step ? "linear-gradient(135deg,#2d9e8f,#0e7490)" : ["pain","symptoms","qsofa","done"].indexOf(checkinStep) > i ? "#22c55e" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: checkinStep === step || ["pain","symptoms","qsofa","done"].indexOf(checkinStep) > i ? "white" : "#94a3b8", fontWeight: 700 }}>
                    {["pain","symptoms","qsofa","done"].indexOf(checkinStep) > i ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: checkinStep === step ? "#2d9e8f" : "#94a3b8" }}>{["Pain Level","Symptoms","qSOFA","Done"][i]}</span>
                  {i < 3 && <div style={{ flex: 1, height: 2, background: ["pain","symptoms","qsofa","done"].indexOf(checkinStep) > i ? "#22c55e" : "#e2e8f0", width: 32, borderRadius: 2 }} />}
                </div>
              ))}
            </div>

            {checkinStep === "pain" && (
              <div className="card" style={{ padding: "36px 40px" }}>
                <h2 className="syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>How much pain are you in?</h2>
                <p style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}>Slide to indicate your current pain level (0 = no pain, 10 = worst)</p>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div className="syne" style={{ fontSize: 72, fontWeight: 800, color: painLevel <= 3 ? "#22c55e" : painLevel <= 6 ? "#f59e0b" : "#ef4444", lineHeight: 1 }}>{painLevel}</div>
                  <div style={{ fontSize: 16, color: "#64748b", marginTop: 8 }}>{painLevel <= 3 ? "Mild — manageable" : painLevel <= 6 ? "Moderate — noticeable" : "Severe — seek help"}</div>
                </div>
                <input type="range" min={0} max={10} value={painLevel} onChange={e => setPainLevel(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#2d9e8f", height: 6, marginBottom: 32 }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
                  {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                    <div key={n} onClick={() => setPainLevel(n)} style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, cursor: "pointer", background: painLevel === n ? "linear-gradient(135deg,#2d9e8f,#0e7490)" : "#f1f5f9", color: painLevel === n ? "white" : "#64748b" }}>{n}</div>
                  ))}
                </div>
                <button onClick={() => setCheckinStep("symptoms")} style={{ width: "100%", padding: 16, borderRadius: 14, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>
                  Next: Symptoms →
                </button>
              </div>
            )}

            {checkinStep === "symptoms" && (
              <div className="card" style={{ padding: "36px 40px" }}>
                <h2 className="syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Any symptoms today?</h2>
                <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Select all that apply. It's okay if none apply.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 32 }}>
                  {symptoms.map(s => (
                    <div key={s} onClick={() => toggleSymptom(s)} style={{ padding: "14px 16px", borderRadius: 14, border: `2px solid ${selectedSymptoms.includes(s) ? "#2d9e8f" : "#e2e8f0"}`, background: selectedSymptoms.includes(s) ? "rgba(45,158,143,0.08)" : "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${selectedSymptoms.includes(s) ? "#2d9e8f" : "#cbd5e1"}`, background: selectedSymptoms.includes(s) ? "#2d9e8f" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {selectedSymptoms.includes(s) && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{s}</span>
                    </div>
                  ))}
                </div>
                {selectedSymptoms.length > 0 && (
                  <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fcd34d", marginBottom: 20, fontSize: 13, color: "#92400e" }}>
                    ⚠️ <strong>{selectedSymptoms.length} symptom(s)</strong> selected — these will be reviewed by your doctor.
                  </div>
                )}
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setCheckinStep("pain")} style={{ flex: 1, padding: 14, borderRadius: 12, border: "2px solid #e2e8f0", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#374151" }}>← Back</button>
                  <button onClick={() => setCheckinStep("qsofa")} style={{ flex: 2, padding: 14, borderRadius: 12, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Next: qSOFA →</button>
                </div>
              </div>
            )}

            {checkinStep === "qsofa" && (
              <div className="card" style={{ padding: "36px 40px" }}>
                <h2 className="syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>qSOFA Assessment</h2>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>Quick Sepsis-related Organ Failure Assessment — answer honestly.</p>
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "#f0f9ff", border: "1px solid #bae6fd", marginBottom: 28, fontSize: 13, color: "#0369a1" }}>
                  Score: <strong>{qsofaScore}/3</strong> {qsofaScore >= 2 ? "⚠️ HIGH RISK — doctor will be alerted" : qsofaScore === 1 ? "— Mild concern, monitor closely" : "— No concern"}
                </div>
                {[
                  { key: "rr", label: "Is your breathing rate faster than normal?", sub: "More than 22 breaths per minute", val: qsofa.rr },
                  { key: "mental", label: "Are you feeling confused or disoriented?", sub: "Altered mental state or difficulty thinking clearly", val: qsofa.mental },
                  { key: "bp", label: "Do you feel very dizzy when standing?", sub: "Possible sign of low blood pressure (≤100 mmHg systolic)", val: qsofa.bp },
                ].map(q => (
                  <div key={q.key} onClick={() => setQsofa(prev => ({ ...prev, [q.key]: !prev[q.key as keyof typeof qsofa] }))}
                    style={{ padding: "18px 20px", borderRadius: 14, border: `2px solid ${q.val ? "#ef4444" : "#e2e8f0"}`, background: q.val ? "#fff5f5" : "white", cursor: "pointer", marginBottom: 14, transition: "all 0.2s" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${q.val ? "#ef4444" : "#cbd5e1"}`, background: q.val ? "#ef4444" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        {q.val && <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{q.label}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{q.sub}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button onClick={() => setCheckinStep("symptoms")} style={{ flex: 1, padding: 14, borderRadius: 12, border: "2px solid #e2e8f0", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#374151" }}>← Back</button>
                  <button onClick={async () => {
                    await fetch('/api/checkin', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        patientId: patient?.id,
                        patientName: patient?.name,
                        painLevel,
                        symptoms: selectedSymptoms,
                        qsofa: [qsofa.rr, qsofa.mental, qsofa.bp].filter(Boolean).length
                      })
                    });
                    setCheckinStep("done");
                  }} style={{ flex: 2, padding: 14, borderRadius: 12, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Submit Check-in ✓</button>
                </div>
              </div>
            )}

            {checkinStep === "done" && (
              <div className="card" style={{ padding: "48px 40px", textAlign: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(34,197,94,0.3)" }}>✓</div>
                <h2 className="syne" style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Check-in Complete!</h2>
                <p style={{ color: "#64748b", fontSize: 15, marginBottom: 32, maxWidth: 360, margin: "0 auto 32px" }}>Your daily check-in has been recorded and shared with {patient.doctorName} and {patient.caregiverName}.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
                  {[
                    { label: "Pain Level", value: `${painLevel}/10`, icon: "🩺" },
                    { label: "Symptoms", value: selectedSymptoms.length > 0 ? `${selectedSymptoms.length} reported` : "None", icon: "📋" },
                    { label: "qSOFA Score", value: `${qsofaScore}/3`, icon: "🧪" },
                  ].map(s => (
                    <div key={s.label} style={{ padding: "16px", borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setCheckinStep("pain"); setActiveTab("overview"); }} style={{ padding: "14px 32px", borderRadius: 14, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
                  Back to Dashboard →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════ MEDICATIONS ═══ */}
        {activeTab === "medications" && (
          <div className="fade-in">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div className="card" style={{ padding: "28px" }}>
                <h3 className="syne" style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Today's Schedule</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {medications.map((med, i) => (
                    <div key={i} className="med-row" onClick={() => setMedsTaken(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: medsTaken[i] ? "rgba(34,197,94,0.06)" : "#f8fafc", border: `1px solid ${medsTaken[i] ? "#bbf7d0" : "#e2e8f0"}`, cursor: "pointer", transition: "all 0.2s" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: medsTaken[i] ? "#dcfce7" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💊</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", textDecoration: medsTaken[i] ? "line-through" : "none" }}>{med.name}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>⏰ {med.time}</div>
                      </div>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: medsTaken[i] ? "#22c55e" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                        {medsTaken[i] ? <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>✓</span> : <span style={{ color: "#94a3b8", fontSize: 14 }}>○</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="card" style={{ padding: "24px" }}>
                  <h3 className="syne" style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Adherence This Week</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => (
                      <div key={day} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ height: 60, background: i < 4 ? "linear-gradient(180deg,#2d9e8f,#4fd1c5)" : i === 4 ? "#fde68a" : "#e2e8f0", borderRadius: 8, marginBottom: 4, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4 }}>
                          <span style={{ fontSize: 10, color: i < 4 ? "white" : "#94a3b8", fontWeight: 700 }}>{i < 4 ? "✓" : i === 4 ? "~" : "-"}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{day}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, padding: "12px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", textAlign: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>85% adherence this week 🎉</span>
                  </div>
                </div>

                <div className="card" style={{ padding: "24px", background: "linear-gradient(135deg,#0f172a,#0c4a6e)" }}>
                  <div style={{ fontSize: 22, marginBottom: 12 }}>⏰</div>
                  <h3 style={{ color: "white", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Next Dose Reminder</h3>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 16 }}>Atorvastatin 40mg + Ramipril 5mg</div>
                  <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", display: "inline-block" }}>
                    <span style={{ color: "#5eead4", fontWeight: 800, fontSize: 18 }}>9:00 PM</span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginLeft: 8 }}>Tonight</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ WOUND ═══ */}
        {activeTab === "wound" && (
          <div className="fade-in">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div className="card" style={{ padding: "28px" }}>
                <h3 className="syne" style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Upload Today's Photo</h3>
                <div style={{ border: "2px dashed rgba(45,158,143,0.3)", borderRadius: 16, padding: "48px 24px", textAlign: "center", background: "rgba(45,158,143,0.03)", cursor: "pointer", marginBottom: 20 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 4 }}>Drop photo here or click to upload</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>JPG, PNG up to 10MB · AI will compare with previous photos</div>
                  <button style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>Choose Photo</button>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>🤖 AI Comparison Active</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Your photo will be automatically compared with Day 1 baseline to detect healing progress or concerns.</div>
                </div>
              </div>

              <div className="card" style={{ padding: "28px" }}>
                <h3 className="syne" style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Healing Timeline</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { day: "Day 1", status: "Baseline", color: "#94a3b8" },
                    { day: "Day 5", status: "Improving", color: "#f59e0b" },
                    { day: "Day 10", status: "Good", color: "#22c55e" },
                  ].map(p => (
                    <div key={p.day} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      <div style={{ height: 80, background: `linear-gradient(135deg,${p.color}20,${p.color}40)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🩹</div>
                      <div style={{ padding: "8px 10px" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{p.day}</div>
                        <div style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "16px", borderRadius: 12, background: "linear-gradient(135deg,rgba(45,158,143,0.06),rgba(14,116,144,0.06))", border: "1px solid rgba(45,158,143,0.15)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0e7490", marginBottom: 4 }}>🤖 AI Analysis — Day 10</div>
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>Wound appears to be healing well. Redness has reduced by approximately 60% compared to Day 1. No signs of infection detected. Continue current care routine.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ SOS ═══ */}
        {activeTab === "sos" && (
          <div className="fade-in" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <div className="card" style={{ padding: "48px 40px" }}>
              {!sosActive ? (
                <>
                  <div style={{ fontSize: 64, marginBottom: 20 }}>🚨</div>
                  <h2 className="syne" style={{ fontSize: 26, fontWeight: 800, color: "#dc2626", marginBottom: 8 }}>Emergency SOS</h2>
                  <p style={{ color: "#64748b", fontSize: 15, marginBottom: 32, lineHeight: 1.65 }}>
                    Pressing SOS will immediately alert <strong>{patient.doctorName}</strong> and <strong>{patient.caregiverName}</strong> with your current location and last check-in data.
                  </p>
                  <div style={{ padding: "16px", borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 32, textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>What gets sent automatically:</div>
                    {["Your name & Patient ID: HM-2024-001","Last check-in: Pain 3/10, No critical symptoms","Medication status: 2/4 taken today","Location (if permission granted)","Emergency contact numbers"].map(item => (
                      <div key={item} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ color: "#ef4444", fontWeight: 700 }}>→</span>
                        <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={async () => {
                    await fetch('/api/alerts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ patientId: patient?.id, patientName: patient?.name, type: 'sos' })
                    });
                    setSosActive(true);
                  }} className="sos-pulse"
                    style={{ width: 160, height: 160, borderRadius: "50%", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", fontWeight: 800, fontSize: 22, border: "none", cursor: "pointer", fontFamily: "'Syne',sans-serif", boxShadow: "0 8px 32px rgba(239,68,68,0.4)", margin: "0 auto", display: "block" }}>
                    SOS<br/><span style={{ fontSize: 13, fontWeight: 500 }}>Hold to Send</span>
                  </button>
                </>
              ) : (
                <>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>✓</div>
                  <h2 className="syne" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Alert Sent!</h2>
                  <p style={{ color: "#64748b", fontSize: 15, marginBottom: 24 }}>Your emergency contacts have been notified and are on their way.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                    {[`✅ ${patient.doctorName} — Notified`,`✅ ${patient.caregiverName} — Notified`,"📞 Emergency helpline: 108 — Ready"].map(item => (
                      <div key={item} style={{ padding: "12px 16px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 14, color: "#16a34a", fontWeight: 600, textAlign: "left" }}>{item}</div>
                    ))}
                  </div>
                  <button onClick={() => setSosActive(false)} style={{ padding: "12px 28px", borderRadius: 12, background: "#f1f5f9", border: "1px solid #e2e8f0", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#374151" }}>Cancel Alert</button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  </div>
  );
}