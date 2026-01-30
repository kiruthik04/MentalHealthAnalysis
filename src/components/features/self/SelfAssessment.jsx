import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
    Tooltip
} from "recharts";
import { RefreshCcw, Download } from "lucide-react";
import { SYMPTOM_DEFS, ACCENT, ACCENT2 } from "../../../data/constants";
import { predictConditions } from "../../../utils/analysis";
import { downloadCSV } from "../../../utils/export";

export default function SelfAssessment({
    selfSymptoms,
    setSelfSymptom,
    resetSelfInputs,
    selfResults,
    setSelfResults,
    selfAnalyzedAt,
    setSelfAnalyzedAt
}) {
    const cardVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    const selfBarData = useMemo(() => SYMPTOM_DEFS.map(s => ({ name: s.short, value: selfSymptoms[s.key] || 0 })), [selfSymptoms]);
    const selfRadarData = useMemo(() => {
        if (!selfResults) return Object.keys(predictConditions({})).map(k => ({ subject: k, A: 0, fullMark: 100 }));
        const pd = selfResults.preds;
        return Object.keys(pd).map(k => ({ subject: k, A: pd[k], fullMark: 100 }));
    }, [selfResults]);

    return (
        <>
            <div className="row">
                {/* left: inputs (65%) */}
                <motion.div className="glass-panel" initial="hidden" animate="visible" variants={cardVariants} style={{ minHeight: 720 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 18 }}>Symptom Input</div>
                            <div className="small" style={{ marginTop: 6 }}>Set severity for each symptom (0–5)</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn-ghost" onClick={resetSelfInputs}><RefreshCcw size={14} /> Reset</button>
                            <button className="btn-ghost" onClick={() => downloadCSV([{ id: "self-input", name: "Self", age: "", sex: "", date: new Date().toISOString().slice(0, 10), symptoms: selfSymptoms, notes: "Self input export", tags: [] }])}><Download size={14} /> Export</button>
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
                                    <div style={{ minWidth: 44, textAlign: "center", fontWeight: 800 }}>{selfSymptoms[s.key]}</div>
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
                                    <div style={{ minWidth: 44, textAlign: "center", fontWeight: 800 }}>{selfSymptoms[s.key]}</div>
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
                                    <div style={{ minWidth: 44, textAlign: "center", fontWeight: 800 }}>{selfSymptoms[s.key]}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="group">
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>Risk & Other</div>
                        {SYMPTOM_DEFS.filter(s => ["Risk", "Substance", "Physical", "Motor"].includes(s.group)).map(s => (
                            <div key={s.key} className="symptom-row">
                                <div className="symptom-label">{s.label}</div>
                                <div className="symptom-controls">
                                    <input className="range" type="range" min="0" max="5" value={selfSymptoms[s.key]} onChange={e => setSelfSymptom(s.key, e.target.value)} />
                                    <div style={{ minWidth: 44, textAlign: "center", fontWeight: 800 }}>{selfSymptoms[s.key]}</div>
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
                            <button className="btn ghost" onClick={() => downloadCSV([{ id: "self-result", name: "Self Result", age: "", sex: "", date: new Date().toISOString().slice(0, 10), symptoms: selfSymptoms, notes: JSON.stringify(selfResults || {}), tags: [] }])}><Download size={14} /> Export</button>
                        </div>
                    </div>

                    <div style={{ height: 18 }} />

                    <div style={{ display: "flex", gap: 18 }}>
                        <div style={{ width: 320, height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={selfRadarData} cx="50%" cy="50%" outerRadius={80}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis domain={[0, 100]} />
                                    <Radar name="Risk" dataKey="A" stroke={ACCENT} fill={ACCENT} fillOpacity={0.6} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                {selfResults ? Object.entries(selfResults.preds).map(([k, v], i) => (
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
                                {selfResults ? selfResults.recommendations.map((r, i) => <div key={i} style={{ marginBottom: 8 }}>{r}</div>) : <div>Analyze to receive recommendations.</div>}
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 18 }} />

                    <div style={{ fontWeight: 900 }}>Symptom intensity (input)</div>
                    <div style={{ height: 260, marginTop: 12 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={selfBarData} margin={{ top: 10, right: 20, left: -10, bottom: 120 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={90} />
                                <YAxis allowDecimals={false} domain={[0, 5]} />
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
    );
}
