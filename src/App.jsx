import { useState, useEffect, useRef, useCallback } from "react";
import {
  Globe, User, Code, Zap, Briefcase, GraduationCap, Mail,
  Moon, Sun, GitBranch, Phone, MapPin,
  ChevronDown, ChevronRight, Copy, Check, ExternalLink,
  Award, Calendar, Terminal, Database, Cpu, ChevronLeft,
  Menu, X, Eye, Download, Users, Flame, Rocket, Sparkles,
  Drone,
  Command, Search, Activity, ShieldCheck, FileText, Workflow,
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
    for (let i = 0; i < 60; i++) {
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.5 + Math.random(),
        vx: (Math.random() - 0.6) * 0.6 + (Math.random() > 0.6 ? 0.2 : -0.2),
        vy: (Math.random() - 0.6) * 0.6 + (Math.random() > 0.6 ? 0.2 : -0.2),
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
            ctx.strokeStyle = t.accent + "21"; // ~8% opacity hex
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

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animRef.current);
      } else {
        cancelAnimationFrame(animRef.current);
        animRef.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [t, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

/* ImageParticleCanvas ─ Photorealistic interactive image particles */
function ImageParticleCanvas({ src = "/profile1.png", t }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const isHoverRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    let animId;
    let particles = [];

    img.onload = () => {
      const w = (canvas.width = 240);
      const h = (canvas.height = 270);

      // Draw source image scaled to cover (crop center for 240x270 from square)
      const offC = document.createElement("canvas");
      offC.width = w;
      offC.height = h;
      const offCtx = offC.getContext("2d");

      // Cover-fit: scale and center-crop the square image into 240x270
      const imgAspect = img.width / img.height;
      const canvasAspect = w / h;
      let sx, sy, sw, sh;
      if (imgAspect > canvasAspect) {
        sh = img.height;
        sw = sh * canvasAspect;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = sw / canvasAspect;
        sx = 0;
        sy = (img.height - sh) * 0.25; // Bias toward top (face area)
      }
      offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      const imgData = offCtx.getImageData(0, 0, w, h).data;

      const gap = 2;
      const pts = [];

      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          const idx = (y * w + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const a = imgData[idx + 3];
          const brightness = (r + g + b) / 3;

          if (a > 50 && brightness > 20) {
            const size = Math.max(1.2, (brightness / 255) * gap * 0.9);
            const isAccent = Math.random() < 0.12 && brightness > 140;
            pts.push({
              x, y,
              baseX: x, baseY: y,
              vx: 0, vy: 0,
              size,
              r, g, b, brightness,
              isAccent,
              twinkle: Math.random() * Math.PI * 2,
            });
          }
        }
      }
      particles = pts;

      const render = () => {
        ctx.clearRect(0, 0, w, h);

        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const radius = 50;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (isHoverRef.current) {
            const dx = mx - p.x;
            const dy = my - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius && dist > 0) {
              const force = (1 - dist / radius) * 6;
              p.vx -= (dx / dist) * force;
              p.vy -= (dy / dist) * force;
            }
          }

          p.vx += (p.baseX - p.x) * 0.07;
          p.vy += (p.baseY - p.y) * 0.07;
          p.vx *= 0.85;
          p.vy *= 0.85;
          p.x += p.vx;
          p.y += p.vy;

          p.twinkle += 0.03;
          const alpha = 0.6 + Math.sin(p.twinkle) * 0.4;
          ctx.globalAlpha = alpha;

          // Use original image colors for photorealistic look
          if (p.isAccent) {
            ctx.fillStyle = t.gold;
          } else {
            ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        animId = requestAnimationFrame(render);
      };

      render();
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    };
    const handleMouseEnter = () => { isHoverRef.current = true; };
    const handleMouseLeave = () => { isHoverRef.current = false; mouseRef.current = { x: -1000, y: -1000 }; };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [src, t]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        aspectRatio: "240/270",
        borderRadius: "22px 22px 0 0",
        background: t.name === "Meadow" ? "rgba(244, 248, 245, 0.95)" : "rgba(0,0,0,0.35)",
        display: "block",
        cursor: "crosshair",
        borderBottom: `1px solid ${t.border}`,
      }}
    />
  );
}

