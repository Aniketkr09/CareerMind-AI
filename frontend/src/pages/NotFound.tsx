/**
 * ============================================================
 * CareerMind AI
 * Not Found Page
 * ============================================================
 *
 * Purpose:
 * - Handle unknown application routes
 * - Provide a professional AI-themed 404 experience
 * - Allow users to return to the dashboard
 * - Allow users to go back to the previous page
 *
 * ============================================================
 */

import {
    ArrowLeft,
    Home,
    Radar,
    Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function NotFound() {
    const navigate = useNavigate();

    /*
     * ----------------------------------------------------------
     * Navigation
     * ----------------------------------------------------------
     */

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleDashboard = () => {
        navigate("/dashboard");
    };

    /*
     * ----------------------------------------------------------
     * Render
     * ----------------------------------------------------------
     */

    return (
        <main className="not-found-page">
            {/* Background effects */}
            <div className="not-found-orb orb-one" />
            <div className="not-found-orb orb-two" />

            <section className="not-found-card">
                {/* AI Badge */}
                <div className="not-found-badge">
                    <Sparkles size={15} />
                    <span>CareerMind AI</span>
                </div>

                {/* Radar Icon */}
                <div className="not-found-icon">
                    <Radar size={42} strokeWidth={1.7} />
                </div>

                {/* Error Code */}
                <div className="not-found-code">
                    404
                </div>

                {/* Heading */}
                <h1>
                    Career path not found
                </h1>

                {/* Description */}
                <p>
                    The page you're looking for doesn't exist,
                    has moved, or is currently outside the
                    CareerMind AI navigation network.
                </p>

                {/* Actions */}
                <div className="not-found-actions">
                    <button
                        type="button"
                        className="not-found-primary"
                        onClick={handleDashboard}
                    >
                        <Home size={18} />
                        Go to Dashboard
                    </button>

                    <button
                        type="button"
                        className="not-found-secondary"
                        onClick={handleGoBack}
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>

                {/* Footer */}
                <div className="not-found-footer">
                    <span className="status-dot" />

                    <span>
                        CareerMind AI navigation system
                        <strong> operational</strong>
                    </span>
                </div>
            </section>
        </main>
    );
}