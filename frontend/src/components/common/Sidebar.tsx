/**
 * ============================================================
 * CareerMind AI
 *
 * Sidebar Navigation
 * AI Career Operating System
 *
 * Features:
 * - Dashboard navigation
 * - Resume Intelligence
 * - Skill Intelligence
 * - Career Strategy
 * - Growth Engine
 * - AI Interview Center
 * - Profile
 * - Settings
 * - Secure logout
 * - Active route detection
 * - Responsive mobile support
 * ============================================================
 */

import {
    Activity,
    ArrowUpRight,
    BarChart3,
    BookOpen,
    BrainCircuit,
    BriefcaseBusiness,
    ChevronRight,
    FileSearch,
    FileText,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Settings,
    ShieldCheck,
    Sparkles,
    Target,
    User,
    X,
} from "lucide-react";

import {
    NavLink,
    useLocation,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import "./sidebar.css";


// ============================================================
// Types
// ============================================================

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}


// ============================================================
// Navigation
// ============================================================

const intelligenceNavigation = [
    {
        label: "Overview",
        description: "Career command center",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Resume Intelligence",
        description: "Resume evidence & ATS",
        path: "/resume",
        icon: FileSearch,
    },
    {
        label: "AI Analysis",
        description: "Professional intelligence",
        path: "/resume-analysis",
        icon: BrainCircuit,
    },
    {
        label: "Skill Intelligence",
        description: "Skills & capability gaps",
        path: "/skill-gap",
        icon: BarChart3,
    },
    {
        label: "Career Strategy",
        description: "Career direction",
        path: "/career",
        icon: Target,
    },
    {
        label: "Growth Engine",
        description: "Learning roadmap",
        path: "/roadmap",
        icon: GraduationCap,
    },
    {
        label: "Interview Center",
        description: "AI interview preparation",
        path: "/interview",
        icon: BriefcaseBusiness,
    },
];


// ============================================================
// Sidebar
// ============================================================

