import React, { useState, useMemo, useEffect } from "react";
import ClinicianDashboard from "../components/features/clinician/ClinicianDashboard";
import PatientDrawer from "../components/features/clinician/PatientDrawer";
import { useData } from "../context/DataContext";
import { SYMPTOM_DEFS } from "../data/constants";
import { PlusCircle, Sliders } from "lucide-react";

export default function ClinicianPage() {
    const {
        patients,
        overallPredictions,
        addPatient,
        deletePatient,
        updatePatient,
        toggleUrgentTag,
        saveSymptomEdits, // If we added this helper, otherwise implement manual
        totals,
        downloadCSV,
        appendThree,
        resetDataset,
        randomizeAllPatients
    } = useData();

    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const selectedPatient = useMemo(() => patients.find(p => p.id === selectedId) || null, [patients, selectedId]);

    // Editor state
    const [editorBuffer, setEditorBuffer] = useState({});
    const [overlayOpen, setOverlayOpen] = useState(false);

    useEffect(() => {
        if (selectedPatient) {
            setEditorBuffer({ ...selectedPatient.symptoms });
            setOverlayOpen(true);
            document.body.style.overflow = "hidden";
        } else {
            setEditorBuffer({});
            setOverlayOpen(false);
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [selectedPatient]);

    const filteredPatients = useMemo(() => {
        const q = String(query || "").trim().toLowerCase();
        if (!q) return patients;
        return patients.filter(p => {
            if (p.name.toLowerCase().includes(q)) return true;
            if ((p.notes || "").toLowerCase().includes(q)) return true;
            if ((p.tags || []).some(t => t.toLowerCase().includes(q))) return true;
            return false;
        });
    }, [patients, query]);

    // Derived for chart
    const barData = useMemo(() => SYMPTOM_DEFS.map(s => ({ name: s.short, full: s.label, value: totals[s.key] || 0 })), [totals]);
    function patientPreviewLine(p) { return `${p.age} y • ${p.sex} • ${p.date}`; }

    function handleAddPatient() {
        const newId = addPatient();
        setSelectedId(newId);
    }

    function saveEdits() {
        if (!selectedId) return;
        saveSymptomEdits(selectedId, editorBuffer);
        setSelectedId(null);
    }

    function randomizeEditor() {
        const out = {};
        for (const s of SYMPTOM_DEFS) out[s.key] = Math.round(Math.random() * 5);
        setEditorBuffer(out);
    }

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: "center" }}>
                <div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>Clinician Dashboard</div>
                    <div className="small">Patient management & dataset insights</div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 300 }}>
                        <input placeholder="Search patients..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: "100%", padding: "10px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "inherit", outline: "none", fontWeight: 500 }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-neon" onClick={handleAddPatient}><PlusCircle size={16} /> New Patient</button>
                    </div>
                </div>
            </div>

            <ClinicianDashboard
                patients={patients}
                setPatients={() => { }} // readonly or handled globally
                randomizeAllPatients={randomizeAllPatients}
                query={query}
                setQuery={setQuery}
                addPatient={handleAddPatient}
                appendThree={appendThree}
                deletePatient={deletePatient}
                setSelectedId={setSelectedId}
                filteredPatients={filteredPatients}
                overallPredictions={overallPredictions}
                downloadCSV={downloadCSV}
                resetDataset={resetDataset}
                barData={barData}
                patientPreviewLine={patientPreviewLine}
            />

            <PatientDrawer
                overlayOpen={overlayOpen}
                selectedPatient={selectedPatient}
                setSelectedId={setSelectedId}
                toggleUrgentTag={toggleUrgentTag}
                deletePatient={deletePatient}
                setEditorBuffer={setEditorBuffer}
                editorBuffer={editorBuffer}
                randomizeEditor={randomizeEditor}
                saveEdits={saveEdits}
                patientPreviewLine={patientPreviewLine}
            />
        </div>
    );
}
