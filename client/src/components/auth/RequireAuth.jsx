import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth({ children, allowedRole }) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        // Redirect to their own dashboard if they try to access wrong portal
        return <Navigate to={user.role === "clinician" ? "/c" : "/p"} replace />;
    }

    return children;
}
