import React, { useState } from "react";
import SelfAssessment from "../components/features/self/SelfAssessment";
import { SYMPTOM_DEFS } from "../data/constants";
import { predictConditions } from "../utils/analysis";
import { PlusCircle } from "lucide-react";

export default function SelfPage() {
    const [selfSymptoms, setSelfSymptoms] = useState(() => {
        const obj = {};
        for (const s of SYMPTOM_DEFS) obj[s.key] = 0;
        return obj;
    });
    const [selfResults, setSelfResults] = useState(null);
    const [selfAnalyzedAt, setSelfAnalyzedAt] = useState(null);
    const [animatingResults, setAnimatingResults] = useState(false);

    function setSelfSymptom(key, value) {
        setSelfSymptoms(prev => ({ ...prev, [key]: Number(value) }));
    }

    function resetSelfInputs() {
        const obj = {};
        for (const s of SYMPTOM_DEFS) obj[s.key] = 0;
        setSelfSymptoms(obj);
        setSelfResults(null);
        setSelfAnalyzedAt(null);
    }

    function analyzeSelf() {
        setAnimatingResults(true);
        setTimeout(() => {
            const preds = predictConditions(selfSymptoms);
            const symptomArray = SYMPTOM_DEFS.map(s => ({ key: s.key, label: s.label, value: selfSymptoms[s.key] || 0 }));
            const topSymptoms = symptomArray.sort((a, b) => b.value - a.value).slice(0, 6);
            const recommendations = [];
            if ((preds.Depression || 0) >= 60) recommendations.push("High depressive indicators: consider contacting a mental health professional.");
            if ((preds.Anxiety || 0) >= 60) recommendations.push("Marked anxiety indicators: practice grounding techniques and consult a clinician.");
            if ((preds.ADHD || 0) >= 60) recommendations.push("Concentration-related symptoms pronounced — consider further evaluation.");
            if ((preds.SubstanceRelated || 0) >= 50) recommendations.push("Substance-related signs detected — seek medical supervision if needed.");
            setSelfResults({ preds, topSymptoms, recommendations });
            setSelfAnalyzedAt(new Date().toISOString());
            setAnimatingResults(false);
        }, 480);
    }

    return (
        <div>
            <div className="header" style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>Self-Assessment</div>
                    <div className="small">Interactive symptom analyzer</div>
                </div>
                <div>
                    <button className="btn" onClick={analyzeSelf}><PlusCircle size={14} /> Analyze</button>
                </div>
            </div>

            <SelfAssessment
                selfSymptoms={selfSymptoms}
                setSelfSymptom={setSelfSymptom}
                resetSelfInputs={resetSelfInputs}
                selfResults={selfResults}
                setSelfResults={setSelfResults}
                selfAnalyzedAt={selfAnalyzedAt}
                setSelfAnalyzedAt={setSelfAnalyzedAt}
            />
        </div>
    );
}
