"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function HealMateLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 85C50 85 10 58 10 32C10 18 20 10 32 12C40 13 47 18 50 24C53 18 60 13 68 12C80 10 90 18 90 32C90 58 50 85 50 85Z" fill="url(#p1)" opacity="0.85" />
        <circle cx="42" cy="34" r="7" fill="url(#p2)" />
        <path d="M34 52Q36 42 42 40Q48 38 52 44L56 58" stroke="url(#p2)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M55 28Q62 22 68 26Q74 30 72 38Q70 44 64 46" stroke="url(#p3)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="64" cy="48" r="4" fill="none" stroke="url(#p3)" strokeWidth="2.5" />
        <circle cx="56" cy="24" r="3.5" fill="none" stroke="url(#p3)" strokeWidth="2" />
        <defs>
          <linearGradient id="p1" x1="10" y1="10" x2="90" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#4fd1c5" /><stop offset="1" stopColor="#2d9e8f" /></linearGradient>
          <linearGradient id="p2" x1="34" y1="27" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#6ee7b7" /><stop offset="1" stopColor="#22c55e" /></linearGradient>
          <linearGradient id="p3" x1="55" y1="22" x2="72" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#2d9e8f" /><stop offset="1" stopColor="#0e7490" /></linearGradient>
        </defs>
      </svg>
      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size * 0.52 }}>
        <span style={{ color: "#2d9e8f" }}>HEAL</span><span style={{ color: "#0e7490" }}>MATE</span>
      </span>
    </div>
  );
}

export default function PatientLogin() {
  const [patientId, setPatientId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/patient/${encodeURIComponent(patientId.trim())}`);
        const data = await res.json();
        
        if (res.ok && data.patient) {
          localStorage.setItem("healmate_patient_id", patientId.trim());
          router.push(`/patient/${patientId.trim()}`);
        } else {
          setError(data.error || "Patient ID not found. Please try again.");
          setIsLoading(false);
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f0f9ff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "20px 48px", background: "white", borderBottom: "1px solid rgba(45,158,143,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <HealMateLogo size={40} />
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "white", padding: 48, borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.06)", maxWidth: 460, width: "100%", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>Patient Login</h1>
          <p style={{ color: "#64748b", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
            Scan your unique HealMate QR code, or enter your <strong>Patient ID</strong> below to open your dashboard.
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input 
              type="text" 
              placeholder="e.g. HM-001" 
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              style={{ padding: "16px 20px", borderRadius: 14, border: error ? "2px solid #ef4444" : "2px solid #e2e8f0", fontSize: 16, outline: "none", transition: "border 0.2s" }}
              required
            />
            {error && <p style={{ color: "#ef4444", fontSize: 14, marginTop: -8, textAlign: "left" }}>{error}</p>}
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ padding: "16px", borderRadius: 14, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: isLoading ? "not-allowed" : "pointer", boxShadow: "0 8px 24px rgba(45,158,143,0.25)", opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "Verifying..." : "Access Dashboard →"}
            </button>
          </form>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
             <Link href="/" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>
               ← Back to Home
             </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
