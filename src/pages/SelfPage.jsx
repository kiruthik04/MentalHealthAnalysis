import React, { useState } from "react";
import SelfAssessment from "../components/features/self/SelfAssessment";
import { SYMPTOM_DEFS } from "../data/constants";
import { predictConditions } from "../utils/analysis";
import { db } from "../services/db"; // Import db
import { useAuth } from "../context/AuthContext"; // Import useAuth
import { PlusCircle } from "lucide-react";

export default function SelfPage() {
    const { user } = useAuth(); // Get current user
    const [selfSymptoms, setSelfSymptoms] = useState(() => {
        const obj = {};
        for (const s of SYMPTOM_DEFS) obj[s.key] = 0;
        return obj;
    });
    const [selfResults, setSelfResults] = useState(null);
    const [selfAnalyzedAt, setSelfAnalyzedAt] = useState(null);
    const [animatingResults, setAnimatingResults] = useState(false);

    const [age, setAge] = useState(25);
    const [sex, setSex] = useState("Male");
    const [analyzingError, setAnalyzingError] = useState(null);

    function setSelfSymptom(key, value) {
        setSelfSymptoms(prev => ({ ...prev, [key]: Number(value) }));
    }

    function resetSelfInputs() {
        const obj = {};
        for (const s of SYMPTOM_DEFS) obj[s.key] = 0;
        setSelfSymptoms(obj);
        setSelfResults(null);
        setSelfAnalyzedAt(null);
        setAnalyzingError(null);
    }

    async function analyzeSelf() {
        setAnimatingResults(true);
        setAnalyzingError(null);
        try {
            // Short delay for UI
            await new Promise(r => setTimeout(r, 480));

            const preds = await predictConditions(selfSymptoms, age, sex);
            const symptomArray = SYMPTOM_DEFS.map(s => ({ key: s.key, label: s.label, value: selfSymptoms[s.key] || 0 }));
            const topSymptoms = symptomArray.sort((a, b) => b.value - a.value).slice(0, 6);
            const recommendations = [];

            // Adjust heuristic recommendations to use probability thresholds (e.g., > 0.5)
            // Note: preds values are now 0-1 (or scaled if model output differs)
            // Let's assume predictConditions returns normalized 0-100 or 0-1.
            // If previous code expected 0-100, we should ensure predictConditions returns that or update here.

            if ((preds.Depression || 0) >= 0.5) recommendations.push("High depressive indicators: consider contacting a mental health professional.");
            if ((preds.Anxiety || 0) >= 0.5) recommendations.push("Marked anxiety indicators: practice grounding techniques and consult a clinician.");
            if ((preds.ADHD || 0) >= 0.5) recommendations.push("Concentration-related symptoms pronounced — consider further evaluation.");
            if ((preds.SubstanceRelated || 0) >= 0.5) recommendations.push("Substance-related signs detected — seek medical supervision if needed.");

            setSelfResults({ preds, topSymptoms, recommendations });
            setSelfAnalyzedAt(new Date().toISOString());

            // SAVING TO DB
            if (user && user.id) {
                console.log("Attempting to save assessment for user:", user.id);
                // First get patient profile ID (assuming user.id maps to a patient, or use user.id directly if that's the schema)
                // In db.js seed data: user.id="u_p1", patient.id="p1".
                // We need to find the patient record for this user to get the correct patient_id for 'assessments' table.
                const profile = await db.getPatientProfile(user.id);
                if (profile) {
                    console.log("Found patient profile:", profile.id);
                    const result = await db.saveAssessment(profile.id, selfSymptoms, preds);
                    console.log("Assessment saved result:", result);
                    alert("Assessment saved to history!"); // Temporary feedback
                } else {
                    console.warn("Patient profile not found for user:", user.id);
                    alert("Error: Could not find patient profile to save results.");
                }
            } else {
                console.warn("No user logged in, cannot save results.");
            }

        } catch (err) {
            console.error(err);
            setAnalyzingError("Failed to run analysis. Model might not be loaded.");
        } finally {
            setAnimatingResults(false);
        }
    }

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>Self Analysis</h2>
            </div>

            <SelfAssessment
                selfSymptoms={selfSymptoms}
                setSelfSymptom={setSelfSymptom}
                resetSelfInputs={resetSelfInputs}
                selfResults={selfResults}
                setSelfResults={setSelfResults}
                selfAnalyzedAt={selfAnalyzedAt}
                setSelfAnalyzedAt={setSelfAnalyzedAt}
                age={age}
                setAge={setAge}
                sex={sex}
                setSex={setSex}
                onAnalyze={analyzeSelf}
            />
            {analyzingError && <div style={{ color: "var(--danger)", marginTop: 12, textAlign: "center" }}>{analyzingError}</div>}
        </div>
    );
}
