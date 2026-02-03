import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import RequireAuth from "./components/auth/RequireAuth";

// Pages & Layouts
import LoginPage from "./pages/LoginPage";
import PatientLayout from "./components/layout/PatientLayout";
import ClinicianLayout from "./components/layout/ClinicianLayout";

import SelfPage from "./pages/SelfPage";
import HistoryPage from "./pages/HistoryPage";
import ClinicianPage from "./pages/ClinicianPage";
import SettingsPage from "./pages/SettingsPage";

import "./styles/dashboard.css";

export default function App() {
    return (
        <AuthProvider>
            <DataProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Patient Portal */}
                        <Route path="/p" element={
                            <RequireAuth allowedRole="patient">
                                <PatientLayout />
                            </RequireAuth>
                        }>
                            <Route index element={<SelfPage />} />
                            <Route path="history" element={<HistoryPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Route>

                        {/* Clinician Portal */}
                        <Route path="/c" element={
                            <RequireAuth allowedRole="clinician">
                                <ClinicianLayout />
                            </RequireAuth>
                        }>
                            <Route index element={<ClinicianPage />} />
                            <Route path="patients" element={<ClinicianPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Route>

                        {/* Default Redirect */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </BrowserRouter>
            </DataProvider>
        </AuthProvider>
    );
}
