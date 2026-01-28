// MentalHealthDashboardDemo.jsx
// INSANE UI 5.1 — Dark Balanced Grid Edition
// - Full single-file component
// - Full-width layout, fixed left sidebar, right content scrolls
// - 65/35 main/results split in Self mode, balanced in Clinician mode
// - Framer Motion entry animations included
// - Recharts charts fixed for label overlap and sizing
// - Safe CSV export, no regex literals in JSX
// - Uses lucide-react icons

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  PlusCircle,
  Trash2,
  Settings,
  ArrowLeftCircle,
  RefreshCcw,
  Sliders,
  Activity,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react";

/* ================================================================
   Data + Utilities
   ================================================================= */

/* Symptom definitions with groups and short labels for charts */
const SYMPTOM_DEFS = [
  { key: "insomnia", label: "Insomnia / Sleep disturbance", short: "Sleep", group: "Sleep" },
  { key: "fatigue", label: "Fatigue / Low energy", short: "Fatigue", group: "Energy" },
  { key: "panic", label: "Panic attacks", short: "Panic", group: "Anxiety" },
  { key: "panic_sleep", label: "Night panic / terrors", short: "Night panic", group: "Anxiety" },
  { key: "social_withdrawal", label: "Social withdrawal", short: "Social", group: "Social" },
  { key: "mood_swings", label: "Mood swings", short: "Mood", group: "Mood" },
  { key: "anhedonia", label: "Loss of interest (anhedonia)", short: "Anhedonia", group: "Mood" },
  { key: "rumination", label: "Rumination / Negative thoughts", short: "Rumination", group: "Cognition" },
  { key: "appetite_change", label: "Appetite change", short: "Appetite", group: "Physical" },
  { key: "concentration_issues", label: "Concentration issues", short: "Concentration", group: "Cognition" },
  { key: "self_harm_ideation", label: "Self-harm ideation", short: "Self-harm", group: "Risk" },
  { key: "irritability", label: "Irritability", short: "Irritability", group: "Mood" },
  { key: "withdrawal", label: "Substance withdrawal symptoms", short: "Withdrawal", group: "Substance" },
  { key: "anxiety_general", label: "Generalised anxiety", short: "Gen Anxiety", group: "Anxiety" },
  { key: "psychomotor", label: "Psychomotor changes", short: "Psychomotor", group: "Motor" },
  { key: "suicidal_thoughts", label: "Suicidal thoughts", short: "Suicidal", group: "Risk" },
  { key: "hopelessness", label: "Hopelessness", short: "Hopeless", group: "Mood" },
  { key: "panic_physical", label: "Physical panic symptoms", short: "Panic phys", group: "Anxiety" },
];

/* helper: random symptom set for demo patients */
function randomSymptomSet() {
  const o = {};
  for (const s of SYMPTOM_DEFS) o[s.key] = Math.random() > 0.6 ? Math.ceil(Math.random() * 5) : 0;
  return o;
}

/* large demo dataset */
const DEMO_PATIENTS = new Array(48).fill(0).map((_, i) => {
  const age = 16 + Math.floor(Math.random() * 60);
  const tags = Math.random() > 0.82 ? ["urgent"] : Math.random() > 0.76 ? ["follow-up"] : [];
  return {
    id: 90000 + i,
    name: `Demo Patient ${i + 1}`,
    age,
    sex: Math.random() > 0.5 ? "Female" : "Male",
    date: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)).toISOString().slice(0, 10),
    symptoms: randomSymptomSet(),
    notes: Math.random() > 0.7 ? "Reported mild improvement with sleep hygiene." : "No major background recorded.",
    tags,
  };
});

/* rule-based prediction heuristics (toy demo) */
function predictConditions(symptoms) {
  const s = symptoms || {};
  const depression =
    (s.anhedonia || 0) * 2.6 +
    (s.fatigue || 0) * 1.3 +
    (s.insomnia || 0) * 1.1 +
    (s.rumination || 0) * 1.7 +
    (s.concentration_issues || 0) * 1.2 +
    (s.self_harm_ideation || 0) * 4.2 +
    (s.hopelessness || 0) * 2.9;
  const anxiety =
    (s.panic || 0) * 3.0 +
    (s.rumination || 0) * 1.4 +
    (s.panic_sleep || 0) * 1.3 +
    (s.anxiety_general || 0) * 2.2 +
    (s.panic_physical || 0) * 1.9;
  const bipolar =
    (s.mood_swings || 0) * 2.7 +
    (s.irritability || 0) * 1.4 +
    (s.psychomotor || 0) * 1.5 +
    (s.insomnia || 0) * 1.2;
  const adhd = (s.concentration_issues || 0) * 2.9 + (s.fatigue || 0) * 0.6;
  const substance = (s.withdrawal || 0) * 3.4 + (s.irritability || 0) * 0.95;
  const normalize = (x, max = 45) => Math.min(100, Math.round((x / max) * 100));
  return {
    Depression: normalize(depression, 45),
    Anxiety: normalize(anxiety, 40),
    Bipolar: normalize(bipolar, 36),
    ADHD: normalize(adhd, 22),
    SubstanceRelated: normalize(substance, 30),
  };
}

