import { useState, useEffect, useRef, useCallback } from "react";
import {
  Globe, User, Code, Zap, Briefcase, GraduationCap, Mail,
  Moon, Sun, GitBranch, Phone, MapPin,
  ChevronDown, ChevronRight, Copy, Check, ExternalLink,
  Award, Calendar, Terminal, Database, Cpu, ChevronLeft,
  Menu, X, Eye, Download,
} from "lucide-react";

// ─────────────────────────────────────────────
// VISUAL COMPONENTS
// ─────────────────────────────────────────────

/* ParticleCanvas ─ full-viewport floating particles with faint connection lines */
function ParticleCanvas({ t }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  const initParticles = useCallback((w, h) => {
    const pts = [];
    for (let i = 0; i < 40; i++) {
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.5 + Math.random(),
        vx: (Math.random() - 0.5) * 0.5 + (Math.random() > 0.5 ? 0.2 : -0.2),
        vy: (Math.random() - 0.5) * 0.5 + (Math.random() > 0.5 ? 0.2 : -0.2),
      });
    }
    particlesRef.current = pts;
  }, []);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    let w = (cvs.width = window.innerWidth);
    let h = (cvs.height = window.innerHeight);
    initParticles(w, h);

    const onResize = () => {
      w = cvs.width = window.innerWidth;
      h = cvs.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const pts = particlesRef.current;
      // connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = t.accent + "14"; // ~8% opacity hex
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      // particles
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = t.accent + "4D"; // ~30% opacity hex
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [t, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

/* CustomCursor ─ circle-follower cursor for desktop */
function CustomCursor({ t }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const checkWidth = () => setVisible(window.innerWidth >= 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!visible) return;
    let hovering = false;

    const onMove = (e) => {
      const { clientX: x, clientY: y } = e;
      if (innerRef.current) {
        innerRef.current.style.left = x + "px";
        innerRef.current.style.top = y + "px";
      }
      if (outerRef.current) {
        outerRef.current.style.left = x + "px";
        outerRef.current.style.top = y + "px";
      }
    };

    const onOver = (e) => {
      if (e.target.closest("button, a, input, textarea, select")) {
        if (!hovering && outerRef.current) {
          hovering = true;
          outerRef.current.style.transform = "translate(-50%,-50%) scale(1.5)";
          outerRef.current.style.borderColor = t.accent + "99"; // 60%
        }
      }
    };
    const onOut = (e) => {
      if (hovering && !e.target.closest("button, a, input, textarea, select")) {
        hovering = false;
        if (outerRef.current) {
          outerRef.current.style.transform = "translate(-50%,-50%) scale(1)";
          outerRef.current.style.borderColor = t.accent + "66"; // 40%
        }
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [t, visible]);

  if (!visible) return null;

  const shared = { position: "fixed", zIndex: 9999, pointerEvents: "none", borderRadius: "50%", top: 0, left: 0 };

  return (
    <>
      <div
        ref={outerRef}
        style={{
          ...shared,
          width: 32,
          height: 32,
          border: `1.5px solid ${t.accent}66`,
          transform: "translate(-50%,-50%) scale(1)",
          transition: "left 0.08s ease, top 0.08s ease, transform 0.15s ease, border-color 0.15s ease",
        }}
      />
      <div
        ref={innerRef}
        style={{
          ...shared,
          width: 5,
          height: 5,
          backgroundColor: t.accent + "B3", // 70%
          transform: "translate(-50%,-50%)",
        }}
      />
    </>
  );
}

/* RevealOnMount ─ staggered fade-in-up wrapper */
function RevealOnMount({ delay = 0, children }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(id);
  }, [delay]);
  return (
    <div
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// CUSTOM SVG ICONS (brand icons removed from lucide)
// ─────────────────────────────────────────────
function LinkedinIcon({ size = 24, color = "currentColor", ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// THEME TOKENS
// ─────────────────────────────────────────────
const THEMES = {
  midnight: {
    bg: "#091410", sidebar: "rgba(16, 32, 20, 0.5)", surface: "rgba(255,255,255,0.03)",
    card: "rgba(255, 255, 255, 0.07)", border: "rgba(255, 255, 255, 0.15)",
    text: "#e8f2eb", textSub: "#9cb8a3", textMuted: "#5a7d63",
    accent: "#4ade80", accentSub: "#86efac",
    accentGlow: "rgba(74,222,128,0.12)",
    gold: "#d4a853", goldLight: "#e0bc5e",
    navActive: "rgba(74,222,128,0.1)", badge: "rgba(74,222,128,0.1)",
    dotEmpty: "rgba(255,255,255,0.08)",
    name: "Forest",
    orb1: "#4ade80", orb2: "#22c55e", orb3: "#d4a853",
    cardHoverShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
    glassHighlight: "rgba(255,255,255,0.09)",
    glassBg: "rgba(255,255,255,0.04)",
  },
  matinee: {
    bg: "#e8f3eb", sidebar: "rgba(255,255,255,0.45)", surface: "rgba(255,255,255,0.4)",
    card: "rgba(255,255,255,0.35)", border: "rgba(22,80,40,0.15)",
    text: "#0a1f10", textSub: "#2d4a35", textMuted: "#5a7d63",
    accent: "#16a34a", accentSub: "#22c55e",
    accentGlow: "rgba(22,163,74,0.1)",
    gold: "#0a1f3d", goldLight: "#1e3a5f",
    navActive: "rgba(22,163,74,0.08)", badge: "rgba(22,163,74,0.06)", dotEmpty: "rgba(22,80,40,0.1)",
    name: "Meadow",
    orb1: "#22c55e", orb2: "#4ade80", orb3: "#f59e0b",
    cardHoverShadow: "0 16px 48px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
    glassHighlight: "rgba(255,255,255,0.6)",
    glassBg: "rgba(255,255,255,0.15)",
  },
};

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const SGPA_DATA = [
  { sem: "Sem 1", sgpa: 8.28 },
  { sem: "Sem 2", sgpa: 8.09 },
  { sem: "Sem 3", sgpa: 7.89 },
  { sem: "Sem 4", sgpa: 8.18 },
  { sem: "Sem 5", sgpa: 7.93 },
];

const SKILLS_DATA = [
  {
    category: "Programming Languages", Icon: Terminal,
    items: [
      { name: "Python", level: 5 }, { name: "Java", level: 4 },
      { name: "C++", level: 3 }, { name: "C", level: 3 }, { name: "SQL", level: 3 },
    ],
  },
  {
    category: "AI / ML Frameworks", Icon: Cpu,
    items: [
      { name: "TensorFlow", level: 4 }, { name: "PyTorch", level: 3 },
      { name: "scikit-learn", level: 4 }, { name: "OpenCV", level: 4 },
      { name: "Pandas", level: 4 }, { name: "NumPy", level: 4 },
      { name: "Matplotlib / Seaborn", level: 4 }, { name: "Flask", level: 3 },
    ],
  },
  {
    category: "AI / ML Domains", Icon: Zap,
    items: [
      { name: "Machine Learning", level: 4 }, { name: "Deep Learning", level: 4 },
      { name: "Computer Vision", level: 4 }, { name: "NLP", level: 3 },
      { name: "Generative AI", level: 3 }, { name: "Cloud Computing (Azure)", level: 3 },
    ],
  },
  {
    category: "Tools & Platforms", Icon: Database,
    items: [
      { name: "Git / GitHub", level: 4 }, { name: "Jupyter Notebook", level: 5 },
      { name: "PyCharm", level: 4 }, { name: "Arduino IDE", level: 3 },
      { name: "OpenAI API", level: 3 }, { name: "Supabase", level: 2 }, { name: "Netlify", level: 2 },
    ],
  },
];

const PROJECTS_DATA = [
  {
    title: "Arachnid — Bio-Inspired Spider",
    badge: "Patented", badgeColor: "#c9a646",
    role: "AI Developer & Circuit Connection", period: "2023 — 1 Aug 2025",
    patentNo: "202531071175 A",
    description: "A bio-inspired robotic spider using computer vision and deep learning to track endangered species in their natural habitat.",
    techStack: ["Python", "OpenCV", "TensorFlow", "Deep Learning", "Arduino Mega", "Raspberry Pi 4", "Pi Camera", "IoT"],
    features: [
      "Computer vision with OpenCV to track animals at risk of extinction in real-time",
      "Data cleaning & pattern detection pipeline for continuous model retraining",
      "IoT device integration across Arduino Mega, Raspberry Pi 4, and Pi Camera",
    ],
    category: ['ML-DL', 'Hardware', 'IoT'],
    github: 'https://github.com/Gocodein/Arachnid',
    demo: null,
  },
  {
    title: "IntelliEat Monitoring System",
    badge: "In Progress", badgeColor: "#3b82f6",
    role: "Team Lead", period: "Aug 2024 — Present",
    description: "IoT-enabled solution tracking eating behaviors via smart plates and utensils to detect patterns linked to eating disorders.",
    techStack: ["Python", "IoT Sensors", "scikit-learn", "Pandas", "Flask", "Data Analysis", "AI / ML"],
    features: [
      "Smart plate & utensil sensors monitoring food intake, chewing speed, and meal duration",
      "AI algorithms detecting behavioral patterns associated with anorexia and bulimia",
      "Real-time analytics dashboard for health practitioners and caregivers",
    ],
    category: ['ML-DL', 'IoT', 'Web-App'],
    github: 'https://github.com/Gocodein/IntelliEat',
    demo: null,
  },
  {
    title: 'AI Portfolio — Interactive Glass UI',
    badge: 'Live', badgeColor: '#22c55e',
    role: 'Full-Stack Developer', period: '2025 — Present',
    description: 'A modern glass-morphism portfolio built with React, featuring particle animations, 3D tilt cards, swipe navigation, and dual themes.',
    techStack: ['React', 'Vite', 'CSS Glass', 'Lucide Icons', 'Vercel'],
    features: [
      'Frosted glass UI with dual Forest/Meadow themes and animated particle background',
      'Swipe, drag, and keyboard navigation between sections with slide animations',
      'Fully responsive with mobile hamburger menu and touch gestures',
    ],
    category: ['Web-App'],
    github: 'https://github.com/Gocodein/portfolio',
    demo: 'https://portfolio-lac-eta-23.vercel.app/',
  },
];

const EXPERIENCE_DATA = [
  {
    role: "AI/ML Engineer — Intern", company: "Confitech Solutions Pvt. Ltd.", type: "Remote",
    period: "17 May 2025 — 18 Aug 2025",
    techStack: ["Python", "Flask", "OpenAI API", "REST APIs", "GenAI", "Git"],
    points: [
      "Developed and maintained AI/ML applications using Python and Flask.",
      "Implemented Generative AI solutions leveraging OpenAI and Microsoft Azure.",
      "Integrated REST APIs and collaborated with backend team for seamless data flow.",
    ],
  },
  {
    role: "AI & ML Internship and Training", company: "Euphoria GenX", type: "Remote",
    period: "17 Aug 2025 — 2 Nov 2025",
    techStack: ["Python", "Machine Learning", "AI Fundamentals"],
    points: ["Completed an intensive AI & ML internship and training programme."],
  },
  {
    role: "Machine Learning using Python — 30-hr Training", company: "Ardent Computech Pvt. Ltd.", type: "JIS College of Engineering",
    period: "7 Jul 2025 — 18 Jul 2025",
    techStack: ["Python", "scikit-learn", "Pandas", "NumPy"],
    points: ["Completed hands-on machine learning training with practical Python projects."],
  },
];

const CERTS_DATA = [
  { name: "Natural Language Processing", org: "NPTEL", weeks: 12, period: "Jan – Apr 2026", score: 57 },
  { name: "Fundamentals of Artificial Intelligence", org: "NPTEL", weeks: 12, period: "Jul – Oct 2025", score: 63 },
  { name: "Programming in Java", org: "NPTEL", weeks: 12, period: "Jan – Apr 2026", score: 72 },
];

const LEADERSHIP_DATA = [
  { role: "AICTE Idea Lab Ambassador — IoT & 3D Modelling Lead", org: "AICTE Idea Lab · Kalyani", period: "May 2024 – Present" },
  { role: "Co-founder & Member", org: "The Risers · Kalyani", period: "Dec 2023 – Present" },
  { role: "Event Organiser — InnovoCon 2025", org: "12-hour 3D Modelling Hackathon", period: "27–28 Feb 2025" },
];

const NAV = [
  { id: "overview", label: "Overview", Icon: Globe },
  { id: "about", label: "About Me", Icon: User },
  { id: "projects", label: "Projects", Icon: Code },
  { id: "skills", label: "Skills & Tools", Icon: Zap },
  { id: "experience", label: "Experience", Icon: Briefcase },
  { id: "certifications", label: "Certifications", Icon: GraduationCap },
  { id: "contact", label: "Contact", Icon: Mail },
];

const NAV_IDS = NAV.map(n => n.id);

// ─────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────
function Dots({ level, t }) {
  return (
    <div style={{ display: "flex", gap: 5 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: 9, height: 9, borderRadius: "50%",
          background: i <= level ? `linear-gradient(135deg, ${t.gold}, ${t.goldLight})` : t.dotEmpty,
          transition: "background .3s, box-shadow .3s",
          boxShadow: i <= level ? `0 0 6px ${t.gold}44` : "none",
        }} />
      ))}
    </div>
  );
}

function Tag({ label, t }) {
  return (
    <span className="tag-hover" style={{
      display: "inline-block", padding: "4px 11px", borderRadius: 999,
      background: t.badge, border: `1px solid ${t.border}`,
      color: t.accentSub, fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
    }}>{label}</span>
  );
}

function PageTitle({ children, t, num }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {num && (
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: t.gold, letterSpacing: 2, marginBottom: 6, fontWeight: 600 }}>
          {num}.
        </div>
      )}
      <h1 style={{
        fontSize: "1.85rem", fontWeight: 800, color: t.accent,
        borderLeft: `3px solid ${t.gold}`, paddingLeft: 14, margin: 0,
        lineHeight: 1.15, fontFamily: "'Outfit', sans-serif",
        letterSpacing: "-0.02em",
      }}>{children}</h1>
    </div>
  );
}

