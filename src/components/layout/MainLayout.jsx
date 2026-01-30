import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import "../../styles/dashboard.css"; // ensure styles are loaded

export default function MainLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div style={{ width: "100%" }}>
            <div className="app">
                <Sidebar
                    isOpen={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                />

                <main className="main" aria-live="polite">
                    {/* Mobile Header Toggle */}
                    <div className="mobile-toggle" style={{ marginBottom: 16 }}>
                        <button className="btn ghost" onClick={() => setMobileMenuOpen(true)}>
                            <Menu size={20} /> <span style={{ fontSize: 14 }}>Menu</span>
                        </button>
                    </div>

                    <Outlet />
                </main>
            </div>
        </div>
    );
}
