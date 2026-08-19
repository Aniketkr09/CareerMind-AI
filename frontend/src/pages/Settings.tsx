/**
 * ============================================================
 * CareerMind AI
 * SETTINGS & PERSONALIZATION CENTER
 *
 * React + TypeScript
 * FastAPI JWT compatible
 * DashboardLayout compatible
 * ============================================================
 */

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
    type CSSProperties,
} from "react";

import {
    Activity,
    Bell,
    Brain,
    BriefcaseBusiness,
    Check,
    CheckCircle2,
    ChevronRight,
    Eye,
    LockKeyhole,
    LogOut,
    RotateCcw,
    Route,
    Settings as SettingsIcon,
    ShieldCheck,
    Sparkles,
    Target,
    UserRound,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import DashboardLayout from "../components/layouts/DashboardLayout";

import "./settings.css";

/* ============================================================
   TYPES
============================================================ */

interface UserPreferences {
    notifications: boolean;
    aiAssistant: boolean;
    careerRecommendations: boolean;
    skillGapAlerts: boolean;
    learningRoadmap: boolean;
    careerReadinessTracking: boolean;
    profileVisibility: boolean;
}

type PreferenceKey = keyof UserPreferences;

/* ============================================================
   DEFAULT PREFERENCES
============================================================ */

const DEFAULT_PREFERENCES: UserPreferences = {
    notifications: true,
    aiAssistant: true,
    careerRecommendations: true,
    skillGapAlerts: true,
    learningRoadmap: true,
    careerReadinessTracking: true,
    profileVisibility: false,
};

const STORAGE_PREFIX = "careermind_ai_preferences";

/* ============================================================
   STORAGE KEY
============================================================ */

function getStorageKey(userId?: string): string {
    if (!userId) {
        return STORAGE_PREFIX;
    }

    return `${STORAGE_PREFIX}_${userId}`;
}

/* ============================================================
   SETTINGS PAGE
============================================================ */

export default function Settings() {
    const { user, logout } = useAuth();

    /* ========================================================
       USER
    ======================================================== */

    const userId = user?.id
        ? String(user.id)
        : undefined;

    const storageKey = useMemo(
        () => getStorageKey(userId),
        [userId]
    );

    /* ========================================================
       STATE
    ======================================================== */

    const [preferences, setPreferences] =
        useState<UserPreferences>(
            DEFAULT_PREFERENCES
        );

    const [saved, setSaved] =
        useState(false);

    const saveTimerRef =
        useRef<number | null>(null);

    /* ========================================================
       LOAD PREFERENCES
    ======================================================== */

    useEffect(() => {
        if (!userId) {
            setPreferences({
                ...DEFAULT_PREFERENCES,
            });

            return;
        }

        try {
            const stored =
                localStorage.getItem(
                    storageKey
                );

            if (!stored) {
                setPreferences({
                    ...DEFAULT_PREFERENCES,
                });

                return;
            }

            const parsed: unknown =
                JSON.parse(stored);

            if (
                !parsed ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
            ) {
                setPreferences({
                    ...DEFAULT_PREFERENCES,
                });

                return;
            }

            setPreferences({
                ...DEFAULT_PREFERENCES,
                ...(parsed as Partial<UserPreferences>),
            });
        } catch (error) {
            console.error(
                "CareerMind AI: unable to load preferences.",
                error
            );

            setPreferences({
                ...DEFAULT_PREFERENCES,
            });
        }
    }, [storageKey, userId]);

    /* ========================================================
       CLEANUP
    ======================================================== */

    useEffect(() => {
        return () => {
            if (
                saveTimerRef.current !== null
            ) {
                window.clearTimeout(
                    saveTimerRef.current
                );
            }
        };
    }, []);

    /* ========================================================
       SAVE
    ======================================================== */

    const persistPreferences =
        useCallback(
            (
                nextPreferences: UserPreferences
            ) => {
                try {
                    localStorage.setItem(
                        storageKey,
                        JSON.stringify(
                            nextPreferences
                        )
                    );

                    setSaved(true);

                    if (
                        saveTimerRef.current !== null
                    ) {
                        window.clearTimeout(
                            saveTimerRef.current
                        );
                    }

                    saveTimerRef.current =
                        window.setTimeout(() => {
                            setSaved(false);
                        }, 1800);
                } catch (error) {
                    console.error(
                        "CareerMind AI: unable to save preferences.",
                        error
                    );
                }
            },
            [storageKey]
        );

    /* ========================================================
       UPDATE PREFERENCE
    ======================================================== */

    const updatePreference = (
        key: PreferenceKey,
        value: boolean
    ) => {
        setPreferences((current) => {
            const nextPreferences: UserPreferences = {
                ...current,
                [key]: value,
            };

            persistPreferences(
                nextPreferences
            );

            return nextPreferences;
        });
    };

    /* ========================================================
       RESET
    ======================================================== */

    const resetPreferences = () => {
        const confirmed =
            window.confirm(
                "Reset all CareerMind AI preferences to their default configuration?"
            );

        if (!confirmed) {
            return;
        }

        const defaults: UserPreferences = {
            ...DEFAULT_PREFERENCES,
        };

        setPreferences(defaults);

        persistPreferences(defaults);
    };

    /* ========================================================
       LOGOUT
    ======================================================== */

    const handleLogout = async () => {
        const confirmed =
            window.confirm(
                "Are you sure you want to sign out of CareerMind AI?"
            );

        if (!confirmed) {
            return;
        }

        try {
            await logout();
        } catch (error) {
            console.error(
                "CareerMind AI logout failed:",
                error
            );
        }
    };

    /* ========================================================
       SAFE USER DATA
    ======================================================== */

    const fullName =
        user?.full_name?.trim() ||
        "Developer";

    const email =
        user?.email?.trim() ||
        "Email unavailable";

    const role =
        user?.role?.trim() ||
        "Student";

    const accountActive =
        Boolean(user?.is_active);

    /* ========================================================
       PREFERENCE SCORE
    ======================================================== */

    const preferenceValues =
        Object.values(preferences);

    const enabledPreferences =
        preferenceValues.filter(Boolean)
            .length;

    const totalPreferences =
        preferenceValues.length;

    const preferenceScore =
        totalPreferences > 0
            ? Math.round(
                (enabledPreferences /
                    totalPreferences) *
                100
            )
            : 0;

    const progressStyle: CSSProperties = {
        "--progress": `${preferenceScore * 3.6}deg`,
    } as CSSProperties;

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <DashboardLayout>

            <main className="settings-page">

                {/* ==================================================
                   HERO
                ================================================== */}

                <section className="settings-hero">

                    <div className="settings-hero-grid" />

                    <div className="settings-hero-main">

                        <div className="settings-hero-icon">
                            <SettingsIcon size={29} />
                        </div>

                        <div className="settings-hero-content">

                            <span className="settings-eyebrow">
                                CAREERMIND AI · CONTROL CENTER
                            </span>

                            <h1>
                                Tune your{" "}
                                <span>
                                    career intelligence.
                                </span>
                            </h1>

                            <p>
                                Configure how CareerMind AI
                                personalizes recommendations,
                                career signals, learning guidance
                                and your professional workspace.
                            </p>

                            <div className="settings-hero-meta">

                                <HeroMeta
                                    icon={
                                        <ShieldCheck
                                            size={15}
                                        />
                                    }
                                    label="Secure session"
                                />

                                <HeroMeta
                                    icon={
                                        <Brain
                                            size={15}
                                        />
                                    }
                                    label="AI personalization"
                                />

                                <HeroMeta
                                    icon={
                                        <Activity
                                            size={15}
                                        />
                                    }
                                    label="Intelligence active"
                                />

                            </div>

                        </div>

                    </div>

                    {/* ==================================================
                       READINESS
                    ================================================== */}

                    <div className="settings-readiness">

                        <div className="readiness-orbit">

                            <div
                                className="readiness-progress"
                                style={progressStyle}
                            />

                            <div className="readiness-core">

                                <strong>
                                    {preferenceScore}%
                                </strong>

                                <span>
                                    configured
                                </span>

                            </div>

                        </div>

                        <span>
                            Personalization
                        </span>

                    </div>

                    {/* ==================================================
                       SAVED
                    ================================================== */}

                    {saved && (
                        <div
                            className="settings-saved"
                            role="status"
                            aria-live="polite"
                        >
                            <CheckCircle2
                                size={17}
                            />

                            Preferences saved
                        </div>
                    )}

                </section>

                {/* ==================================================
                   ACCOUNT
                ================================================== */}

                <section className="settings-card account-card">

                    <SettingsSectionHeader
                        icon={<UserRound />}
                        eyebrow="IDENTITY"
                        title="Account Overview"
                        description="Your authenticated CareerMind AI identity."
                    />

                    <div className="account-grid">

                        <AccountField
                            label="Full Name"
                            value={fullName}
                        />

                        <AccountField
                            label="Email Address"
                            value={email}
                        />

                        <AccountField
                            label="Account Role"
                            value={formatRole(role)}
                        />

                        <AccountField
                            label="Account Status"
                            value={
                                accountActive
                                    ? "Active"
                                    : "Inactive"
                            }
                            status={accountActive}
                        />

                    </div>

                </section>

                {/* ==================================================
                   SECURITY
                ================================================== */}

                <section className="settings-card">

                    <SettingsSectionHeader
                        icon={<ShieldCheck />}
                        eyebrow="SECURITY"
                        title="Authentication & Security"
                        description="Your workspace uses authenticated access to protect career intelligence."
                    />

                    <div className="security-banner">

                        <div className="security-icon">
                            <LockKeyhole size={22} />
                        </div>

                        <div className="security-content">

                            <div className="security-title-row">

                                <h3>
                                    JWT Authentication
                                </h3>

                                <span className="security-status">
                                    <span />
                                    Protected
                                </span>

                            </div>

                            <p>
                                Your authenticated requests
                                are protected through the
                                active CareerMind AI
                                access session.
                            </p>

                        </div>

                        <CheckCircle2
                            className="security-check"
                            size={22}
                        />

                    </div>

                </section>

                {/* ==================================================
                   CAREER SIGNALS
                ================================================== */}

                <section className="settings-card">

                    <SettingsSectionHeader
                        icon={<Bell />}
                        eyebrow="CAREER SIGNALS"
                        title="Intelligence Notifications"
                        description="Choose which career signals CareerMind AI should keep active."
                    />

                    <SettingToggle
                        icon={<Bell />}
                        title="Career Updates"
                        description="Receive important updates related to your professional profile."
                        checked={
                            preferences.notifications
                        }
                        onChange={(value) =>
                            updatePreference(
                                "notifications",
                                value
                            )
                        }
                    />

                    <SettingToggle
                        icon={<Target />}
                        title="Skill Gap Alerts"
                        description="Surface missing or underrepresented skills that could strengthen your profile."
                        checked={
                            preferences.skillGapAlerts
                        }
                        onChange={(value) =>
                            updatePreference(
                                "skillGapAlerts",
                                value
                            )
                        }
                    />

                    <SettingToggle
                        icon={<Route />}
                        title="Learning Roadmap"
                        description="Keep learning priorities and roadmap recommendations synchronized with your career direction."
                        checked={
                            preferences.learningRoadmap
                        }
                        onChange={(value) =>
                            updatePreference(
                                "learningRoadmap",
                                value
                            )
                        }
                    />

                </section>

                {/* ==================================================
                   AI ENGINE
                ================================================== */}

                <section className="settings-card ai-settings-card">

                    <div className="ai-card-glow" />

                    <SettingsSectionHeader
                        icon={<Brain />}
                        eyebrow="AI ENGINE"
                        title="CareerMind Intelligence"
                        description="Control the AI systems that shape your personalized career experience."
                    />

                    <SettingToggle
                        icon={<Sparkles />}
                        title="AI Career Assistant"
                        description="Enable personalized career guidance, insights and AI-assisted recommendations."
                        checked={
                            preferences.aiAssistant
                        }
                        onChange={(value) =>
                            updatePreference(
                                "aiAssistant",
                                value
                            )
                        }
                        highlighted
                    />

                    <SettingToggle
                        icon={<BriefcaseBusiness />}
                        title="Career Recommendations"
                        description="Generate career directions using your resume, skills and professional signals."
                        checked={
                            preferences.careerRecommendations
                        }
                        onChange={(value) =>
                            updatePreference(
                                "careerRecommendations",
                                value
                            )
                        }
                    />

                    <SettingToggle
                        icon={<Target />}
                        title="Career Readiness Tracking"
                        description="Monitor career readiness using resume quality, ATS signals and demonstrated skills."
                        checked={
                            preferences.careerReadinessTracking
                        }
                        onChange={(value) =>
                            updatePreference(
                                "careerReadinessTracking",
                                value
                            )
                        }
                    />

                </section>

                {/* ==================================================
                   PRIVACY
                ================================================== */}

                <section className="settings-card">

                    <SettingsSectionHeader
                        icon={<Eye />}
                        eyebrow="PRIVACY"
                        title="Professional Visibility"
                        description="Control how your professional identity may participate in future discovery features."
                    />

                    <SettingToggle
                        icon={<Eye />}
                        title="Professional Profile Visibility"
                        description="Allow your professional profile to be discoverable by future CareerMind AI features."
                        checked={
                            preferences.profileVisibility
                        }
                        onChange={(value) =>
                            updatePreference(
                                "profileVisibility",
                                value
                            )
                        }
                    />

                    <div className="privacy-note">

                        <ShieldCheck size={18} />

                        <div>

                            <strong>
                                Local preference storage
                            </strong>

                            <span>
                                These settings are persisted
                                in your browser and scoped
                                to your authenticated user.
                            </span>

                        </div>

                    </div>

                </section>

                {/* ==================================================
                   PREFERENCE MANAGEMENT
                ================================================== */}

                <section className="settings-card">

                    <SettingsSectionHeader
                        icon={<RotateCcw />}
                        eyebrow="CONTROL"
                        title="Preference Management"
                        description="Restore CareerMind AI personalization to its original configuration."
                    />

                    <button
                        type="button"
                        className="reset-button"
                        onClick={
                            resetPreferences
                        }
                    >

                        <RotateCcw size={17} />

                        <span>
                            Reset Preferences
                        </span>

                        <ChevronRight size={17} />

                    </button>

                </section>

                {/* ==================================================
                   LOGOUT
                ================================================== */}

                <section className="settings-card danger-card">

                    <SettingsSectionHeader
                        icon={<LogOut />}
                        eyebrow="ACCOUNT ACTION"
                        title="Sign Out"
                        description="End your current authenticated CareerMind AI session."
                    />

                    <div className="logout-area">

                        <div className="logout-copy">

                            <h3>
                                Leave your workspace
                            </h3>

                            <p>
                                Signing out ends your current
                                authenticated session. You can
                                safely return by signing in again.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="logout-button"
                            onClick={
                                handleLogout
                            }
                        >

                            <LogOut size={18} />

                            Sign Out

                        </button>

                    </div>

                </section>

                {/* ==================================================
                   FOOTER
                ================================================== */}

                <footer className="settings-footer">

                    <div className="settings-footer-brand">

                        <div className="settings-footer-logo">
                            <Brain size={17} />
                        </div>

                        <div>

                            <strong>
                                CareerMind AI
                            </strong>

                            <span>
                                AI Career Intelligence Platform
                            </span>

                        </div>

                    </div>

                    <div className="settings-footer-status">

                        <span className="footer-live-dot" />

                        Intelligence systems ready

                    </div>

                </footer>

            </main>

        </DashboardLayout>
    );
}

