import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    MapPin,
    Briefcase,
    Phone,
    FileText,
    Save,
    Calendar,
    ShieldAlert
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/db";

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editor state
    const [formData, setFormData] = useState({
        age: "",
        location: "",
        occupation: "",
        contact: ""
    });

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        const p = await db.getPatientProfile(user.id);
        if (p) {
            setProfile(p);
            setFormData({
                age: p.age || "",
                location: p.location || "",
                occupation: p.occupation || "",
                contact: p.contact || ""
            });
        }
        setLoading(false);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        // Simulate delay
        await new Promise(r => setTimeout(r, 600));

        const success = await db.updatePatient(profile.id, formData);
        if (success.success) {
            // Update local state
            setProfile({ ...profile, ...formData });
            alert("Profile updated successfully!");
        } else {
            alert("Failed to update profile.");
        }
        setSaving(false);
    };

    if (loading) return <div className="glass-panel" style={{ padding: 32 }}>Loading profile...</div>;

    if (!profile) return (
        <div className="glass-panel" style={{ padding: 32, textAlign: "center" }}>
            <User size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
            <h3>Profile Not Found</h3>
            <p className="text-muted">Could not retrieve patient details for this account.</p>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 800 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>My Profile</h2>
                <button
                    className="btn-neon"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ padding: "10px 20px", display: "flex", gap: 8, alignItems: "center" }}
                >
                    {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
                </button>
            </div>

            <div style={{ display: "grid", gap: 24 }}>
                {/* Personal Details - Editable */}
                <div className="glass-panel">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ background: "rgba(99, 102, 241, 0.2)", padding: 8, borderRadius: 10 }}>
                            <User size={20} color="#a5b4fc" />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Personal Details</h3>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        <div className="input-group">
                            <label className="small" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Full Name (Read-only)</label>
                            <input
                                value={profile.name}
                                disabled
                                className="input"
                                style={{ width: "100%", opacity: 0.6, cursor: "not-allowed" }}
                            />
                        </div>

                        <div className="input-group">
                            <label className="small" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Age</label>
                            <div style={{ position: "relative" }}>
                                <Calendar size={18} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={e => handleChange("age", e.target.value)}
                                    className="input"
                                    style={{ width: "100%", paddingLeft: 40 }}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="small" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Location</label>
                            <div style={{ position: "relative" }}>
                                <MapPin size={18} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                                <input
                                    value={formData.location}
                                    onChange={e => handleChange("location", e.target.value)}
                                    className="input"
                                    style={{ width: "100%", paddingLeft: 40 }}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="small" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Occupation</label>
                            <div style={{ position: "relative" }}>
                                <Briefcase size={18} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                                <input
                                    value={formData.occupation}
                                    onChange={e => handleChange("occupation", e.target.value)}
                                    className="input"
                                    style={{ width: "100%", paddingLeft: 40 }}
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ gridColumn: "span 2" }}>
                            <label className="small" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Contact Information</label>
                            <div style={{ position: "relative" }}>
                                <Phone size={18} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                                <input
                                    value={formData.contact}
                                    onChange={e => handleChange("contact", e.target.value)}
                                    className="input"
                                    style={{ width: "100%", paddingLeft: 40 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical Details - Read Only */}
                <div className="glass-panel" style={{ border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ background: "rgba(239, 68, 68, 0.2)", padding: 8, borderRadius: 10 }}>
                            <ShieldAlert size={20} color="#fca5a5" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Clinical Record</h3>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Managed by your clinician</div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: 20 }}>
                        <div>
                            <label className="small" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Medical History</label>
                            <textarea
                                value={profile.medicalHistory || "No history recorded."}
                                disabled
                                style={{
                                    width: "100%",
                                    minHeight: 100,
                                    background: "rgba(0,0,0,0.2)",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    borderRadius: 8,
                                    padding: 12,
                                    color: "var(--text-muted)",
                                    resize: "none",
                                    cursor: "not-allowed"
                                }}
                            />
                        </div>

                        <div>
                            <label className="small" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Clinical Notes</label>
                            <textarea
                                value={profile.notes || "No notes available."}
                                disabled
                                style={{
                                    width: "100%",
                                    minHeight: 80,
                                    background: "rgba(0,0,0,0.2)",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    borderRadius: 8,
                                    padding: 12,
                                    color: "var(--text-muted)",
                                    resize: "none",
                                    cursor: "not-allowed"
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
