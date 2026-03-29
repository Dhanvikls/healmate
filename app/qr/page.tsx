"use client";
import Link from 'next/link';

function HealMateLogo({ size = 48 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 85C50 85 10 58 10 32C10 18 20 10 32 12C40 13 47 18 50 24C53 18 60 13 68 12C80 10 90 18 90 32C90 58 50 85 50 85Z" fill="url(#qg1)" opacity="0.85" />
        <circle cx="42" cy="34" r="7" fill="url(#qg2)" />
        <path d="M34 52Q36 42 42 40Q48 38 52 44L56 58" stroke="url(#qg2)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M55 28Q62 22 68 26Q74 30 72 38Q70 44 64 46" stroke="url(#qg3)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="64" cy="48" r="4" fill="none" stroke="url(#qg3)" strokeWidth="2.5" />
        <circle cx="56" cy="24" r="3.5" fill="none" stroke="url(#qg3)" strokeWidth="2" />
        <defs>
          <linearGradient id="qg1" x1="10" y1="10" x2="90" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#4fd1c5" /><stop offset="1" stopColor="#2d9e8f" /></linearGradient>
          <linearGradient id="qg2" x1="34" y1="27" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#6ee7b7" /><stop offset="1" stopColor="#22c55e" /></linearGradient>
          <linearGradient id="qg3" x1="55" y1="22" x2="72" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#2d9e8f" /><stop offset="1" stopColor="#0e7490" /></linearGradient>
        </defs>
      </svg>
      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size * 0.55 }}>
        <span style={{ color: "#2d9e8f" }}>HEAL</span><span style={{ color: "#0e7490" }}>MATE</span>
      </span>
    </div>
  );
}

export default function QRInstructions() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#0f172a", 
      fontFamily: "'DM Sans', sans-serif", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: 24,
      textAlign: "center"
    }}>
       <style>{`
         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@800&display=swap');
         @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
         .float { animation: float 4s ease-in-out infinite; }
       `}</style>

       <div className="float" style={{ marginBottom: 40 }}>
         <HealMateLogo size={64} />
       </div>

       <div style={{ 
         maxWidth: 400, 
         background: "rgba(255,255,255,0.03)", 
         border: "1px solid rgba(255,255,255,0.08)", 
         padding: 40, 
         borderRadius: 32,
         backdropFilter: "blur(20px)"
       }}>
         <div style={{ fontSize: 56, marginBottom: 24 }}>📱</div>
         <h1 style={{ fontFamily: "'Syne', sans-serif", color: "white", fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
           How to Access Your Hub
         </h1>
         <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.65, marginBottom: 32 }}>
           Use your phone's camera to scan the unique QR code on your discharge summary or provided by your doctor.
         </p>

         <div style={{ textAlign: "left", marginBottom: 32 }}>
            {[
              "Open your camera app",
              "Point it at the QR code",
              "Click the link that pops up",
              "Access your recovery plan instantly"
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#2d9e8f", color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                   {i + 1}
                </div>
                <span style={{ color: "#cbd5e1", fontSize: 14 }}>{step}</span>
              </div>
            ))}
         </div>

         <Link href="/" style={{ 
           display: "block",
           padding: "16px", 
           borderRadius: 16, 
           background: "linear-gradient(135deg,#2d9e8f,#0e7490)", 
           color: "white", 
           fontWeight: 700, 
           textDecoration: "none",
           fontSize: 15,
           boxShadow: "0 8px 20px rgba(45,158,143,0.2)"
         }}>
           Return to Landing Page
         </Link>
       </div>

       <div style={{ marginTop: 40, color: "#64748b", fontSize: 12 }}>
         HealMate AI © 2024 · Secure Recovery Guidance
       </div>
    </div>
  );
}
