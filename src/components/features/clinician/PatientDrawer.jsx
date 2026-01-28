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
import { ArrowLeftCircle, Trash2 } from "lucide-react";
import { SYMPTOM_DEFS, ACCENT, COLORS, DANGER } from "../../../data/constants";
import { predictConditions } from "../../../utils/analysis";

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
                                            <PolarRadiusAxis domain={[0, 100]} />
                                            <Radar name="Risk" dataKey="A" stroke={ACCENT} fill={ACCENT} fillOpacity={0.6} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div style={{ marginTop: 12 }}>
                                    {Object.entries(predictConditions(selectedPatient.symptoms)).map(([k, v], idx) => (
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
    );
}
