import React from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: 12 }}>Settings</h1>
            <p className="small" style={{ marginBottom: 24 }}>Application preferences (Demo)</p>

            <div className="card" style={{ maxWidth: 600 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <div style={{ fontWeight: 700 }}>Dark Mode</div>
                        <div className="small">Enable dark aesthetic</div>
                    </div>
                    <input type="checkbox" checked readOnly style={{ accentColor: 'var(--primary)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <div style={{ fontWeight: 700 }}>Data Persistence</div>
                        <div className="small">Save to localStorage</div>
                    </div>
                    <input type="checkbox" checked readOnly style={{ accentColor: 'var(--primary)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 700 }}>Animation Speed</div>
                        <div className="small">UI transition duration</div>
                    </div>
                    <select style={{ background: 'transparent', color: 'inherit', border: '1px solid var(--glass-border)', padding: 4, borderRadius: 4 }}>
                        <option>Normal</option>
                        <option>Fast</option>
                    </select>
                </div>
            </div>
        </motion.div>
    );
}
