import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Database, Zap } from "lucide-react";
import { db } from "../services/db";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
    const { user } = useAuth();
    const [prefs, setPrefs] = useState({
        darkMode: true,
        dataPersistence: true,
        animationSpeed: "Normal"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            db.getUserPreferences(user.id).then(p => {
                if (p) setPrefs(p);
                setLoading(false);
            });
        }
    }, [user]);

    const handleToggle = (key) => {
        const newVal = !prefs[key];
        updatePref(key, newVal);
    };

    const handleChange = (key, val) => {
        updatePref(key, val);
    };

    const updatePref = (key, val) => {
        const newPrefs = { ...prefs, [key]: val };
        setPrefs(newPrefs);
        if (user) {
            db.updateUserPreferences(user.id, { [key]: val });
        }
    };

    const SettingItem = ({ icon: Icon, title, desc, children }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: "20px 0", borderBottom: "1px solid var(--glass-border)" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                    <Icon size={20} />
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
                    <div className="small" style={{ opacity: 0.6 }}>{desc}</div>
                </div>
            </div>
            {children}
        </div>
    );

    if (loading) return <div className="glass-panel" style={{ padding: 32 }}>Loading preferences...</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 800 }}>
            <div className="glass-panel">
                <h3 style={{ marginBottom: 24, fontSize: 18 }}>Preferences</h3>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <SettingItem icon={Moon} title="Dark Mode" desc="Enable dark aesthetic">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={prefs.darkMode}
                                onChange={() => handleToggle("darkMode")}
                                style={{ accentColor: 'var(--primary)', width: 20, height: 20, cursor: "pointer" }}
                            />
                        </label>
                    </SettingItem>

                    <SettingItem icon={Database} title="Data Persistence" desc="Save to localStorage">
                        <input
                            type="checkbox"
                            checked={prefs.dataPersistence}
                            onChange={() => handleToggle("dataPersistence")}
                            style={{ accentColor: 'var(--primary)', width: 20, height: 20, cursor: "pointer" }}
                        />
                    </SettingItem>

                    <SettingItem icon={Zap} title="Animation Speed" desc="UI transition duration">
                        <select
                            value={prefs.animationSpeed}
                            onChange={(e) => handleChange("animationSpeed", e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.3)', color: 'inherit', border: '1px solid var(--glass-border)', padding: "8px 12px", borderRadius: 8, outline: "none", cursor: "pointer" }}
                        >
                            <option value="Normal">Normal</option>
                            <option value="Fast">Fast</option>
                        </select>
                    </SettingItem>
                </div>
            </div>
        </motion.div>
    );
}
