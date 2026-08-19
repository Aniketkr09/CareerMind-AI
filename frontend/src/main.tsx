/**
 * ============================================================
 * CareerMind AI
 * Application Entry Point
 * ============================================================
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";

import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error(
        "CareerMind AI: #root element was not found."
    );
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);

if (import.meta.env.DEV) {
    console.info(
        "%c CareerMind AI ",
        "background:#06b6d4;color:#020617;font-weight:900;padding:5px 9px;border-radius:6px;"
    );

    console.info(
        "%cAI Career Intelligence Engine initialized.",
        "color:#38bdf8;font-weight:700;"
    );
}