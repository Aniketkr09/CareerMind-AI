/**
 * ============================================================
 * CareerMind AI
 *
 * Dashboard Layout
 * AI Career Intelligence Operating System
 *
 * Responsibilities:
 * - Protected dashboard shell
 * - Persistent application navigation
 * - Ambient AI visual environment
 * - Responsive workspace container
 * - Accessible main content region
 * - Global AI system status
 *
 * Architecture:
 * React + TypeScript
 * React Router
 * ============================================================
 */

import type { ReactNode } from "react";

import Navbar from "../common/Navbar";

import "./dashboardLayout.css";

// ============================================================
// TYPES
// ============================================================

interface DashboardLayoutProps {
    children: ReactNode;
}

// ============================================================
// DASHBOARD LAYOUT
// ============================================================

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    return (
        <div className="cm-dashboard-layout">
            {/* ==================================================
                AMBIENT AI ENVIRONMENT

                Decorative only.
                Pointer events are disabled through CSS.
            ================================================== */}

            <div
                className="cm-dashboard-ambient"
                aria-hidden="true"
            >
                <div className="cm-dashboard-grid" />

                <div className="cm-dashboard-glow cm-dashboard-glow-one" />

                <div className="cm-dashboard-glow cm-dashboard-glow-two" />

                <div className="cm-dashboard-glow cm-dashboard-glow-three" />

                <div className="cm-dashboard-noise" />
            </div>

            {/* ==================================================
                APPLICATION NAVIGATION
            ================================================== */}

            <header className="cm-dashboard-header">
                <Navbar />
            </header>

            {/* ==================================================
                MAIN WORKSPACE
            ================================================== */}

            <main
                id="main-content"
                className="cm-dashboard-main"
                tabIndex={-1}
            >
                <div className="cm-dashboard-container">
                    <section
                        className="cm-dashboard-workspace"
                        aria-label="CareerMind AI dashboard workspace"
                    >
                        {children}
                    </section>
                </div>
            </main>

            {/* ==================================================
                GLOBAL AI SYSTEM STATUS
            ================================================== */}

            <aside
                className="cm-ai-system-status"
                aria-label="CareerMind AI system status"
            >
                <span
                    className="cm-ai-status-indicator"
                    aria-hidden="true"
                />

                <span className="cm-ai-status-text">
                    AI System Online
                </span>
            </aside>

            {/* ==================================================
                ACCESSIBILITY SKIP LINK
            ================================================== */}

            <a
                href="#main-content"
                className="cm-dashboard-skip-link"
            >
                Skip to dashboard
            </a>
        </div>
    );
}