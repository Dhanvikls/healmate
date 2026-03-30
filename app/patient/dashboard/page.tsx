"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";

function HealMateLogo({ size = 40 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 85C50 85 10 58 10 32C10 18 20 10 32 12C40 13 47 18 50 24C53 18 60 13 68 12C80 10 90 18 90 32C90 58 50 85 50 85Z" fill="url(#lg1)" opacity="0.85" />
        <circle cx="42" cy="34" r="7" fill="url(#lg2)" />
        <path d="M34 52Q36 42 42 40Q48 38 52 44L56 58" stroke="url(#lg2)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M55 28Q62 22 68 26Q74 30 72 38Q70 44 64 46" stroke="url(#lg3)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="64" cy="48" r="4" fill="none" stroke="url(#lg3)" strokeWidth="2.5" />
        <circle cx="56" cy="24" r="3.5" fill="none" stroke="url(#lg3)" strokeWidth="2" />
        <defs>
          <linearGradient id="lg1" x1="10" y1="10" x2="90" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#4fd1c5" /><stop offset="1" stopColor="#2d9e8f" /></linearGradient>
          <linearGradient id="lg2" x1="34" y1="27" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#6ee7b7" /><stop offset="1" stopColor="#22c55e" /></linearGradient>
          <linearGradient id="lg3" x1="55" y1="22" x2="72" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#2d9e8f" /><stop offset="1" stopColor="#0e7490" /></linearGradient>
        </defs>
      </svg>
      <div style={{ lineHeight: 1.1 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size * 0.52 }}>
          <span style={{ color: "#2d9e8f" }}>HEAL</span><span style={{ color: "#0e7490" }}>MATE</span>
        </div>
        <div style={{ fontSize: size * 0.2, color: "#64748b", fontWeight: 500 }}>Your Trusted Guide to Health & Wellbeing</div>
      </div>
    </div>
  );
}

const validIds = ["HM-001", "HM-002", "HM-003"];

function PatientLoginInner() {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!patientId.trim()) {
      setError("Please enter your Patient ID");
      return;
    }
    const formattedId = patientId.trim().toUpperCase();
    if (!validIds.includes(formattedId)) {
      setError("Patient ID not found. Please check and try again.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      router.push(`/patient/dashboard?id=${formattedId}`);
    }, 1000);
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeUp 0.5s ease forwards;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin 1s linear infinite;display:inline-block;}
      `}</style>

      <div className="fade-in" style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <HealMateLogo size={48} />
        </div>

        {/* Card */}
        <div style={{ background: "white", borderRadius: 24, padding: "36px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏥</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Patient Login</div>
            <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>Enter your Patient ID to access your recovery dashboard</div>
          </div>

          {/* Input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Patient ID</label>
            <input
              value={patientId}
              onChange={e => { setPatientId(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="e.g. HM-001"
              style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `2px solid ${error ? "#ef4444" : "#e2e8f0"}`, fontSize: 16, fontFamily: "'DM Sans',sans-serif", outline: "none", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", fontWeight: 700, color: "#0f172a" }}
            />
            {error && <div style={{ fontSize: 13, color: "#ef4444", marginTop: 6, textAlign: "center" }}>⚠️ {error}</div>}
          </div>

          {/* Login button */}
          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", padding: "15px", borderRadius: 14, background: loading ? "rgba(45,158,143,0.5)" : "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <><span className="spin">⟳</span> Loading Dashboard...</> : "Access My Dashboard →"}
          </button>

          {/* Demo IDs */}
          <div style={{ marginTop: 24, padding: "16px", borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10, textAlign: "center" }}>DEMO PATIENT IDs</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {validIds.map(id => (
                <button key={id} onClick={() => { setPatientId(id); setError(""); }}
                  style={{ padding: "6px 14px", borderRadius: 8, background: patientId === id ? "#2d9e8f" : "white", border: `1px solid ${patientId === id ? "#2d9e8f" : "#e2e8f0"}`, fontSize: 13, fontWeight: 700, color: patientId === id ? "white" : "#374151", cursor: "pointer", letterSpacing: 0.5 }}>
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* QR hint */}
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
            📱 Or scan your QR code to login automatically
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>← Back to Home</a>
        </div>
      </div>
    </div>
  );
}

export default function PatientLoginPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading...</div>}>
      <PatientLoginInner />
    </Suspense>
  );
}