/* aggregates */
function aggregateSymptomTotals(patients) {
  const totals = {};
  for (const s of SYMPTOM_DEFS) totals[s.key] = 0;
  for (const p of patients) {
    for (const k in p.symptoms) totals[k] += p.symptoms[k] || 0;
  }
  return totals;
}

/* safe CSV export */
function downloadCSV(patients) {
  const headers = ["id", "name", "age", "sex", "date", ...SYMPTOM_DEFS.map(s => s.key), "notes", "tags"];
  const rows = patients.map(p => [
    p.id,
    p.name,
    p.age,
    p.sex,
    p.date,
    ...SYMPTOM_DEFS.map(s => p.symptoms[s.key] || 0),
    String(p.notes || "").replaceAll("\n", " "),
    (p.tags || []).join("|")
  ]);
  const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mh_demo_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* colors */
const ACCENT = "#6b5cff";
const ACCENT2 = "#4e3bff";
const DANGER = "#ff6b6b";
const COLORS = ["#6b5cff", "#ff6b6b", "#ffc300", "#22d3a2", "#9b59b6", "#e67e22"];

/* ================================================================
   Runtime CSS (dark premium)
   ================================================================= */

const GLOBAL_STYLES = `
:root{
  --bg1: #061226;
  --bg2: #071428;
  --panel: rgba(255,255,255,0.03);
  --muted: #9aa4b2;
  --accent: ${ACCENT};
  --accent-2: ${ACCENT2};
  --danger: ${DANGER};
  --radius: 14px;
  --shadow: 0 14px 50px rgba(2,6,23,0.6);
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{
  margin:0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  color:#E6EEF3;
  background: linear-gradient(180deg, var(--bg1), var(--bg2));
  overflow: auto;
}

/* app layout full width, fixed sidebar + scrollable main */
.app {
  display:flex;
  width:100%;
  min-height:100vh;
  gap:20px;
  padding: 20px 28px;
  align-items:flex-start;
}

/* sidebar */
.sidebar {
  width:320px;
  min-width:280px;
  max-width:360px;
  background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00));
  border-radius: var(--radius);
  padding: 22px;
  border: 1px solid rgba(255,255,255,0.02);
  box-shadow: var(--shadow);
  height: calc(100vh - 40px);
  overflow-y: auto;
  position: sticky;
  top:20px;
}

/* main area */
.main {
  flex:1 1 auto;
  min-width: 700px;
  max-width: none;
  height: calc(100vh - 40px);
  overflow-y: auto;
  display:flex;
  flex-direction:column;
  gap:18px;
}

/* header area */
.header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
}

/* tabs */
.tab {
  padding: 10px 14px;
  border-radius: 10px;
  cursor:pointer;
  color: var(--muted);
  background: transparent;
  border: 1px solid rgba(255,255,255,0.015);
  font-weight:700;
}
.tab.active {
  color:#fff;
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  box-shadow: 0 8px 28px rgba(78,59,255,0.12);
}

/* card */
.card {
  background: var(--panel);
  border-radius: 12px;
  padding: 18px;
  border: 1px solid rgba(255,255,255,0.02);
  box-shadow: var(--shadow);
}

/* row grid: main split */
.row {
  display:grid;
  grid-template-columns: 65% 35%;
  gap:18px;
}

/* when content needs full width rows */
.row-wide {
  display:block;
}

/* groups and slider rows */
.group {
  background: rgba(255,255,255,0.01);
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 12px;
}
.symptom-row {
  display:flex;
  align-items:center;
  gap:12px;
  padding:8px 0;
  border-bottom: 1px dashed rgba(255,255,255,0.02);
}
.symptom-row:last-child { border-bottom: none; }
.symptom-label { width:48%; font-weight:700; }
.symptom-controls { width:52%; display:flex; align-items:center; gap:8px; }
.range { width:100%; }

/* patient list */
.patient-list { display:flex; flex-direction:column; gap:8px; }
.patient-row { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px; background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00)); border-radius:10px; border: 1px solid rgba(255,255,255,0.02); }

/* charts */
.chart-large { height: 380px; }
.chart-medium { height: 280px; }
.chart-small { height: 180px; }

/* drawer overlay */
.drawer-backdrop { position:fixed; inset:0; z-index:120; background: rgba(2,6,23,0.55); backdrop-filter: blur(4px); }
.drawer { position:fixed; right:0; top:0; bottom:0; width:560px; max-width:95%; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border-left:1px solid rgba(255,255,255,0.03); z-index:130; padding:22px; overflow-y:auto; box-shadow: 0 -4px 40px rgba(0,0,0,0.6); }

/* buttons */
.btn { display:inline-flex; align-items:center; gap:8px; padding: 10px 14px; border-radius:10px; border:none; cursor:pointer; color:white; background: linear-gradient(180deg, var(--accent), var(--accent-2)); font-weight:800; }
.btn.ghost { background: transparent; color: var(--muted); border: 1px solid rgba(255,255,255,0.03); }
.small { color:var(--muted); font-size:13px; }

/* responsive: hide sidebar on narrow screens */
@media (max-width:1100px) {
  .sidebar { display:none; }
  .main { height:auto; padding:12px; }
  .app { padding:12px; }
  .drawer { width:100%; }
  .row { grid-template-columns: 1fr; }
}
`;

/* ================================================================
   Small UI components
   ================================================================= */

function IconButton({ title, onClick, children }) {
  return (
    <button title={title} onClick={onClick} className="btn ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {children}
    </button>
  );
}

/* Stat card small */
function StatCard({ title, value, hint }) {
  return (
    <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.01)" }}>
      <div style={{ color: "var(--muted)", fontSize: 13 }}>{title}</div>
      <div style={{ fontWeight: 900, fontSize: 20 }}>{value}</div>
      {hint && <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>{hint}</div>}
    </div>
  );
}

