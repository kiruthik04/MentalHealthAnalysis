import { SYMPTOM_DEFS } from "../data/constants";

/* safe CSV export */
export function downloadCSV(patients) {
    const headers = ["id", "name", "age", "sex", "date", ...SYMPTOM_DEFS.map(s => s.key), "notes", "tags"];
    const rows = patients.map(p => [
        p.id,
        p.name,
        p.age,
        p.sex,
        p.date,
        ...SYMPTOM_DEFS.map(s => p.symptoms[s.key] || 0),
        String(p.notes || "").replaceAll("\n", " "),
        (p.tags || []).join("|")
    ]);
    const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mh_demo_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
