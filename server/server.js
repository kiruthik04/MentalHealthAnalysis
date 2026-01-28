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
} from './data.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

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
