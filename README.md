
# 🧠 Mental Health Dashboard

> A comprehensive, modern, and data-driven dashboard for mental health analytics, featuring a Clinician Interface, Patient Management, and AI-powered insights.

![Clinician Dashboard](https://via.placeholder.com/800x450.png?text=Dashboard+Overview+Placeholder)

## 🌟 Overview

The **Mental Health Dashboard** is a dual-interface application designed to bridge the gap between clinicians and patient data. It provides:

1.  **Clinician Dashboard**: A powerful interface for managing patient records, visualizing symptom trends, and receiving AI-driven risk assessments.
2.  **Patient Data Management**: Tools to add, edit, and track patient progress over time.
3.  **Interactive Visualizations**: Dynamic charts and graphs powered by Recharts for clear data interpretation.

## ✨ Features

-   **Dashboard Analytics**: Real-time overview of patient statistics, risk levels, and symptom distributions.
-   **Patient Management**: Create, read, update, and delete (CRUD) patient records with ease.
-   **Search & Filter**: dedicated search functionality to quickly find patients by name, notes, or tags.
-   **Data Visualization**: 
    -   **Line Charts**: Track aggregate risk trends over time.
    -   **Bar Charts**: Visualize cumulative symptom severity across the patient cohort.
-   **AI Insights**: Automated analysis providing correlations and alerts (e.g., "Sleep Disturbance correlates with Anxiety").
-   **CSV Export**: One-click export of patient data for external analysis.
-   **Responsive Design**: Glassmorphism UI that adapts to different screen sizes.

## 🛠️ Tech Stack

**Frontend:**
-   **React 19**: Core UI library.
-   **Vite**: Fast build tool and development server.
-   **Framer Motion**: Smooth, professional animations and transitions.
-   **Recharts**: Composable charting library for React.
-   **Lucide React**: Beautiful & consistent icons.
-   **React Router**: Navigation and routing.

**Backend:**
-   **Node.js & Express**: API server handling data requests.
-   **Body Parser**: Middleware for parsing request bodies.
-   **CORS**: Handling Cross-Origin Resource Sharing.

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Client [Frontend (React + Vite)]
        A[App Entry] --> B[Context Provider]
        B --> C[Pages]
        C --> D[ClinicianDashboard]
        C --> E[PatientDrawer]
        D --> F[Charts (Recharts)]
        E --> G[Forms]
    end

    subgraph Server [Backend (Express)]
        H[API Routes]
        H -- /patients --> I[Data Controller]
        H -- /stats --> I
        I --> J[(In-Memory Data Store)]
    end

    Client -- HTTP Requests (Axios/Fetch) --> Server
```

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   npm (comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/mental-health-dashboard.git
    cd mental-health-dashboard
    ```

2.  **Install dependencies (Root, Client, Server):**
    We use a convenient script to install dependencies for all workspaces.
    ```bash
    npm run install:all
    ```
    *Alternatively/Manual:*
    ```bash
    npm install
    cd client && npm install
    cd ../server && npm install
    ```

### Running the Application

To start both the **Client** and **Server** concurrently:

```bash
npm start
```

-   **Frontend**: http://localhost:5173
-   **Backend**: http://localhost:4000

## 📂 Project Structure

```
mental-health-dashboard/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI & Feature components
│   │   ├── context/        # Global State Management
│   │   ├── pages/          # Route Components (Clinician, History, etc.)
│   │   └── ...
├── server/                 # Express Backend
│   ├── server.js           # Entry point
│   ├── data.js             # Data persistence logic
│   └── ...
├── package.json            # Root configuration
└── README.md               # You are here!
```

## 📝 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/patients` | Retrieve all patients (supports query `?q=search`) |
| `POST` | `/patients` | Create a new patient record |
| `GET` | `/patients/:id` | Retrieve a specific patient |
| `PUT` | `/patients/:id` | Update an existing patient |
| `DELETE` | `/patients/:id` | Remove a patient record |
| `GET` | `/export/csv` | Download patient data as CSV |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
