import React, { useEffect, useMemo, useState } from "react";
import { PlusCircle, Sliders } from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import SelfAssessment from "../components/features/self/SelfAssessment";
import ClinicianDashboard from "../components/features/clinician/ClinicianDashboard";
import PatientDrawer from "../components/features/clinician/PatientDrawer";

import { SYMPTOM_DEFS } from "../data/constants";
import { DEMO_PATIENTS, randomSymptomSet } from "../utils/mockData";
import { aggregateSymptomTotals, predictConditions } from "../utils/analysis";
import { downloadCSV } from "../utils/export";

import "../styles/dashboard.css";

export default function Dashboard() {
    // dataset state
    const [patients, setPatients] = useState(() => {
        try {
            const raw = window.localStorage.getItem("mh_v5_1_demo");
            if (raw) return JSON.parse(raw);
        } catch (e) { }
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
        } catch (e) { }
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
        return list.sort((a, b) => b.value - a.value);
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
            const topSymptoms = symptomArray.sort((a, b) => b.value - a.value).slice(0, 6);
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
            date: new Date().toISOString().slice(0, 10),
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
        const items = DEMO_PATIENTS.slice(0, 3).map(p => ({ ...p, id: Math.floor(Math.random() * 1e7) }));
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

    /* chart data helpers */
    const barData = useMemo(() => SYMPTOM_DEFS.map(s => ({ name: s.short, full: s.label, value: totals[s.key] || 0 })), [totals]);

    /* small helper */
    function patientPreviewLine(p) { return `${p.age} y • ${p.sex} • ${p.date}`; }

    return (
        <div style={{ width: "100%" }}>
            <div className="app" role="application" aria-label="Mental Health Dashboard (Insane UI 5.1)">
                {/* Sidebar */}
                <Sidebar
                    patients={patients}
                    overallPredictions={overallPredictions}
                    totals={totals}
                    mode={mode}
                    setMode={setMode}
                    resetDataset={resetDataset}
                    appendThree={appendThree}
                    downloadCSV={downloadCSV}
                />

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
                                <button className="btn ghost" onClick={() => setPatients(prev => prev.map(p => ({ ...p, date: new Date().toISOString().slice(0, 10) })))}><Sliders size={14} /> Stamp</button>
                                <button className="btn" onClick={() => { if (mode === "self") analyzeSelf(); else addPatient(); }}><PlusCircle size={14} /> {mode === "self" ? "Analyze" : "New"}</button>
                            </div>
                        </div>
                    </div>

                    {/* content */}
                    {mode === "self" ? (
                        <SelfAssessment
                            selfSymptoms={selfSymptoms}
                            setSelfSymptom={setSelfSymptom}
                            resetSelfInputs={resetSelfInputs}
                            selfResults={selfResults}
                            setSelfResults={setSelfResults}
                            selfAnalyzedAt={selfAnalyzedAt}
                            setSelfAnalyzedAt={setSelfAnalyzedAt}
                        />
                    ) : (
                        <ClinicianDashboard
                            patients={patients}
                            setPatients={setPatients}
                            query={query}
                            setQuery={setQuery}
                            addPatient={addPatient}
                            appendThree={appendThree}
                            deletePatient={deletePatient}
                            setSelectedId={setSelectedId}
                            filteredPatients={filteredPatients}
                            overallPredictions={overallPredictions}
                            downloadCSV={downloadCSV}
                            resetDataset={resetDataset}
                            barData={barData}
                            patientPreviewLine={patientPreviewLine}
                        />
                    )}
                </main>
            </div>

            {/* overlay drawer */}
            <PatientDrawer
                overlayOpen={overlayOpen}
                selectedPatient={selectedPatient}
                setSelectedId={setSelectedId}
                toggleUrgentTag={toggleUrgentTag}
                deletePatient={deletePatient}
                setEditorBuffer={setEditorBuffer}
                editorBuffer={editorBuffer}
                randomizeEditor={randomizeEditor}
                saveEdits={saveEdits}
                patientPreviewLine={patientPreviewLine}
            />
        </div>
    );
}
