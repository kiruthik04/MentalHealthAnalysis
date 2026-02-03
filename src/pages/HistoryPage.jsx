import React, { useEffect, useState } from "react";
import { db } from "../services/db";
import { useAuth } from "../context/AuthContext";
import { Calendar, AlertCircle } from "lucide-react";

export default function HistoryPage() {
    const { user } = useAuth();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            if (user) {
                // First get patient profile to ensure we have the correct patient ID
                const profile = await db.getPatientProfile(user.id);
                if (profile) {
                    const data = await db.getPatientAssessments(profile.id);
                    setAssessments(data);
                }
            }
            setLoading(false);
        }
        fetchHistory();
    }, [user]);

    if (loading) return <div className="glass-panel" style={{ padding: 24, textAlign: "center" }}>Loading history...</div>;

    if (assessments.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: 40, textAlign: "center" }}>
                <Calendar size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
                <h3>No Assessments Yet</h3>
                <p style={{ color: "var(--text-muted)" }}>Complete a self-assessment to track your progress.</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Assessment History</h2>

            {assessments.map(record => (
                <div key={record.id} className="glass-panel" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ fontWeight: 600 }}>
                            {new Date(record.created_at).toLocaleDateString()} at {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>ID: {record.id}</div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>Risk Analysis</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {Object.entries(record.prediction_result || {}).map(([condition, score]) => (
                                score > 0.3 && (
                                    <div key={condition} style={{
                                        padding: "4px 10px",
                                        borderRadius: 20,
                                        background: score > 0.7 ? "rgba(255, 107, 107, 0.2)" : "rgba(255, 195, 0, 0.2)",
                                        color: score > 0.7 ? "var(--danger)" : "var(--warning)",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6
                                    }}>
                                        {score > 0.7 && <AlertCircle size={14} />}
                                        {condition}: {Math.round(score * 100)}%
                                    </div>
                                )
                            ))}
                            {Object.values(record.prediction_result || {}).every(s => s <= 0.3) && (
                                <div style={{
                                    padding: "4px 10px",
                                    borderRadius: 20,
                                    background: "rgba(34, 211, 162, 0.15)",
                                    color: "var(--success)",
                                    fontSize: 13,
                                    fontWeight: 600
                                }}>
                                    No significant risks detected
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {Object.keys(record.symptom_scores || {}).length} symptoms reported
                    </div>
                </div>
            ))}
        </div>
    );
}
