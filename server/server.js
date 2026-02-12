import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {
    listPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    patientsToCSV,
    findUser,
    getUser,
    updateUser,
} from './data.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// Auth & Profile
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = findUser(email, password);
    if (user) {
        // Return user info sans password
        const { password: _, ...userInfo } = user;
        return res.json({ success: true, user: userInfo });
    }
    return res.status(401).json({ success: false, error: "Invalid credentials" });
});

app.get('/api/profile/:userId', (req, res) => {
    // For demo simplicity, we use the userId directly. Real app would use session/token.
    // Also, we return the linked patient profile if it exists.
    const user = getUser(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Find linked patient profile (demo logic: first patient linked to user)
    // We need to import listPatients for this check or just do it here
    // But data.js exports separate functions.
    // Let's add a helper in data.js or just iterate listPatients here.
    // Actually, listPatients() returns the array.
    const allPatients = listPatients();
    // Wait, listPatients is imported.
    const patientProfile = allPatients.find(p => p.user_id === user.id);

    // Merge user data and patient data for the profile view
    // The ProfilePage.jsx expects: name, age, location, occupation, contact, medicalHistory, notes...
    // These come from the patient record mostly.

    if (patientProfile) {
        return res.json(patientProfile);
    }

    // If no patient profile linked, return basic user info
    return res.json({
        id: user.id || "unknown",
        name: user.name,
        email: user.email
    });
});

app.post('/api/profile/:userId', (req, res) => {
    const user = getUser(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update Linked Patient
    const allPatients = listPatients();
    let patient = allPatients.find(p => p.user_id === user.id);

    if (patient) {
        updatePatient(patient.id, req.body);
        return res.json({ success: true, profile: patient });
    } else {
        // Create new patient record linked to user?
        // For now, let's assume seed data always has a linked patient for the demo user
        // Or if not, we create one.
        const newPatient = createPatient({
            ...req.body,
            user_id: user.id,
            name: user.name
        });
        return res.json({ success: true, profile: newPatient });
    }
});

app.get('/patients', (req, res) => {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    let items = listPatients();
    if (q) {
        items = items.filter(p => p.name.toLowerCase().includes(q) || (p.notes || '').toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q)));
    }
    res.json(items);
});

app.get('/patients/:id', (req, res) => {
    const p = getPatient(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
});

app.post('/patients', (req, res) => {
    const p = createPatient(req.body || {});
    res.status(201).json(p);
});

app.put('/patients/:id', (req, res) => {
    const p = updatePatient(req.params.id, req.body || {});
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
});

app.delete('/patients/:id', (req, res) => {
    const ok = deletePatient(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
});

app.get('/export/csv', (req, res) => {
    const items = listPatients();
    const csv = patientsToCSV(items);
    res.setHeader('Content-Disposition', 'attachment; filename="mh_demo_export.csv"');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.send(csv);
});

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Demo backend listening at http://localhost:${port}`);
});