export default function Sidebar({
    mobileOpen = false,
    onClose,
}: SidebarProps) {

    const {
        user,
        logout,
    } = useAuth();

    const location = useLocation();


    // ========================================================
    // User information
    // ========================================================

    const fullName =
        user?.full_name?.trim() ||
        "CareerMind User";

    const role =
        user?.role?.trim() ||
        "Student";


    const initials =
        fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (part) =>
                    part.charAt(0).toUpperCase(),
            )
            .join("") || "CM";


    // ========================================================
    // Logout
    // ========================================================

    const handleLogout = async () => {

        try {

            await logout();

        } catch (error) {

            console.error(
                "CareerMind AI | Logout failed:",
                error,
            );

        }

    };


    // ========================================================
    // Active route helper
    // ========================================================

    const isCurrentRoute = (
        path: string,
    ) => {

        if (path === "/dashboard") {

            return (
                location.pathname ===
                "/dashboard"
            );

        }

        return (
            location.pathname === path ||
            location.pathname.startsWith(
                `${path}/`,
            )
        );
    };


    // ========================================================
    // Render
    // ========================================================

    return (
        <>

            {/* ==================================================
                MOBILE OVERLAY
            ================================================== */}

            {mobileOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    aria-label="Close navigation"
                    onClick={onClose}
                />
            )}


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside
                className={`cm-sidebar ${mobileOpen
                        ? "cm-sidebar-open"
                        : ""
                    }`}
                aria-label="CareerMind navigation"
            >

                {/* ==================================================
                    BRAND
                ================================================== */}

                <div className="sidebar-brand">

                    <NavLink
                        to="/dashboard"
                        className="sidebar-brand-link"
                        onClick={onClose}
                    >

                        <div className="sidebar-brand-mark">

                            <Sparkles
                                size={21}
                                strokeWidth={2.4}
                            />

                        </div>


                        <div className="sidebar-brand-copy">

                            <span className="sidebar-brand-name">
                                CareerMind
                            </span>

                            <span className="sidebar-brand-subtitle">
                                AI Career OS
                            </span>

                        </div>

                    </NavLink>


                    {/* Mobile close */}

                    <button
                        type="button"
                        className="sidebar-mobile-close"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >

                        <X size={19} />

                    </button>

                </div>


                {/* ==================================================
                    AI STATUS
                ================================================== */}

                <div className="sidebar-ai-status">

                    <div className="sidebar-ai-status-icon">

                        <Activity
                            size={15}
                        />

                    </div>


                    <div className="sidebar-ai-status-copy">

                        <span>
                            AI System
                        </span>

                        <strong>
                            Online
                        </strong>

                    </div>


                    <span
                        className="sidebar-ai-pulse"
                        aria-hidden="true"
                    />

                </div>


                {/* ==================================================
                    NAVIGATION
                ================================================== */}

                <nav
                    className="sidebar-navigation"
                    aria-label="Primary navigation"
                >

                    <div className="sidebar-section-label">
                        Intelligence
                    </div>


                    <div className="sidebar-menu">

                        {intelligenceNavigation.map(
                            (item) => {

                                const Icon =
                                    item.icon;

                                const active =
                                    isCurrentRoute(
                                        item.path,
                                    );


                                return (

                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={
                                            `sidebar-nav-item ${active
                                                ? "sidebar-nav-item-active"
                                                : ""
                                            }`
                                        }
                                    >

                                        <span className="sidebar-nav-icon">

                                            <Icon
                                                size={18}
                                                strokeWidth={
                                                    active
                                                        ? 2.3
                                                        : 1.9
                                                }
                                            />

                                        </span>


                                        <span className="sidebar-nav-content">

                                            <span className="sidebar-nav-label">
                                                {
                                                    item.label
                                                }
                                            </span>

                                            <span className="sidebar-nav-description">
                                                {
                                                    item.description
                                                }
                                            </span>

                                        </span>


                                        <ChevronRight
                                            className="sidebar-nav-arrow"
                                            size={15}
                                        />

                                    </NavLink>

                                );

                            },
                        )}

                    </div>


                    {/* ==================================================
                        ACCOUNT
                    ================================================== */}

                    <div className="sidebar-section-label sidebar-section-account">
                        Workspace
                    </div>


                    <div className="sidebar-menu">

                        <NavLink
                            to="/profile"
                            onClick={onClose}
                            className={
                                `sidebar-nav-item ${isCurrentRoute(
                                    "/profile",
                                )
                                    ? "sidebar-nav-item-active"
                                    : ""
                                }`
                            }
                        >

                            <span className="sidebar-nav-icon">

                                <User
                                    size={18}
                                />

                            </span>


                            <span className="sidebar-nav-content">

                                <span className="sidebar-nav-label">
                                    Profile
                                </span>

                                <span className="sidebar-nav-description">
                                    Personal career profile
                                </span>

                            </span>


                            <ChevronRight
                                className="sidebar-nav-arrow"
                                size={15}
                            />

                        </NavLink>


                        <NavLink
                            to="/settings"
                            onClick={onClose}
                            className={
                                `sidebar-nav-item ${isCurrentRoute(
                                    "/settings",
                                )
                                    ? "sidebar-nav-item-active"
                                    : ""
                                }`
                            }
                        >

                            <span className="sidebar-nav-icon">

                                <Settings
                                    size={18}
                                />

                            </span>


                            <span className="sidebar-nav-content">

                                <span className="sidebar-nav-label">
                                    Settings
                                </span>

                                <span className="sidebar-nav-description">
                                    Platform preferences
                                </span>

                            </span>


                            <ChevronRight
                                className="sidebar-nav-arrow"
                                size={15}
                            />

                        </NavLink>

                    </div>

                </nav>


                {/* ==================================================
                    CAREER INTELLIGENCE CARD
                ================================================== */}

                <div className="sidebar-intelligence-card">

                    <div className="sidebar-intelligence-glow" />


                    <div className="sidebar-intelligence-header">

                        <div className="sidebar-intelligence-icon">

                            <ShieldCheck
                                size={17}
                            />

                        </div>

                        <span>
                            Protected workspace
                        </span>

                    </div>


                    <p>
                        Your career evidence and
                        AI intelligence stay inside
                        your protected workspace.
                    </p>


                    <NavLink
                        to="/profile"
                        className="sidebar-intelligence-link"
                        onClick={onClose}
                    >

                        <span>
                            View profile
                        </span>

                        <ArrowUpRight
                            size={14}
                        />

                    </NavLink>

                </div>


                {/* ==================================================
                    USER PROFILE
                ================================================== */}

                <div className="sidebar-user">

                    <div className="sidebar-user-avatar">

                        {initials}

                    </div>


                    <div className="sidebar-user-info">

                        <strong>
                            {fullName}
                        </strong>

                        <span>
                            {role}
                        </span>

                    </div>


                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={
                            handleLogout
                        }
                        title="Logout"
                        aria-label="Logout"
                    >

                        <LogOut
                            size={17}
                        />

                    </button>

                </div>

            </aside>

        </>
    );
}