function GlassCard({ children, t, style = {}, className = "" }) {
  return (
    <div className={`card-hover glass-card ${className}`} style={{
      background: `linear-gradient(135deg, ${t.card}, ${t.glassBg})`,
      border: `1px solid ${t.border}`,
      borderTop: `1px solid ${t.glassHighlight}`,
      borderRadius: 18, padding: 20,
      backdropFilter: "blur(28px) saturate(1.6)",
      WebkitBackdropFilter: "blur(28px) saturate(1.6)",
      boxShadow: `inset 0 1px 0 0 ${t.glassHighlight}, inset 0 0 30px rgba(255,255,255,0.02), 0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)`,
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────
// OVERVIEW
// ─────────────────────────────────────────────
function Overview({ t }) {
  const cgpa = (SGPA_DATA.reduce((s, d) => s + d.sgpa, 0) / SGPA_DATA.length).toFixed(2);
  const stats = [
    { val: cgpa, label: "CGPA", sub: `Best SGPA: ${Math.max(...SGPA_DATA.map(d => d.sgpa))}` },
    { val: "1", label: "Patent Filed", sub: "No. 202531071175 A" },
    { val: "3", label: "NPTEL Certificates", sub: "Verified & scored" },
    { val: "2", label: "Internships", sub: "AI/ML focused" },
  ];
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x, y });
  };
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <div>
      <RevealOnMount delay={0}>
        <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap", marginBottom: 28 }}>
          {/* 3D Tilt Photo Card */}
          <div
            ref={cardRef}
            onMouseMove={handleMouse}
            onMouseLeave={resetTilt}
            style={{
              perspective: 600, flexShrink: 0,
            }}
          >
            <div style={{
              width: 240, borderRadius: 22, overflow: "hidden",
              transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
              transition: "transform 0.15s ease-out",
              background: `linear-gradient(135deg, ${t.card}, ${t.glassBg})`,
              border: `1px solid ${t.border}`,
              borderTop: `1px solid ${t.glassHighlight}`,
              backdropFilter: "blur(24px) saturate(1.5)",
              WebkitBackdropFilter: "blur(24px) saturate(1.5)",
              boxShadow: `0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 ${t.glassHighlight}, 0 0 50px ${t.accent}18`,
              position: "relative",
            }}>
              {/* Shine effect */}
              <div style={{
                position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
                background: `linear-gradient(${105 + tilt.x * 3}deg, transparent 30%, ${t.glassHighlight} 50%, transparent 70%)`,
                opacity: 0.5,
              }} />
              <img
                src="/profile.png"
                alt="Sagar Shaw"
                style={{ width: "100%", height: 270, objectFit: "cover", objectPosition: "center 20%", display: "block" }}
              />
              <div style={{ padding: "14px 16px 16px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                  {["AI/ML", "Computer Vision", "IoT", "GenAI", "Deep Learning"].map(tag => (
                    <span key={tag} style={{
                      fontSize: 9, padding: "3px 9px", borderRadius: 999,
                      background: t.badge, color: t.accentSub, border: `1px solid ${t.border}`,
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                    }}>{tag}</span>
                  ))}
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-around",
                  padding: "10px 0 4px", borderTop: `1px solid ${t.border}`,
                }}>
                  {[
                    { v: "3+", l: "Projects" },
                    { v: "2", l: "Interns" },
                    { v: "1", l: "Patent" },
                  ].map(s => (
                    <div key={s.l} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: t.accent, fontFamily: "'Outfit', sans-serif" }}>{s.v}</div>
                      <div style={{ fontSize: 9, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.gold, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>
              AI/ML Engineer · CSE(AIML) Student · Indian Citizen
            </div>
            <h1 style={{
              fontSize: "2.5rem", fontWeight: 900, margin: "0 0 10px", lineHeight: 1.1,
              backgroundImage: `linear-gradient(135deg, ${t.text}, ${t.accentSub})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em",
            }}>Sagar Shaw</h1>
            <p style={{ color: t.textSub, fontSize: 14, maxWidth: 500, lineHeight: 1.8, margin: "0 0 16px", fontFamily: "'Outfit', sans-serif" }}>
              Building intelligent systems at the intersection of computer vision, generative AI and IoT — from a patented wildlife conservation robot to AI-driven health monitoring.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { href: "https://www.linkedin.com/in/sagar-shaw-79701138a", label: "LinkedIn", Icon: LinkedinIcon },
                { href: "https://github.com/Gocodein", label: "GitHub", Icon: GitBranch },
              ].map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener" className="link-hover" style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                  background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
                  color: t.textSub, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                  backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                }}><Icon size={13} />{label}</a>
              ))}
              <a href="/resume.pdf" target="_blank" rel="noopener" className="link-hover" style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
                color: t.textSub, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              }}><Eye size={13} />View Resume</a>
              <a href="/resume.pdf" download="Sagar_Shaw_Resume.pdf" className="link-hover" style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                background: `linear-gradient(135deg, ${t.accent}18, ${t.accentSub}12)`,
                border: `1px solid ${t.accent}33`, borderRadius: 10,
                color: t.accent, fontSize: 12, fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              }}><Download size={13} />Download PDF</a>
            </div>
          </div>
        </div>
      </RevealOnMount>

      <RevealOnMount delay={150}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 18 }}>
          {stats.map((s) => (
            <GlassCard key={s.label} t={t} style={{ padding: "18px 16px" }}>
              <div style={{
                fontSize: "2.1rem", fontWeight: 900, lineHeight: 1,
                backgroundImage: `linear-gradient(135deg, ${t.gold}, ${t.goldLight})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text", fontFamily: "'Outfit', sans-serif",
              }}>{s.val}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginTop: 7, fontFamily: "'Outfit', sans-serif" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{s.sub}</div>
            </GlassCard>
          ))}
        </div>
      </RevealOnMount>

      <RevealOnMount delay={300}>
        <GlassCard t={t} style={{ padding: "17px 19px" }}>
          <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 11 }}>Core Domains</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {["Computer Vision", "Generative AI", "Deep Learning", "NLP", "IoT / Embedded", "Cloud (Azure)", "Machine Learning"].map(d => <Tag key={d} label={d} t={t} />)}
          </div>
        </GlassCard>
      </RevealOnMount>
    </div>
  );
}

