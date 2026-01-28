import React from "react";

export default function StatCard({ title, value, hint }) {
    return (
        <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.01)" }}>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{title}</div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{value}</div>
            {hint && <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>{hint}</div>}
        </div>
    );
}
