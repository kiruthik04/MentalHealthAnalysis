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
                        <input placeholder="Filter patients..." value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)", fontWeight: 700 }} />
                        <button className="btn ghost" onClick={randomizeAllPatients}>Randomize all</button>
                    </div>
                </div>

                <div style={{ marginTop: 12, overflowY: "auto", maxHeight: 360 }}>
                    <div className="patient-list">
                        {filteredPatients.map(p => (
                            <motion.div key={p.id} className="patient-row" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                                <div>
                                    <div style={{ fontWeight: 900 }}>{p.name}</div>
                                    <div className="small">{patientPreviewLine(p)}</div>
                                    <div style={{ marginTop: 6 }}>{(p.tags || []).map(tag => <span key={tag} style={{ marginRight: 8, padding: "4px 8px", background: "rgba(255,255,255,0.02)", borderRadius: 8, fontSize: 12 }}>{tag}</span>)}</div>
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

            <div style={{ gridColumn: "1 / -1" }}>
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
            </div>
        </div>
    );
}