// ─────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────
function About({ t }) {
  const cgpa = (SGPA_DATA.reduce((s, d) => s + d.sgpa, 0) / SGPA_DATA.length).toFixed(2);
  const maxSgpa = Math.max(...SGPA_DATA.map(d => d.sgpa));

  return (
    <div>
      <PageTitle t={t} num="01">About Me</PageTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 20, alignItems: "start" }}>
        <div>
          {[
            "I'm a Computer Science Engineering student specializing in AI & ML at JIS College of Engineering, Kalyani, expected to graduate in June 2027. My work spans computer vision for wildlife conservation, IoT-integrated health monitoring, and generative AI application development.",
            "I hold a patent for Arachnid — a bio-inspired robotic system using computer vision and deep learning to track endangered species in natural habitats. I also lead IntelliEat, an IoT-enabled system that applies AI to detect behavioral patterns linked to eating disorders.",
            "I bring hands-on industry experience from my AI/ML internship at Confitech Solutions, building GenAI-powered applications with OpenAI and Azure. Beyond engineering, I serve as an AICTE Idea Lab Ambassador and co-founded The Risers student community.",
          ].map((p, i) => <p key={i} style={{ color: t.textSub, fontSize: 14, lineHeight: 1.85, marginBottom: 14, fontFamily: "'Outfit', sans-serif" }}>{p}</p>)}

          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Leadership & Activities</div>
            {LEADERSHIP_DATA.map(l => (
              <div key={l.role} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${t.border}`, gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{l.role}</div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>{l.org}</div>
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, whiteSpace: "nowrap", paddingTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{l.period}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCard t={t}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 13 }}>Quick Facts</div>
            {[
              ["Location", "Kankinara, West Bengal"], ["Email", "sagarshaw.jisce@gmail.com"],
              ["Phone", "+91 9123634756"], ["GitHub", "Gocodein"],
              ["Patent No.", "202531071175 A"], ["Expected Grad.", "June 2027"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 8, marginBottom: 9 }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.textMuted, minWidth: 90, paddingTop: 1 }}>{k}</div>
                <div style={{ fontSize: 12, color: t.text }}>{v}</div>
              </div>
            ))}
          </GlassCard>

          {/* EDUCATION + SGPA */}
          <GlassCard t={t}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 13 }}>Education</div>

            {/* B.Tech with SGPA chart */}
            <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>B.Tech CSE — AI & ML</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>JIS College of Engineering · Expected June 2027</div>

              {/* SGPA Bar Chart */}
              <div style={{ marginTop: 14, padding: "14px 12px 10px", background: t.surface, borderRadius: 10, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: t.accentSub, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>
                    Semester SGPA
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                    background: `${t.gold}18`, color: t.gold, fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    CGPA: {cgpa}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                  {SGPA_DATA.map(s => {
                    const barH = ((s.sgpa - 5) / 5) * 55 + 10; // Scale 5-10 range to 10-65px
                    const isMax = s.sgpa === maxSgpa;
                    return (
                      <div key={s.sem} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{
                          fontSize: 10, fontWeight: 700,
                          color: isMax ? t.gold : t.accentSub,
                          marginBottom: 4, fontFamily: "'JetBrains Mono', monospace",
                        }}>{s.sgpa}</div>
                        <div className="sgpa-bar" style={{
                          height: barH,
                          background: isMax
                            ? `linear-gradient(180deg, ${t.gold}, ${t.goldLight})`
                            : `linear-gradient(180deg, ${t.accentSub}, ${t.accent})`,
                          borderRadius: "4px 4px 0 0",
                          margin: "0 auto", width: "70%",
                          boxShadow: isMax ? `0 0 12px ${t.gold}44` : `0 0 8px ${t.accent}22`,
                          transition: "height 0.6s cubic-bezier(.4,0,.2,1)",
                        }} />
                        <div style={{
                          fontSize: 8, color: t.textMuted, marginTop: 5,
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                        }}>{s.sem}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 12th & 10th */}
            {[
              { d: "12th — ISC · 69.25%", i: "Authpur National Model School", y: "2023" },
              { d: "10th — ICSE · 79.80%", i: "Authpur National Model School", y: "2021" },
            ].map(e => (
              <div key={e.d} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{e.d}</div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{e.i} · {e.y}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────
function Projects({ t }) {
  const [open, setOpen] = useState(0);
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? PROJECTS_DATA : PROJECTS_DATA.filter(p => p.category.includes(filter));
  return (
    <div>
      <PageTitle t={t} num="02">Featured Projects</PageTitle>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {['All', 'ML-DL', 'Web-App', 'Hardware', 'IoT'].map(tab => (
          <button key={tab} onClick={() => { setFilter(tab); setOpen(-1); }} style={{
            padding: '7px 18px', borderRadius: 999, fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
            transition: 'all 0.25s',
            ...(filter === tab
              ? { background: `linear-gradient(135deg, ${t.accent}, ${t.accentSub})`, color: '#fff', fontWeight: 700, border: 'none' }
              : { background: t.card, border: `1px solid ${t.border}`, color: t.textSub, backdropFilter: 'blur(8px)' }),
          }}>{tab}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {filtered.map((p, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="card-hover glass-card" style={{
              background: t.card, border: `1px solid ${isOpen ? t.accentSub : t.border}`,
              borderRadius: 18, overflow: "hidden", transition: "border-color .3s, box-shadow .3s",
              backdropFilter: "blur(24px) saturate(1.4)", WebkitBackdropFilter: "blur(24px) saturate(1.4)",
              boxShadow: isOpen
                ? `inset 0 1px 0 0 ${t.glassHighlight}, 0 0 24px ${t.accent}20, 0 8px 32px rgba(0,0,0,0.15)`
                : `inset 0 1px 0 0 ${t.glassHighlight}, 0 4px 20px rgba(0,0,0,0.08)`,
            }}>
              <button onClick={() => setOpen(isOpen ? -1 : i)} style={{
                width: "100%", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
                background: "none", border: "none", cursor: "pointer", textAlign: "left",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: isOpen ? `linear-gradient(135deg, ${t.accent}, ${t.accentSub})` : t.surface,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background .3s, box-shadow .3s",
                  boxShadow: isOpen ? `0 0 14px ${t.accent}33` : "none",
                }}>
                  {isOpen ? <ChevronDown size={15} color="#fff" /> : <ChevronRight size={15} color={t.textMuted} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif" }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div>
                </div>
                <span style={{
                  padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, flexShrink: 0,
                  background: `${p.badgeColor}18`, color: p.badgeColor, border: `1px solid ${p.badgeColor}44`,
                }}>{p.badge}</span>
              </button>

              {isOpen && (
                <div style={{ padding: "0 18px 18px" }} className="fade-in">
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14, fontSize: 11, color: t.textMuted }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Briefcase size={11} />{p.role}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{p.period}</span>
                    {p.patentNo && <span style={{ display: "flex", alignItems: "center", gap: 4, color: t.gold }}><Award size={11} />Patent No. {p.patentNo}</span>}
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: t.accentSub, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Tech Stack</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{p.techStack.map(tag => <Tag key={tag} label={tag} t={t} />)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: t.accentSub, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Key Features</div>
                    {p.features.map((f, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, color: t.textSub, lineHeight: 1.5 }}>
                        <span style={{ color: t.gold, flexShrink: 0, marginTop: 1 }}>◦</span>{f}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noopener noreferrer" className="card-hover" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                        borderRadius: 10, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                        background: t.card, border: `1px solid ${t.border}`, color: t.textSub,
                        backdropFilter: 'blur(8px)', textDecoration: 'none', transition: 'all 0.25s',
                      }}><GitBranch size={13} />Source Code</a>
                    )}
                    {p.demo && (
                      <a href={p.demo} target="_blank" rel="noopener noreferrer" className="card-hover" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                        borderRadius: 10, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                        background: `linear-gradient(135deg, ${t.accent}, ${t.accentSub})`, border: 'none',
                        color: '#fff', textDecoration: 'none', transition: 'all 0.25s',
                      }}><ExternalLink size={13} />Live Demo</a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────
function Skills({ t }) {
  return (
    <div>
      <PageTitle t={t} num="03">Tech Stack</PageTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {SKILLS_DATA.map(({ category, Icon, items }) => (
          <GlassCard key={category} t={t}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `linear-gradient(135deg, ${t.accent}22, ${t.accentSub}11)`,
                border: `1px solid ${t.accent}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={15} color={t.accentSub} />
              </div>
              <div style={{ fontSize: 13, fontFamily: "'Outfit', sans-serif", color: t.text, fontWeight: 700 }}>{category}</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {items.map(({ name, level }) => {
                const isStrong = level >= 4;
                return (
                  <span key={name} className="tag-hover" style={{
                    display: "inline-block", padding: "6px 14px", borderRadius: 999,
                    fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: isStrong ? 600 : 400,
                    background: isStrong
                      ? `linear-gradient(135deg, ${t.accent}15, ${t.accentSub}08)`
                      : t.surface,
                    border: `1px solid ${isStrong ? t.accent + "55" : t.border}`,
                    color: isStrong ? t.accent : t.textSub,
                    boxShadow: isStrong ? `0 0 12px ${t.accent}12` : "none",
                    transition: "all 0.25s ease",
                  }}>{name}</span>
                );
              })}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EXPERIENCE
// ─────────────────────────────────────────────
function Experience({ t }) {
  return (
    <div>
      <PageTitle t={t} num="04">Experience</PageTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {EXPERIENCE_DATA.map((e, i) => (
          <GlassCard key={i} t={t} style={{ position: "relative", overflow: "hidden" }}>
            {/* Subtle accent bar */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: `linear-gradient(180deg, ${t.accent}, ${t.gold})`, borderRadius: "14px 0 0 14px" }} />
            <div style={{ paddingLeft: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 11 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif" }}>{e.role}</div>
                  <div style={{ fontSize: 12, color: t.accentSub, marginTop: 3 }}>{e.company} · <span style={{ color: t.textMuted }}>{e.type}</span></div>
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={11} />{e.period}
                </div>
              </div>
              {e.points.map((p, j) => (
                <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: t.textSub, lineHeight: 1.5 }}>
                  <span style={{ color: t.gold, flexShrink: 0, marginTop: 1 }}>◦</span>{p}
                </div>
              ))}
              <div style={{ marginTop: 13 }}>
                <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: t.accentSub, textTransform: "uppercase", letterSpacing: 2, marginBottom: 7 }}>Tech Stack</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{e.techStack.map(tag => <Tag key={tag} label={tag} t={t} />)}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CERTIFICATIONS
// ─────────────────────────────────────────────
function Certifications({ t }) {
  return (
    <div>
      <PageTitle t={t} num="05">Certifications</PageTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {CERTS_DATA.map((c, i) => (
          <GlassCard key={i} t={t}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>{c.org} · {c.weeks}-week course · {c.period}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{
                  fontSize: "1.8rem", fontWeight: 900, lineHeight: 1,
                  backgroundImage: `linear-gradient(135deg, ${t.gold}, ${t.goldLight})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text", fontFamily: "'Outfit', sans-serif",
                }}>{c.score}%</div>
                <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }}>Score</div>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ height: 6, background: t.border, borderRadius: 4, overflow: "hidden" }}>
                <div className="progress-fill" style={{
                  width: `${c.score}%`, height: "100%",
                  background: `linear-gradient(90deg, ${t.accentSub}, ${t.gold})`,
                  borderRadius: 4,
                  boxShadow: `0 0 10px ${t.accentSub}33`,
                }} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard t={t} style={{ marginTop: 18, padding: "20px 22px" }}>
        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>Career Goal</div>
        <p style={{ color: t.textSub, fontSize: 14, lineHeight: 1.85, fontStyle: "italic", borderLeft: `3px solid ${t.gold}`, paddingLeft: 14, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          My near-term goal is to deepen my expertise in computer vision and generative AI through research collaborations, targeting a full-time AI/ML Engineer role focused on production-ready, real-world AI systems. Longer term, I aim to lead applied-AI initiatives bridging IoT, healthcare, and conservation technology — scaling projects like Arachnid and IntelliEat into impactful solutions.
        </p>
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────
function Contact({ t }) {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const copyEmail = () => {
    const em = "sagarshaw.jisce@gmail.com";
    const doIt = () => { setCopied(true); setTimeout(() => setCopied(false), 2200); };
    if (navigator.clipboard) { navigator.clipboard.writeText(em).then(doIt).catch(fb); } else { fb(); }
    function fb() {
      const ta = Object.assign(document.createElement("textarea"), { value: em });
      Object.assign(ta.style, { position: "fixed", opacity: 0 });
      document.body.appendChild(ta); ta.select(); document.execCommand("copy");
      document.body.removeChild(ta); doIt();
    }
  };

  const sendMessage = () => {
    const { name, email, message } = form;
    if (!name || !email || !message) return;
    const s = encodeURIComponent(`Portfolio Enquiry from ${name}`);
    const b = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply-to: ${email}`);
    window.open(`mailto:sagarshaw.jisce@gmail.com?subject=${s}&body=${b}`);
    setSent(true); setTimeout(() => setSent(false), 3000);
  };

  const inp = {
    width: "100%", padding: "10px 13px", background: t.surface,
    border: `1px solid ${t.border}`, borderRadius: 9, color: t.text,
    fontSize: 13, fontFamily: "'Outfit', sans-serif", boxSizing: "border-box",
    transition: "border-color .25s, box-shadow .25s",
  };

  const avail = [
    { label: "Available", sub: "For new roles", c: "#22c55e" },
    { label: "24 hrs", sub: "Response time", c: t.text },
    { label: "Remote", sub: "Preferred", c: "#f59e0b" },
    { label: "Flexible", sub: "Start date", c: "#8b5cf6" },
  ];

  return (
    <div>
      <PageTitle t={t} num="06">Get In Touch</PageTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
        {avail.map(a => (
          <GlassCard key={a.label} t={t} style={{ padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: a.c, fontFamily: "'Outfit', sans-serif" }}>{a.label}</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3 }}>{a.sub}</div>
          </GlassCard>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Info */}
        <GlassCard t={t}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 15, color: t.accentSub, fontSize: 13, fontWeight: 600 }}>
            <Mail size={14} />Contact Information
          </div>
          {[
            { Icon: Mail, val: "sagarshaw.jisce@gmail.com", action: copyEmail, actionLabel: copied ? "Copied ✓" : "Copy" },
            { Icon: Phone, val: "+91 9123634756" },
            { Icon: MapPin, val: "Kalyani, West Bengal, India" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: t.surface, borderRadius: 9, marginBottom: 7, transition: "background .2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: t.textSub, fontSize: 12 }}>
                <row.Icon size={12} color={t.accentSub} />{row.val}
              </div>
              {row.action && (
                <button onClick={row.action} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: copied ? "#22c55e" : t.accentSub, display: "flex", alignItems: "center", gap: 3, transition: "color .2s" }}>
                  {copied ? <Check size={11} /> : <Copy size={11} />}{row.actionLabel}
                </button>
              )}
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 10 }}>
            {[{ href: "https://github.com/Gocodein", label: "GitHub", Icon: GitBranch }, { href: "https://www.linkedin.com/in/sagar-shaw-79701138a", label: "LinkedIn", Icon: LinkedinIcon }].map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener" className="link-hover" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px 0", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 9, color: t.textSub, fontSize: 12 }}>
                <Icon size={13} />{label}
              </a>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: "10px 12px", background: "#16a34a11", border: "1px solid #16a34a33", borderRadius: 9, display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#22c55e" }}>
            <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            Available for new opportunities
          </div>
        </GlassCard>

        {/* Form */}
        <GlassCard t={t}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 15, color: t.accentSub, fontSize: 13, fontWeight: 600 }}>
            <ExternalLink size={14} />Send a Message
          </div>
          {["name", "email", "message"].map(field => (
            <div key={field} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: t.textMuted, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 5, fontWeight: 500 }}>{field}</label>
              {field === "message"
                ? <textarea value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder="What's on your mind?" rows={4} style={{ ...inp, resize: "vertical" }} />
                : <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={field === "email" ? "your@email.com" : "Your name"} style={inp} />
              }
            </div>
          ))}
          <button onClick={sendMessage} className="send-btn" style={{
            width: "100%", padding: 12,
            background: sent ? "#16a34a" : `linear-gradient(135deg, ${t.accent}, ${t.accentSub})`,
            border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all .3s", boxShadow: `0 4px 16px ${t.accent}33`,
            fontFamily: "'Outfit', sans-serif",
          }}>
            {sent ? <Check size={13} /> : <ExternalLink size={13} />}
            {sent ? "Opening mail client…" : "Send Message"}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState("midnight");
  const [section, setSection] = useState("overview");
  const [slideKey, setSlideKey] = useState(0);
  const [animDir, setAnimDir] = useState("left");
  const [showHint, setShowHint] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchRef = useRef({ startX: 0, startY: 0, dragging: false });
  const mainRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mq.matches ? "midnight" : "matinee");
    const handler = e => setTheme(e.matches ? "midnight" : "matinee");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Responsive breakpoint
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Hide swipe hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const t = THEMES[theme];

  const navigate = useCallback((id, dir) => {
    if (id === section) return;
    const curIdx = NAV_IDS.indexOf(section);
    const newIdx = NAV_IDS.indexOf(id);
    setAnimDir(dir || (newIdx > curIdx ? "left" : "right"));
    setSection(id);
    setSlideKey(k => k + 1);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [section]);

  const goNext = useCallback(() => {
    const idx = NAV_IDS.indexOf(section);
    if (idx < NAV_IDS.length - 1) navigate(NAV_IDS[idx + 1], "left");
  }, [section, navigate]);

  const goPrev = useCallback(() => {
    const idx = NAV_IDS.indexOf(section);
    if (idx > 0) navigate(NAV_IDS[idx - 1], "right");
  }, [section, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Touch swipe handlers
  const onTouchStart = (e) => {
    touchRef.current.startX = e.touches[0].clientX;
    touchRef.current.startY = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    const dy = e.changedTouches[0].clientY - touchRef.current.startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      if (dx < 0) goNext();  // swipe left → next
      else goPrev();         // swipe right → prev
    }
  };

  // Mouse drag handlers (for desktop swipe)
  const onMouseDown = (e) => {
    // Skip if clicking interactive elements
    if (e.target.closest("input, textarea, button, a, select")) return;
    e.preventDefault();
    touchRef.current.startX = e.clientX;
    touchRef.current.dragging = true;
    setIsDragging(true);
    setDragOffset(0);
  };
  const onMouseMove = (e) => {
    if (!touchRef.current.dragging) return;
    const dx = e.clientX - touchRef.current.startX;
    // Apply a dampened drag offset for visual feedback (max ±120px)
    setDragOffset(Math.max(-120, Math.min(120, dx * 0.4)));
  };
  const onMouseUp = (e) => {
    if (!touchRef.current.dragging) return;
    touchRef.current.dragging = false;
    setIsDragging(false);
    const dx = e.clientX - touchRef.current.startX;
    setDragOffset(0);
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };
  const onMouseLeave = () => {
    if (touchRef.current.dragging) {
      touchRef.current.dragging = false;
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  const renderSection = () => {
    switch (section) {
      case "overview": return <Overview t={t} />;
      case "about": return <About t={t} />;
      case "projects": return <Projects t={t} />;
      case "skills": return <Skills t={t} />;
      case "experience": return <Experience t={t} />;
      case "certifications": return <Certifications t={t} />;
      case "contact": return <Contact t={t} />;
      default: return null;
    }
  };

  const curIdx = NAV_IDS.indexOf(section);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Outfit', system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes slideInLeft { from { opacity:0; transform:translateX(70px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(-70px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes orbFloat1 { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(50px,-60px) scale(1.12); } }
        @keyframes orbFloat2 { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(-40px,55px) scale(0.9); } }
        @keyframes orbFloat3 { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(30px,35px) scale(1.08); } 66% { transform:translate(-25px,-30px) scale(0.94); } }
        @keyframes orbFloat4 { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(-20px,-40px) scale(1.06); } }
        @keyframes fadeHint { 0% { opacity:0; } 12% { opacity:0.6; } 75% { opacity:0.6; } 100% { opacity:0; } }
        @keyframes pulseDot { 0%,100% { opacity:1; box-shadow:0 0 0 0 #22c55e88; } 50% { opacity:.7; box-shadow:0 0 0 5px #22c55e00; } }
        @keyframes barGrow { from { transform:scaleY(0); } to { transform:scaleY(1); } }
        @keyframes progressFill { from { width:0; } }
        @keyframes snapBack { from { transform:translateX(var(--drag-offset, 0px)); } to { transform:translateX(0); } }

        .slide-left { animation: slideInLeft 0.38s cubic-bezier(.4,0,.2,1) both; }
        .slide-right { animation: slideInRight 0.38s cubic-bezier(.4,0,.2,1) both; }
        .fade-in { animation: fadeIn 0.35s ease both; }

        * { box-sizing:border-box; margin:0; }
        html { background:${t.bg}; }
        input, textarea { outline:none; }
        input::placeholder, textarea::placeholder { color:${t.textMuted}; }
        input:focus, textarea:focus { border-color:${t.accentSub} !important; box-shadow:0 0 0 3px ${t.accentGlow}, inset 0 1px 0 ${t.glassHighlight} !important; }
        a { text-decoration:none; }
        button { font-family:inherit; }

        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${theme === "midnight" ? "rgba(255,255,255,0.12)" : "rgba(22,80,40,0.15)"}; border-radius:3px; }

        .glass-card { position:relative; overflow:hidden; }
        .glass-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg, transparent 5%, ${t.glassHighlight} 30%, ${t.glassHighlight} 70%, transparent 95%);
          z-index:1; pointer-events:none;
        }
        .glass-card::after {
          content:''; position:absolute; bottom:0; left:10%; right:10%; height:1px;
          background:linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
          z-index:1; pointer-events:none;
        }

        .card-hover { transition: transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s ease, border-color 0.3s ease !important; }
        .card-hover:hover { transform:translateY(-4px); box-shadow:${t.cardHoverShadow}; }

        .link-hover { transition: all 0.25s ease !important; }
        .link-hover:hover { border-color:${t.accentSub} !important; transform:translateY(-2px); box-shadow:0 6px 20px ${t.accentGlow}, inset 0 1px 0 ${t.glassHighlight}; }

        .tag-hover { transition: all 0.2s ease; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
        .tag-hover:hover { background:${t.accentGlow}; border-color:${t.accentSub} !important; transform:translateY(-1px); }

        .skill-row { transition: all 0.2s ease; border-radius:9px; }
        .skill-row:hover { background:${t.accentGlow} !important; box-shadow:inset 0 1px 0 ${t.glassHighlight}; }

        .send-btn { transition: all 0.3s ease !important; }
        .send-btn:hover { filter:brightness(1.15); transform:translateY(-2px); box-shadow:0 8px 28px ${t.accent}55 !important; }

        .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }

        .sgpa-bar { transform-origin:bottom; animation: barGrow 0.8s cubic-bezier(.4,0,.2,1) both; }

        .progress-fill { animation: progressFill 1s ease both; }

        .swipe-hint { animation: fadeHint 5s ease forwards; pointer-events:none; }

        .progress-pill { transition: all 0.35s cubic-bezier(.4,0,.2,1); cursor:pointer; border:none; }
        .progress-pill:hover { opacity:0.85; transform:scale(1.3); }

        .nav-item { transition: all 0.22s ease !important; position:relative; }
        .nav-item::before { content:''; position:absolute; left:0; top:15%; height:70%; width:3px; border-radius:0 3px 3px 0; background:${t.accentSub}; transform:scaleY(0); transition:transform 0.22s ease; }
        .nav-item:hover { background:${t.navActive} !important; color:${t.text} !important; }
        .nav-active::before { transform:scaleY(1) !important; }

        .avatar-glow { transition: box-shadow 0.3s ease; }
        .avatar-glow:hover { box-shadow: 0 0 0 5px ${t.card}, 0 0 40px ${t.accent}55 !important; }

        .nav-arrow { transition:all 0.25s ease; opacity:0.6; }
        .nav-arrow:hover { opacity:1; background:${t.navActive} !important; transform:scale(1.1); box-shadow:0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 ${t.glassHighlight}; }

        .drag-active { cursor:grabbing !important; user-select:none !important; }
        .drag-active * { cursor:grabbing !important; user-select:none !important; }

        .sidebar-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:99; backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); }

        @media (max-width:767px) {
          .mobile-header { display:flex !important; }
          .desktop-sidebar { transform:translateX(-100%); transition:transform 0.3s cubic-bezier(.4,0,.2,1); }
          .desktop-sidebar.open { transform:translateX(0); }
        }
        @media (min-width:768px) {
          .mobile-header { display:none !important; }
          .desktop-sidebar { transform:translateX(0) !important; }
        }
      `}</style>

      {/* ── PARTICLE CANVAS ── */}
      <ParticleCanvas t={t} />

      {/* ── NOISE OVERLAY ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: theme === "midnight" ? 0.035 : 0.02,
      }} />

      {/* ── CUSTOM CURSOR ── */}
      <CustomCursor t={t} />

      {/* ── BACKGROUND ORBS ── */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          top: "-15%", right: "-10%",
          background: `radial-gradient(circle, ${t.orb1}50, ${t.orb1}20 40%, transparent 70%)`,
          filter: "blur(80px)", animation: "orbFloat1 18s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          bottom: "-5%", left: "5%",
          background: `radial-gradient(circle, ${t.orb2}40, ${t.orb2}15 45%, transparent 70%)`,
          filter: "blur(90px)", animation: "orbFloat2 22s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          top: "30%", left: "45%",
          background: `radial-gradient(circle, ${t.orb3}35, ${t.orb3}12 50%, transparent 70%)`,
          filter: "blur(90px)", animation: "orbFloat3 25s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 350, height: 350, borderRadius: "50%",
          top: "10%", left: "20%",
          background: `radial-gradient(circle, ${t.orb1}25, transparent 60%)`,
          filter: "blur(100px)", animation: "orbFloat4 30s ease-in-out infinite",
        }} />
      </div>

      {/* ── MOBILE HEADER ── */}
      <div className="mobile-header" style={{
        display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 110,
        height: 56, alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        background: t.sidebar, borderBottom: `1px solid ${t.border}`,
        backdropFilter: "blur(28px) saturate(1.5)", WebkitBackdropFilter: "blur(28px) saturate(1.5)",
        boxShadow: `0 2px 16px rgba(0,0,0,0.1)`,
      }}>
        <button onClick={() => setSidebarOpen(o => !o)} style={{
          width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`,
          background: t.card, color: t.text, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        }}>
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, padding: 1.5, overflow: "hidden",
            background: `linear-gradient(135deg, ${t.accent}, ${t.gold})`,
          }}>
            <img src="/profile.png" alt="SS" style={{ width: "100%", height: "100%", borderRadius: 5.5, objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: t.text }}>Sagar Shaw</span>
        </div>
        <button onClick={() => setTheme(th => th === "midnight" ? "matinee" : "midnight")} style={{
          width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`,
          background: t.card, color: t.textMuted, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        }}>
          {theme === "midnight" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* ── SIDEBAR OVERLAY (mobile) ── */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`desktop-sidebar ${sidebarOpen ? "open" : ""}`} style={{
        width: isMobile ? 260 : 222, flexShrink: 0, background: t.sidebar,
        borderRight: `1px solid ${t.border}`,
        backdropFilter: "blur(28px) saturate(1.5)",
        WebkitBackdropFilter: "blur(28px) saturate(1.5)",
        display: "flex", flexDirection: "column",
        position: "fixed", top: isMobile ? 56 : 0, left: 0, bottom: 0, zIndex: 100,
        boxShadow: `inset -1px 0 0 ${t.glassHighlight}, 4px 0 24px rgba(0,0,0,0.15)`,
      }}>
        {/* Profile (desktop only) */}
        {!isMobile && (
          <div style={{ padding: "22px 17px 17px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, marginBottom: 11,
              padding: 2,
              background: `linear-gradient(135deg, ${t.accent}, ${t.gold})`,
              boxShadow: `0 0 12px ${t.accent}22`,
              overflow: "hidden",
            }}>
              <img
                src="/profile.png"
                alt="Sagar Shaw"
                style={{
                  width: "100%", height: "100%", borderRadius: 8,
                  objectFit: "cover", objectPosition: "center 20%", display: "block",
                }}
              />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif" }}>Sagar Shaw</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>AI/ML Engineer</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV.map(({ id, label, Icon }) => {
            const active = section === id;
            return (
              <button key={id} onClick={() => { navigate(id); if (isMobile) setSidebarOpen(false); }} className={`nav-item ${active ? "nav-active" : ""}`} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9,
                padding: "10px 12px", borderRadius: 9, border: "none",
                background: active ? t.navActive : "transparent",
                color: active ? t.text : t.textMuted,
                fontSize: 13, fontWeight: active ? 600 : 400,
                cursor: "pointer", marginBottom: 2, textAlign: "left",
              }}>
                <Icon size={14} />{label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#22c55e", marginBottom: 10 }}>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            Available for hire
          </div>
          {!isMobile && (
            <button onClick={() => setTheme(th => th === "midnight" ? "matinee" : "midnight")} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              width: "100%", padding: "8px 0", borderRadius: 8,
              background: t.card, border: `1px solid ${t.border}`,
              color: t.textMuted, fontSize: 11, cursor: "pointer",
              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              transition: "all .25s",
            }}>
              {theme === "midnight" ? <Sun size={12} /> : <Moon size={12} />}
              {theme === "midnight" ? "Switch to Meadow" : "Switch to Forest"}
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main
        ref={mainRef}
        className={isDragging ? "drag-active" : ""}
        style={{
          flex: 1, marginLeft: isMobile ? 0 : 222,
          paddingTop: isMobile ? 72 : 36,
          padding: isMobile ? "72px 16px 90px" : "36px 42px 80px",
          overflowY: "auto", minHeight: "100vh", position: "relative", zIndex: 1,
          cursor: isDragging ? "grabbing" : "default",
        }}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}
      >
        <div
          key={slideKey}
          className={animDir === "left" ? "slide-left" : "slide-right"}
          style={{
            transform: isDragging ? `translateX(${dragOffset}px)` : undefined,
            transition: isDragging ? "none" : "transform 0.3s cubic-bezier(.4,0,.2,1)",
            opacity: isDragging ? Math.max(0.7, 1 - Math.abs(dragOffset) / 300) : undefined,
          }}
        >
          {renderSection()}
        </div>

        {/* Navigation arrows */}
        <div style={{ position: "fixed", bottom: isMobile ? 20 : 28, right: isMobile ? 16 : 36, display: "flex", gap: 8, zIndex: 200 }}>
          <button className="nav-arrow" onClick={goPrev} disabled={curIdx === 0} style={{
            width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`,
            background: t.card, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            color: curIdx === 0 ? t.dotEmpty : t.textSub, cursor: curIdx === 0 ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><ChevronLeft size={16} /></button>
          <button className="nav-arrow" onClick={goNext} disabled={curIdx === NAV_IDS.length - 1} style={{
            width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`,
            background: t.card, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            color: curIdx === NAV_IDS.length - 1 ? t.dotEmpty : t.textSub, cursor: curIdx === NAV_IDS.length - 1 ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><ChevronRight size={16} /></button>
        </div>

        {/* Progress dots */}
        <div style={{
          position: "fixed", bottom: isMobile ? 20 : 28,
          left: isMobile ? "50%" : "calc(222px + 50%)",
          transform: "translateX(-50%)",
          display: "flex", gap: 6, alignItems: "center", zIndex: 200,
          padding: "6px 14px", borderRadius: 20,
          background: t.sidebar, border: `1px solid ${t.border}`,
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        }}>
          {NAV.map(({ id, label }) => (
            <button
              key={id} onClick={() => navigate(id)}
              className="progress-pill"
              title={label}
              style={{
                width: section === id ? 22 : 8, height: 8, borderRadius: 5,
                background: section === id
                  ? `linear-gradient(90deg, ${t.accent}, ${t.accentSub})`
                  : t.dotEmpty,
                boxShadow: section === id ? `0 0 8px ${t.accent}44` : "none",
              }}
            />
          ))}
        </div>

        {/* Swipe hint */}
        {showHint && (
          <div className="swipe-hint" style={{
            position: "fixed", bottom: isMobile ? 48 : 56,
            left: isMobile ? "50%" : "calc(222px + 50%)",
            transform: "translateX(-50%)",
            fontSize: 11, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 1, whiteSpace: "nowrap", zIndex: 200,
          }}>
            ← swipe or arrow keys to navigate →
          </div>
        )}
      </main>
    </div>
  );
}
