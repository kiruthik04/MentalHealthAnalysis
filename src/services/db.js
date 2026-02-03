/**
 * TiDB Service Adapter
 * 
 * Ideally/In Future: This connects to TiDB Cloud using 'mysql2' or an HTTP Driver.
 * Currently: Mocks the DB behavior using LocalStorage to allow immediate UI development without backend.
 */

const DB_KEY = "tidb_mock_store_v1";

// Initial Demo Data
const SEED_DATA = {
    users: [
        { id: "u_p1", email: "patient@demo.com", password: "123", role: "patient", name: "Alex Rivers" },
        { id: "u_c1", email: "doctor@demo.com", password: "123", role: "clinician", name: "Dr. Sarah Chen" }
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

class TiDBService {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(DB_KEY)) {
            localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
        }
    }

    _getStore() {
        return JSON.parse(localStorage.getItem(DB_KEY) || JSON.stringify(SEED_DATA));
    }

    _saveStore(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    async delay(ms = 400) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --- Auth ---

    async login(email, password) {
        await this.delay(600);
        const store = this._getStore();
        const user = store.users.find(u => u.email === email && u.password === password);

        if (user) {
            return { success: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } };
        }
        return { success: false, error: "Invalid credentials" };
    }

    // --- Patient Data ---

    async getPatientProfile(userId) {
        await this.delay();
        const store = this._getStore();
        return store.patients.find(p => p.user_id === userId);
    }

    async saveAssessment(patientId, symptoms, predictions) {
        await this.delay();
        const store = this._getStore();
        const record = {
            id: Date.now(),
            patient_id: patientId,
            symptom_scores: symptoms,
            prediction_result: predictions,
            labeled_condition: null, // To be filled by clinician for training
            created_at: new Date().toISOString()
        };
        store.assessments.push(record);
        this._saveStore(store);
        return { success: true, id: record.id };
    }

    // --- Clinician Data ---

    async getAssignedPatients(clinicianUserId) {
        await this.delay();
        // For demo, we just return the seed patient. In real App, filter by clinician_id
        const store = this._getStore();
        return store.patients;
    }

    async getPatientAssessments(patientId) {
        await this.delay();
        const store = this._getStore();
        return store.assessments.filter(a => a.patient_id === patientId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    async getAllAssessments() {
        await this.delay();
        const store = this._getStore();
        return store.assessments;
    }

    // --- CRUD Operations (Clinician) ---

    async createPatient(patientData) {
        await this.delay();
        const store = this._getStore();
        store.patients.unshift(patientData);
        this._saveStore(store);
        return { success: true, id: patientData.id };
    }

    async updatePatient(id, updates) {
        await this.delay();
        const store = this._getStore();
        const idx = store.patients.findIndex(p => p.id === id);
        if (idx !== -1) {
            store.patients[idx] = { ...store.patients[idx], ...updates };
            this._saveStore(store);
            return { success: true };
        }
        return { success: false };
    }

    async deletePatient(id) {
        await this.delay();
        const store = this._getStore();
        store.patients = store.patients.filter(p => p.id !== id);
        this._saveStore(store);
        return { success: true };
    }
}

export const db = new TiDBService();