/* CustomCursor ─ circle-follower cursor for desktop */
function CustomCursor({ t }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const mouse = useRef({ x: -100, y: -100 });
  const outerPos = useRef({ x: -100, y: -100 });
  const rafId = useRef(null);

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
      mouse.current = { x: e.clientX, y: e.clientY };
      if (innerRef.current) {
        innerRef.current.style.left = e.clientX + "px";
        innerRef.current.style.top = e.clientY + "px";
      }
    };

    // Smooth lerp loop for outer ring
    const animate = () => {
      const lerp = 0.18;
      outerPos.current.x += (mouse.current.x - outerPos.current.x) * lerp;
      outerPos.current.y += (mouse.current.y - outerPos.current.y) * lerp;
      if (outerRef.current) {
        outerRef.current.style.left = outerPos.current.x + "px";
        outerRef.current.style.top = outerPos.current.y + "px";
      }
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);

    const onOver = (e) => {
      if (e.target.closest("button, a, input, textarea, select")) {
        if (!hovering && outerRef.current) {
          hovering = true;
          outerRef.current.style.transform = "translate(-50%,-50%) scale(1.5)";
          outerRef.current.style.borderColor = t.accent + "99";
        }
      }
    };
    const onOut = (e) => {
      if (hovering && !e.target.closest("button, a, input, textarea, select")) {
        hovering = false;
        if (outerRef.current) {
          outerRef.current.style.transform = "translate(-50%,-50%) scale(1)";
          outerRef.current.style.borderColor = t.accent + "66";
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
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [t, visible]);

  if (!visible) return null;

  const shared = { position: "fixed", zIndex: 9999, pointerEvents: "none", borderRadius: "50%", top: -100, left: -100 };

  return (
    <>
      <div
        ref={outerRef}
        style={{
          ...shared,
          width: 36,
          height: 36,
          border: `1.5px solid ${t.accent}66`,
          transform: "translate(-50%,-50%) scale(1)",
          transition: "transform 0.15s ease, border-color 0.15s ease",
        }}
      />
      <div
        ref={innerRef}
        style={{
          ...shared,
          width: 5,
          height: 5,
          backgroundColor: t.accent + "B3",
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
    bg: "#091410", sidebar: "rgba(16, 32, 20, 0.65)", surface: "rgba(255,255,255,0.03)",
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
    codeBg: "rgba(0, 0, 0, 0.45)",
    codeBorder: "rgba(255, 255, 255, 0.12)",
    codeText: "#86efac",
    modalBackdrop: "rgba(0, 0, 0, 0.75)",
    modalCard: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  },
  matinee: {
    bg: "#f4f8f5", sidebar: "rgba(255,255,255,0.88)", surface: "rgba(255,255,255,0.8)",
    card: "rgba(255, 255, 255, 0.88)", border: "rgba(22, 101, 52, 0.16)",
    text: "#0a1f10", textSub: "#1f3d27", textMuted: "#476852",
    accent: "#15803d", accentSub: "#166534",
    accentGlow: "rgba(21,128,61,0.12)",
    gold: "#b45309", goldLight: "#d97706",
    navActive: "rgba(21,128,61,0.1)", badge: "rgba(21,128,61,0.08)", dotEmpty: "rgba(22,101,52,0.18)",
    name: "Meadow",
    orb1: "#86efac", orb2: "#bbf7d0", orb3: "#fde68a",
    cardHoverShadow: "0 16px 40px rgba(22,101,52,0.08), 0 2px 10px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
    glassHighlight: "rgba(255,255,255,0.95)",
    glassBg: "rgba(255,255,255,0.72)",
    codeBg: "rgba(22, 101, 52, 0.05)",
    codeBorder: "rgba(22, 101, 52, 0.15)",
    codeText: "#15803d",
    modalBackdrop: "rgba(15, 30, 20, 0.45)",
    modalCard: "#ffffff",
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
  { sem: "Sem 6", sgpa: 7.51 },
];

const SKILLS_DATA = [
  {
    category: "Programming Languages", Icon: Terminal,
    items: [
      { name: "Python", level: 5 }, { name: "TypeScript", level: 4 }, { name: "Java", level: 5 },
      { name: "C++", level: 3 }, { name: "C", level: 3 }, { name: "SQL", level: 4 },
      { name: "Problem Solving", level: 4 },
    ],
  },
  {
    category: "AI / ML Frameworks", Icon: Cpu,
    items: [
      { name: "TensorFlow", level: 4 }, { name: "PyTorch", level: 3 },
      { name: "scikit-learn", level: 4 }, { name: "OpenCV", level: 4 },
      { name: "FastMCP", level: 4 }, { name: "ChromaDB", level: 4 },
      { name: "Pandas / NumPy", level: 4 }, { name: "Matplotlib / Seaborn", level: 4 }, { name: "Flask", level: 3 },
    ],
  },
  {
    category: "AI / ML Domains", Icon: Zap,
    items: [
      { name: "Machine Learning", level: 5 }, { name: "Deep Learning", level: 4 },
      { name: "Computer Vision", level: 4 }, { name: "Agentic AI & FastMCP", level: 4 },
      { name: "NLP", level: 4 }, { name: "Generative AI", level: 3 }, { name: "Cloud (Azure/Vercel)", level: 3 },
    ],
  },
  {
    category: "Tools & Platforms", Icon: Database,
    items: [
      { name: "Next.js 16", level: 4 }, { name: "React 19", level: 5 },
      { name: "Git / GitHub", level: 5 }, { name: "Prisma ORM", level: 4 },
      { name: "Supabase PostgreSQL", level: 4 }, { name: "Arduino IDE", level: 4 },
      { name: "Anthropic / Gemini API", level: 4 }, { name: "Vercel", level: 4 },
    ],
  },
];

const PROJECTS_DATA = [
  {
    title: "Merchant AI Readability & Autonomous Commerce",
    tagline: "FastMCP gateway connecting LLMs to D2C catalogs with sub-10ms vector search & ₹2,000 UAP spending cap",
    badge: "Razorpay Buildathon · FastMCP", badgeColor: "#c9a646",
    role: "AI Architect & Lead Engineer", period: "Sep 2026",
    description: "Architected an Agentic FastMCP Commerce Gateway connecting autonomous LLMs to D2C merchant inventories via ChromaDB semantic vector search (sub-10ms lookup); enforced deterministic financial safety through an NPCI UAP ₹2,000 session spending cap with human consent gates and an immutable SQLite WAL audit ledger, validated end-to-end with 17/17 automated pytest suites.",
    techStack: ["Python", "FastMCP (MCP SDK)", "Razorpay API", "ChromaDB", "Anthropic Claude 3.5", "Gemini 3.5 Flash", "sentence-transformers", "Pydantic v2", "SQLite WAL", "Streamlit", "Pytest"],
    category: ['All', 'Agentic AI & FastMCP', 'Full-Stack Web', 'ML-DL', 'Web-App'],
    architecture: {
      summary: "7-tool FastMCP model context protocol gateway exposing merchant product catalogs as structured vector tools with deterministic NPCI UAP financial boundary. LLMs autonomously discover, inspect, and transact via Razorpay UPI rails backed by an immutable SQLite WAL audit ledger.",
      flowAscii: `[SMB / D2C Catalog (CSV/JSON)]
       │
       ▼
[Vernacular LLM Enricher (Gemini 3.5 Flash)]
       │  (Hinglish Intents, Aliases, Attributes)
       ▼
[ChromaDB Vector Store (all-MiniLM-L6-v2)]
       │  (7 FastMCP Tools: search, inspect, order, cancel)
       ▼
[Claude 3.5 Sonnet / Gemini 3.5 Flash]
       │  (Autonomous Reasoning & Tool Invocation)
       ▼
[NPCI UAP Spending Gate (₹2,000 Cap + Human Consent)]
       │  (Deterministic Pre-flight Budget Check)
       ▼
[Razorpay Orders API + UPI Payment Links & QR]
       │
       ▼
[Immutable SQLite WAL Audit Ledger]`,
      pipeline: [
        { step: "01", name: "Catalog Ingestion", tech: "FastMCP + Pydantic v2", detail: "Normalizes raw merchant CSV/JSON into agent-readable semantic schemas with vernacular LLM enrichment." },
        { step: "02", name: "Vector Search", tech: "ChromaDB + MiniLM-L6", detail: "Cosine similarity retrieval with in-memory fallback search (sub-10ms, zero-downtime)." },
        { step: "03", name: "Agentic Reasoning", tech: "Gemini 3.5 & Claude 3.5", detail: "Multi-model tool invocation for autonomous Hinglish intent resolution and cart generation." },
        { step: "04", name: "Financial Safety Gate", tech: "NPCI UAP Simulation", detail: "₹2,000 session spending cap with pre-flight budget check and explicit human confirmation." },
        { step: "05", name: "Payment & Audit", tech: "Razorpay + SQLite WAL", detail: "UPI payment link/QR creation with immutable audit trail logging every tool invocation." },
      ],
    },
    metrics: [
      { label: "Retrieval Latency", value: "Sub-10ms", desc: "ChromaDB cosine similarity with fallback search" },
      { label: "Pytest Coverage", value: "17/17 Pass", desc: "100% automated integration test pass rate" },
      { label: "Spending Boundary", value: "₹2,000 Cap", desc: "Deterministic NPCI UAP session spending limit" },
      { label: "MCP Tools", value: "7 Tools", desc: "Full FastMCP protocol specification compliance" },
    ],
    features: [
      "7-tool FastMCP server transforming unstructured D2C Indian merchant catalogs into 100% agent-readable APIs with Hinglish vernacular intent resolution",
      "ChromaDB vector search with all-MiniLM-L6-v2 embeddings (384-dim, sub-10ms) and zero-downtime in-memory fallback for guaranteed availability",
      "Deterministic NPCI UAP financial safety boundary — ₹2,000 session spending cap with explicit human consent gates preventing autonomous overspending",
      "Graceful out-of-stock failure recovery with semantic alternative recommendations and capture-aware order cancellation guard",
      "Immutable SQLite WAL audit ledger capturing 100% of tool invocations, financial deltas, and parameter hashes for regulatory auditability",
      "Multi-agent support verified across Anthropic Claude 3.5 Sonnet and Google Gemini 3.5 Flash with automatic LLM fallback cascade",
    ],
    github: 'https://github.com/Gocodein/merchant-ai-readability',
    demo: null,
  },
  {
    title: "Arachnid — Bio-Inspired Spider",
    tagline: "Patented bio-inspired hexapod robot with edge YOLOv8 vision tracking 9 endangered species at <250ms latency",
    badge: "2 Patents · Live App", badgeColor: "#c9a646",
    role: "AI Developer & Hardware Support Engineer", period: "Aug 2025 — Present",
    patentNo: "Design Reg. 467786-001 | App. 202531071175 A",
    description: "Co-invented and patented (Design Reg. 467786-001, App. 202531071175 A) a bio-inspired hexapod robot for non-invasive ecological monitoring; engineered an edge YOLOv8 and PyTorch vision pipeline tracking 9 endangered species at sub-250ms stream latency with 18-DOF inverse kinematic terrain stabilization.",
    techStack: ["Python", "PyTorch", "YOLOv8", "OpenCV", "Streamlit", "timm", "Plotly", "Arduino Mega", "Raspberry Pi 4", "IoT"],
    category: ['All', 'Robotics & IoT', 'Computer Vision & Drones', 'ML-DL', 'Hardware/IoT'],
    architecture: {
      summary: "Dual-tier edge computing architecture pairing a Raspberry Pi 4 high-level telemetry and computer vision host with an Arduino Mega real-time inverse kinematics gait controller, backed by cloud Streamlit telemetry.",
      flowAscii: `[Ground Camera Feed & Ultrasonic Array]
       │
       ▼
[Raspberry Pi 4 Edge Compute Unit]
       │  (Real-Time YOLOv8 & PyTorch Multi-Species Pipeline)
       ▼
[Edge Inference: 9 Endangered Wildlife Classes]
       │  (Sub-250ms Video Latency & Bounding Box Coordinates)
       ▼
[Arduino Mega Kinematics Subsystem]
       │  (Inverse Kinematics Gait Adaptation & Terrain Stabilization)
       ▼
[Streamlit Cloud Research Suite (6 Interactive Analytics Pages)]`,
      pipeline: [
        { step: "01", name: "Perception & Sensing", tech: "RGB Camera + Sensors", detail: "Ground-level optical capture under dense jungle foliage with obstacle telemetry." },
        { step: "02", name: "Wildlife Identification", tech: "YOLOv8 + PyTorch", detail: "Custom edge weights classifying 9 endangered species with 82% precision." },
        { step: "03", name: "Motion & Stabilization", tech: "Arduino Mega + PWM", detail: "Inverse kinematics driving 18 DOF hexapod legs over uneven wilderness terrain." },
        { step: "04", name: "Telemetry Streaming", tech: "Raspberry Pi 4 + IoT", detail: "Sub-250ms video and sensor data streaming over cellular/Wi-Fi uplink." },
        { step: "05", name: "Live Research Portal", tech: "Streamlit Cloud + Plotly", detail: "6-page scientific dashboard with population heatmaps and gait analysis." },
      ],
    },
    metrics: [
      { label: "Target Species", value: "9 Classes", desc: "Bengal Tiger, Asian Elephant, Leopard, Rhino, etc." },
      { label: "Model Precision", value: "82%", desc: "Field-tested multi-species detection accuracy" },
      { label: "Stream Latency", value: "<250ms", desc: "Real-time edge video pipeline latency" },
      { label: "Govt. IP Grants", value: "2 Patents", desc: "Design Reg. 467786-001 & Invention App. 202531071175 A" },
    ],
    features: [
      "Official Design Patent registered (No. 467786-001, Class 15-99) by Controller General of Patents, Govt. of India",
      "Invention Patent Application published (No. 202531071175 A) for ARC biomimetic ground-level environmental monitoring",
      "Multi-model AI pipeline using YOLOv8 & PyTorch for 9 target species (Bengal Tiger, Asian Elephant, Leopard, Rhino, etc.)",
      "Interactive 6-page Streamlit research dashboard with real-time species analytics, spatial heatmaps, & kinematic behavior tracking",
      "Seamless IoT hardware integration (Arduino Mega + Raspberry Pi 4) with sub-250ms video latency and 18-DOF servo coordination",
    ],
    github: 'https://github.com/Gocodein/spidy',
    demo: 'https://6gtwjs9csfbmyt957xc3nv.streamlit.app/',
  },
  {
    title: "IntelliEat Monitoring System",
    tagline: "IoT smart plate & utensil sensors with scikit-learn ML tracking eating behaviors to detect disorder patterns",
    badge: "In Progress", badgeColor: "#3b82f6",
    role: "Team Lead", period: "Aug 2024 — Present",
    description: "IoT-enabled solution tracking eating behaviors via smart plates and utensils to detect patterns linked to eating disorders.",
    techStack: ["Python", "IoT Sensors", "scikit-learn", "Pandas", "Matplotlib / Seaborn", "Flask", "Data Analysis", "AI / ML"],
    category: ['All', 'Robotics & IoT', 'Full-Stack Web', 'ML-DL', 'Hardware/IoT', 'Web-App'],
    architecture: {
      summary: "Non-invasive hardware sensor platform combining micro load-cells and smart utensil kinematics to capture temporal consumption metrics, classified via scikit-learn for clinical intervention.",
      flowAscii: `[Smart Plate Strain Gauges & Utensil Gyros]
       │
       ▼
[Edge ADC Signal Acquisition & Filtering]
       │  (Mass Delta, Bite Velocity, Interval Timers)
       ▼
[Temporal Feature Extraction Engine]
       │  (Bite Frequency, Duration, Consumption Curves)
       ▼
[scikit-learn Anomaly Classifier (85% Precision)]
       │  (Detects Anorexia, Bulimia, & Binge Eating Patterns)
       ▼
[Flask Caregiver & Clinician Telemetry Dashboard]`,
      pipeline: [
        { step: "01", name: "Physical Sensing", tech: "Strain Gauges & ADC", detail: "Captures minute mass drops and utensil lift intervals in real time." },
        { step: "02", name: "Signal Filtering", tech: "NumPy / Pandas", detail: "Removes tremors and utensil clatter artifacts via moving average filters." },
        { step: "03", name: "Pattern Classification", tech: "scikit-learn", detail: "Random Forest & SVM models distinguishing healthy eating from behavioral disorders." },
        { step: "04", name: "Clinical Reporting", tech: "Flask + Seaborn", detail: "Generates longitudinal behavioral trends and meal duration charts for physicians." },
      ],
    },
    metrics: [
      { label: "Detection Precision", value: "85%", desc: "Precision distinguishing eating disorder patterns" },
      { label: "Sensor Modalities", value: "3 Channels", desc: "Plate load delta, utensil motion, and duration" },
      { label: "Non-Invasive", value: "100%", desc: "Integrated invisibly into everyday dining utensils" },
      { label: "Telemetry Mode", value: "Continuous", desc: "Real-time edge ingestion into caregiver portal" },
    ],
    features: [
      "IoT-enabled smart plate & utensil sensors monitoring food intake, chewing speed, and meal duration",
      "ML algorithms detecting eating disorder patterns (anorexia, bulimia) with 85% precision",
      "Real-time analytics dashboard for health practitioners, clinicians, and family caregivers",
      "Automated outlier detection flagging rapid binge consumption or extreme dietary restriction",
    ],
    github: 'https://github.com/Gocodein/IntelliEat',
    demo: null,
  },
  {
    title: 'JIVAN — Rescue Drone AI',
    tagline: 'Edge aerial triage AI running 1.4 FPS in-browser client ONNX models for disaster zone search & rescue',
    badge: 'Active R&D', badgeColor: '#f59e0b',
    role: 'AI Developer & Architect', period: 'Jul 2026 — Present',
    description: 'Developed an edge aerial triage AI fusing live RGB and thermal FPV drone video to detect victims in disaster zones; deployed quantized YOLO models inside the client browser via WebAssembly ONNX Runtime, eliminating cloud dependency during telecom blackouts.',
    techStack: ['Python', 'ONNX Runtime', 'YOLO', 'OpenCV', 'Flask', 'JavaScript', 'FPV Camera', 'Thermal Fusion'],
    category: ['All', 'Computer Vision & Drones', 'Robotics & IoT', 'ML-DL', 'Hardware/IoT'],
    architecture: {
      summary: "Zero-backend edge AI vision pipeline executing quantized YOLO detection models directly in the client browser via WebAssembly ONNX Runtime, eliminating cloud round-trip latency during disaster blackouts.",
      flowAscii: `[FPV Drone Video Feed / Thermal Sensors]
       │
       ▼
[WebAssembly Video Frame Preprocessor]
       │  (Dynamic Normalization, 640x640 Resize)
       ▼
[In-Browser ONNX Runtime Inference Engine (1.4 FPS)]
       │  (Multi-Class Victim Bounding Boxes & Confidence)
       ▼
[Multi-Frame Tracking & Risk Tier Matrix]
       │  (Priority Scoring: High / Medium / Low)
       ▼
[Search & Rescue Mission HUD & Operator Verification]`,
      pipeline: [
        { step: "01", name: "Feed Ingestion", tech: "FPV RTSP / WebRTC", detail: "Ingests raw drone camera stream directly into local browser memory buffer." },
        { step: "02", name: "Client-Side Inference", tech: "ONNX Runtime Wasm", detail: "Zero-cloud inference loop running 1.4 FPS on consumer laptops in disconnected zones." },
        { step: "03", name: "Spatial Tracking", tech: "Multi-Frame Hungarian", detail: "Maintains victim tracking IDs across drone pitch and yaw oscillations." },
        { step: "04", name: "Risk Assessment", tech: "Rule-Engine Scoring", detail: "Evaluates posture, thermal signatures, and environment to output risk priorities." },
      ],
    },
    metrics: [
      { label: "Inference Latency", value: "1.4 FPS", desc: "Continuous client-side ONNX Runtime execution" },
      { label: "Cloud Dependency", value: "0ms / Zero", desc: "Operates 100% offline in disaster blackout zones" },
      { label: "Risk Tiers", value: "3 Levels", desc: "Automated High / Medium / Low victim triage" },
      { label: "Sensor Modality", value: "RGB + Thermal", desc: "Multi-modal vision fusion for low-visibility rubble" },
    ],
    features: [
      'Real-time victim detection & risk scoring via FPV drone and mobile camera feeds with bounding boxes and confidence metrics',
      'Continuous live AI inference loop (1.4 FPS) in-browser using ONNX Runtime with multi-frame tracking IDs',
      'Thermal & RGB vision fusion pipeline calculating victim threat priority (High/Medium/Low) for emergency teams',
      'Integrated operator verification workflow and automated dataset export pipeline for active learning and model fine-tuning',
    ],
    github: 'https://github.com/Gocodein/jivan',
    demo: null,
  },
  {
    title: "AI Engineer OS — Personal Productivity PWA",
    tagline: "Next.js 16 & Supabase PWA for tracking technical skill acquisition, deep work sprints & habit streaks",
    badge: "Live App · Production", badgeColor: "#22c55e",
    role: "Full-Stack Developer & Architect", period: "June 2026 — Present",
    description: "Engineered a production-ready Progressive Web App (PWA) on Next.js 16 App Router and React 19 for developer sprint management; achieved 100% Google Lighthouse ratings by configuring PgBouncer connection-pooled Supabase queries and service-worker offline state synchronization.",
    techStack: ["Next.js 16", "React 19", "TypeScript", "Prisma ORM", "Supabase PostgreSQL", "Tailwind CSS", "Auth.js v5", "PWA", "Vercel"],
    category: ['All', 'Full-Stack Web', 'Web-App'],
    architecture: {
      summary: "Modern full-stack JAMstack architecture featuring Next.js 16 App Router server actions, connected to Supabase PostgreSQL via connection-pooled Prisma ORM with offline PWA service worker caching.",
      flowAscii: `[Desktop / Mobile PWA Home Screen]
       │
       ▼
[Next.js 16 App Router & React 19 Client]
       │  (Optimistic UI Updates, Service Worker Offline Cache)
       ▼
[Server Actions & Auth.js v5 Authentication]
       │  (Session Validation & RBAC Middleware)
       ▼
[Prisma ORM with PgBouncer Connection Pooling]
       │  (Zero Cold-Start Latency, Type-Safe Queries)
       ▼
[Supabase PostgreSQL Enterprise Cloud Database]`,
      pipeline: [
        { step: "01", name: "Client PWA UI", tech: "Next.js 16 + React 19", detail: "Fast client hydration, standalone manifest, and touch-optimized navigation." },
        { step: "02", name: "Secure Auth", tech: "Auth.js v5", detail: "Multi-provider OAuth with JWT sessions and protected API routes." },
        { step: "03", name: "Data Persistence", tech: "Prisma + Supabase", detail: "Connection-pooled PostgreSQL with relational schemas for tasks, logs, and sprints." },
        { step: "04", name: "Offline Sync", tech: "Service Worker Cache", detail: "Permits seamless routine management even during transit and spotty connectivity." },
      ],
    },
    metrics: [
      { label: "Lighthouse Score", value: "100%", desc: "PWA criteria, performance, and best practices" },
      { label: "Cold-Start Latency", value: "0ms", desc: "Accelerated via Supabase PgBouncer connection pooling" },
      { label: "Device Sync", value: "Cross-Device", desc: "Instant sync across smartphone PWA and desktop browsers" },
      { label: "Core Modules", value: "5 Engines", desc: "DSA tracker, habit streak, Pomodoro, AI sprints, daily tasks" },
    ],
    features: [
      "Full-stack Next.js 16 App Router application integrated with Supabase PostgreSQL via Prisma ORM & Auth.js v5",
      "Progressive Web App (PWA) architecture with standalone manifest, offline capability, and native mobile home-screen installation",
      "Integrated modules for daily routine tracking, DSA problem solving, AI project sprints, habit streaks, and Pomodoro focus timers",
      "Deployed on Vercel with automated CI/CD and connection pooling for zero cold-start latency",
    ],
    github: 'https://github.com/Gocodein/daily-task-tracker',
    demo: 'https://daily-task-tracker-gray.vercel.app/',
  },
  {
    title: 'AI Portfolio — Interactive Glass UI',
    tagline: 'High-performance React portfolio with dual themes, 3D tilt card, interactive particles & Recruiter Cockpit',
    badge: 'Live App', badgeColor: '#22c55e',
    role: 'Full-Stack Developer', period: '2026 — Present',
    description: 'A modern glass-morphism portfolio built with React, featuring particle animations, 3D tilt cards, swipe navigation, Recruiter Cockpit (Cmd+K), and dual themes.',
    techStack: ['React', 'Vite', 'CSS Glass', 'Lucide Icons', 'Vercel'],
    category: ['All', 'Full-Stack Web', 'Web-App'],
    architecture: {
      summary: "Single-page responsive architecture with custom HTML5 Canvas particle physics, 3D CSS perspective transforms, and interactive keyboard command orchestration.",
      flowAscii: `[User Interaction: Mouse / Touch / Keyboard (⌘K)]
       │
       ▼
[React 19 State Engine & Gesture Hook Listeners]
       │  (Smooth Section Sliding & 3D Tilt Math)
       ▼
[Dual HTML5 Canvas 2D Particle Shaders (60 FPS)]
       │  (Dynamic Particle Connections & Image Decomposition)
       ▼
[Obsidian Emerald Glassmorphic Design System]
       │  (Google Stitch & Linear Inspired Tokens)
       ▼
[Global Edge CDN (Vercel Production Deployment)]`,
      pipeline: [
        { step: "01", name: "Gesture & Key Engine", tech: "Custom Hooks", detail: "Supports keyboard arrow navigation, Cmd+K palette, and mobile touch swiping." },
        { step: "02", name: "Particle Shaders", tech: "HTML5 Canvas API", detail: "60 FPS floating nodes and interactive photo particle scattering engine." },
        { step: "03", name: "Glassmorphism UI", tech: "Modern CSS Filters", detail: "Backdrop saturation, variable blur, and dual Obsidian/Meadow themes." },
      ],
    },
    metrics: [
      { label: "Render Frame Rate", value: "60 FPS", desc: "Hardware-accelerated 2D canvas particle physics" },
      { label: "Edge Delivery", value: "<1s FCP", desc: "First Contentful Paint on global Vercel edge network" },
      { label: "Design Token Sets", value: "2 Systems", desc: "Obsidian Emerald (Forest) & High-Contrast Meadow" },
      { label: "Cockpit Latency", value: "<16ms", desc: "Instant spotlight search with zero perceptible delay" },
    ],
    features: [
      'Frosted glass UI with dual Forest/Meadow themes and animated particle background',
      'Interactive Cmd+K Recruiter Cockpit with keyboard navigation and instant spotlight search',
      'Multi-tabbed project case studies showcasing system architecture dataflow, benchmarks, and live code',
      'Swipe, drag, and keyboard navigation between sections with slide animations',
      'Fully responsive with mobile hamburger menu and touch gestures',
    ],
    github: 'https://github.com/Gocodein/portfolio',
    demo: 'https://portfolio-lac-eta-23.vercel.app/',
  },
];

const EXPERIENCE_DATA = [
  {
    role: "AI/ML Engineer — Intern", company: "Confitech Solutions Pvt. Ltd.", type: "Remote",
    period: "May 2025 — Aug 2025",
    techStack: ["Python", "Flask", "OpenAI API", "Azure", "REST APIs", "GenAI", "Git"],
    points: [
      "Developed and maintained scalable AI/ML applications using Python and Flask, improving system processing speed by 20%.",
      "Implemented GenAI solutions via OpenAI & Azure, automating key workflows and reducing manual processing time by 10 hrs/week.",
      "Integrated RESTful APIs and streamlined data pipelines with backend developers, ensuring 99% uptime.",
    ],
  },
];

// Scored / exam-based certs (full card with score bar)
const CERTS_SCORED = [
  { name: "SAP Certified – Back-End Developer (ABAP Cloud)", org: "SAP SE", weeks: null, period: "June 2026 – June 2027 · 1 Year Validity", score: null, verify: "https://www.credly.com/badges/96cfe04d-c44a-45d0-ab7b-52293a60a771", badge: "Exam Certified" },
  { name: "Natural Language Processing", org: "NPTEL (IIT)", weeks: 12, period: "Jan – Apr 2026", score: null, verify: "https://nptel.ac.in/noc/E_Certificate/NOC26CS45S105750069604840008", badge: "IIT Certified" },
  { name: "Fundamentals of Artificial Intelligence", org: "NPTEL (IIT)", weeks: 12, period: "Jul – Oct 2025", score: null, verify: "https://nptel.ac.in/noc/E_Certificate/NPTEL25GE55S125960077910799707", badge: "IIT Certified" },
  { name: "Programming in Java", org: "NPTEL (IIT)", weeks: 12, period: "Jan – Apr 2025", score: null, verify: "https://nptel.ac.in/noc/E_Certificate/NPTEL25CS57S114840034704432631", badge: "Elite Certified" },
];

// Quick course completions (chip/tag layout — no score)
const CERTS_COURSES = [
  { name: "Machine Learning with Python", org: "IBM", verify: "https://drive.google.com/file/d/1EfBRGrMfajqCaYVWtkXOr6DqS7H-syBv/view?usp=sharing" },
  { name: "Intermediate Machine Learning", org: "Kaggle", verify: "https://drive.google.com/file/d/1mQ3gHFaULPRz9MbnKlHpeBHhbJRpjaXB/view?usp=sharing" },
  { name: "DBMS – Master the Fundamentals & Advanced Topics", org: "Scaler", verify: "https://drive.google.com/file/d/1MOWPD_XRDOGUFiJ6-b79kAJHLpI8twgD/view?usp=sharing" },
  { name: "Intermediate SQL", org: "Sololearn", verify: "https://drive.google.com/file/d/1WwmCJJ6ASE9BnXVR55CgufRiRUTa0yid/view?usp=sharing" },
];

const LEADERSHIP_DATA = [
  { role: "AICTE Idea Lab Ambassador — IoT & 3D Modelling Lead", org: "AICTE Idea Lab · Kalyani", period: "May 2024 – Present" },
  { role: "Core Team Member", org: "Risers Cre8", period: "Dec 2023 – Present" },
  { role: "Event Organiser — InnovoCon 2025", org: "12-hour 3D Modelling Hackathon", period: "27–28 Feb 2025" },
];

const NAV = [
  { id: "overview", label: "Overview", Icon: Globe },
  { id: "about", label: "About Me", Icon: User },
  { id: "projects", label: "Projects", Icon: Code },
  { id: "skills", label: "Skills & Tools", Icon: Zap },
  { id: "experience", label: "Experience", Icon: Briefcase },
  { id: "initiatives", label: "Focus & Events", Icon: Rocket },
  { id: "certifications", label: "Certifications", Icon: GraduationCap },
  { id: "contact", label: "Contact", Icon: Mail },
];

const NAV_IDS = NAV.map(n => n.id);

// ─────────────────────────────────────────────
// TYPING ANIMATION
// ─────────────────────────────────────────────
const TYPING_PREFIX = "I build ";
const TYPING_STRINGS = [
  "AI that protects endangered wildlife.",
  "rescue drones to find trapped victims.",
  "smart health monitors for eating disorders.",
  "computer vision with 82% field accuracy.",
  "IoT systems from Arduino to Raspberry Pi.",
  "GenAI solutions that save 10 hrs/week.",
];

function TypingAnimation({ t }) {
  const [stringIdx, setStringIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const current = TYPING_STRINGS[stringIdx];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2200);
      return () => clearTimeout(pauseTimer);
    }

    if (!isDeleting && charIdx === current.length) {
      const pTimer = setTimeout(() => {
        setIsPaused(true);
      }, 0);
      return () => clearTimeout(pTimer);
    }

    if (isDeleting && charIdx === 0) {
      const dTimer = setTimeout(() => {
        setIsDeleting(false);
        setStringIdx((prev) => (prev + 1) % TYPING_STRINGS.length);
      }, 0);
      return () => clearTimeout(dTimer);
    }

    const speed = isDeleting ? 28 : 55 + Math.random() * 35;
    const timer = setTimeout(() => {
      setCharIdx((prev) => prev + (isDeleting ? -1 : 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, isPaused, stringIdx]);

  const displayed = TYPING_STRINGS[stringIdx].substring(0, charIdx);

  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit",
    }}>
      <span style={{ color: t.textMuted }}>{TYPING_PREFIX}</span>
      <span style={{ color: t.accent }}>{displayed}</span>
      <span style={{
        display: "inline-block", width: 2, height: "1.1em",
        marginLeft: 1, background: t.accent,
        verticalAlign: "text-bottom",
        animation: "cursorBlink 0.75s step-end infinite",
      }} />
    </span>
  );
}

// ─────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────
// (Dots component removed — Skills now uses tag chips)

function Tag({ label, t }) {
  return (
    <span className="tag-hover" style={{
      display: "inline-block", padding: "4px 11px", borderRadius: 999,
      background: t.badge, border: `1px solid ${t.border}`,
      color: t.name === "Meadow" ? t.accent : t.accentSub, fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
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
  const isLight = t.name === "Meadow";
  return (
    <div className={`card-hover glass-card ${className}`} style={{
      position: "relative",
      background: `linear-gradient(135deg, ${t.card}, ${t.glassBg})`,
      border: `1px solid ${t.border}`,
      borderTop: `1px solid ${t.glassHighlight}`,
      borderRadius: 18, padding: 20, overflow: "hidden", minWidth: 0, wordBreak: "break-word",
      backdropFilter: "blur(28px) saturate(1.6)",
      WebkitBackdropFilter: "blur(28px) saturate(1.6)",
      boxShadow: isLight
        ? `inset 0 1px 0 0 ${t.glassHighlight}, 0 10px 30px rgba(22,101,52,0.06), 0 1px 4px rgba(0,0,0,0.03)`
        : `inset 0 1px 0 0 ${t.glassHighlight}, inset 0 0 30px rgba(255,255,255,0.02), 0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)`,
      ...style,
    }}>
      {children}
      {/* Bottom accent line — reveals on hover */}
      <div className="card-accent-line" style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${t.accent}, ${t.gold})`,
        transform: "scaleX(0)", transformOrigin: "left",
        transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// RECRUITER PITCH MODAL
// ─────────────────────────────────────────────
function RecruiterPitchModal({ isOpen, onClose, t }) {
  if (!isOpen) return null;
  const isLight = t.name === "Meadow";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: t.modalBackdrop,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-in glass-card"
        style={{
          width: "100%",
          maxWidth: 640,
          maxHeight: "90vh",
          overflowY: "auto",
          background: t.modalCard,
          border: `1px solid ${t.gold}66`,
          borderTop: `2px solid ${t.gold}`,
          borderRadius: 22,
          padding: 24,
          backdropFilter: "blur(32px) saturate(1.8)",
          WebkitBackdropFilter: "blur(32px) saturate(1.8)",
          boxShadow: isLight
            ? "0 24px 60px rgba(22,101,52,0.15), 0 4px 20px rgba(0,0,0,0.06)"
            : `0 24px 70px rgba(0,0,0,0.6), 0 0 40px ${t.accent}22`,
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "3px 10px", borderRadius: 999,
              background: `${t.gold}22`, border: `1px solid ${t.gold}55`,
              color: t.gold, fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8,
            }}>
              <Sparkles size={11} /> 30-Second Executive Pitch
            </div>
            <h2 style={{
              fontSize: "1.5rem", fontWeight: 900, color: t.text, margin: 0,
              fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em",
            }}>
              Sagar Shaw — AI & Systems Engineer
            </h2>
            <div style={{ fontSize: 12, color: t.accentSub, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
              JIS College of Engineering, Kalyani · Dual Patents · FastMCP & Edge AI
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: t.surface, border: `1px solid ${t.border}`,
              color: t.textMuted, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .2s",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 3 Value Pillars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {/* Pillar 1 */}
          <div style={{
            padding: "14px 16px", borderRadius: 14,
            background: t.surface, border: `1px solid ${t.border}`,
            borderLeft: `3px solid ${t.gold}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <Terminal size={14} color={t.gold} />
              <span style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif" }}>
                1. Agentic AI & Autonomous Commerce
              </span>
            </div>
            <p style={{ fontSize: 12, color: t.textSub, lineHeight: 1.6, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Engineered the <strong>7-tool FastMCP merchant gateway</strong> turning Indian D2C catalogs into semantic vector APIs with Hinglish intent resolution. ChromaDB retrieval (<strong>sub-10ms</strong>), deterministic <strong>NPCI UAP ₹2,000 spending cap</strong> with human consent gates, immutable SQLite WAL audit trail, and Claude 3.5 &amp; Gemini 3.5 Flash tool calling with <strong>17/17 pytest pass rate</strong>.
            </p>
          </div>

          {/* Pillar 2 */}
          <div style={{
            padding: "14px 16px", borderRadius: 14,
            background: t.surface, border: `1px solid ${t.border}`,
            borderLeft: `3px solid ${t.accent}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <Award size={14} color={t.accent} />
              <span style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif" }}>
                2. Patented Edge Computer Vision & Robotics
              </span>
            </div>
            <p style={{ fontSize: 12, color: t.textSub, lineHeight: 1.6, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Co-invented the <strong>Arachnid Hexapod Robot (ARC)</strong> with <strong>2 official Government of India patents</strong> (Design Reg. 467786-001 & Invention App. 202531071175 A). Built custom PyTorch/YOLOv8 wildlife pipelines (<strong>82% precision, 9 species</strong>) and <strong>1.4 FPS in-browser ONNX vision</strong> for rescue drones.
            </p>
          </div>

          {/* Pillar 3 */}
          <div style={{
            padding: "14px 16px", borderRadius: 14,
            background: t.surface, border: `1px solid ${t.border}`,
            borderLeft: `3px solid ${isLight ? "#0284c7" : "#38bdf8"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <Rocket size={14} color={isLight ? "#0284c7" : "#38bdf8"} />
              <span style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif" }}>
                3. Production Web & Full-Stack Systems
              </span>
            </div>
            <p style={{ fontSize: 12, color: t.textSub, lineHeight: 1.6, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Architected <strong>AI Engineer OS</strong> on Next.js 16 App Router, React 19, Supabase PostgreSQL, Prisma ORM, and connection pooling for <strong>0ms cold starts</strong>. Achieved <strong>100% Lighthouse PWA benchmark score</strong>.
            </p>
          </div>
        </div>

        {/* Availability Strip */}
        <div style={{
          padding: "10px 14px", borderRadius: 12,
          background: `${t.accent}15`, border: `1px solid ${t.accent}44`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 8, marginBottom: 18,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: t.text, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span>Open for SDE / AI / ML Full-Time Roles (2027)</span>
          </div>
          <span style={{ fontSize: 11, color: t.accentSub, fontFamily: "'JetBrains Mono', monospace" }}>
            Remote & On-Site / Relocation Ready
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="mailto:sagarshaw.jisce@gmail.com"
            style={{
              flex: 1, minWidth: 140, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px 16px", borderRadius: 10,
              background: `linear-gradient(135deg, ${t.accent}, ${t.accentSub})`,
              color: "#fff", fontSize: 12, fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace", textDecoration: "none",
              boxShadow: `0 4px 16px ${t.accent}44`,
            }}
          >
            <Mail size={13} /> Email Sagar Directly
          </a>
          <a
            href="/resume.pdf"
            download="Sagar_Shaw_Resume.pdf"
            style={{
              flex: 1, minWidth: 140, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px 16px", borderRadius: 10,
              background: t.surface, border: `1px solid ${t.border}`,
              color: t.text, fontSize: 12, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace", textDecoration: "none",
            }}
          >
            <Download size={13} /> Download Resume
          </a>
          <a
            href="https://www.linkedin.com/in/sagar-shaw-79701138a"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px 16px", borderRadius: 10,
              background: t.surface, border: `1px solid ${t.border}`,
              color: t.textSub, fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace", textDecoration: "none",
            }}
          >
            <LinkedinIcon size={13} /> LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMMAND PALETTE (RECRUITER COCKPIT)
// ─────────────────────────────────────────────
function CommandPalette({
  isOpen, onClose, t, theme, setTheme,
  navigate, onOpenPitch, onSelectProject,
}) {
  const isLight = t.name === "Meadow";
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery("");
        setSelectedIdx(0);
        inputRef.current?.focus();
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const items = [
    {
      id: "pitch",
      category: "Executive Signals",
      title: "30-Second Recruiter Pitch",
      desc: "Fast executive summary: FastMCP, edge vision, patents & production metrics",
      icon: Sparkles,
      action: () => { onClose(); onOpenPitch(); },
    },
    {
      id: "resume-view",
      category: "Executive Signals",
      title: "View Official Resume",
      desc: "Opens Sagar_Shaw_Resume.pdf in browser",
      icon: FileText,
      action: () => { window.open("/resume.pdf", "_blank"); onClose(); },
    },
    {
      id: "resume-dl",
      category: "Executive Signals",
      title: "Download Resume (PDF)",
      desc: "Direct download of Sagar_Shaw_Resume.pdf",
      icon: Download,
      action: () => {
        const a = document.createElement("a");
        a.href = "/resume.pdf";
        a.download = "Sagar_Shaw_Resume.pdf";
        a.click();
        onClose();
      },
    },
    {
      id: "copy-email",
      category: "Executive Signals",
      title: "Copy Email Address",
      desc: "sagarshaw.jisce@gmail.com",
      icon: Copy,
      action: () => {
        navigator.clipboard.writeText("sagarshaw.jisce@gmail.com");
        setToast("Email copied to clipboard!");
        setTimeout(() => setToast(null), 2500);
      },
    },
    {
      id: "patents",
      category: "Intellectual Property",
      title: "Inspect Dual Government Patents",
      desc: "Design No. 467786-001 & Invention App. 202531071175 A",
      icon: Award,
      action: () => {
        navigate("projects");
        onSelectProject(1);
        onClose();
      },
    },
    {
      id: "proj-merchant",
      category: "Case Studies",
      title: "Merchant AI Readability & Autonomous Commerce",
      desc: "7-tool FastMCP server, ChromaDB vector search (sub-10ms), NPCI UAP spending gate, Claude 3.5 & Gemini 3.5",
      icon: Terminal,
      action: () => {
        navigate("projects");
        onSelectProject(0);
        onClose();
      },
    },
    {
      id: "proj-spider",
      category: "Case Studies",
      title: "Arachnid — Bio-Inspired Spider Robot (ARC)",
      desc: "Dual patents, YOLOv8 9-species wildlife vision, Arduino + RPi4, Live Streamlit",
      icon: Cpu,
      action: () => {
        navigate("projects");
        onSelectProject(1);
        onClose();
      },
    },
    {
      id: "proj-jivan",
      category: "Case Studies",
      title: "JIVAN — Rescue Drone AI",
      desc: "1.4 FPS in-browser client ONNX inference, risk scoring, RGB/Thermal fusion",
      icon: Drone,
      action: () => {
        navigate("projects");
        onSelectProject(3);
        onClose();
      },
    },
    {
      id: "proj-task-tracker",
      category: "Case Studies",
      title: "AI Engineer OS — Personal Productivity PWA",
      desc: "Next.js 16, Supabase PostgreSQL, Prisma ORM, 100% Lighthouse PWA",
      icon: Rocket,
      action: () => {
        navigate("projects");
        onSelectProject(4);
        onClose();
      },
    },
    {
      id: "proj-intellieat",
      category: "Case Studies",
      title: "IntelliEat Monitoring System",
      desc: "IoT smart plate sensors, scikit-learn eating disorder detection (85% precision)",
      icon: Activity,
      action: () => {
        navigate("projects");
        onSelectProject(2);
        onClose();
      },
    },
    {
      id: "nav-overview",
      category: "Navigation",
      title: "Go to Overview / Home",
      desc: "Executive bio, 3D tilt card, core stats",
      icon: Globe,
      action: () => { navigate("overview"); onClose(); },
    },
    {
      id: "nav-about",
      category: "Navigation",
      title: "Go to About Me",
      desc: "Background, education, patents & leadership",
      icon: User,
      action: () => { navigate("about"); onClose(); },
    },
    {
      id: "nav-projects",
      category: "Navigation",
      title: "Go to Projects Section",
      desc: "Case studies, system architectures & production metrics",
      icon: Code,
      action: () => { navigate("projects"); onClose(); },
    },
    {
      id: "nav-skills",
      category: "Navigation",
      title: "Go to Tech Arsenal & Skills",
      desc: "Languages, AI/ML frameworks, tools & live marquee",
      icon: Zap,
      action: () => { navigate("skills"); onClose(); },
    },
    {
      id: "nav-experience",
      category: "Navigation",
      title: "Go to Experience",
      desc: "AI/ML Engineer internship at Confitech Solutions",
      icon: Briefcase,
      action: () => { navigate("experience"); onClose(); },
    },
    {
      id: "nav-initiatives",
      category: "Navigation",
      title: "Go to Focus & Initiatives",
      desc: "Active R&D pipelines, drone vision, Risers Cre8",
      icon: Rocket,
      action: () => { navigate("initiatives"); onClose(); },
    },
    {
      id: "nav-certs",
      category: "Navigation",
      title: "Go to Certifications",
      desc: "SAP Certified ABAP Cloud, NPTEL AI & NLP, IBM ML",
      icon: GraduationCap,
      action: () => { navigate("certifications"); onClose(); },
    },
    {
      id: "nav-contact",
      category: "Navigation",
      title: "Go to Contact",
      desc: "Direct contact info & message form",
      icon: Mail,
      action: () => { navigate("contact"); onClose(); },
    },
    {
      id: "toggle-theme",
      category: "Appearance",
      title: `Switch Theme to ${theme === "midnight" ? "Meadow (Light)" : "Forest (Dark)"}`,
      desc: `Currently using ${theme === "midnight" ? "Forest (Obsidian Emerald)" : "Meadow (Light)"}`,
      icon: theme === "midnight" ? Sun : Moon,
      action: () => {
        setTheme(th => th === "midnight" ? "matinee" : "midnight");
        onClose();
      },
    },
  ];

  const filtered = items.filter(it =>
    it.title.toLowerCase().includes(query.toLowerCase()) ||
    it.desc.toLowerCase().includes(query.toLowerCase()) ||
    it.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(i => (i + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(i => (i - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIdx]) {
        filtered[selectedIdx].action();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: t.modalBackdrop,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px 16px 20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="fade-in glass-card"
        style={{
          width: "100%",
          maxWidth: 580,
          background: t.modalCard,
          border: `1px solid ${t.border}`,
          borderTop: `1px solid ${t.glassHighlight}`,
          borderRadius: 18,
          overflow: "hidden",
          backdropFilter: "blur(32px) saturate(1.8)",
          WebkitBackdropFilter: "blur(32px) saturate(1.8)",
          boxShadow: isLight
            ? "0 20px 50px rgba(22,101,52,0.12), 0 2px 10px rgba(0,0,0,0.06)"
            : `0 24px 60px rgba(0,0,0,0.5), 0 0 35px ${t.accent}20`,
        }}
      >
        {/* Search Bar Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          borderBottom: `1px solid ${t.border}`,
          background: t.surface,
        }}>
          <Search size={17} color={t.accent} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search projects, patents, skills... (↑↓ to select)"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: t.text,
              fontSize: 14,
              fontFamily: "'Outfit', sans-serif",
            }}
          />
          <span style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: t.textMuted,
            padding: "2px 6px",
            borderRadius: 5,
            background: t.badge,
            border: `1px solid ${t.border}`,
          }}>
            ESC to close
          </span>
        </div>

        {/* Toast notification if active */}
        {toast && (
          <div style={{
            padding: "8px 16px",
            background: isLight ? "rgba(21, 128, 61, 0.1)" : "#22c55e22",
            color: isLight ? "#15803d" : "#22c55e",
            fontSize: 11.5,
            fontFamily: "'JetBrains Mono', monospace",
            borderBottom: `1px solid ${isLight ? "rgba(21, 128, 61, 0.25)" : "#22c55e44"}`,
            textAlign: "center",
          }}>
            ✓ {toast}
          </div>
        )}

        {/* List of actions */}
        <div style={{ maxHeight: 360, overflowY: "auto", padding: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "28px 16px", textAlign: "center", color: t.textMuted, fontSize: 13 }}>
              No commands or case studies matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIdx;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: isSelected ? t.navActive : "transparent",
                    border: isSelected ? `1px solid ${t.accent}44` : "1px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: isSelected ? (isLight ? "rgba(21, 128, 61, 0.12)" : `linear-gradient(135deg, ${t.accent}33, ${t.accentSub}22)`) : t.surface,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: isSelected ? t.accent : t.textMuted,
                  }}>
                    <Icon size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? t.accent : t.text, fontFamily: "'Outfit', sans-serif" }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: 9.5, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
                        {item.category}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.accent, padding: "2px 6px", borderRadius: 4, background: `${t.accent}20` }}>
                      ↵ Enter
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: "8px 16px",
          borderTop: `1px solid ${t.border}`,
          background: t.surface,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 10.5,
          color: t.textMuted,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>Recruiter Cockpit v2.5</span>
          <span>Press ↑↓ to navigate · ↵ to run</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PATENTS SPOTLIGHT COMPONENT
// ─────────────────────────────────────────────
function PatentsSpotlight({ t }) {
  const isLight = t.name === "Meadow";
  const [copied, setCopied] = useState(null);

  const copyPatent = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{
      marginBottom: 24,
      borderRadius: 18,
      background: isLight ? "rgba(255, 255, 255, 0.95)" : `linear-gradient(135deg, ${t.card}, ${t.glassBg})`,
      border: `1px solid ${t.gold}55`,
      borderTop: `2px solid ${t.gold}`,
      padding: "20px 22px",
      backdropFilter: "blur(28px) saturate(1.6)",
      WebkitBackdropFilter: "blur(28px) saturate(1.6)",
      boxShadow: isLight
        ? "0 10px 32px rgba(180,83,9,0.08), 0 2px 8px rgba(0,0,0,0.04)"
        : `0 12px 40px rgba(0,0,0,0.2), 0 0 30px ${t.gold}15`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background radial accent */}
      <div style={{
        position: "absolute", top: -50, right: -50, width: 180, height: 180,
        borderRadius: "50%", background: `radial-gradient(circle, ${t.gold}25, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 999,
            background: `${t.gold}18`, border: `1px solid ${t.gold}44`,
            color: t.gold, fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6,
          }}>
            <Award size={12} /> Official Intellectual Property & Patents
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: t.text, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Dual Patents Granted & Published — Government of India
          </h2>
          <p style={{ fontSize: 12, color: t.textSub, margin: "4px 0 0", fontFamily: "'Outfit', sans-serif" }}>
            Certified biomimetic robotics hardware and ground surveillance intellectual property issued by The Patent Office, Govt. of India.
          </p>
        </div>
        <span style={{
          fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: t.gold, fontWeight: 700,
          padding: "4px 10px", borderRadius: 8, background: `${t.gold}15`, border: `1px solid ${t.gold}33`,
        }}>
          1 Grant · 1 Published
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {/* Patent 1: Design Patent */}
        <div style={{
          padding: 16, borderRadius: 14, background: isLight ? "#ffffff" : t.surface,
          border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{
                fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                color: isLight ? "#15803d" : "#22c55e",
                background: isLight ? "rgba(21, 128, 61, 0.08)" : "#22c55e18",
                padding: "2px 8px", borderRadius: 6,
                border: isLight ? "1px solid rgba(21, 128, 61, 0.25)" : "1px solid #22c55e44",
              }}>
                ✓ REGISTERED DESIGN PATENT
              </span>
              <button
                onClick={() => copyPatent("467786-001", "p1")}
                style={{
                  background: "none", border: "none", color: t.textMuted, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {copied === "p1" ? <Check size={11} color="#22c55e" /> : <Copy size={11} />}
                {copied === "p1" ? "Copied" : "Copy No."}
              </button>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
              Spider Arachnid Ground Habitat Exploration Mechanism
            </div>
            <div style={{ fontSize: 11, color: t.gold, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, marginBottom: 8 }}>
              Design No: 467786-001 · Class 15-99 · Certificate No: 197282
            </div>
            <p style={{ fontSize: 11.5, color: t.textSub, lineHeight: 1.55, margin: "0 0 10px", fontFamily: "'Outfit', sans-serif" }}>
              Official Design Patent granted by the Controller General of Patents, Designs and Trade Marks, Govt. of India. Protects novel hexapod chassis, multi-axial articulation, and terrain-adaptive mobility kinematics.
            </p>
          </div>
          <div style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: t.textMuted, borderTop: `1px solid ${t.border}`, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Reg Date: 09/01/2026</span>
            <span>Authority: Govt. of India</span>
          </div>
        </div>

        {/* Patent 2: Invention Patent */}
        <div style={{
          padding: 16, borderRadius: 14, background: isLight ? "#ffffff" : t.surface,
          border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{
                fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                color: t.gold, background: `${t.gold}18`, padding: "2px 8px", borderRadius: 6, border: `1px solid ${t.gold}44`,
              }}>
                ⚡ PUBLISHED INVENTION PATENT
              </span>
              <button
                onClick={() => copyPatent("202531071175 A", "p2")}
                style={{
                  background: "none", border: "none", color: t.textMuted, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {copied === "p2" ? <Check size={11} color="#22c55e" /> : <Copy size={11} />}
                {copied === "p2" ? "Copied" : "Copy No."}
              </button>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
              Arachnid Research Companion (ARC): Biomimetic Platform
            </div>
            <div style={{ fontSize: 11, color: t.gold, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, marginBottom: 8 }}>
              App No: 202531071175 A · IPO Journal No. 31/2025
            </div>
            <p style={{ fontSize: 11.5, color: t.textSub, lineHeight: 1.55, margin: "0 0 10px", fontFamily: "'Outfit', sans-serif" }}>
              Comprehensive utility invention published in the Official Patent Office Journal for ground-level environmental telemetry, endangered wildlife computer vision (YOLOv8 9-species pipeline), and sensor fusion.
            </p>
          </div>
          <div style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: t.textMuted, borderTop: `1px solid ${t.border}`, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Pub Date: 01/08/2025</span>
            <span>Journal: 31/2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OVERVIEW
// ─────────────────────────────────────────────
function Overview({ t, setPitchOpen, setPaletteOpen }) {
  const cgpa = (SGPA_DATA.reduce((s, d) => s + d.sgpa, 0) / SGPA_DATA.length).toFixed(2);
  const stats = [
    { val: cgpa, label: "CGPA", sub: `Best SGPA: ${Math.max(...SGPA_DATA.map(d => d.sgpa))}` },
    { val: "2", label: "Patents", sub: "Reg. 467786-001 & 202531071175 A" },
    { val: "1", label: "Internships", sub: "AI/ML focused" },
    { val: "8", label: "Certifications", sub: "NPTEL, SAP, IBM & more" },
  ];
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [cardMode, setCardMode] = useState("photo");

  const handleMouse = (e) => {
    if (!cardRef.current || cardMode === "particle") return;
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
              perspective: 600, flexShrink: 1, minWidth: 160, maxWidth: 240, width: "100%",
            }}
          >
            <div style={{
              width: "100%", maxWidth: 240, borderRadius: 22, overflow: "hidden",
              transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
              transition: "transform 0.15s ease-out",
              background: t.name === "Meadow" ? "rgba(255, 255, 255, 0.92)" : `linear-gradient(135deg, ${t.card}, ${t.glassBg})`,
              border: `1px solid ${t.border}`,
              borderTop: `1px solid ${t.glassHighlight}`,
              backdropFilter: "blur(24px) saturate(1.5)",
              WebkitBackdropFilter: "blur(24px) saturate(1.5)",
              boxShadow: t.name === "Meadow"
                ? `0 16px 40px rgba(22,101,52,0.08), 0 2px 8px rgba(0,0,0,0.04)`
                : `0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 ${t.glassHighlight}, 0 0 50px ${t.accent}18`,
              position: "relative",
            }}>
              {/* Mode toggle button */}
              <button
                onClick={(e) => { e.stopPropagation(); setCardMode(m => m === "photo" ? "particle" : "photo"); }}
                title="Toggle Interactive Particle Mode"
                style={{
                  position: "absolute", top: 10, right: 10, zIndex: 10,
                  fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                  padding: "3px 8px", borderRadius: 999,
                  background: t.name === "Meadow" ? "rgba(255, 255, 255, 0.88)" : "rgba(0,0,0,0.65)",
                  color: t.name === "Meadow" ? t.accent : t.gold,
                  border: `1px solid ${t.name === "Meadow" ? "rgba(22, 101, 52, 0.22)" : "rgba(255,255,255,0.2)"}`,
                  boxShadow: t.name === "Meadow" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  backdropFilter: "blur(8px)",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 3,
                  transition: "all 0.2s ease"
                }}
              >
                {cardMode === "photo" ? "✦ Particles" : "📷 Photo"}
              </button>

              {/* Shine effect */}
              <div style={{
                position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
                background: `linear-gradient(${105 + tilt.x * 3}deg, transparent 30%, ${t.glassHighlight} 50%, transparent 70%)`,
                opacity: t.name === "Meadow" ? 0.12 : 0.45,
              }} />
              {cardMode === "photo" ? (
                <div style={{ position: "relative", width: "100%", overflow: "hidden", borderBottom: `1px solid ${t.border}` }}>
                  <img
                    src="/profile1.png"
                    alt="Sagar Shaw"
                    style={{
                      width: "100%", aspectRatio: "240/270",
                      objectFit: "cover", objectPosition: "center 20%",
                      display: "block",
                    }}
                  />
                  {t.name !== "Meadow" && (
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, height: 42,
                      background: `linear-gradient(to bottom, transparent, ${t.card})`,
                      pointerEvents: "none",
                    }} />
                  )}
                </div>
              ) : (
                <ImageParticleCanvas src="/profile1.png" t={t} />
              )}
              <div style={{ padding: "14px 16px 16px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                  {["AI/ML", "Computer Vision", "IoT", "GenAI", "Deep Learning"].map(tag => (
                    <span key={tag} style={{
                      fontSize: 9, padding: "3px 9px", borderRadius: 999,
                      background: t.badge, color: t.name === "Meadow" ? t.accent : t.accentSub, border: `1px solid ${t.border}`,
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                    }}>{tag}</span>
                  ))}
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-around",
                  padding: "10px 0 4px", borderTop: `1px solid ${t.border}`,
                }}>
                  {[
                    { v: "6", l: "Projects" },
                    { v: "1", l: "Interns" },
                    { v: "2", l: "Patents" },
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
            <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5, marginBottom: 8, fontWeight: 500, minHeight: 20 }}>
              <TypingAnimation t={t} />
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
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="link-hover" style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                  background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
                  color: t.textSub, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                  backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                }}><Icon size={13} />{label}</a>
              ))}
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="link-hover" style={{
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
              <button
                onClick={() => setPitchOpen(true)}
                className="link-hover"
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                  background: `linear-gradient(135deg, ${t.gold}28, ${t.goldLight}15)`,
                  border: `1px solid ${t.gold}66`, borderRadius: 10,
                  color: t.gold, fontSize: 12, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
                  backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                  boxShadow: `0 0 16px ${t.gold}22`,
                }}
              >
                <Sparkles size={13} /> 30-Sec Pitch
              </button>
            </div>
          </div>
        </div>

        {/* Executive Proof-of-Work Impact Strip */}
        <div style={{
          marginTop: 8,
          marginBottom: 22,
          padding: "12px 16px",
          borderRadius: 14,
          background: t.name === "Meadow" ? "rgba(255, 255, 255, 0.92)" : `linear-gradient(135deg, ${t.surface}, ${t.card})`,
          border: `1px solid ${t.border}`,
          borderLeft: `3px solid ${t.accent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: t.accent, fontWeight: 700, letterSpacing: 1 }}>
              HARD SIGNALS
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, padding: "3px 9px", borderRadius: 999, background: `${t.gold}18`, color: t.gold, border: `1px solid ${t.gold}44`, fontFamily: "'JetBrains Mono', monospace" }}>
              <Award size={12} /> 2 Govt. Patents
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, padding: "3px 9px", borderRadius: 999, background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}33`, fontFamily: "'JetBrains Mono', monospace" }}>
              <Activity size={12} /> Sub-10ms Search
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, padding: "3px 9px", borderRadius: 999, background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}33`, fontFamily: "'JetBrains Mono', monospace" }}>
              <ShieldCheck size={12} /> 17/17 Pytests Pass
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, padding: "3px 9px", borderRadius: 999, background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}33`, fontFamily: "'JetBrains Mono', monospace" }}>
              <Zap size={12} /> 1.4 FPS On-Device ONNX
            </span>
          </div>
          <button
            onClick={() => setPaletteOpen(true)}
            className="link-hover"
            style={{
              fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
              color: t.accent, background: t.surface, border: `1px solid ${t.accent}44`,
              borderRadius: 8, padding: "5px 12px", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600,
            }}
          >
            <Command size={12} /> ⌘K Cockpit
          </button>
        </div>
      </RevealOnMount>

      <RevealOnMount delay={150}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12, marginBottom: 18 }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,340px)", gap: 20, alignItems: "start" }}
        className="about-grid">
        <div>
          {[
            "I'm a Computer Science Engineering student specializing in AI & ML at JIS College of Engineering, Kalyani, expected to graduate in June 2027. My work spans computer vision for wildlife conservation, IoT-integrated health monitoring, and generative AI application development.",
            "I hold two patents (Registered Design Patent No. 467786-001 & Invention App. 202531071175 A) for Arachnid — a bio-inspired hexapod robotic system using computer vision and deep learning to track endangered species in natural habitats. I also lead IntelliEat, an IoT-enabled system that applies AI to detect behavioral patterns linked to eating disorders.",
            "I bring hands-on industry experience from my AI/ML internship at Confitech Solutions, building GenAI-powered applications with OpenAI and Azure. Beyond engineering, I serve as an AICTE Idea Lab Ambassador and co-founded Risers Cre8 (formerly The Risers).",
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
              ["Design Reg.", "467786-001 (Class 15-99)"], ["Invention App.", "202531071175 A"],
              ["Expected Grad.", "June 2027"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, marginBottom: 9, alignItems: "center" }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.textMuted, minWidth: 85, flexShrink: 0 }}>{k}</div>
                <div style={{ fontSize: 12, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {k === "Email" ? (
                    <a href={`mailto:${v}`} style={{ color: t.text, textDecoration: "none", transition: "color .2s" }} onMouseEnter={e => e.currentTarget.style.color = t.accentSub} onMouseLeave={e => e.currentTarget.style.color = t.text}>
                      {v}
                    </a>
                  ) : v}
                </div>
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

/* TechMarquee ─ Infinite dual-row scrolling technology ticker (extracted from brutalist-void template) */
function TechMarquee({ t }) {
  const row1 = ["PYTHON", "FASTMCP", "NEXT.JS 16", "TYPESCRIPT", "CHROMADB", "GEMINI API", "ANTHROPIC", "OPENCV", "TENSORFLOW", "PYTORCH", "YOLO", "ROS / IOT", "REACT", "FLASK", "SUPABASE", "SQL"];
  const row2 = ["AGENTIC COMMERCE", "COMPUTER VISION", "GENERATIVE AI", "DEEP LEARNING", "RESCUE DRONES", "HEALTH MONITORING", "EMBEDDED IOT", "PATENTED ROBOTICS"];

  const renderRow = (items, direction) => {
    const list = [...items, ...items, ...items, ...items];
    return (
      <div style={{ overflow: "hidden", padding: "6px 0", whiteSpace: "nowrap" }}>
        <div style={{
          display: "inline-flex",
          gap: 20,
          animation: `${direction === "left" ? "marqueeLeft" : "marqueeRight"} 28s linear infinite`,
        }}>
          {list.map((item, idx) => (
            <span
              key={idx}
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "0.04em",
                color: "transparent",
                WebkitTextStroke: `1px ${t.border}`,
                transition: "all 0.3s ease",
                cursor: "default",
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = t.gold;
                e.currentTarget.style.WebkitTextStroke = "none";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "transparent";
                e.currentTarget.style.WebkitTextStroke = `1px ${t.border}`;
              }}
            >
              {item}
              <span style={{ color: t.textMuted, opacity: 0.3, fontSize: "0.9rem" }}>•</span>
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: 24, padding: "16px 0", borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}>
      <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.gold, letterSpacing: 2, marginBottom: 10, fontWeight: 600, textTransform: "uppercase" }}>
        03 — Tech Arsenal
      </div>
      {renderRow(row1, "left")}
      {renderRow(row2, "right")}
    </div>
  );
}

// ─────────────────────────────────────────────
// PROJECTS (CASE STUDY EXPLORER)
// ─────────────────────────────────────────────
function Projects({ t, activeProjectIdx, setActiveProjectIdx }) {
  const [open, setOpen] = useState(activeProjectIdx ?? 0);
  const [prevActiveIdx, setPrevActiveIdx] = useState(activeProjectIdx);
  const [filter, setFilter] = useState('All');
  const [activeTabs, setActiveTabs] = useState({});

  if (activeProjectIdx !== prevActiveIdx) {
    setPrevActiveIdx(activeProjectIdx);
    setOpen(activeProjectIdx ?? 0);
  }

  const categories = [
    'All',
    'Agentic AI & FastMCP',
    'Computer Vision & Drones',
    'Robotics & IoT',
    'Full-Stack Web',
  ];

  const filtered = filter === 'All'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter(p => p.category.includes(filter));

  const getActiveTab = (idx) => activeTabs[idx] || 'arch';
  const setTab = (idx, tab) => setActiveTabs(prev => ({ ...prev, [idx]: tab }));
  const isLight = t.name === "Meadow";

  return (
    <div>
      <PageTitle t={t} num="02">Featured Case Studies & Systems</PageTitle>

      {/* Dual Patents Spotlight */}
      <PatentsSpotlight t={t} />

      {/* Domain Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {categories.map(tab => (
          <button key={tab} onClick={() => { setFilter(tab); setOpen(-1); }} style={{
            padding: '7px 16px', borderRadius: 999, fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
            transition: 'all 0.25s',
            ...(filter === tab
              ? { background: `linear-gradient(135deg, ${t.accent}, ${t.accentSub})`, color: '#fff', fontWeight: 700, border: 'none', boxShadow: `0 0 14px ${t.accent}33` }
              : { background: isLight ? "#ffffff" : t.card, border: `1px solid ${t.border}`, color: t.textSub, backdropFilter: 'blur(8px)' }),
          }}>{tab}</button>
        ))}
      </div>

      {/* Projects List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map((p, i) => {
          const isOpen = open === i;
          const currentTab = getActiveTab(i);

          return (
            <div key={p.title} className="card-hover glass-card" style={{
              background: isLight ? (isOpen ? "#ffffff" : "rgba(255, 255, 255, 0.88)") : t.card,
              border: `1px solid ${isOpen ? (isLight ? t.accent : t.accentSub) : t.border}`,
              borderRadius: 16, overflow: "hidden", transition: "all .3s ease",
              borderLeft: isOpen ? `3px solid ${t.accent}` : `1px solid ${t.border}`,
              backdropFilter: "blur(24px) saturate(1.4)", WebkitBackdropFilter: "blur(24px) saturate(1.4)",
              boxShadow: isOpen
                ? (isLight ? "0 8px 30px rgba(22,101,52,0.08), 0 2px 8px rgba(0,0,0,0.04)" : `inset 0 1px 0 0 ${t.glassHighlight}, 0 0 28px ${t.accent}22, 0 8px 32px rgba(0,0,0,0.15)`)
                : (isLight ? "0 4px 16px rgba(22,101,52,0.04)" : `inset 0 1px 0 0 ${t.glassHighlight}, 0 4px 20px rgba(0,0,0,0.08)`),
            }}>
              {/* Sleek 1-2 Line Collapsed Box Header */}
              <button
                onClick={() => {
                  const nextOpen = isOpen ? -1 : i;
                  setOpen(nextOpen);
                  if (setActiveProjectIdx) setActiveProjectIdx(nextOpen);
                }}
                style={{
                  width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
                  background: "none", border: "none", cursor: "pointer", textAlign: "left",
                }}
              >
                {/* Chevron icon indicator */}
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: isOpen ? `linear-gradient(135deg, ${t.accent}, ${t.accentSub})` : t.surface,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .3s ease",
                  boxShadow: isOpen ? `0 0 14px ${t.accent}33` : "none",
                  border: `1px solid ${isOpen ? "transparent" : t.border}`,
                }}>
                  {isOpen ? <ChevronDown size={15} color="#fff" /> : <ChevronRight size={15} color={t.textMuted} />}
                </div>

                {/* Main 2-line Content Box */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Line 1: Title + Patent Badge (Left) & Category Badge (Right) */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1 }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700, color: isOpen ? t.accent : t.text,
                        fontFamily: "'Outfit', sans-serif",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {p.title}
                      </span>
                      {p.patentNo && (
                        <span style={{
                          fontSize: 9, padding: "1px 6px", borderRadius: 5,
                          background: `${t.gold}18`, color: t.gold, border: `1px solid ${t.gold}44`,
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, flexShrink: 0,
                        }}>
                          Patented
                        </span>
                      )}
                    </div>

                    <span style={{
                      padding: "3px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 600, flexShrink: 0,
                      background: isLight && p.badgeColor === "#c9a646" ? `${t.gold}18` : `${p.badgeColor}18`,
                      color: isLight && p.badgeColor === "#c9a646" ? t.gold : p.badgeColor,
                      border: `1px solid ${isLight && p.badgeColor === "#c9a646" ? t.gold : p.badgeColor}44`,
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: "nowrap",
                    }}>
                      {p.badge}
                    </span>
                  </div>

                  {/* Line 2: Single-line Elevator Pitch */}
                  <div style={{
                    fontSize: 12, color: t.textSub, marginTop: 3, lineHeight: 1.4,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {p.tagline || p.description}
                  </div>
                </div>
              </button>

              {/* Expanded Case Study Content */}
              {isOpen && (
                <div style={{ padding: "4px 16px 20px" }} className="fade-in">
                  {/* Executive Brief Box */}
                  <div style={{
                    padding: "14px 16px",
                    borderRadius: 13,
                    background: isLight ? "rgba(22, 101, 52, 0.04)" : "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${t.border}`,
                    borderLeft: `3px solid ${t.accent}`,
                    marginBottom: 16,
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      flexWrap: "wrap", gap: 8, marginBottom: 8,
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6, fontSize: 11,
                        color: t.accent, fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                      }}>
                        <Terminal size={13} /> Executive Project Brief
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                        fontSize: 11, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Briefcase size={12} color={t.accentSub} /> {p.role}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={12} /> {p.period}
                        </span>
                        {p.patentNo && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: t.gold, fontWeight: 600 }}>
                            <Award size={12} /> {p.patentNo}
                          </span>
                        )}
                      </div>
                    </div>

                    <p style={{
                      fontSize: 13, color: t.text, lineHeight: 1.75, margin: 0,
                      fontFamily: "'Outfit', sans-serif",
                    }}>
                      {p.description}
                    </p>

                    {/* Tech Stack Pills in Brief */}
                    <div style={{
                      display: "flex", flexWrap: "wrap", gap: 6,
                      marginTop: 12, paddingTop: 10, borderTop: `1px solid ${t.border}`,
                    }}>
                      {p.techStack.map(tech => (
                        <span key={tech} style={{
                          fontSize: 10.5, padding: "2px 8px", borderRadius: 6,
                          background: isLight ? "rgba(21, 128, 61, 0.07)" : `${t.accent}14`,
                          color: isLight ? "#15803d" : t.accent,
                          border: `1px solid ${isLight ? "rgba(21, 128, 61, 0.2)" : `${t.accent}33`}`,
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                        }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sub-tab Navigation */}
                  <div style={{
                    display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16,
                    background: t.surface, padding: 4, borderRadius: 10, border: `1px solid ${t.border}`,
                  }}>
                    {[
                      { id: "arch", label: "Architecture & Dataflow", Icon: Workflow },
                      { id: "metrics", label: "Production Metrics", Icon: Activity },
                      { id: "features", label: "Engineering Features", Icon: Zap },
                      { id: "links", label: "Code & Artifacts", Icon: GitBranch },
                    ].map(({ id, label, Icon }) => {
                      const active = currentTab === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setTab(i, id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "6px 12px", borderRadius: 7, border: "none",
                            background: active ? (isLight ? "rgba(21, 128, 61, 0.1)" : `linear-gradient(135deg, ${t.accent}25, ${t.accentSub}15)`) : "transparent",
                            color: active ? t.accent : t.textSub,
                            fontSize: 11.5, fontWeight: active ? 700 : 500,
                            fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
                            transition: "all .2s ease",
                            boxShadow: active ? `0 0 10px ${t.accent}15` : "none",
                          }}
                        >
                          <Icon size={13} />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab 1: Architecture */}
                  {currentTab === "arch" && p.architecture && (
                    <div className="fade-in">
                      <p style={{ fontSize: 13, color: t.textSub, lineHeight: 1.6, marginBottom: 14, fontFamily: "'Outfit', sans-serif" }}>
                        {p.architecture.summary}
                      </p>

                      {/* Visual Flow Nodes */}
                      <div style={{
                        display: "flex", flexDirection: "column", gap: 8, marginBottom: 14,
                      }}>
                        {p.architecture.pipeline.map((step) => (
                          <div
                            key={step.step}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 12,
                              padding: "10px 14px", borderRadius: 10,
                              background: isLight ? "#ffffff" : t.surface, border: `1px solid ${t.border}`,
                            }}
                          >
                            <span style={{
                              fontSize: 10, fontWeight: 800, color: t.accent,
                              fontFamily: "'JetBrains Mono', monospace", padding: "2px 6px",
                              borderRadius: 4, background: `${t.accent}18`, flexShrink: 0,
                            }}>
                              {step.step}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 12.5, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif" }}>
                                  {step.name}
                                </span>
                                <span style={{ fontSize: 10, color: t.gold, fontFamily: "'JetBrains Mono', monospace" }}>
                                  [{step.tech}]
                                </span>
                              </div>
                              <div style={{ fontSize: 11.5, color: t.textSub, marginTop: 2, lineHeight: 1.5 }}>
                                {step.detail}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ASCII Dataflow Box */}
                      <div style={{
                        padding: "12px 14px", borderRadius: 10,
                        background: t.codeBg, border: `1px solid ${t.codeBorder}`,
                        overflowX: "auto",
                      }}>
                        <div style={{ fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace", color: t.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>
                          Pipeline Flow Topology
                        </div>
                        <pre style={{
                          margin: 0, fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                          color: t.codeText, lineHeight: 1.45, whiteSpace: "pre",
                        }}>
                          {p.architecture.flowAscii}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Production Metrics */}
                  {currentTab === "metrics" && p.metrics && (
                    <div className="fade-in">
                      <div style={{
                        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 12, marginBottom: 14,
                      }}>
                        {p.metrics.map(m => (
                          <div
                            key={m.label}
                            style={{
                              padding: "14px 16px", borderRadius: 12,
                              background: isLight ? "#ffffff" : t.surface, border: `1px solid ${t.border}`,
                              borderTop: `2px solid ${t.accent}`,
                            }}
                          >
                            <div style={{
                              fontSize: "1.4rem", fontWeight: 900, color: t.accent,
                              fontFamily: "'Outfit', sans-serif", lineHeight: 1.1,
                            }}>
                              {m.value}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginTop: 6, fontFamily: "'Outfit', sans-serif" }}>
                              {m.label}
                            </div>
                            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3, lineHeight: 1.4 }}>
                              {m.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Engineering Features */}
                  {currentTab === "features" && (
                    <div className="fade-in">
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: isLight ? t.accent : t.accentSub, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                          Tech Stack Arsenal
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {p.techStack.map(tag => <Tag key={tag} label={tag} t={t} />)}
                        </div>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: isLight ? t.accent : t.accentSub, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                          System Features & Implementation Highlights
                        </div>
                        {p.features.map((f, j) => (
                          <div key={j} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, color: t.textSub, lineHeight: 1.55 }}>
                            <span style={{ color: t.gold, flexShrink: 0, marginTop: 1 }}>◆</span>
                            <span style={{ wordBreak: "break-word" }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Code & Artifacts */}
                  {currentTab === "links" && (
                    <div className="fade-in">
                      <p style={{ fontSize: 12.5, color: t.textSub, lineHeight: 1.6, marginBottom: 14, fontFamily: "'Outfit', sans-serif" }}>
                        Inspect verified production repositories, cloud deployments, and official patent journal publications:
                      </p>

                      <div style={{ display: 'flex', gap: 10, flexWrap: "wrap" }}>
                        {p.github && (
                          <a href={p.github} target="_blank" rel="noopener noreferrer" className="card-hover" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px',
                            borderRadius: 10, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                            background: isLight ? "#ffffff" : t.card, border: `1px solid ${t.border}`, color: t.text,
                            backdropFilter: 'blur(8px)', textDecoration: 'none', transition: 'all 0.25s',
                          }}>
                            <GitBranch size={13} color={t.accent} /> Inspect Repository
                          </a>
                        )}
                        {p.demo && (
                          <a href={p.demo} target="_blank" rel="noopener noreferrer" className="card-hover" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px',
                            borderRadius: 10, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                            background: `linear-gradient(135deg, ${t.accent}, ${t.accentSub})`, border: 'none',
                            color: '#fff', textDecoration: 'none', transition: 'all 0.25s', fontWeight: 600,
                            boxShadow: `0 4px 16px ${t.accent}33`,
                          }}>
                            <ExternalLink size={13} /> Launch Live Demo
                          </a>
                        )}
                        {p.patentNo && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                            borderRadius: 10, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace",
                            background: `${t.gold}18`, border: `1px solid ${t.gold}44`, color: t.gold,
                          }}>
                            <Award size={13} /> Official Patent Citation Verified
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
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
                const isLight = t.name === "Meadow";
                return (
                  <span key={name} className="tag-hover" style={{
                    display: "inline-block", padding: "6px 14px", borderRadius: 999,
                    fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: isStrong ? 600 : 400,
                    background: isStrong
                      ? (isLight ? "rgba(21, 128, 61, 0.08)" : `linear-gradient(135deg, ${t.accent}15, ${t.accentSub}08)`)
                      : (isLight ? "#ffffff" : t.surface),
                    border: `1px solid ${isStrong ? (isLight ? "rgba(21, 128, 61, 0.28)" : t.accent + "55") : t.border}`,
                    color: isStrong ? t.accent : t.textSub,
                    boxShadow: isStrong ? (isLight ? "0 1px 4px rgba(21,128,61,0.08)" : `0 0 12px ${t.accent}12`) : "none",
                    transition: "all 0.25s ease",
                  }}>{name}</span>
                );
              })}
            </div>
          </GlassCard>
        ))}
      </div>
      <TechMarquee t={t} />
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
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: `linear-gradient(180deg, ${t.accent}, ${t.gold})`, borderRadius: "14px 0 0 14px" }} />
            <div style={{ paddingLeft: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 11 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif" }}>{e.role}</div>
                  <div style={{ fontSize: 12, color: t.accentSub, marginTop: 3 }}>{e.company} · <span style={{ color: t.textMuted }}>{e.type}</span></div>
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <Calendar size={11} />{e.period}
                </div>
              </div>
              {e.points.map((p, j) => (
                <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: t.textSub, lineHeight: 1.6 }}>
                  <span style={{ color: t.gold, flexShrink: 0, marginTop: 2 }}>◦</span>{p}
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
// INITIATIVES & EVENTS
// ─────────────────────────────────────────────
function Initiatives({ t }) {
  const isLight = t.name === "Meadow";
  const currentFocus = [
    {
      title: "Rescue Drone Vision (JIVAN)",
      status: "Active R&D",
      statusColor: isLight ? "#b45309" : "#f59e0b",
      Icon: Drone,
      desc: "Optimizing real-time person detection algorithms with ONNX & YOLO for low-latency FPV drone cameras and search-and-rescue operator interfaces.",
      tags: ["Computer Vision", "YOLO", "ONNX", "Disaster Tech"],
    },
    {
      title: "Bio-Robotics Telemetry (Arachnid)",
      status: "Patented & Scaling",
      statusColor: t.gold,
      Icon: Cpu,
      desc: "Advancing multi-sensor telemetry and kinematic gait control for bio-inspired quad/hex walking robotics designed for habitat surveillance.",
      tags: ["Deep Learning", "Arduino Mega", "Raspberry Pi", "Kinematics"],
    },
    {
      title: "Risers Cre8 Ecosystem",
      status: "Core Initiative",
      statusColor: t.accent,
      Icon: Users,
      desc: "Core Member and driving hardware/software project atelier, developer workshops, and tech product bundles for student innovators.",
      tags: ["Startup", "Hardware & IoT", "Mentorship", "Community"],
    },
  ];

  const upcomingEvents = [
    {
      title: "InnoVocon Season 2",
      type: "Flagship Innovation Hackathon",
      role: "Partnered Host (Risers Cre8)",
      date: "Upcoming 2026",
      location: "Partnered Hackathon Portal",
      highlights: [
        "Leading hackathon registration, problem statement curation, and IoT hardware kit sponsorship.",
        "Building community outreach across regional engineering colleges.",
      ],
      link: "https://riserscre8.com/partnered-hackathons/innovocon-season-2",
    },
  ];

  const completedEvents = [
    {
      title: "InnovoCon 2025",
      type: "12-Hour 3D Modelling Hackathon",
      role: "Event Organiser & Host",
      date: "27–28 Feb 2025",
      location: "JIS College of Engineering · Kalyani",
      highlights: [
        "Structured 3D CAD modeling challenges and evaluated 3D printing accuracy for participant teams.",
        "Mentored engineering students in rapid prototyping and mechanical design principles.",
      ],
      link: null,
    },
    {
      title: "AICTE Idea Lab Workshops",
      type: "Technical Hands-on Sessions",
      role: "IoT & 3D Modelling Lead",
      date: "May 2025 – June 2025",
      location: "AICTE Idea Lab · Kalyani",
      highlights: [
        "Conducting practical workshops on ESP32/Raspberry Pi embedded systems and sensor interfacing.",
        "Guiding students from conceptual 3D CAD design to physical additive manufacturing.",
      ],
      link: null,
    },
  ];

  return (
    <div>
      <PageTitle t={t} num="05">Focus & Events</PageTitle>

      {/* ── CURRENT FOCUS ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.accentSub, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <Flame size={12} color={t.accentSub} /> Current Technical Focus
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {currentFocus.map((f, i) => (
            <GlassCard key={i} t={t}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: isLight ? "rgba(21, 128, 61, 0.08)" : `linear-gradient(135deg, ${t.accent}22, ${t.accentSub}11)`,
                    border: `1px solid ${isLight ? "rgba(21, 128, 61, 0.2)" : t.accent + "33"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <f.Icon size={15} color={t.accent} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif" }}>{f.title}</div>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <span style={{
                  display: "inline-block", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 600,
                  background: `${f.statusColor}18`, color: f.statusColor, border: `1px solid ${f.statusColor}44`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{f.status}</span>
              </div>
              <p style={{ fontSize: 13, color: t.textSub, lineHeight: 1.6, marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>
                {f.desc}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {f.tags.map(tag => <Tag key={tag} label={tag} t={t} />)}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* ── UPCOMING EVENT & COMMUNITY ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={12} color={t.gold} /> UPCOMING EVENT & COMMUNITY
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {upcomingEvents.map((ev, i) => (
            <GlassCard key={i} t={t} style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.text, fontFamily: "'Outfit', sans-serif" }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: t.accentSub, fontWeight: 600, marginTop: 2 }}>{ev.type} · <span style={{ color: t.textMuted, fontWeight: 400 }}>{ev.role}</span></div>
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={11} />{ev.date}
                </div>
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={11} color={t.gold} />{ev.location}
              </div>
              <div style={{ marginBottom: 12 }}>
                {ev.highlights.map((h, j) => (
                  <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: t.textSub, lineHeight: 1.5 }}>
                    <span style={{ color: t.gold, flexShrink: 0, marginTop: 2 }}>◦</span>{h}
                  </div>
                ))}
              </div>
              {ev.link && (
                <a href={ev.link} target="_blank" rel="noopener noreferrer" className="link-hover" style={{
                  display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8,
                  fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: isLight ? t.accent : t.accentSub,
                  background: isLight ? "#ffffff" : t.surface, border: `1px solid ${t.border}`, textDecoration: "none",
                }}>
                  <ExternalLink size={11} /> Event Page
                </a>
              )}
            </GlassCard>
          ))}
        </div>
      </div>

      {/* ── ORGANIZATIONAL SPOTLIGHT ── */}
      <GlassCard t={t} style={{ padding: "20px 22px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Users size={16} color={t.accentSub} />
          <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif" }}>Risers Cre8 — Core Team & Organization</div>
        </div>
        <p style={{ color: t.textSub, fontSize: 13, lineHeight: 1.8, marginBottom: 14, fontFamily: "'Outfit', sans-serif" }}>
          As a Core Team Member at <strong>Risers Cre8</strong>, I collaborate with fellow engineers to build open-source robotics, hardware development boards, IoT sensor modules, and planning to host regional hackathons. We aim to empower student innovators by bridging academic theory with real-world prototyping.
        </p>
        <a href="https://riserscre8.com" target="_blank" rel="noopener noreferrer" className="link-hover" style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10,
          fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: isLight ? "#ffffff" : t.accent,
          background: isLight ? t.accent : `linear-gradient(135deg, ${t.accent}15, ${t.accentSub}08)`,
          border: `1px solid ${isLight ? t.accent : t.accent + "44"}`, textDecoration: "none", fontWeight: 600,
          boxShadow: isLight ? "0 2px 8px rgba(21, 128, 61, 0.25)" : "none",
        }}>
          <ExternalLink size={13} /> Visit Risers Cre8 Platform
        </a>
      </GlassCard>

      {/* ── COMPLETED EVENTS ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.accentSub, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <Check size={12} color={t.accentSub} /> Completed Events
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {completedEvents.map((ev, i) => (
            <GlassCard key={i} t={t} style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.text, fontFamily: "'Outfit', sans-serif" }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: t.accentSub, fontWeight: 600, marginTop: 2 }}>{ev.type} · <span style={{ color: t.textMuted, fontWeight: 400 }}>{ev.role}</span></div>
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={11} />{ev.date}
                </div>
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={11} color={t.gold} />{ev.location}
              </div>
              <div style={{ marginBottom: 12 }}>
                {ev.highlights.map((h, j) => (
                  <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: t.textSub, lineHeight: 1.5 }}>
                    <span style={{ color: t.gold, flexShrink: 0, marginTop: 2 }}>◦</span>{h}
                  </div>
                ))}
              </div>
              {ev.link && (
                <a href={ev.link} target="_blank" rel="noopener noreferrer" className="link-hover" style={{
                  display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8,
                  fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: isLight ? t.accent : t.accentSub,
                  background: isLight ? "#ffffff" : t.surface, border: `1px solid ${t.border}`, textDecoration: "none",
                }}>
                  <ExternalLink size={11} /> Event Page
                </a>
              )}
            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────
// CERTIFICATIONS
// ─────────────────────────────────────────────
function Certifications({ t }) {
  const isLight = t.name === "Meadow";
  return (
    <div>
      <PageTitle t={t} num="06">Certifications</PageTitle>

      {/* ── SCORED / EXAM CERTS ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 20 }}>
        {CERTS_SCORED.map((c, i) => (
          <GlassCard key={i} t={t}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Outfit', sans-serif", marginBottom: 3 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>
                  {c.org}{c.weeks ? ` · ${c.weeks}-week course` : ""} · {c.period}
                </div>
                {c.badge && (
                  <span style={{
                    display: "inline-block", marginTop: 6, fontSize: 9, padding: "2px 9px", borderRadius: 999,
                    background: isLight ? "rgba(21, 128, 61, 0.08)" : `${t.accent}18`,
                    border: `1px solid ${isLight ? "rgba(21, 128, 61, 0.28)" : t.accent + "44"}`,
                    color: t.accent,
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: 1,
                  }}>{c.badge}</span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                {c.score !== null && (
                  <div style={{
                    fontSize: "1.8rem", fontWeight: 900, lineHeight: 1,
                    backgroundImage: `linear-gradient(135deg, ${t.gold}, ${t.goldLight})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text", fontFamily: "'Outfit', sans-serif",
                  }}>{c.score}<span style={{ fontSize: "0.9rem" }}>%</span></div>
                )}
                <a href={c.verify} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 4, fontSize: 11,
                  color: isLight ? t.accent : t.accentSub, fontFamily: "'JetBrains Mono', monospace",
                  textDecoration: "none", padding: "4px 10px", borderRadius: 8,
                  border: `1px solid ${t.border}`, background: isLight ? "#ffffff" : t.surface,
                  transition: "all 0.2s",
                }}>
                  <ExternalLink size={10} /> Verify
                </a>
              </div>
            </div>
            {c.score !== null && (
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 5, background: isLight ? "rgba(0,0,0,0.06)" : t.border, borderRadius: 4, overflow: "hidden" }}>
                  <div className="progress-fill" style={{
                    width: `${c.score}%`, height: "100%",
                    background: `linear-gradient(90deg, ${t.accent}, ${t.gold})`,
                    borderRadius: 4, boxShadow: `0 0 10px ${t.accent}33`,
                  }} />
                </div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {/* ── QUICK COURSES ── */}
      <GlassCard t={t} style={{ padding: "18px 20px" }}>
        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14, fontWeight: 600 }}>Quick Course Completions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CERTS_COURSES.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "'Outfit', sans-serif" }}>{c.name}</span>
                <span style={{ fontSize: 11, color: t.textMuted, marginLeft: 8 }}>{c.org}</span>
              </div>
              <a href={c.verify} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", gap: 4, fontSize: 10,
                color: isLight ? t.accent : t.accentSub, fontFamily: "'JetBrains Mono', monospace",
                textDecoration: "none", padding: "3px 9px", borderRadius: 7,
                border: `1px solid ${t.border}`, background: isLight ? "#ffffff" : t.surface,
                flexShrink: 0, transition: "all 0.2s",
              }}>
                <ExternalLink size={9} /> Verify
              </a>
            </div>
          ))}
        </div>
      </GlassCard>

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
  const isLight = t.name === "Meadow";
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
    width: "100%", padding: "10px 13px",
    background: isLight ? "#ffffff" : t.surface,
    border: `1px solid ${t.border}`, borderRadius: 9, color: t.text,
    fontSize: 13, fontFamily: "'Outfit', sans-serif", boxSizing: "border-box",
    transition: "border-color .25s, box-shadow .25s",
  };

  const avail = [
    { label: "Available", sub: "For new roles", c: isLight ? "#15803d" : "#22c55e" },
    { label: "6 hrs", sub: "Response time", c: t.text },
    { label: "Remote", sub: "Preferred", c: isLight ? "#b45309" : "#f59e0b" },
    { label: "Flexible", sub: "Start date", c: isLight ? "#7c3aed" : "#8b5cf6" },
  ];

  return (
    <div>
      <PageTitle t={t} num="07">Get In Touch</PageTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 18 }}>
        {avail.map(a => (
          <GlassCard key={a.label} t={t} style={{ padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: a.c, fontFamily: "'Outfit', sans-serif" }}>{a.label}</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3 }}>{a.sub}</div>
          </GlassCard>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {/* Info */}
        <GlassCard t={t}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 15, color: t.accent, fontSize: 13, fontWeight: 700 }}>
            <Mail size={14} />Contact Information
          </div>
          {[
            { Icon: Mail, val: "sagarshaw.jisce@gmail.com", action: copyEmail, actionLabel: copied ? "Copied ✓" : "Copy" },
            { Icon: Phone, val: "+91 9123634756" },
            { Icon: MapPin, val: "Kalyani, West Bengal, India" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: isLight ? "#ffffff" : t.surface, border: `1px solid ${t.border}`, borderRadius: 9, marginBottom: 7, transition: "background .2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: t.textSub, fontSize: 12 }}>
                <row.Icon size={12} color={t.accent} />{row.val}
              </div>
              {row.action && (
                <button onClick={row.action} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: copied ? (isLight ? "#15803d" : "#22c55e") : t.accent, display: "flex", alignItems: "center", gap: 3, transition: "color .2s" }}>
                  {copied ? <Check size={11} /> : <Copy size={11} />}{row.actionLabel}
                </button>
              )}
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 10 }}>
            {[{ href: "https://github.com/Gocodein", label: "GitHub", Icon: GitBranch }, { href: "https://www.linkedin.com/in/sagar-shaw-79701138a", label: "LinkedIn", Icon: LinkedinIcon }].map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="link-hover" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px 0", background: isLight ? "#ffffff" : t.surface, border: `1px solid ${t.border}`, borderRadius: 9, color: t.textSub, fontSize: 12 }}>
                <Icon size={13} />{label}
              </a>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: "10px 12px", background: isLight ? "rgba(21, 128, 61, 0.08)" : "#16a34a11", border: `1px solid ${isLight ? "rgba(21, 128, 61, 0.25)" : "#16a34a33"}`, borderRadius: 9, display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: isLight ? "#15803d" : "#22c55e", fontWeight: 600 }}>
            <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: isLight ? "#15803d" : "#22c55e", display: "inline-block" }} />
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
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "midnight" : "matinee";
    }
    return "midnight";
  });
  const [section, setSection] = useState("overview");
  const [slideKey, setSlideKey] = useState(0);
  const [animDir, setAnimDir] = useState("left");
  const [showHint, setShowHint] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const touchRef = useRef({ startX: 0, startY: 0, dragging: false });
  const mainRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = e => setTheme(e.matches ? "midnight" : "matinee");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Responsive breakpoint
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
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

  // Keyboard navigation & Cockpit shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(open => !open);
        return;
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setPitchOpen(false);
        return;
      }
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
      case "overview": return (
        <Overview
          t={t}
          setPitchOpen={setPitchOpen}
          setPaletteOpen={setPaletteOpen}
          navigate={navigate}
        />
      );
      case "about": return <About t={t} />;
      case "projects": return (
        <Projects
          t={t}
          activeProjectIdx={activeProjectIdx}
          setActiveProjectIdx={setActiveProjectIdx}
        />
      );
      case "skills": return <Skills t={t} />;
      case "experience": return <Experience t={t} />;
      case "initiatives": return <Initiatives t={t} />;
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
        @keyframes cursorBlink { 0%,50% { opacity:1; } 51%,100% { opacity:0; } }
        @keyframes marqueeLeft { 0% { transform: translateX(0%); } 100% { transform: translateX(-25%); } }
        @keyframes marqueeRight { 0% { transform: translateX(-25%); } 100% { transform: translateX(0%); } }
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

        @media (max-width:1023px) {
          .mobile-header { display:flex !important; }
          .desktop-sidebar { transform:translateX(-100%); transition:transform 0.3s cubic-bezier(.4,0,.2,1); }
          .desktop-sidebar.open { transform:translateX(0); }
        }
        @media (max-width:880px) {
          .about-grid { grid-template-columns:1fr !important; }
        }
        @media (min-width:1024px) {
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
            <img src="/profile1.png" alt="SS" style={{ width: "100%", height: "100%", borderRadius: 5.5, objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
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
                src="/profile1.png"
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
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: t.name === "Meadow" ? "#15803d" : "#22c55e", fontWeight: 600, marginBottom: 10 }}>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: t.name === "Meadow" ? "#15803d" : "#22c55e", display: "inline-block" }} />
            Available for hire
          </div>
          {!isMobile && (
            <button onClick={() => setTheme(th => th === "midnight" ? "matinee" : "midnight")} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              width: "100%", padding: "8px 0", borderRadius: 8,
              background: t.name === "Meadow" ? "#ffffff" : t.card, border: `1px solid ${t.border}`,
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
          overflowY: "auto", overflowX: "hidden", minHeight: "100vh", minWidth: 0,
          position: "relative", zIndex: 1,
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
            background: t.name === "Meadow" ? "#ffffff" : t.card, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            color: curIdx === 0 ? t.dotEmpty : t.textSub, cursor: curIdx === 0 ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><ChevronLeft size={16} /></button>
          <button className="nav-arrow" onClick={goNext} disabled={curIdx === NAV_IDS.length - 1} style={{
            width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`,
            background: t.name === "Meadow" ? "#ffffff" : t.card, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
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

        {/* Floating Cockpit Trigger Button */}
        <button
          onClick={() => setPaletteOpen(true)}
          title="Recruiter Cockpit (⌘K / Ctrl+K)"
          className="card-hover"
          style={{
            position: "fixed",
            bottom: isMobile ? 70 : 28,
            right: isMobile ? 16 : 124,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 14px",
            borderRadius: 12,
            background: `linear-gradient(135deg, ${t.card}, ${t.sidebar})`,
            border: `1px solid ${t.accent}44`,
            color: t.accent,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            cursor: "pointer",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: `0 4px 20px rgba(0,0,0,0.25), 0 0 15px ${t.accent}22`,
          }}
        >
          <Command size={14} />
          <span>⌘K Cockpit</span>
        </button>

        {/* Command Palette Cockpit */}
        <CommandPalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          t={t}
          theme={theme}
          setTheme={setTheme}
          navigate={navigate}
          onOpenPitch={() => setPitchOpen(true)}
          onSelectProject={(idx) => {
            navigate("projects");
            setActiveProjectIdx(idx);
          }}
        />

        {/* Recruiter Pitch Modal */}
        <RecruiterPitchModal
          isOpen={pitchOpen}
          onClose={() => setPitchOpen(false)}
          t={t}
        />
      </main>
    </div>
  );
}
