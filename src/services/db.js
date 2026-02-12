/**
 * TiDB Service Adapter
 * 
 * Ideally/In Future: This connects to TiDB Cloud using 'mysql2' or an HTTP Driver.
 * Currently: Mocks the DB behavior using LocalStorage to allow immediate UI development without backend.
 */

const DB_KEY = "tidb_mock_store_v3"; // Incremented to load preferences schema

// Initial Demo Data
const SEED_DATA = {
    users: [
        { id: "u_p1", email: "patient@demo.com", password: "123", role: "patient", name: "Alex Rivers", preferences: { darkMode: true, dataPersistence: true, animationSpeed: "Normal" } },
        { id: "u_c1", email: "doctor@demo.com", password: "123", role: "clinician", name: "Dr. Sarah Chen", preferences: { darkMode: true, dataPersistence: true, animationSpeed: "Normal" } }
    ],
    patients: [
        {
            id: "p1",
            user_id: "u_p1",
            clinician_id: "u_c1",
            name: "Alex Rivers",
            age: 29,
            sex: "Male",
            notes: "Anxiety symptoms worsening at night.",
            medicalHistory: "Diagnosed with GAD in 2022. No known allergies.",
            location: "San Francisco, CA",
            occupation: "Software Engineer",
            contact: "alex.rivers@example.com"
        }
    ],
    assessments: []
};

const API_URL = "http://localhost:4000";

class TiDBService {
    constructor() {
        // No init needed for API
    }

    async _fetch(endpoint, options = {}) {
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            if (!res.ok) {
                // Try to parse error
                try {
                    const err = await res.json();
                    return { success: false, error: err.error || res.statusText };
                } catch (e) {
                    return { success: false, error: res.statusText };
                }
            }
            const data = await res.json();
            return data;
        } catch (err) {
            console.error("API Error:", err);
            return { success: false, error: err.message };
        }
    }

    async delay(ms = 400) {
        // No artificial delay needed for real network requests
        return;
    }

    // --- Auth ---

    async login(email, password) {
        const res = await this._fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (res.success && res.user) {
            return { success: true, user: res.user };
        }
        return { success: false, error: res.error || "Login failed" };
    }

    async getUserPreferences(userId) {
        // In a real app we would have a preferences endpoint.
        // For now, return defaults or fetch if we add it to backend.
        // The backend 'findUser' returns prefs in user object, but we don't have separate endpoint.
        // We can just rely on local defaults for now or hit profile.
        return { darkMode: true, dataPersistence: true, animationSpeed: "Normal" };
    }

    async updateUserPreferences(userId, prefs) {
        // Todo: Implement backend preference persistence
        return { success: true };
    }

    // --- Patient Data ---

    async getPatientProfile(userId) {
        const res = await this._fetch(`/api/profile/${userId}`);
        if (res.error) return null;
        return res;
    }

    async saveAssessment(patientId, symptoms, predictions) {
        // We don't have an assessment endpoint in the simple backend yet.
        // We can create one or just log it.
        // Existing backend only has 'patients'. 
        // For now, we will just log success to not break the UI.
        console.log("Mock saving assessment to API (not implemented on server):", { patientId, symptoms });
        return { success: true, id: Date.now() };
    }

    // --- Clinician Data ---

    async getAssignedPatients(clinicianUserId) {
        const res = await this._fetch('/patients');
        if (Array.isArray(res)) return res;
        return [];
    }

    async getPatientAssessments(patientId) {
        return []; // Not implemented on backend
    }

    async getAllAssessments() {
        return []; // Not implemented
    }

    // --- CRUD Operations (Clinician) ---

    async createPatient(patientData) {
        const res = await this._fetch('/patients', {
            method: 'POST',
            body: JSON.stringify(patientData)
        });
        if (res.id) return { success: true, id: res.id };
        return { success: false };
    }

    async updatePatient(id, updates) {
        const res = await this._fetch(`/patients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        if (res.id) return { success: true };
        return { success: false };
    }

    async deletePatient(id) {
        const res = await this._fetch(`/patients/${id}`, {
            method: 'DELETE'
        });
        return { success: !!res.ok };
    }
}

export const db = new TiDBService();
