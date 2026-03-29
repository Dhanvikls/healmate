"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const stats = [
  { value: "98%", label: "Recovery Rate" },
  { value: "12K+", label: "Patients Supported" },
  { value: "200+", label: "Doctors Onboard" },
  { value: "4.9★", label: "Patient Rating" },
];

const features = [
  { icon: "🧠", title: "AI Recovery Plans", desc: "Discharge PDF auto-parsed into personalized step-by-step recovery plans powered by Claude AI.", color: "#0ea5e9" },
  { icon: "📊", title: "Daily Check-ins", desc: "Guided symptom monitoring with qSOFA scoring. Detects deterioration before it becomes critical.", color: "#06b6d4" },
  { icon: "🩹", title: "Wound Tracking", desc: "Upload daily wound photos. AI compares healing progress over time and flags concerns instantly.", color: "#22c55e" },
  { icon: "💊", title: "Medication Reminders", desc: "Smart reminders with adherence logging. Never miss a dose during the critical recovery window.", color: "#f59e0b" },
  { icon: "🚨", title: "SOS Alert System", desc: "One-tap emergency with auto-context sent to doctor and caregiver simultaneously.", color: "#ef4444" },
  { icon: "👩‍⚕️", title: "ASHA Worker Mode", desc: "Simplified offline-friendly check-in form for community health workers in rural areas.", color: "#8b5cf6" },
];

const roles = [
  { title: "Patient", icon: "🏥", desc: "Track your recovery, check in daily, upload wound photos, and get AI-guided care — all from your phone.", cta: "Enter Patient Portal", href: "/patient", gradient: "linear-gradient(135deg,#2d9e8f,#0e7490)" },
  { title: "Doctor / Caregiver", icon: "👨‍⚕️", desc: "Monitor all your patients in real-time, get pre-visit briefs, and receive instant alerts on deterioration.", cta: "Open Dashboard", href: "/doctor", gradient: "linear-gradient(135deg,#2dd4bf,#22c55e)" },
  { title: "ASHA Worker", icon: "🤝", desc: "Simple check-in forms for patients without smartphones. Syncs directly to doctor dashboard.", cta: "ASHA Mode", href: "/asha", gradient: "linear-gradient(135deg,#a78bfa,#8b5cf6)" },
];

