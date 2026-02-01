import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from "recharts";
import { ArrowLeftCircle, Trash2, Tag, Save, RotateCcw } from "lucide-react";
import { SYMPTOM_DEFS, ACCENT, COLORS, DANGER } from "../../../data/constants";
import { predictConditions } from "../../../utils/analysis";
import { User, MapPin, Briefcase, Phone, FileText } from "lucide-react";

export default function PatientDrawer({
    overlayOpen,
    selectedPatient,
    setSelectedId,
    toggleUrgentTag,
    deletePatient,
    setEditorBuffer,
    editorBuffer,
    randomizeEditor,
    saveEdits,
    patientPreviewLine
}) {
    const drawerRadarData = useMemo(() => {
        if (!selectedPatient) return [];
        const preds = predictConditions(selectedPatient.symptoms);
        return Object.keys(preds).map(k => ({ subject: k, A: preds[k], fullMark: 100 }));
    }, [selectedPatient]);

    return (
        <AnimatePresence>
            {overlayOpen && selectedPatient && (
                <>
                    <motion.div
                        className="drawer-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSelectedId(null)}
                    />
                    <motion.aside
                        className="drawer"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        style={{
                            position: "fixed",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: "90%",
                            maxWidth: 550,
                            background: "rgba(11, 14, 20, 0.95)",
                            backdropFilter: "blur(40px)",
                            borderLeft: "1px solid var(--glass-border)",
                            zIndex: 1000,
                            padding: 32,
                            overflowY: "auto",
                            boxShadow: "-10px 0 50px rgba(0,0,0,0.5)"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>{selectedPatient.name}</div>
                                <div className="small" style={{ marginTop: 6, fontSize: 14 }}>{patientPreviewLine(selectedPatient)}</div>
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="btn-ghost" onClick={() => setSelectedId(null)} style={{ border: "none" }}>
                                    <ArrowLeftCircle size={24} />
                                </button>
                            </div>
                        </div>

                        <div style={{ height: 24 }} />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                            <div className="glass-panel" style={{ padding: 20 }}>
                                <div style={{ fontWeight: 800 }}>Risk Profile</div>
                                <div className="small" style={{ marginTop: 4 }}>AI Risk Assessment</div>
                                <div style={{ height: 200, marginTop: 12 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={drawerRadarData} cx="50%" cy="50%" outerRadius={60}>
                                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="Risk" dataKey="A" stroke={ACCENT} fill={ACCENT} fillOpacity={0.6} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div style={{ marginTop: 12 }}>
                                    {Object.entries(predictConditions(selectedPatient.symptoms)).map(([k, v], idx) => (
                                        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed rgba(255,255,255,0.05)" }}>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <div style={{ width: 8, height: 8, background: COLORS[idx % COLORS.length], borderRadius: "50%" }} />
                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{k}</div>
                                            </div>
                                            <div style={{ fontWeight: 800, color: "white" }}>{v}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: 20 }}>
                                <div style={{ fontWeight: 800 }}>Clinical Editor</div>
                                <div className="small" style={{ marginTop: 4 }}>Fine-tune symptoms</div>

                                <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    <button className="btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 13 }} onClick={() => setEditorBuffer({ ...selectedPatient, symptoms: { ...selectedPatient.symptoms } })}>
                                        <RotateCcw size={14} /> Revert
                                    </button>
                                    <button className="btn-neon" style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "8px 12px" }} onClick={() => { saveEdits(); setSelectedId(null); }}>
                                        <Save size={14} /> Save
                                    </button>
                                </div>

                                <div style={{ marginTop: 16, maxHeight: 400, overflowY: "auto", paddingRight: 6 }}>
                                    {SYMPTOM_DEFS.map(s => {
                                        const val = editorBuffer.symptoms?.[s.key] ?? selectedPatient.symptoms[s.key] ?? 0;
                                        return (
                                            <div key={s.key} style={{ marginBottom: 16 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{val}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="5"
                                                    value={val}
                                                    onChange={e => setEditorBuffer(prev => ({ ...prev, symptoms: { ...prev.symptoms, [s.key]: Number(e.target.value) } }))}
                                                    style={{ width: "100%", accentColor: "var(--primary)" }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
                            <div className="glass-panel" style={{ padding: 20 }}>
                                <div style={{ fontWeight: 800, marginBottom: 12 }}>Patient Details</div>
                                <div style={{ display: "grid", gap: 12 }}>
                                    <div>
                                        <label className="small" style={{ display: "block", marginBottom: 4 }}>Age</label>
                                        <input
                                            type="number"
                                            value={editorBuffer.age || ""}
                                            onChange={e => setEditorBuffer(prev => ({ ...prev, age: e.target.value }))}
                                            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", padding: 8, borderRadius: 8, color: "white" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="small" style={{ display: "block", marginBottom: 4 }}>Location</label>
                                        <div style={{ position: "relative" }}>
                                            <MapPin size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-muted)" }} />
                                            <input
                                                value={editorBuffer.location || ""}
                                                onChange={e => setEditorBuffer(prev => ({ ...prev, location: e.target.value }))}
                                                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", padding: "8px 8px 8px 32px", borderRadius: 8, color: "white" }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="small" style={{ display: "block", marginBottom: 4 }}>Occupation</label>
                                        <div style={{ position: "relative" }}>
                                            <Briefcase size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-muted)" }} />
                                            <input
                                                value={editorBuffer.occupation || ""}
                                                onChange={e => setEditorBuffer(prev => ({ ...prev, occupation: e.target.value }))}
                                                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", padding: "8px 8px 8px 32px", borderRadius: 8, color: "white" }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="small" style={{ display: "block", marginBottom: 4 }}>Contact</label>
                                        <div style={{ position: "relative" }}>
                                            <Phone size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-muted)" }} />
                                            <input
                                                value={editorBuffer.contact || ""}
                                                onChange={e => setEditorBuffer(prev => ({ ...prev, contact: e.target.value }))}
                                                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", padding: "8px 8px 8px 32px", borderRadius: 8, color: "white" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: 20 }}>
                                <div style={{ fontWeight: 800, marginBottom: 12 }}>Medical History</div>
                                <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                    <textarea
                                        value={editorBuffer.medicalHistory || ""}
                                        onChange={e => setEditorBuffer(prev => ({ ...prev, medicalHistory: e.target.value }))}
                                        placeholder="Enter patient medical history, allergies, and past treatments..."
                                        style={{
                                            flex: 1,
                                            width: "100%",
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid var(--glass-border)",
                                            padding: 12,
                                            borderRadius: 8,
                                            color: "white",
                                            resize: "none",
                                            minHeight: 180,
                                            lineHeight: 1.5,
                                            fontFamily: "inherit"
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ marginTop: 18 }}>
                            <div style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1 }}>Notes</div>
                            <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.5 }}>{selectedPatient.notes}</div>

                            <div style={{ height: "1px", background: "var(--glass-border)", margin: "24px 0" }} />

                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="btn-ghost" onClick={() => toggleUrgentTag(selectedPatient.id)}>
                                    <Tag size={16} /> {(selectedPatient.tags || []).includes("Urgent") ? "Remove Urgent" : "Mark as Urgent"}
                                </button>
                                <button className="btn-ghost" style={{ color: "#ff6b6b", borderColor: "rgba(255, 107, 107, 0.3)" }} onClick={() => { deletePatient(selectedPatient.id); setSelectedId(null); }}>
                                    <Trash2 size={16} /> Delete Record
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
