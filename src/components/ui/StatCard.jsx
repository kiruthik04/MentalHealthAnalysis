import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ title, value, hint, trend = "neutral" }) {
    return (
        <div className="glass-panel" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 28, textShadow: "0 0 20px rgba(255,255,255,0.1)" }}>{value}</div>
                {hint && <div style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>{hint}</div>}
            </div>
        </div>
    );
}
