import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, Zap } from "lucide-react";
import Sidebar from "./Sidebar";
import "../../styles/dashboard.css";

export default function MainLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const getPageTitle = (pathname) => {
        switch (pathname) {
            case "/": return "Dashboard Overview";
            case "/clinician": return "Patient Analytics";
            case "/settings": return "Preferences";
            default: return "MindFlow";
        }
    };

    return (
        <div className="app-container">
            <Sidebar
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <main className="main-content">
                {/* Mobile Header */}
                <div className="mobile-toggle">
                    <div style={{ fontWeight: 700, fontSize: 18 }}>MindFlow</div>
                    <button className="btn-ghost" style={{ padding: 8 }} onClick={() => setMobileMenuOpen(true)}>
                        <Menu size={20} />
                    </button>
                </div>

                {/* Desktop Header area inside main content */}
                <header style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 24, borderBottom: "1px solid var(--glass-border)" }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800 }} className="text-gradient">
                            {getPageTitle(location.pathname)}
                        </h1>
                        <div style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>
                            Welcome back, Dr. Sarah
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <button className="btn-ghost" style={{ borderRadius: "50%", width: 42, height: 42, padding: 0, justifyContent: "center" }}>
                            <Zap size={18} />
                        </button>
                        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                            S
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
