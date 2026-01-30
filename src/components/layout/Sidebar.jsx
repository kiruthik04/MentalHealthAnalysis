import React from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
    Settings as SettingsIcon,
    Activity,
    ClipboardCheck,
    RefreshCcw,
    Download
} from "lucide-react";
import IconButton from "../ui/IconButton";
import StatCard from "../ui/StatCard";
import { SYMPTOM_DEFS, ACCENT, ACCENT2 } from "../../data/constants";
import { useData } from "../../context/DataContext";

export default function Sidebar({ isOpen, onClose }) {
    const { patients, overallPredictions, totals, resetDataset, appendThree, downloadCSV } = useData();

    const cardVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="drawer-backdrop"
                    onClick={onClose}
                    style={{ zIndex: 49 }}
                />
            )}

            <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Sidebar">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <div>
                        <div className="gradient-text" style={{ fontSize: 22, fontWeight: 900 }}>Mental Health</div>
                        <div style={{ color: "var(--text-muted)", marginTop: 6 }}>Dashboard V2</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {/* Close button for mobile */}
                        <div className="mobile-only" style={{ display: isOpen ? 'block' : 'none' }}>
                            <IconButton title="Close Menu" onClick={onClose}>
                                <span style={{ fontSize: 18 }}>✕</span>
                            </IconButton>
                        </div>
                    </div>
                </div>

                <div style={{ height: 24 }} />

                <motion.div className="card" initial="hidden" animate="visible" variants={cardVariants}>
                    <div style={{ fontWeight: 900, marginBottom: 12 }}>Navigation</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <NavLink to="/" className={({ isActive }) => `tab ${isActive ? "active" : ""}`} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                            <Activity size={16} /> Self Assessment
                        </NavLink>
                        <NavLink to="/clinician" className={({ isActive }) => `tab ${isActive ? "active" : ""}`} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                            <ClipboardCheck size={16} /> Clinician View
                        </NavLink>
                        <NavLink to="/settings" className={({ isActive }) => `tab ${isActive ? "active" : ""}`} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                            <SettingsIcon size={16} /> Settings
                        </NavLink>
                    </div>
                </motion.div>

                <div style={{ height: 12 }} />

                <motion.div className="card" initial="hidden" animate="visible" variants={cardVariants}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontWeight: 900 }}>Dataset Overview</div>
                            <div className="small" style={{ marginTop: 6 }}>Client-only demo data</div>
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
                        {SYMPTOM_DEFS.slice(0, 6).map(s => {
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
            </aside>
        </>
    );
}
