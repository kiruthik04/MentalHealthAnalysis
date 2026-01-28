import { SYMPTOM_DEFS } from "../data/constants";

/* rule-based prediction heuristics (toy demo) */
export function predictConditions(symptoms) {
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

/* aggregates */
export function aggregateSymptomTotals(patients) {
    const totals = {};
    for (const s of SYMPTOM_DEFS) totals[s.key] = 0;
    for (const p of patients) {
        for (const k in p.symptoms) totals[k] += p.symptoms[k] || 0;
    }
    return totals;
}
