import React from "react";
import { NavLink } from "react-router-dom";
import {
    Activity,
    ClipboardCheck,
    Settings,
    Sparkles,
    LogOut,
    Home
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function PatientSidebar({ isOpen, onClose }) {
    const { logout } = useAuth();

    const Backdrop = () => (
        isOpen ? <div className="backdrop" onClick={onClose} /> : null
    );

    return (
        <>
            <Backdrop />
            <aside className={`sidebar-dock ${isOpen ? "open" : ""}`}>
                <div className="brand">
                    <div className="brand-title">MindFlow</div>
                    <div className="brand-subtitle">Patient Portal</div>
                </div>

                <nav className="nav-section">
                    <div style={{ paddingLeft: 12, marginBottom: 8, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>
                        Menu
                    </div>

                    <NavLink
                        to="/p"
                        end
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        onClick={onClose}
                    >
                        <Activity size={20} className="nav-icon" />
                        <span>Self Assessment</span>
                    </NavLink>

                    <NavLink
                        to="/p/history"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        onClick={onClose}
                    >
                        <ClipboardCheck size={20} className="nav-icon" />
                        <span>History</span>
                    </NavLink>

                    <NavLink
                        to="/p/settings"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        onClick={onClose}
                    >
                        <Settings size={20} className="nav-icon" />
                        <span>Settings</span>
                    </NavLink>
                </nav>

                <div style={{ marginTop: "auto" }}>
                    <button className="nav-link" onClick={logout} style={{ width: "100%", background: "transparent", cursor: "pointer" }}>
                        <LogOut size={20} className="nav-icon" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
