import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, Zap } from "lucide-react";
import PatientSidebar from "./PatientSidebar";
import "../../styles/dashboard.css";
import { useAuth } from "../../context/AuthContext";

export default function PatientLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    const getPageTitle = (pathname) => {
        if (pathname.includes("/assessment")) return "Self Assessment";
        if (pathname.includes("/settings")) return "Settings";
        return "My Wellbeing";
    };

    return (
        <div className="app-container">
            <PatientSidebar
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <main className="main-content">
                <div className="mobile-toggle">
                    <div style={{ fontWeight: 700, fontSize: 18 }}>MindFlow</div>
                    <button className="btn-ghost" style={{ padding: 8 }} onClick={() => setMobileMenuOpen(true)}>
                        <Menu size={20} />
                    </button>
                </div>

                <header style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 24, borderBottom: "1px solid var(--glass-border)" }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800 }} className="text-gradient">
                            {getPageTitle(location.pathname)}
                        </h1>
                        <div style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>
                            Hello, {user?.name || "Patient"}
                        </div>
                    </div>
                </header>

                <div className="content-scrollable">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
