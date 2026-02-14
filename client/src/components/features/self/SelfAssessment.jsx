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
    setSelfAnalyzedAt,
    age,
    setAge,
    sex,
    setSex,
    onAnalyze
}) {
    const cardVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    const [flipped, setFlipped] = useState(null); // Track which card is flipped

    const selfBarData = useMemo(() => SYMPTOM_DEFS.map(s => ({ name: s.short, value: selfSymptoms[s.key] || 0 })), [selfSymptoms]);
    const selfRadarData = useMemo(() => {
        if (!selfResults) return Object.keys(predictConditions({})).map(k => ({ subject: k, A: 0, fullMark: 100 }));
        const pd = selfResults.preds;
        return Object.keys(pd).map(k => ({ subject: k, A: pd[k] * 100, fullMark: 100 }));
    }, [selfResults]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* INPUT SECTION */}
            <motion.div
                className="glass-panel"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 22 }} className="text-gradient">Self Assessment</div>
                        <div className="text-muted" style={{ marginTop: 4, fontSize: 14 }}>Rate your symptoms (0 = None, 5 = Severe)</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button className="btn-ghost" onClick={resetSelfInputs}>
                            <RefreshCcw size={16} /> Reset
                        </button>
                        <button className="btn-ghost" onClick={() => downloadCSV([{ id: "self-input", name: "Self", date: new Date().toISOString(), symptoms: selfSymptoms }])}>
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                <div style={{ height: 24 }} />

                {/* DEMOGRAPHICS */}
                <div className="symptom-grid" style={{ marginBottom: 24 }}>
                    <div className="symptom-card">
                        <label className="small" style={{ marginBottom: 6, display: "block", color: "var(--text-muted)" }}>Age</label>
                        <input
                            type="number"
                            className="input"
                            style={{ width: "100%" }}
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            placeholder="e.g. 25"
                        />
                    </div>
                    <div className="symptom-card">
                        <label className="small" style={{ marginBottom: 6, display: "block", color: "var(--text-muted)" }}>Biological Sex</label>
                        <select
                            className="input"
                            style={{ width: "100%" }}
                            value={sex}
                            onChange={e => setSex(e.target.value)}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>

                <div style={{ borderBottom: "1px solid var(--glass-border)", marginBottom: 24 }} />

                {/* SYMPTOM GROUPS */}
                {["Sleep & Energy", "Mood & Cognition", "Anxiety", "Risk & Other"].map(groupName => {
                    let filterFn;
                    if (groupName === "Sleep & Energy") filterFn = s => ["Sleep", "Energy"].includes(s.group);
                    else if (groupName === "Mood & Cognition") filterFn = s => ["Mood", "Cognition"].includes(s.group);
                    else if (groupName === "Anxiety") filterFn = s => ["Anxiety"].includes(s.group);
                    else filterFn = s => !["Sleep", "Energy", "Mood", "Cognition", "Anxiety"].includes(s.group);

                    const groupSymptoms = SYMPTOM_DEFS.filter(filterFn);

                    if (groupSymptoms.length === 0) return null;

                    return (
                        <div key={groupName} style={{ marginBottom: 24 }}>
                            <div style={{
                                fontWeight: 700,
                                fontSize: 13,
                                textTransform: "uppercase",
                                letterSpacing: 1.2,
                                color: "var(--primary)",
                                marginBottom: 12
                            }}>
                                {groupName}
                            </div>
                            <div className="symptom-grid">
                                {groupSymptoms.map((s) => (
                                    <div
                                        key={s.key}
                                        className={`flip-container ${flipped === s.key ? "flipped" : ""}`}
                                        onClick={() => setFlipped(flipped === s.key ? null : s.key)}
                                    >
                                        <div className="flip-inner">
                                            {/* FRONT */}
                                            <div className="flip-front">
                                                <div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                                        <div style={{ fontWeight: 500, fontSize: 15 }}>{s.label}</div>
                                                        <div style={{
                                                            fontWeight: 800,
                                                            color: selfSymptoms[s.key] > 0 ? "var(--primary)" : "var(--text-muted)",
                                                            background: "rgba(0,0,0,0.2)",
                                                            padding: "2px 8px",
                                                            borderRadius: 6,
                                                            minWidth: 28,
                                                            textAlign: "center"
                                                        }}>
                                                            {selfSymptoms[s.key]}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                                                        <span>None</span>
                                                        <span>Severe</span>
                                                    </div>
                                                </div>

                                                <div onClick={e => e.stopPropagation()}>
                                                    <input
                                                        className="range"
                                                        type="range"
                                                        min="0"
                                                        max="5"
                                                        step="1"
                                                        value={selfSymptoms[s.key]}
                                                        onChange={e => setSelfSymptom(s.key, e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* BACK */}
                                            <div className="flip-back">
                                                <div style={{ fontSize: 13, lineHeight: 1.4, color: "var(--text-muted)" }}>
                                                    <div style={{ fontWeight: 700, color: "white", marginBottom: 4 }}>About this symptom</div>
                                                    {s.desc || "No description available."}
                                                </div>
                                                <div style={{ marginTop: 8, fontSize: 11, color: "var(--primary)" }}>Tap to flip back</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div style={{ marginTop: 32, textAlign: "center" }}>
                    <button
                        className="btn-neon"
                        onClick={onAnalyze}
                        style={{
                            width: "100%",
                            maxWidth: 400,
                            justifyContent: "center",
                            padding: "16px 24px",
                            fontSize: 16
                        }}
                    >
                        Run Analysis
                    </button>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                        This tool uses AI to estimate risk levels. Always verify with a professional.
                    </div>
                </div>
            </motion.div>

            {/* RESULTS SECTION */}
            {selfResults && (
                <motion.div
                    className="glass-panel"
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    style={{ borderTop: "4px solid var(--secondary)" }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 22 }} className="text-gradient">Analysis Results</div>
                            <div className="small" style={{ marginTop: 4 }}>
                                {selfAnalyzedAt ? `Analyzed on ${new Date(selfAnalyzedAt).toLocaleDateString()} at ${new Date(selfAnalyzedAt).toLocaleTimeString()}` : ""}
                            </div>
                        </div>
                        <button className="btn-ghost" onClick={() => { setSelfResults(null); setSelfAnalyzedAt(null); }}>
                            Clear Results
                        </button>
                    </div>

                    <div style={{ height: 24 }} />

                    <div className="symptom-grid">
                        {/* CHART */}
                        <div className="symptom-card" style={{ height: 340, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ fontWeight: 700, marginBottom: 16 }}>Risk Profile</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={selfRadarData} cx="50%" cy="50%" outerRadius="70%">
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                                    <PolarRadiusAxis domain={[0, 100]} angle={30} tick={false} axisLine={false} />
                                    <Radar name="Risk" dataKey="A" stroke={ACCENT} fill={ACCENT} fillOpacity={0.5} />
                                    <Tooltip
                                        contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                                        itemStyle={{ color: "#fff" }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* RISKS LIST */}
                        <div>
                            <div style={{ fontWeight: 700, marginBottom: 12 }}>Prediction Confidence</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {Object.entries(selfResults.preds).map(([k, v]) => (
                                    <div key={k} style={{
                                        background: "rgba(255,255,255,0.03)",
                                        padding: "16px",
                                        borderRadius: 12,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        borderLeft: `4px solid ${v > 0.5 ? "var(--danger)" : "var(--secondary)"}`
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{k}</div>
                                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Estimated probability</div>
                                        </div>
                                        <div style={{ fontWeight: 900, fontSize: 18, color: v > 0.5 ? "var(--danger)" : "var(--secondary)" }}>
                                            {Math.round(v * 100)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 24 }}>
                        <div style={{ fontWeight: 700, marginBottom: 12 }}>Insights & Recommendations</div>
                        <div style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: 12, padding: 16 }}>
                            {selfResults.recommendations.length > 0 ? (
                                <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-main)" }}>
                                    {selfResults.recommendations.map((r, i) => <li key={i} style={{ marginBottom: 8 }}>{r}</li>)}
                                </ul>
                            ) : (
                                <div style={{ color: "var(--text-muted)" }}>No specific concerns detected based on the input.</div>
                            )}
                        </div>
                    </div>

                </motion.div>
            )}
        </div>
    );
}
