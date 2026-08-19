/**
 * ============================================================
 * CareerMind AI
 * Public Route Guard
 * ============================================================
 *
 * Purpose:
 *
 * Protects authentication pages from already authenticated
 * users.
 *
 * Public pages:
 *
 *   /login
 *   /register
 *
 * Flow:
 *
 * Application starts
 *        ↓
 * AuthProvider restores session
 *        ↓
 * loading === true
 *        ↓
 * Show initialization screen
 *        ↓
 * Authentication resolved
 *        ↓
 * ┌───────────────────────┐
 * │                       │
 * │ user exists?          │
 * │                       │
 * └───────────┬───────────┘
 *             │
 *       ┌─────┴─────┐
 *       │           │
 *      YES          NO
 *       │           │
 *       ↓           ↓
 * /dashboard     children
 *
 * ============================================================
 */

import {
    Navigate,
} from "react-router-dom";

import type {
    ReactNode,
} from "react";

import {
    useAuth,
} from "../hooks/useAuth";

// ============================================================
// PROPS
// ============================================================

interface PublicRouteProps {
    children: ReactNode;
}

// ============================================================
// PUBLIC ROUTE
// ============================================================

export default function PublicRoute({
    children,
}: PublicRouteProps) {

    const {
        user,
        loading,
    } = useAuth();

    // ========================================================
    // AUTHENTICATION RESTORATION
    // ========================================================
    //
    // IMPORTANT:
    //
    // Do not decide whether the user is authenticated until
    // AuthProvider has finished restoring the JWT session.
    //
    // Without this check:
    //
    // page refresh
    //      ↓
    // user === null temporarily
    //      ↓
    // Login renders
    //      ↓
    // /auth/me finishes
    //      ↓
    // Dashboard renders
    //
    // That creates unnecessary UI flickering.
    //
    // ========================================================

    if (loading) {
        return (
            <main
                className="route-loading"
                aria-live="polite"
                aria-busy="true"
            >

                <div className="route-loading__orb">
                    <span>
                        AI
                    </span>
                </div>

                <div className="route-loading__content">

                    <div className="route-loading__brand">
                        CareerMind
                        <span>
                            AI
                        </span>
                    </div>

                    <h1>
                        Restoring your intelligence workspace
                    </h1>

                    <p>
                        Securely checking your CareerMind
                        session...
                    </p>

                    <div
                        className="route-loading__progress"
                        aria-hidden="true"
                    >
                        <span />
                    </div>

                </div>

            </main>
        );
    }

    // ========================================================
    // AUTHENTICATED USER
    // ========================================================
    //
    // Login/Register should not be accessible after the user
    // has already authenticated.
    //
    // Example:
    //
    // /login
    //      ↓
    // user exists
    //      ↓
    // /dashboard
    //
    // ========================================================

    if (user) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    // ========================================================
    // PUBLIC ACCESS
    // ========================================================
    //
    // No authenticated user exists.
    //
    // Render the requested public page:
    //
    // Login
    // Register
    //
    // ========================================================

    return (
        <>
            {children}
        </>
    );
}
