import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import SelfPage from "./pages/SelfPage";
import ClinicianPage from "./pages/ClinicianPage";
import SettingsPage from "./pages/SettingsPage";
import { DataProvider } from "./context/DataContext";
import "./styles/dashboard.css";

export default function App() {
    return (
        <DataProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<SelfPage />} />
                        <Route path="clinician" element={<ClinicianPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </DataProvider>
    );
}
