import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar
} from "recharts";
import { PlusCircle, Trash2, Download, RefreshCcw } from "lucide-react";
import { ACCENT, DANGER } from "../../../data/constants";

export default function ClinicianDashboard({
    patients,
    setPatients,
    query,
    setQuery,
    addPatient,
    appendThree,
    deletePatient,
    setSelectedId,
    filteredPatients,
    overallPredictions,
    downloadCSV,
    resetDataset,
    barData,
    patientPreviewLine,
    randomizeAllPatients
}) {
    const cardVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            <motion.div className="glass-panel" initial="hidden" animate="visible" variants={cardVariants} style={{ minHeight: 520 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>Patient Records</div>
                        <div className="small" style={{ marginTop: 6 }}>Search, edit and manage demo patients</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-neon" onClick={addPatient}><PlusCircle size={16} /> New</button>
                        <button className="btn-ghost" onClick={appendThree}>Add 3</button>
                    </div>
                </div>

                <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                        <input
                            placeholder="Filter patients..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "12px 16px",
                                borderRadius: 12,
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid var(--glass-border)",
                                fontWeight: 500,
                                color: "white",
                                outline: "none"
                            }}
                        />
                        <button className="btn-ghost" onClick={randomizeAllPatients}>Randomize all</button>
                    </div>
                </div>

                <div style={{ overflowY: "auto", maxHeight: 400, paddingRight: 4 }}>
                    <div className="patient-list">
                        {filteredPatients.map(p => (
                            <motion.div key={p.id} className="patient-row" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: "16px",
                                    marginBottom: 8,
                                    background: "rgba(255,255,255,0.02)",
                                    borderRadius: 12,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    border: "1px solid transparent",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                            >
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                                    <div className="small" style={{ opacity: 0.7 }}>{patientPreviewLine(p)}</div>
                                    <div style={{ marginTop: 8 }}>
                                        {(p.tags || []).map(tag => (
                                            <span key={tag} style={{ marginRight: 8, padding: "4px 10px", background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button className="btn-ghost" style={{ padding: "8px 16px" }} onClick={() => setSelectedId(p.id)}>View</button>
                                    <button className="btn-ghost" style={{ color: "#ff6b6b", borderColor: "rgba(255, 107, 107, 0.2)" }} onClick={() => deletePatient(p.id)}><Trash2 size={16} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <motion.div className="glass-panel" initial="hidden" animate="visible" variants={cardVariants}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontWeight: 900 }}>Aggregate risks</div>
                            <div className="small" style={{ marginTop: 4 }}>Average dataset risk</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn-ghost" style={{ padding: 8 }} onClick={resetDataset}><RefreshCcw size={14} /></button>
                        </div>
                    </div>

                    <div style={{ height: 180, marginTop: 16 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={overallPredictions.map(c => ({ name: c.condition, value: c.value }))}>
                                <XAxis dataKey="name" hide />
                                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }} />
                                <Line type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={3} dot={{ r: 4, fill: ACCENT }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div className="glass-panel" initial="hidden" animate="visible" variants={cardVariants} style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900 }}>Symptom distribution</div>
                    <div className="small" style={{ marginTop: 4 }}>Cumulative severity</div>
                    <div style={{ height: 260, marginTop: 16 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 0, left: -20, bottom: 40 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} interval={0} angle={-45} textAnchor="end" />
                                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }} />
                                <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
                <motion.div className="glass-panel" initial="hidden" animate="visible" variants={cardVariants}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontWeight: 900 }}>AI Insights</div>
                            <div className="small" style={{ marginTop: 6 }}>Automated pattern recognition (Demo)</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn-ghost" onClick={() => downloadCSV(patients)}><Download size={14} /> Export CSV</button>
                        </div>
                    </div>

                    <div style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12 }}>
                        Analysis of the current cohort suggests a correlation between <strong>Sleep Disturbance Level 4+</strong> and elevated <strong>Anxiety</strong> scores (r=0.65). Consider prioritizing sleep hygiene interventions.
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
