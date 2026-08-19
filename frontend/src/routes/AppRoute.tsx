/**
 * ============================================================
 * CareerMind AI
 * Application Routes
 * ============================================================
 *
 * Responsibilities:
 *
 * - Central application routing
 * - Public routes
 * - Protected routes
 * - Authentication-aware redirects
 * - Dashboard protection
 * - Resume intelligence routes
 * - Career roadmap routes
 * - Interview preparation routes
 * - 404 handling
 *
 * Authentication Flow:
 *
 * App
 *  ↓
 * AuthProvider
 *  ↓
 * AppRoutes
 *  ↓
 * Authentication restored?
 *  ↓
 * ProtectedRoute
 *  ↓
 * Dashboard
 *
 * ============================================================
 */

import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import {
    useAuth,
} from "../hooks/useAuth";

// ============================================================
// PUBLIC PAGES
// ============================================================

import Login from "../pages/Login";
import Register from "../pages/Register";

// ============================================================
// PROTECTED PAGES
// ============================================================

import Dashboard from "../pages/Dashboard";

// ============================================================
// OPTIONAL / FUTURE CAREER PAGES
// ============================================================
//
// Keep these imports only if these pages actually exist.
//
// import ResumeAnalysis from "../pages/ResumeAnalysis";
// import CareerRoadmap from "../pages/CareerRoadmap";
// import InterviewPreparation from "../pages/InterviewPreparation";
// import CareerProfile from "../pages/CareerProfile";
// import ResumeHistory from "../pages/ResumeHistory";
//

// ============================================================
// ROUTE LOADING SCREEN
// ============================================================

function RouteLoadingScreen() {
    return (
        <main className="route-loading-screen">
            <div className="route-loading-card">

                <div className="route-loading-orb">
                    <span>AI</span>
                </div>

                <div className="route-loading-content">

                    <div className="route-loading-brand">
                        CareerMind <span>AI</span>
                    </div>

                    <p className="route-loading-status">
                        Initializing your career intelligence...
                    </p>

                    <div
                        className="route-loading-bar"
                        aria-hidden="true"
                    >
                        <span />
                    </div>

                    <small>
                        Restoring secure workspace
                    </small>

                </div>

            </div>
        </main>
    );
}

// ============================================================
// PUBLIC-ONLY ROUTE
// ============================================================
//
// Used for:
//
// /login
// /register
//
// If the user is already authenticated,
// don't allow them to return to login/register.
//
// ============================================================

interface PublicRouteProps {
    children: React.ReactNode;
}

function PublicRoute({
    children,
}: PublicRouteProps) {

    const {
        user,
        loading,
    } = useAuth();

    // --------------------------------------------------------
    // Authentication restoration
    // --------------------------------------------------------

    if (loading) {
        return <RouteLoadingScreen />;
    }

    // --------------------------------------------------------
    // Already authenticated
    // --------------------------------------------------------

    if (user) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return children;
}

// ============================================================
// PROTECTED APPLICATION SHELL
// ============================================================
//
// All authenticated application pages should live inside
// this route.
//
// This makes authentication behavior consistent.
//
// ============================================================

function ProtectedApp() {

    return (
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    );
}

// ============================================================
// NOT FOUND PAGE
// ============================================================

function NotFoundPage() {

    const {
        user,
    } = useAuth();

    return (
        <main className="not-found-page">

            <div className="not-found-card">

                <div className="not-found-code">
                    404
                </div>

                <div className="not-found-ai">
                    CareerMind AI
                </div>

                <h1>
                    Intelligence destination not found
                </h1>

                <p>
                    The page you are looking for does not
                    exist or may have moved to another
                    intelligence workspace.
                </p>

                <Navigate
                    to={
                        user
                            ? "/dashboard"
                            : "/login"
                    }
                    replace
                />

            </div>

        </main>
    );
}

// ============================================================
// APPLICATION ROUTES
// ============================================================

export default function AppRoutes() {

    return (
        <Routes>

            {/* ==================================================
                PUBLIC ROUTES
                ================================================== */}

            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />

            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />


            {/* ==================================================
                ROOT ROUTE
                ================================================== */}

            <Route
                path="/"
                element={
                    <RootRedirect />
                }
            />


            {/* ==================================================
                PROTECTED DASHBOARD
                ================================================== */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />


            {/* ==================================================
                OPTIONAL FUTURE ROUTES
                ==================================================

                Add these when their page components exist.

                Example:

                <Route
                    path="/resume-analysis"
                    element={
                        <ProtectedRoute>
                            <ResumeAnalysis />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/career-roadmap"
                    element={
                        <ProtectedRoute>
                            <CareerRoadmap />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/interview"
                    element={
                        <ProtectedRoute>
                            <InterviewPreparation />
                        </ProtectedRoute>
                    }
                />

                ================================================== */}


            {/* ==================================================
                CATCH-ALL
                ================================================== */}

            <Route
                path="*"
                element={
                    <NotFoundPage />
                }
            />

        </Routes>
    );
}

// ============================================================
// ROOT REDIRECT
// ============================================================
//
// /
// ↓
// authenticated → /dashboard
// unauthenticated → /login
//
// ============================================================

function RootRedirect() {

    const {
        user,
        loading,
    } = useAuth();

    if (loading) {
        return <RouteLoadingScreen />;
    }

    if (user) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return (
        <Navigate
            to="/login"
            replace
        />
    );
}
