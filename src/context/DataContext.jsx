import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { db } from "../services/db";
import { aggregateSymptomTotals, predictConditions } from "../utils/analysis";
import { downloadCSV } from "../utils/export";
import { randomSymptomSet } from "../utils/mockData";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export function DataProvider({ children }) {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial Fetch based on role
    useEffect(() => {
        // If not logged in, clear data
        if (!user) {
            setPatients([]);
            return;
        }

        async function loadData() {
            setLoading(true);
            if (user.role === 'clinician') {
                const data = await db.getAssignedPatients(user.id);
                setPatients(data || []);
            } else {
                // Patient view - maybe just fetch their own profile
                // For now, we reuse the 'patients' array concept but it might just be [self]
                const p = await db.getPatientProfile(user.id);
                setPatients(p ? [p] : []);
            }
            setLoading(false);
        }

        loadData();
    }, [user]);

    // --- DERIVED ---
    const totals = useMemo(() => aggregateSymptomTotals(patients), [patients]);

    const overallPredictions = useMemo(() => {
        if (!patients.length) return [];
        const agg = {};
        for (const p of patients) {
            const pred = predictConditions(p.symptoms || {});
            for (const k in pred) agg[k] = (agg[k] || 0) + pred[k];
        }
        const list = Object.keys(agg).map(k => ({ condition: k, value: Math.round(agg[k] / (patients.length || 1)) }));
        return list.sort((a, b) => b.value - a.value);
    }, [patients]);

    // --- ACTIONS ---
    async function addPatient() {
        const id = Math.floor(Math.random() * 1e7);
        const p = {
            id,
            user_id: `u_gen_${id}`,
            clinician_id: user?.id,
            name: `New Patient ${id % 1000}`,
            age: 18 + Math.floor(Math.random() * 60),
            sex: Math.random() > 0.5 ? "Female" : "Male",
            date: new Date().toISOString().slice(0, 10),
            symptoms: randomSymptomSet(),
            notes: "",
            tags: [],
            medicalHistory: "",
            location: "Unknown",
            occupation: "Unemployed",
            contact: ""
        };
        // Optimistic update
        setPatients(prev => [p, ...prev]);
        await db.createPatient(p);
        return id;
    }

    async function deletePatient(id) {
        setPatients(prev => prev.filter(p => p.id !== id));
        await db.deletePatient(id);
    }

    async function updatePatient(id, edits) {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, ...edits } : p));
        await db.updatePatient(id, edits);
    }

    async function saveSymptomEdits(id, newSymptoms) {
        const updates = { symptoms: { ...newSymptoms } };
        setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        await db.updatePatient(id, updates);
    }

    function resetDataset() {
        // Implementation for resetting demo data via DB? 
        // For now, let's just reload the page or clear local storage key manually
        alert("Reset not fully implemented in DB mode yet.");
    }

    function appendThree() {
        // Add 3 randoms
        for (let i = 0; i < 3; i++) addPatient();
    }

    function toggleUrgentTag(id) {
        const p = patients.find(pat => pat.id === id);
        if (!p) return;
        const tags = p.tags || [];
        const newTags = tags.includes("urgent") ? tags.filter(t => t !== "urgent") : [...tags, "urgent"];
        updatePatient(id, { tags: newTags });
    }

    function randomizeAllPatients() {
        // Complex batch update
        const newPatients = patients.map(pp => ({ ...pp, symptoms: Object.fromEntries(Object.keys(pp.symptoms).map(k => [k, Math.round(Math.random() * 5)])) }));
        setPatients(newPatients);
        // In real DB, we'd need a bulk update. For now, we skip persistence of this 'simulation' action or iterate
        // newPatients.forEach(p => db.updatePatient(p.id, { symptoms: p.symptoms }));
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
        downloadCSV,
        randomizeAllPatients,
        loading
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    return useContext(DataContext);
}
