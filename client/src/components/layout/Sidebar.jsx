import React from "react";
import { NavLink } from "react-router-dom";
import {
    Activity,
    ClipboardCheck,
    Settings,
    Sparkles,
    LogOut
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
    // Backdrop for mobile
    const Backdrop = () => (
        isOpen ? <div className="backdrop" onClick={onClose} /> : null
    );

    return (
        <>
            <Backdrop />
            <aside className={`sidebar-dock ${isOpen ? "open" : ""}`}>
                <div className="brand">
                    <div className="brand-title">MindFlow</div>
                    <div className="brand-subtitle">AI Wellness Companion</div>
                </div>

                <nav className="nav-section">
                    <div style={{ paddingLeft: 12, marginBottom: 8, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>
                        Menu
                    </div>

                    <NavLink
                        to="/"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        onClick={onClose}
                    >
                        <Activity size={20} className="nav-icon" />
                        <span>Overview</span>
                    </NavLink>

                    <NavLink
                        to="/clinician"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        onClick={onClose}
                    >
                        <ClipboardCheck size={20} className="nav-icon" />
                        <span>Clinician View</span>
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        onClick={onClose}
                    >
                        <Settings size={20} className="nav-icon" />
                        <span>Settings</span>
                    </NavLink>
                </nav>

                <div className="glass-panel" style={{ marginTop: "auto", padding: 16, background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Pro Plan</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Active</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