function HealMateLogo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 85 C50 85 10 58 10 32 C10 18 20 10 32 12 C40 13 47 18 50 24 C53 18 60 13 68 12 C80 10 90 18 90 32 C90 58 50 85 50 85Z" fill="url(#heartGrad)" opacity="0.85" />
        <circle cx="42" cy="34" r="7" fill="url(#figureGrad)" />
        <path d="M34 52 Q36 42 42 40 Q48 38 52 44 L56 58" stroke="url(#figureGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M55 28 Q62 22 68 26 Q74 30 72 38 Q70 44 64 46" stroke="url(#stethGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="64" cy="48" r="4" fill="none" stroke="url(#stethGrad)" strokeWidth="2.5" />
        <circle cx="56" cy="24" r="3.5" fill="none" stroke="url(#stethGrad)" strokeWidth="2" />
        <defs>
          <linearGradient id="heartGrad" x1="10" y1="10" x2="90" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4fd1c5" /><stop offset="100%" stopColor="#2d9e8f" />
          </linearGradient>
          <linearGradient id="figureGrad" x1="34" y1="27" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6ee7b7" /><stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="stethGrad" x1="55" y1="22" x2="72" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2d9e8f" /><stop offset="100%" stopColor="#0e7490" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: size * 0.52, letterSpacing: -0.5 }}>
            <span style={{ color: "#2d9e8f" }}>HEAL</span><span style={{ color: "#0e7490" }}>MATE</span>
          </div>
          <div style={{ fontSize: size * 0.2, color: "#64748b", fontWeight: 500 }}>Your Trusted Guide to Health & Wellbeing</div>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f0f9ff", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .syne{font-family:'Syne',sans-serif;}
        .glass{background:rgba(255,255,255,0.75);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.5);}
        .glass-teal{background:rgba(45,158,143,0.05);backdrop-filter:blur(16px);border:1px solid rgba(45,158,143,0.15);}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:1}100%{transform:scale(1.7);opacity:0}}
        .float{animation:float 4s ease-in-out infinite;}
        .fade-up{animation:fadeUp 0.8s ease forwards;}
        a{text-decoration:none;}

        /* RESPONSIVE OVERRIDES */
        @media (max-width: 1024px) {
          .nav-links { display: none !important; }
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; gap: 40px !important; }
          .hero-text { max-width: 100% !important; margin: 0 auto; }
          .hero-visual { height: 400px !important; margin-top: 40px; }
          .hero-title { font-size: 48px !important; }
          .feature-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .role-grid { grid-template-columns: 1fr !important; }
          .qr-grid { grid-template-columns: 1fr !important; padding: 40px !important; }
          .nav-container { padding: 12px 24px !important; }
        }
        @media (max-width: 640px) {
          .feature-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 36px !important; }
          .hero-stats { justify-content: center !important; gap: 20px !important; }
          .hero-btns { justify-content: center !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav-container" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "12px 48px", background: scrolled ? "rgba(255,255,255,0.94)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(45,158,143,0.1)" : "none", transition: "all 0.3s ease", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <HealMateLogo size={46} showText={true} />
        <div className="nav-links" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Features", "How it works", "For Doctors", "ASHA"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} style={{ fontSize: 14, fontWeight: 500, color: "#475569", transition: "color 0.2s" }}>{item}</a>
          ))}
          <Link href="/patient/HM-001" className="btn" style={{ padding: "10px 22px", borderRadius: 12, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 14px rgba(45,158,143,0.3)" }}>
            Demo Dashboard →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 80 }}>
        <div style={{ position: "absolute", top: -120, right: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,158,143,0.13),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle,rgba(6,182,212,0.09),transparent 70%)", pointerEvents: "none" }} />

        <div className="hero-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", width: "100%" }}>
          <div className="fade-up hero-text">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 40, background: "rgba(45,158,143,0.1)", border: "1px solid rgba(45,158,143,0.2)", marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#2d9e8f" }}>AI-Powered Post-Hospital Recovery</span>
            </div>

            <h1 className="syne hero-title" style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.05, color: "#0f172a", marginBottom: 20 }}>
              YOUR<br />
              <span style={{ background: "linear-gradient(135deg,#2d9e8f,#0e7490)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TRUSTED</span><br />
              RECOVERY<br />GUIDE
            </h1>

            <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.75, marginBottom: 36, maxWidth: 460 }}>
              HealMate supports patients during post-hospital recovery with AI-personalized plans, daily symptom monitoring, wound tracking, and instant caregiver alerts.
            </p>

            <div className="hero-btns" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link href="/patient/HM-001" className="btn" style={{ padding: "14px 28px", borderRadius: 14, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 700, fontSize: 15, boxShadow: "0 8px 24px rgba(45,158,143,0.35)" }}>
                I'm a Patient →
              </Link>
              <Link href="/doctor" className="btn" style={{ padding: "14px 28px", borderRadius: 14, background: "white", color: "#0f172a", fontWeight: 700, fontSize: 15, border: "2px solid rgba(45,158,143,0.2)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                Doctor Dashboard
              </Link>
            </div>

            <div className="hero-stats" style={{ display: "flex", gap: 36, marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(45,158,143,0.12)" }}>
              {stats.map(s => (
                <div key={s.label}>
                  <div className="syne" style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating visual */}
          <div className="hero-visual" style={{ position: "relative", height: 520, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="float" style={{ width: 264, height: 264, borderRadius: "50%", background: "linear-gradient(135deg,#2d9e8f,#0e7490)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 64px rgba(45,158,143,0.45)", flexDirection: "column", gap: 10 }}>
              <HealMateLogo size={64} showText={false} />
              <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 16, fontFamily: "'Syne',sans-serif" }}>HealMate</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>Your Care Hub</div>
            </div>
            <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", border: "1px dashed rgba(45,158,143,0.2)", pointerEvents: "none" }} />
            {[
              { top: 18, left: -28, icon: "💊", label: "Medications", val: "3 due today", color: "#f59e0b" },
              { top: 18, right: -28, icon: "📈", label: "Recovery", val: "Day 7 of 14", color: "#22c55e" },
              { bottom: 58, left: -48, icon: "🩺", label: "Last Check-in", val: "2 hrs ago", color: "#2d9e8f" },
              { bottom: 58, right: -48, icon: "🚨", label: "Alerts", val: "All Clear ✅", color: "#ef4444" },
            ].map((card, i) => (
              <div key={i} className="glass" style={{ position: "absolute", top: card.top, bottom: (card as any).bottom, left: (card as any).left, right: (card as any).right, padding: "14px 18px", borderRadius: 16, display: "flex", alignItems: "center", gap: 12, minWidth: 172, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", animation: `float ${3.5 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{card.icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{card.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{card.val}</div>
                </div>
              </div>
            ))}
            <div className="pulse-dot" style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: "#ef4444" }} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#2d9e8f", textTransform: "uppercase", letterSpacing: 2 }}>Everything you need</span>
          <h2 className="syne" style={{ fontSize: 42, fontWeight: 800, color: "#0f172a", marginTop: 8 }}>Built for Real Recovery</h2>
          <p style={{ color: "#64748b", fontSize: 16, marginTop: 12, maxWidth: 480, margin: "12px auto 0" }}>From discharge to full recovery — every feature designed around patient safety and caregiver peace of mind.</p>
        </div>
        <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="fcard glass" style={{ padding: "28px 24px", borderRadius: 20, borderTop: activeFeature === i ? `3px solid ${f.color}` : "3px solid transparent" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "80px 48px", background: "linear-gradient(135deg,#0f172a,#0c4a6e)", borderRadius: 32, maxWidth: 1200, margin: "0 auto 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#5eead4", textTransform: "uppercase", letterSpacing: 2 }}>Simple Process</span>
          <h2 className="syne" style={{ fontSize: 40, fontWeight: 800, color: "white", marginTop: 8 }}>How HealMate Works</h2>
        </div>
        <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32 }}>
          {[
            { step: "01", icon: "📄", title: "Upload Discharge PDF", desc: "AI reads your discharge summary and builds a personalized recovery plan in seconds." },
            { step: "02", icon: "📱", title: "Scan Your QR Code", desc: "Every patient gets a unique QR. Doctors, caregivers and you access everything through it." },
            { step: "03", icon: "✅", title: "Daily Check-ins", desc: "Answer guided questions. HealMate AI monitors for warning signs automatically." },
            { step: "04", icon: "🔔", title: "Smart Alerts", desc: "Caregivers and doctors notified instantly when something needs attention." },
          ].map(s => (
            <div key={s.step} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#5eead4", letterSpacing: 2, marginBottom: 12 }}>STEP {s.step}</div>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(94,234,212,0.1)", border: "1px solid rgba(94,234,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 16px" }}>{s.icon}</div>
              <h3 style={{ color: "white", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROLE PORTALS */}
      <section style={{ padding: "80px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#2d9e8f", textTransform: "uppercase", letterSpacing: 2 }}>Choose your role</span>
          <h2 className="syne" style={{ fontSize: 40, fontWeight: 800, color: "#0f172a", marginTop: 8 }}>Enter Your Portal</h2>
        </div>
        <div className="role-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
          {roles.map(r => (
            <Link key={r.title} href={r.href} style={{ textDecoration: 'none' }}>
              <div className="rcard glass" style={{ padding: "36px 28px", borderRadius: 24, textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: r.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>{r.icon}</div>
                <h3 className="syne" style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>{r.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65, marginBottom: 24 }}>{r.desc}</p>
                <div style={{ padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg,#2d9e8f,#0e7490)", color: "white", fontWeight: 600, fontSize: 14, display: "inline-block" }}>{r.cta} →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* QR SECTION */}
      <section style={{ padding: "60px 48px", maxWidth: 1200, margin: "0 auto 80px" }}>
        <div className="glass-teal qr-grid" style={{ borderRadius: 28, padding: "60px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#2d9e8f", textTransform: "uppercase", letterSpacing: 2 }}>One QR. Everything.</span>
            <h2 className="syne" style={{ fontSize: 38, fontWeight: 800, color: "#0f172a", marginTop: 8, marginBottom: 16 }}>Your Recovery in a Scan</h2>
            <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.75, marginBottom: 28 }}>Every patient gets a unique QR code at discharge. Scan it to instantly access your recovery plan, medications, and check-in history — and share with your caregiver or doctor.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Patient accesses full recovery dashboard", "Caregiver views tasks & check-in alerts", "Doctor sees live vitals & wound photos", "ASHA worker syncs offline check-ins"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>✓</div>
                  <span style={{ fontSize: 14, color: "#374151" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="glass float" style={{ padding: 28, borderRadius: 24, boxShadow: "0 20px 60px rgba(45,158,143,0.2)", textAlign: "center" }}>
              <div style={{ width: 180, height: 180, background: "white", borderRadius: 12, padding: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(9,1fr)", gap: 3 }}>
                {Array.from({ length: 81 }).map((_, i) => {
                  const pattern = [0, 1, 2, 3, 4, 5, 6, 7, 13, 14, 20, 21, 27, 28, 35, 36, 37,
                    38, 39, 40, 41, 42, 43, 56, 63, 70, 74, 75, 76, 77, 78, 79, 80,
                    10, 17, 24, 31, 45, 52, 59, 11, 18, 47, 48, 49, 50, 51];
                  return (
                    <div key={i} style={{
                      borderRadius: 2,
                      background: pattern.includes(i) ? "#0f172a" : "transparent"
                    }} />
                  );
                })}
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2d9e8f" }}>PATIENT ID: HM-2024-001</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Scan to access HealMate hub</div>
              </div>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                <HealMateLogo size={26} showText={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0f172a", padding: "48px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <HealMateLogo size={42} showText={true} />
          <div style={{ color: "#475569", fontSize: 13 }}>© 2024 HealMate · Your Trusted Guide to Health & Wellbeing</div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map(item => (
              <a key={item} href="#" style={{ color: "#475569", fontSize: 13 }}>{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}