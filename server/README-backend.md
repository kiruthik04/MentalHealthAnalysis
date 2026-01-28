# Demo Backend for Mental Health Dashboard

This small Express backend provides an in-memory dataset and utility endpoints for the dashboard demo.

Available endpoints:

- `GET /health` - health check
- `GET /patients` - list patients (optional `?q=` query)
- `GET /patients/:id` - retrieve single patient
- `POST /patients` - create patient (JSON body)
- `PUT /patients/:id` - update patient (JSON body)
- `DELETE /patients/:id` - delete patient
- `GET /export/csv` - download CSV export of the dataset

Run locally:

1. Install dependencies: `npm install`
2. Start server: `npm run serve`

The server listens on port `4000` by default. It's an in-memory demo store and resets when restarted.
