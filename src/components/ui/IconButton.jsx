import React from "react";

export default function IconButton({ title, onClick, children }) {
    return (
        <button title={title} onClick={onClick} className="btn ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {children}
        </button>
    );
}