/* ============================================================
   HERO META
============================================================ */

function HeroMeta({
    icon,
    label,
}: {
    icon: ReactNode;
    label: string;
}) {
    return (
        <span className="hero-meta-item">
            {icon}
            {label}
        </span>
    );
}

/* ============================================================
   ACCOUNT FIELD
============================================================ */

function AccountField({
    label,
    value,
    status,
}: {
    label: string;
    value: string;
    status?: boolean;
}) {
    return (
        <div className="account-field">

            <span>
                {label}
            </span>

            {status !== undefined ? (
                <strong
                    className={
                        status
                            ? "status-active"
                            : "status-inactive"
                    }
                >
                    <span className="status-dot" />

                    {value}
                </strong>
            ) : (
                <strong>
                    {value}
                </strong>
            )}

        </div>
    );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SettingsSectionHeader({
    icon,
    eyebrow,
    title,
    description,
}: {
    icon: ReactNode;
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="settings-section-header">

            <div className="settings-section-icon">
                {icon}
            </div>

            <div className="settings-section-copy">

                <span className="settings-label">
                    {eyebrow}
                </span>

                <h2>
                    {title}
                </h2>

                <p>
                    {description}
                </p>

            </div>

        </div>
    );
}

/* ============================================================
   SETTING TOGGLE
============================================================ */

function SettingToggle({
    icon,
    title,
    description,
    checked,
    onChange,
    highlighted = false,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    highlighted?: boolean;
}) {
    return (
        <div
            className={[
                "setting-item",
                highlighted
                    ? "setting-item-highlight"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >

            <div className="setting-item-icon">
                {icon}
            </div>

            <div className="setting-item-content">

                <div className="setting-title-row">

                    <h3>
                        {title}
                    </h3>

                    {highlighted && (
                        <span className="ai-badge">

                            <Sparkles size={11} />

                            AI Core

                        </span>
                    )}

                </div>

                <p>
                    {description}
                </p>

            </div>

            <label
                className="toggle-control"
                aria-label={title}
            >

                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) =>
                        onChange(
                            event.target.checked
                        )
                    }
                />

                <span
                    className="toggle-slider"
                    aria-hidden="true"
                >

                    {checked && (
                        <Check size={12} />
                    )}

                </span>

            </label>

        </div>
    );
}

/* ============================================================
   ROLE FORMATTER
============================================================ */

function formatRole(
    role: string
): string {
    return role
        .trim()
        .replace(
            /[-_]+/g,
            " "
        )
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}