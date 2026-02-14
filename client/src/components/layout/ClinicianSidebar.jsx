import React from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    FileText
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ClinicianSidebar({ isOpen, onClose }) {
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
                    <div className="brand-subtitle">Clinician Workspace</div>
                </div>

                <nav className="nav-section">
                    <div style={{ paddingLeft: 12, marginBottom: 8, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>
                        Practice
                    </div>

                    <NavLink
                        to="/c"
                        end
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        onClick={onClose}
                    >
                        <LayoutDashboard size={20} className="nav-icon" />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/c/patients"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        onClick={onClose}
                    >
                        <Users size={20} className="nav-icon" />
                        <span>Patients</span>
                    </NavLink>

                    <div style={{ paddingLeft: 12, marginBottom: 8, marginTop: 24, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>
                        System
                    </div>

                    <NavLink
                        to="/c/settings"
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