/* ================================================================
   Main component
   ================================================================= */

export default function MentalHealthDashboardDemo() {
  // inject styles
  useEffect(() => {
    if (!document.getElementById("mh-v5-1-styles")) {
      const s = document.createElement("style");
      s.id = "mh-v5-1-styles";
      s.innerHTML = GLOBAL_STYLES;
      document.head.appendChild(s);
    }
  }, []);

  // dataset state
  const [patients, setPatients] = useState(() => {
    try {
      const raw = window.localStorage.getItem("mh_v5_1_demo");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEMO_PATIENTS;
  });

  const [mode, setMode] = useState("self"); // 'self' | 'clinician'
  const [query, setQuery] = useState("");

  // self inputs
  const [selfSymptoms, setSelfSymptoms] = useState(() => {
    const obj = {};
    for (const s of SYMPTOM_DEFS) obj[s.key] = 0;
    return obj;
  });
  const [selfResults, setSelfResults] = useState(null);
  const [selfAnalyzedAt, setSelfAnalyzedAt] = useState(null);
  const [animatingResults, setAnimatingResults] = useState(false);

  // overlay / editor
  const [selectedId, setSelectedId] = useState(null);
  const selectedPatient = useMemo(() => patients.find(p => p.id === selectedId) || null, [patients, selectedId]);
  const [editorBuffer, setEditorBuffer] = useState({});
  const [overlayOpen, setOverlayOpen] = useState(false);

  /* persist dataset */
  useEffect(() => {
    try {
      window.localStorage.setItem("mh_v5_1_demo", JSON.stringify(patients));
    } catch (e) {}
  }, [patients]);

  /* when selected patient changes update editor */
  useEffect(() => {
    if (selectedPatient) {
      setEditorBuffer({ ...selectedPatient.symptoms });
      setOverlayOpen(true);
      // lock body scroll while overlay open
      document.body.style.overflow = "hidden";
    } else {
      setEditorBuffer({});
      setOverlayOpen(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedPatient]);

  /* derived */
  const totals = useMemo(() => aggregateSymptomTotals(patients), [patients]);
  const overallPredictions = useMemo(() => {
    const agg = {};
    for (const p of patients) {
      const pred = predictConditions(p.symptoms);
      for (const k in pred) agg[k] = (agg[k] || 0) + pred[k];
    }
    const list = Object.keys(agg).map(k => ({ condition: k, value: Math.round(agg[k] / (patients.length || 1)) }));
    return list.sort((a,b) => b.value - a.value);
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(p => {
      if (p.name.toLowerCase().includes(q)) return true;
      if ((p.notes || "").toLowerCase().includes(q)) return true;
      if ((p.tags || []).some(t => t.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [patients, query]);

  /* actions: self */
  function setSelfSymptom(key, value) {
    setSelfSymptoms(prev => ({ ...prev, [key]: Number(value) }));
  }

  function resetSelfInputs() {
    const obj = {};
    for (const s of SYMPTOM_DEFS) obj[s.key] = 0;
    setSelfSymptoms(obj);
    setSelfResults(null);
    setSelfAnalyzedAt(null);
  }

  function analyzeSelf() {
    setAnimatingResults(true);
    setTimeout(() => {
      const preds = predictConditions(selfSymptoms);
      const symptomArray = SYMPTOM_DEFS.map(s => ({ key: s.key, label: s.label, value: selfSymptoms[s.key] || 0 }));
      const topSymptoms = symptomArray.sort((a,b) => b.value - a.value).slice(0,6);
      const recommendations = [];
      if ((preds.Depression || 0) >= 60) recommendations.push("High depressive indicators: consider contacting a mental health professional.");
      if ((preds.Anxiety || 0) >= 60) recommendations.push("Marked anxiety indicators: practice grounding techniques and consult a clinician.");
      if ((preds.ADHD || 0) >= 60) recommendations.push("Concentration-related symptoms pronounced — consider further evaluation.");
      if ((preds.SubstanceRelated || 0) >= 50) recommendations.push("Substance-related signs detected — seek medical supervision if needed.");
      setSelfResults({ preds, topSymptoms, recommendations });
      setSelfAnalyzedAt(new Date().toISOString());
      setAnimatingResults(false);
    }, 480);
  }

  /* clinician actions */
  function addPatient() {
    const id = Math.floor(Math.random() * 1e7);
    const p = {
      id,
      name: `New Patient ${id % 1000}`,
      age: 18 + Math.floor(Math.random() * 60),
      sex: Math.random() > 0.5 ? "Female" : "Male",
      date: new Date().toISOString().slice(0,10),
      symptoms: randomSymptomSet(),
      notes: "",
      tags: [],
    };
    setPatients(prev => [p, ...prev]);
    setSelectedId(id);
  }

  function deletePatient(id) {
    setPatients(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function saveEdits() {
    if (!selectedId) return;
    setPatients(prev => prev.map(p => p.id === selectedId ? { ...p, symptoms: { ...editorBuffer } } : p));
  }

  function randomizeEditor() {
    const out = {};
    for (const s of SYMPTOM_DEFS) out[s.key] = Math.round(Math.random() * 5);
    setEditorBuffer(out);
  }

  function resetDataset() {
    setPatients(DEMO_PATIENTS.map(p => ({ ...p, id: Math.floor(Math.random() * 1e7) })));
    setSelectedId(null);
  }

  function appendThree() {
    const items = DEMO_PATIENTS.slice(0,3).map(p => ({ ...p, id: Math.floor(Math.random() * 1e7) }));
    setPatients(prev => [...items, ...prev]);
  }

  function toggleUrgentTag(id) {
    setPatients(prev => prev.map(p => {
      if (p.id !== id) return p;
      const tags = p.tags || [];
      if (tags.includes("urgent")) return { ...p, tags: tags.filter(t => t !== "urgent") };
      return { ...p, tags: [...tags, "urgent"] };
    }));
  }

  /* chart data helpers (short labels to avoid overlap) */
  const barData = useMemo(() => SYMPTOM_DEFS.map(s => ({ name: s.short, full: s.label, value: totals[s.key] || 0 })), [totals]);
  const selfBarData = useMemo(() => SYMPTOM_DEFS.map(s => ({ name: s.short, value: selfSymptoms[s.key] || 0 })), [selfSymptoms]);
  const selfRadarData = useMemo(() => {
    if (!selfResults) return Object.keys(predictConditions({})).map(k => ({ subject: k, A: 0, fullMark: 100 }));
    const pd = selfResults.preds;
    return Object.keys(pd).map(k => ({ subject: k, A: pd[k], fullMark: 100 }));
  }, [selfResults]);

  const drawerRadarData = useMemo(() => {
    if (!selectedPatient) return [];
    const preds = predictConditions(selectedPatient.symptoms);
    return Object.keys(preds).map(k => ({ subject: k, A: preds[k], fullMark: 100 }));
  }, [selectedPatient]);

  /* small helper */
  function patientPreviewLine(p) { return `${p.age} y • ${p.sex} • ${p.date}`; }

  /* entry animations for cards */
  const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  /* render */
  return (
    <div style={{ width: "100%" }}>
      <div className="app" role="application" aria-label="Mental Health Dashboard (Insane UI 5.1)">
        {/* Sidebar */}
        <aside className="sidebar" aria-label="Sidebar">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>Mental Health Analysis</div>
              <div style={{ color: "var(--muted)", marginTop: 6 }}>Full-width Split Layout — Demo</div>
            </div>
            <div>
              <IconButton title="Settings (demo)" onClick={() => alert("Settings are demo-only.")}>
                <Settings size={16} />
              </IconButton>
            </div>
          </div>

          <div style={{ height: 14 }} />

          <motion.div className="card" initial="hidden" animate="visible" variants={cardVariants}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 900 }}>Dataset Overview</div>
                <div className="small" style={{ marginTop: 6 }}>Client-only demo data (not clinical)</div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <StatCard title="Patients" value={patients.length} hint="Total demo records" />
              <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.01)" }}>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>Top predicted</div>
                <div style={{ fontWeight: 900, marginTop: 6 }}>{overallPredictions[0]?.condition || "N/A"}</div>
                <div className="small" style={{ marginTop: 6 }}>{overallPredictions[0]?.value || 0}% avg risk</div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button className={`tab ${mode === "self" ? "active" : ""}`} onClick={() => setMode("self")}><Activity size={14} /> Self</button>
              <button className={`tab ${mode === "clinician" ? "active" : ""}`} onClick={() => setMode("clinician")}><ClipboardCheck size={14} /> Clinician</button>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button className="btn ghost" onClick={resetDataset}><RefreshCcw size={14} /> Reset dataset</button>
              <button className="btn ghost" onClick={appendThree}>Add 3 random</button>
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="btn ghost" onClick={() => downloadCSV(patients)} style={{ width: "100%" }}><Download size={14} /> Export CSV</button>
            </div>
          </motion.div>

          <motion.div className="card" initial="hidden" animate="visible" variants={cardVariants} style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900 }}>Symptom spotlight</div>
            <div className="small" style={{ marginTop: 6 }}>Most frequent symptoms (dataset)</div>
            <div style={{ marginTop: 12 }}>
              {SYMPTOM_DEFS.slice(0,6).map(s => {
                const total = totals[s.key] || 0;
                const percent = Math.min(100, Math.round((total / (patients.length * 5 || 1)) * 100));
                return (
                  <div key={s.key} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 800 }}>{s.label.split("/")[0]}</div>
                      <div className="small">{total}</div>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.02)", borderRadius: 6, marginTop: 8 }}>
                      <div style={{ width: `${percent}%`, height: "100%", background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, borderRadius: 6 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div className="card" initial="hidden" animate="visible" variants={cardVariants} style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900 }}>Quick tips</div>
            <div className="small" style={{ marginTop: 8 }}>
              This dashboard is a UI demo. If you or someone has active self-harm or suicidal thoughts, seek immediate help.
            </div>
          </motion.div>
        </aside>

        {/* Main area */}
        <main className="main" aria-live="polite">
          <div className="header">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{mode === "self" ? "Self-Assessment" : "Clinician Dashboard"}</div>
              <div className="small">{mode === "self" ? "Interactive symptom analyzer" : "Patient management & dataset insights"}</div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 320 }}>
                <input placeholder={mode === "clinician" ? "Search patients, notes, tags..." : "Search... (clinician tab for patients)"} value={query} onChange={e => setQuery(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)", color: "inherit", outline: "none", fontWeight: 700 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn ghost" onClick={() => setPatients(prev => prev.map(p => ({ ...p, date: new Date().toISOString().slice(0,10) })))}><Sliders size={14} /> Stamp</button>
                <button className="btn" onClick={() => { if (mode === "self") analyzeSelf(); else addPatient(); }}><PlusCircle size={14} /> {mode === "self" ? "Analyze" : "New"}</button>
              </div>
            </div>
          </div>

          {/* content */}
          {mode === "self" ? (
            <>
              <div className="row">
                {/* left: inputs (65%) */}
                <motion.div className="card" initial="hidden" animate="visible" variants={cardVariants} style={{ minHeight: 720 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>Symptom Input</div>
                      <div className="small" style={{ marginTop: 6 }}>Set severity for each symptom (0–5)</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn ghost" onClick={resetSelfInputs}><RefreshCcw size={14} /> Reset</button>
                      <button className="btn ghost" onClick={() => downloadCSV([{ id: "self-input", name: "Self", age: "", sex: "", date: new Date().toISOString().slice(0,10), symptoms: selfSymptoms, notes: "Self input export", tags: [] }])}><Download size={14} /> Export</button>
                    </div>
                  </div>

                  <div style={{ height: 14 }} />

                  {/* grouped sections */}
                  <div className="group">
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Sleep & Energy</div>
                    {SYMPTOM_DEFS.filter(s => s.group === "Sleep" || s.group === "Energy").map(s => (
                      <div key={s.key} className="symptom-row">
                        <div className="symptom-label">{s.label}</div>
                        <div className="symptom-controls">
                          <input className="range" type="range" min="0" max="5" value={selfSymptoms[s.key]} onChange={e => setSelfSymptom(s.key, e.target.value)} />
                          <div style={{ minWidth:44, textAlign:"center", fontWeight:800 }}>{selfSymptoms[s.key]}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="group">
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Anxiety-related</div>
                    {SYMPTOM_DEFS.filter(s => s.group === "Anxiety").map(s => (
                      <div key={s.key} className="symptom-row">
                        <div className="symptom-label">{s.label}</div>
                        <div className="symptom-controls">
                          <input className="range" type="range" min="0" max="5" value={selfSymptoms[s.key]} onChange={e => setSelfSymptom(s.key, e.target.value)} />
                          <div style={{ minWidth:44, textAlign:"center", fontWeight:800 }}>{selfSymptoms[s.key]}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="group">
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Mood & Cognition</div>
                    {SYMPTOM_DEFS.filter(s => s.group === "Mood" || s.group === "Cognition").map(s => (
                      <div key={s.key} className="symptom-row">
                        <div className="symptom-label">{s.label}</div>
                        <div className="symptom-controls">
                          <input className="range" type="range" min="0" max="5" value={selfSymptoms[s.key]} onChange={e => setSelfSymptom(s.key, e.target.value)} />
                          <div style={{ minWidth:44, textAlign:"center", fontWeight:800 }}>{selfSymptoms[s.key]}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="group">
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Risk & Other</div>
                    {SYMPTOM_DEFS.filter(s => ["Risk","Substance","Physical","Motor"].includes(s.group)).map(s => (
                      <div key={s.key} className="symptom-row">
                        <div className="symptom-label">{s.label}</div>
                        <div className="symptom-controls">
                          <input className="range" type="range" min="0" max="5" value={selfSymptoms[s.key]} onChange={e => setSelfSymptom(s.key, e.target.value)} />
                          <div style={{ minWidth:44, textAlign:"center", fontWeight:800 }}>{selfSymptoms[s.key]}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* right: results (35%) */}
                <motion.div className="card" initial="hidden" animate="visible" variants={cardVariants} style={{ minHeight: 720 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>Analysis Results</div>
                      <div className="small" style={{ marginTop: 6 }}>{selfAnalyzedAt ? `Analyzed at ${new Date(selfAnalyzedAt).toLocaleString()}` : "No analysis yet — press Analyze."}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn ghost" onClick={() => { setSelfResults(null); setSelfAnalyzedAt(null); }}>Clear</button>
                      <button className="btn ghost" onClick={() => downloadCSV([{ id: "self-result", name: "Self Result", age: "", sex: "", date: new Date().toISOString().slice(0,10), symptoms: selfSymptoms, notes: JSON.stringify(selfResults || {}), tags: [] }])}><Download size={14} /> Export</button>
                    </div>
                  </div>

                  <div style={{ height: 18 }} />

                  <div style={{ display: "flex", gap: 18 }}>
                    <div style={{ width: 320, height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={selfRadarData} cx="50%" cy="50%" outerRadius={110}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis domain={[0,100]} />
                          <Radar name="Risk" dataKey="A" stroke={ACCENT} fill={ACCENT} fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {selfResults ? Object.entries(selfResults.preds).map(([k,v],i) => (
                          <div key={k} style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontWeight: 800 }}>{k}</div>
                              <div className="small">Predicted risk</div>
                            </div>
                            <div style={{ fontWeight: 900 }}>{v}%</div>
                          </div>
                        )) : (
                          <div style={{ gridColumn: "1 / -1", color: "var(--muted)" }}>No results yet — press Analyze to calculate predictions.</div>
                        )}
                      </div>

                      <div style={{ height: 12 }} />

                      <div style={{ fontWeight: 900 }}>Top symptoms</div>
                      <div style={{ marginTop: 8 }}>
                        {selfResults ? selfResults.topSymptoms.map(s => (
                          <div key={s.key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed rgba(255,255,255,0.02)" }}>
                            <div>{s.label}</div>
                            <div style={{ fontWeight: 900 }}>{s.value}</div>
                          </div>
                        )) : <div className="small">—</div>}
                      </div>

                      <div style={{ height: 12 }} />

                      <div style={{ fontWeight: 900 }}>Recommendations</div>
                      <div style={{ marginTop: 8, color: "var(--muted)" }}>
                        {selfResults ? selfResults.recommendations.map((r,i) => <div key={i} style={{ marginBottom: 8 }}>{r}</div>) : <div>Analyze to receive recommendations.</div>}
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 18 }} />

                  <div style={{ fontWeight: 900 }}>Symptom intensity (input)</div>
                  <div style={{ height: 260, marginTop: 12 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selfBarData} margin={{ top: 10, right: 20, left: -10, bottom: 80 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={70} />
                        <YAxis allowDecimals={false} domain={[0,5]} />
                        <Tooltip formatter={(value) => [value, "Severity"]} />
                        <Bar dataKey="value" fill={ACCENT} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* wide analytics below */}
              <motion.div className="row-wide card" initial="hidden" animate="visible" variants={cardVariants}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>Contextual insights</div>
                    <div className="small" style={{ marginTop: 6 }}>A narrative explanation for the predicted outcomes (demo).</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn ghost" onClick={() => alert("Narrative copied (demo)")}>Copy</button>
                  </div>
                </div>

                <div style={{ marginTop: 12, color: "var(--muted)" }}>
                  This is heuristic demo output: high panic + sleep issues tilt towards anxiety; persistent anhedonia + hopelessness increase depressive risk. Use clinical judgement in real use.
                </div>
              </motion.div>
            </>
          ) : (
            /* Clinician mode */
            <>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
                <motion.div className="card" initial="hidden" animate="visible" variants={cardVariants} style={{ minHeight: 520 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>Patient Records</div>
                      <div className="small" style={{ marginTop: 6 }}>Search, edit and manage demo patients</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn" onClick={addPatient}><PlusCircle size={14} /> New</button>
                      <button className="btn ghost" onClick={appendThree}>Add 3</button>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input placeholder="Filter patients..." value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)", fontWeight:700 }} />
                      <button className="btn ghost" onClick={() => setPatients(prev => prev.map(pp => ({ ...pp, symptoms: Object.fromEntries(Object.keys(pp.symptoms).map(k => [k, Math.round(Math.random()*5)])) })))}>Randomize all</button>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, overflowY: "auto", maxHeight: 360 }}>
                    <div className="patient-list">
                      {filteredPatients.map(p => (
                        <motion.div key={p.id} className="patient-row" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                          <div>
                            <div style={{ fontWeight: 900 }}>{p.name}</div>
                            <div className="small">{patientPreviewLine(p)}</div>
                            <div style={{ marginTop: 6 }}>{(p.tags || []).map(tag => <span key={tag} style={{ marginRight:8, padding:"4px 8px", background:"rgba(255,255,255,0.02)", borderRadius:8, fontSize:12 }}>{tag}</span>)}</div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn ghost" onClick={() => setSelectedId(p.id)}>View</button>
                            <button className="btn ghost" style={{ color: DANGER }} onClick={() => deletePatient(p.id)}><Trash2 size={14} /> Delete</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <div>
                  <motion.div className="card" initial="hidden" animate="visible" variants={cardVariants} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 900 }}>Aggregate predicted conditions</div>
                        <div className="small" style={{ marginTop: 6 }}>Average risk across dataset</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn ghost" onClick={() => downloadCSV(patients)}><Download size={14} /> Export</button>
                        <button className="btn ghost" onClick={resetDataset}><RefreshCcw size={14} /> Reset</button>
                      </div>
                    </div>

                    <div style={{ height: 220, marginTop: 12 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={overallPredictions.map(c => ({ name: c.condition, value: c.value }))}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div className="card" initial="hidden" animate="visible" variants={cardVariants}>
                    <div style={{ fontWeight: 900 }}>Symptom distribution</div>
                    <div className="small" style={{ marginTop: 6 }}>Cumulative severity across dataset</div>
                    <div style={{ height: 300, marginTop: 12 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 80 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill={ACCENT} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>
              </div>

              <motion.div className="row-wide card" initial="hidden" animate="visible" variants={cardVariants}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>Dataset narrative</div>
                    <div className="small" style={{ marginTop: 6 }}>Auto-generated summary (demo)</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn ghost" onClick={() => alert("Download report (demo)")}>Report</button>
                  </div>
                </div>

                <div style={{ marginTop: 12, color: "var(--muted)" }}>
                  Demo summary: depression and anxiety are the most common predicted conditions. Top symptoms: sleep disturbance, rumination, concentration issues.
                </div>
              </motion.div>
            </>
          )}
        </main>
      </div>

      {/* overlay drawer */}
      <AnimatePresence>
        {overlayOpen && selectedPatient && (
          <>
            <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={() => setSelectedId(null)} />
            <motion.aside className="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 90, damping: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{selectedPatient.name}</div>
                  <div className="small" style={{ marginTop: 6 }}>{patientPreviewLine(selectedPatient)}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn ghost" onClick={() => toggleUrgentTag(selectedPatient.id)}>Toggle urgent</button>
                  <button className="btn ghost" onClick={() => setSelectedId(null)}><ArrowLeftCircle size={18} /></button>
                </div>
              </div>

              <div style={{ height: 12 }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="card">
                  <div style={{ fontWeight: 900 }}>Predicted risks</div>
                  <div className="small" style={{ marginTop: 6 }}>Rule-based demo scoring</div>
                  <div style={{ height: 220, marginTop: 12 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={drawerRadarData} cx="50%" cy="50%" outerRadius={70}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis domain={[0,100]} />
                        <Radar name="Risk" dataKey="A" stroke={ACCENT} fill={ACCENT} fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    {Object.entries(predictConditions(selectedPatient.symptoms)).map(([k,v], idx) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ width: 10, height: 10, background: COLORS[idx % COLORS.length], borderRadius: 3 }} />
                          <div style={{ fontWeight: 800 }}>{k}</div>
                        </div>
                        <div style={{ fontWeight: 800 }}>{v}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontWeight: 900 }}>Editor — tune symptoms</div>
                  <div className="small" style={{ marginTop: 6 }}>Adjust severity and Save</div>

                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button className="btn ghost" onClick={() => setEditorBuffer({ ...selectedPatient.symptoms })}>Load</button>
                    <button className="btn ghost" onClick={randomizeEditor}>Randomize</button>
                    <button className="btn" onClick={() => { saveEdits(); setSelectedId(null); }}>Save</button>
                  </div>

                  <div style={{ marginTop: 12, maxHeight: 420, overflow: "auto", paddingRight: 6 }}>
                    {SYMPTOM_DEFS.map(s => {
                      const val = editorBuffer[s.key] ?? selectedPatient.symptoms[s.key] ?? 0;
                      return (
                        <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed rgba(255,255,255,0.02)" }}>
                          <div style={{ width: "55%" }}>
                            <div style={{ fontWeight: 800 }}>{s.label}</div>
                            <div className="small">Severity {val}</div>
                          </div>
                          <div style={{ width: "40%", display: "flex", alignItems: "center", gap: 8 }}>
                            <input type="range" min="0" max="5" value={val} onChange={e => setEditorBuffer(prev => ({ ...prev, [s.key]: Number(e.target.value) }))} style={{ width: "100%" }} />
                            <div style={{ width: 40, textAlign: "center", background: "rgba(255,255,255,0.02)", padding: "6px 8px", borderRadius: 8 }}>{val}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div className="small">Notes: {selectedPatient.notes}</div>
                <div style={{ height: 12 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn ghost" onClick={() => toggleUrgentTag(selectedPatient.id)}>Toggle urgent</button>
                  <button className="btn ghost" style={{ color: DANGER }} onClick={() => { deletePatient(selectedPatient.id); setSelectedId(null); }}>Delete patient</button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
