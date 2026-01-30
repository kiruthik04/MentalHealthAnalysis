import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { DEMO_PATIENTS, randomSymptomSet } from "../utils/mockData";
import { aggregateSymptomTotals, predictConditions } from "../utils/analysis";
import { downloadCSV } from "../utils/export";
import { SYMPTOM_DEFS } from "../data/constants";

const DataContext = createContext();

export function DataProvider({ children }) {
    // --- STATE ---
    const [patients, setPatients] = useState(() => {
        try {
            const raw = window.localStorage.getItem("mh_v5_1_demo");
            if (raw) return JSON.parse(raw);
        } catch (e) { }
        return DEMO_PATIENTS;
    });

    // Persist
    useEffect(() => {
        try {
            window.localStorage.setItem("mh_v5_1_demo", JSON.stringify(patients));
        } catch (e) { }
    }, [patients]);

    // --- DERIVED ---
    const totals = useMemo(() => aggregateSymptomTotals(patients), [patients]);

    const overallPredictions = useMemo(() => {
        const agg = {};
        for (const p of patients) {
            const pred = predictConditions(p.symptoms);
            for (const k in pred) agg[k] = (agg[k] || 0) + pred[k];
        }
        const list = Object.keys(agg).map(k => ({ condition: k, value: Math.round(agg[k] / (patients.length || 1)) }));
        return list.sort((a, b) => b.value - a.value);
    }, [patients]);

    // --- ACTIONS ---
    function addPatient() {
        const id = Math.floor(Math.random() * 1e7);
        const p = {
            id,
            name: `New Patient ${id % 1000}`,
            age: 18 + Math.floor(Math.random() * 60),
            sex: Math.random() > 0.5 ? "Female" : "Male",
            date: new Date().toISOString().slice(0, 10),
            symptoms: randomSymptomSet(),
            notes: "",
            tags: [],
        };
        setPatients(prev => [p, ...prev]);
        return id; // return ID so consumer can select it
    }

    function deletePatient(id) {
        setPatients(prev => prev.filter(p => p.id !== id));
    }

    function updatePatient(id, edits) {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, ...edits } : p));
    }

    function saveSymptomEdits(id, newSymptoms) {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, symptoms: { ...newSymptoms } } : p));
    }

    function resetDataset() {
        setPatients(DEMO_PATIENTS.map(p => ({ ...p, id: Math.floor(Math.random() * 1e7) })));
    }

    function appendThree() {
        const items = DEMO_PATIENTS.slice(0, 3).map(p => ({ ...p, id: Math.floor(Math.random() * 1e7) }));
        setPatients(prev => [...items, ...prev]);
    }

    function toggleUrgentTag(id) {
        setPatients(prev => prev.map(p => {
            if (p.id !== id) return p;
            const tags = p.tags || [];
            if (tags.includes("urgent")) return { ...p, tags: tags.filter(t => t !== "urgent") };
            return { ...p, tags: [...tags, "urgent"] };
        }));
    }

    function randomizeAllPatients() {
        setPatients(prev => prev.map(pp => ({ ...pp, symptoms: Object.fromEntries(Object.keys(pp.symptoms).map(k => [k, Math.round(Math.random() * 5)])) })));
    }

    const value = {
        patients,
        setPatients,
        totals,
        overallPredictions,
        addPatient,
        deletePatient,
        updatePatient,
        saveSymptomEdits,
        resetDataset,
        appendThree,
        toggleUrgentTag,
        downloadCSV
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    return useContext(DataContext);
}
