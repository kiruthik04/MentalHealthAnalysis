import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Lock, User, ArrowRight, Sparkles, Activity } from "lucide-react";
import "../styles/dashboard.css";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [role, setRole] = useState("patient"); // 'patient' | 'clinician'
    const [email, setEmail] = useState("patient@demo.com");
    const [password, setPassword] = useState("123");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Simulating network delay for effect
        await new Promise(r => setTimeout(r, 800));

        const success = await login(email, password);
        if (success) {
            navigate(role === "clinician" ? "/c" : "/p");
        } else {
            setError("Invalid credentials. Try patient@demo.com / 123");
            setLoading(false);
        }
    };

    const switchRole = (r) => {
        setRole(r);
        setEmail(r === "patient" ? "patient@demo.com" : "doctor@demo.com");
        setError("");
    };

    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#030305",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Ambient Background Animations */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 50, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    top: "-20%",
                    left: "-10%",
                    width: "60vw",
                    height: "60vw",
                    background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%)",
                    filter: "blur(60px)",
                    zIndex: 0
                }}
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, -30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    bottom: "-10%",
                    right: "-10%",
                    width: "50vw",
                    height: "50vw",
                    background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)",
                    filter: "blur(60px)",
                    zIndex: 0
                }}
            />

            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                style={{
                    width: "100%",
                    maxWidth: 400,
                    padding: 48,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(10, 10, 15, 0.6)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    zIndex: 10,
                    position: "relative"
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        style={{
                            width: 64,
                            height: 64,
                            background: "linear-gradient(135deg, var(--primary), var(--accent-pink))",
                            borderRadius: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px auto",
                            boxShadow: "0 10px 30px rgba(99,102,241,0.3)"
                        }}
                    >
                        <Activity size={32} color="white" />
                    </motion.div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }} className="text-gradient">MindFlow</h1>
                    <div className="small" style={{ fontSize: 16 }}>Your AI Wellness Companion</div>
                </div>

                <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 16, marginBottom: 32, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <button
                        onClick={() => switchRole("patient")}
                        style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: role === "patient" ? "rgba(255,255,255,0.1)" : "transparent", color: role === "patient" ? "white" : "var(--text-muted)", fontWeight: 700, cursor: "pointer", transition: "all 0.3s" }}
                    >
                        Patient
                    </button>
                    <button
                        onClick={() => switchRole("clinician")}
                        style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: role === "clinician" ? "rgba(99,102,241,0.2)" : "transparent", color: role === "clinician" ? "#a5b4fc" : "var(--text-muted)", fontWeight: 700, cursor: "pointer", transition: "all 0.3s" }}
                    >
                        Clinician
                    </button>
                </div>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="input-group">
                        <User size={20} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email address"
                            style={{
                                width: "100%",
                                padding: "16px 16px 16px 50px",
                                borderRadius: 16,
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "white",
                                outline: "none",
                                fontSize: 16,
                                transition: "all 0.2s"
                            }}
                            onFocus={e => e.target.style.borderColor = "var(--primary)"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={20} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            style={{
                                width: "100%",
                                padding: "16px 16px 16px 50px",
                                borderRadius: 16,
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "white",
                                outline: "none",
                                fontSize: 16,
                                transition: "all 0.2s"
                            }}
                            onFocus={e => e.target.style.borderColor = "var(--primary)"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            style={{ color: "#ff6b6b", fontSize: 13, textAlign: "center", background: "rgba(255, 107, 107, 0.1)", padding: 10, borderRadius: 8 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-neon"
                        style={{ marginTop: 12, justifyContent: "center", fontSize: 16, height: 56, borderRadius: 16, fontWeight: 700 }}
                        disabled={loading}
                    >
                        {loading ? <Activity className="spin" /> : <>Sign In <ArrowRight size={20} /></>}
                    </motion.button>
                </form>

                <div style={{ marginTop: 32, textAlign: "center", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    <div style={{ marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, fontSize: 11 }}>Debug Access</div>
                    <span style={{ color: "white" }}>patient@demo.com</span> / 123 <br />
                    <span style={{ color: "#a5b4fc" }}>doctor@demo.com</span> / 123
                </div>
            </motion.div>
        </div>
    );
}
