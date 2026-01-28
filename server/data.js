// data.js
// Extracted demo data and utilities for the mental-health-dashboard backend
import { randomUUID } from 'crypto';

const SYMPTOM_DEFS = [
    { key: 'insomnia', label: 'Insomnia / Sleep disturbance', short: 'Sleep', group: 'Sleep' },
    { key: 'fatigue', label: 'Fatigue / Low energy', short: 'Fatigue', group: 'Energy' },
    { key: 'panic', label: 'Panic attacks', short: 'Panic', group: 'Anxiety' },
    { key: 'panic_sleep', label: 'Night panic / terrors', short: 'Night panic', group: 'Anxiety' },
    { key: 'social_withdrawal', label: 'Social withdrawal', short: 'Social', group: 'Social' },
    { key: 'mood_swings', label: 'Mood swings', short: 'Mood', group: 'Mood' },
    { key: 'anhedonia', label: 'Loss of interest (anhedonia)', short: 'Anhedonia', group: 'Mood' },
    { key: 'rumination', label: 'Rumination / Negative thoughts', short: 'Rumination', group: 'Cognition' },
    { key: 'appetite_change', label: 'Appetite change', short: 'Appetite', group: 'Physical' },
    { key: 'concentration_issues', label: 'Concentration issues', short: 'Concentration', group: 'Cognition' },
    { key: 'self_harm_ideation', label: 'Self-harm ideation', short: 'Self-harm', group: 'Risk' },
    { key: 'irritability', label: 'Irritability', short: 'Irritability', group: 'Mood' },
    { key: 'withdrawal', label: 'Substance withdrawal symptoms', short: 'Withdrawal', group: 'Substance' },
    { key: 'anxiety_general', label: 'Generalised anxiety', short: 'Gen Anxiety', group: 'Anxiety' },
    { key: 'psychomotor', label: 'Psychomotor changes', short: 'Psychomotor', group: 'Motor' },
    { key: 'suicidal_thoughts', label: 'Suicidal thoughts', short: 'Suicidal', group: 'Risk' },
    { key: 'hopelessness', label: 'Hopelessness', short: 'Hopeless', group: 'Mood' },
    { key: 'panic_physical', label: 'Physical panic symptoms', short: 'Panic phys', group: 'Anxiety' },
];

function randomSymptomSet() {
    const o = {};
    for (const s of SYMPTOM_DEFS) o[s.key] = Math.random() > 0.6 ? Math.ceil(Math.random() * 5) : 0;
    return o;
}

// Create a demo dataset (in-memory)
const DEMO_PATIENTS = new Array(48).fill(0).map((_, i) => {
    const age = 16 + Math.floor(Math.random() * 60);
    const tags = Math.random() > 0.82 ? ['urgent'] : Math.random() > 0.76 ? ['follow-up'] : [];
    return {
        id: String(90000 + i),
        name: `Demo Patient ${i + 1}`,
        age,
        sex: Math.random() > 0.5 ? 'Female' : 'Male',
        date: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)).toISOString().slice(0, 10),
        symptoms: randomSymptomSet(),
        notes: Math.random() > 0.7 ? 'Reported mild improvement with sleep hygiene.' : 'No major background recorded.',
        tags,
    };
});

function predictConditions(symptoms) {
    const s = symptoms || {};
    const depression =
        (s.anhedonia || 0) * 2.6 +
        (s.fatigue || 0) * 1.3 +
        (s.insomnia || 0) * 1.1 +
        (s.rumination || 0) * 1.7 +
        (s.concentration_issues || 0) * 1.2 +
        (s.self_harm_ideation || 0) * 4.2 +
        (s.hopelessness || 0) * 2.9;
    const anxiety =
        (s.panic || 0) * 3.0 +
        (s.rumination || 0) * 1.4 +
        (s.panic_sleep || 0) * 1.3 +
        (s.anxiety_general || 0) * 2.2 +
        (s.panic_physical || 0) * 1.9;
    const bipolar =
        (s.mood_swings || 0) * 2.7 +
        (s.irritability || 0) * 1.4 +
        (s.psychomotor || 0) * 1.5 +
        (s.insomnia || 0) * 1.2;
    const adhd = (s.concentration_issues || 0) * 2.9 + (s.fatigue || 0) * 0.6;
    const substance = (s.withdrawal || 0) * 3.4 + (s.irritability || 0) * 0.95;
    const normalize = (x, max = 45) => Math.min(100, Math.round((x / max) * 100));
    return {
        Depression: normalize(depression, 45),
        Anxiety: normalize(anxiety, 40),
        Bipolar: normalize(bipolar, 36),
        ADHD: normalize(adhd, 22),
        SubstanceRelated: normalize(substance, 30),
    };
}

function aggregateSymptomTotals(patients) {
    const totals = {};
    for (const s of SYMPTOM_DEFS) totals[s.key] = 0;
    for (const p of patients) {
        for (const k in p.symptoms) totals[k] += p.symptoms[k] || 0;
    }
    return totals;
}

function patientsToCSV(patients) {
    const headers = ['id', 'name', 'age', 'sex', 'date', ...SYMPTOM_DEFS.map(s => s.key), 'notes', 'tags'];
    const rows = patients.map(p => [
        p.id,
        p.name,
        p.age,
        p.sex,
        p.date,
        ...SYMPTOM_DEFS.map(s => p.symptoms[s.key] || 0),
        String(p.notes || '').replace(/\n/g, ' '),
        (p.tags || []).join('|')
    ]);
    const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    return csv;
}

// in-memory store and helpers
const store = {
    patients: [...DEMO_PATIENTS],
};

function listPatients() { return store.patients; }

function getPatient(id) { return store.patients.find(p => String(p.id) === String(id)) || null; }

function createPatient(payload = {}) {
    const id = String(Math.floor(Math.random() * 1e7));
    const p = {
        id,
        name: payload.name || `New Patient ${id.slice(-4)}`,
        age: payload.age || 18 + Math.floor(Math.random() * 60),
        sex: payload.sex || (Math.random() > 0.5 ? 'Female' : 'Male'),
        date: payload.date || new Date().toISOString().slice(0, 10),
        symptoms: payload.symptoms || randomSymptomSet(),
        notes: payload.notes || '',
        tags: payload.tags || [],
    };
    store.patients.unshift(p);
    return p;
}

function updatePatient(id, patch = {}) {
    const idx = store.patients.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null;
    store.patients[idx] = { ...store.patients[idx], ...patch };
    return store.patients[idx];
}

function deletePatient(id) {
    const before = store.patients.length;
    store.patients = store.patients.filter(p => String(p.id) !== String(id));
    return store.patients.length !== before;
}

export {
    SYMPTOM_DEFS,
    randomSymptomSet,
    DEMO_PATIENTS,
    predictConditions,
    aggregateSymptomTotals,
    patientsToCSV,
    listPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
};
