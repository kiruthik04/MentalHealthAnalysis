import { SYMPTOM_DEFS } from "../data/constants";

/* helper: random symptom set for demo patients */
export function randomSymptomSet() {
    const o = {};
    for (const s of SYMPTOM_DEFS) o[s.key] = Math.random() > 0.6 ? Math.ceil(Math.random() * 5) : 0;
    return o;
}

/* large demo dataset */
export const DEMO_PATIENTS = new Array(48).fill(0).map((_, i) => {
    const age = 16 + Math.floor(Math.random() * 60);
    const tags = Math.random() > 0.82 ? ["urgent"] : Math.random() > 0.76 ? ["follow-up"] : [];
    return {
        id: 90000 + i,
        name: `Demo Patient ${i + 1}`,
        age,
        sex: Math.random() > 0.5 ? "Female" : "Male",
        date: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)).toISOString().slice(0, 10),
        symptoms: randomSymptomSet(),
        notes: Math.random() > 0.7 ? "Reported mild improvement with sleep hygiene." : "No major background recorded.",
        tags,
    };
});
