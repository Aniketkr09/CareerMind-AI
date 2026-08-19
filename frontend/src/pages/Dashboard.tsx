/**
 * ============================================================
 * CareerMind AI
 * AI CAREER OS — Professional Intelligence Dashboard
 * ============================================================
 *
 * Backend-connected features:
 *
 * GET  /api/v1/resume/latest
 * POST /api/v1/resume/upload
 * GET  /api/v1/resume-analysis/{resume_id}
 *
 * Architecture:
 *
 * Dashboard
 *    ↓
 * useDashboard()
 *    ↓
 * resumeService
 *    ↓
 * FastAPI
 *
 * Important:
 * - No direct fetch()
 * - No duplicate authentication logic
 * - No fake backend scores
 * - No automatic interview API call
 * - Resume can exist without analysis
 * - Analysis can exist without optional AI modules
 * ============================================================
 */

import {
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type ReactNode,
} from "react";

import {
    Activity,
    ArrowRight,
    BrainCircuit,
    BriefcaseBusiness,
    Check,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    Clock3,
    Code2,
    Cpu,
    FileSearch,
    Gauge,
    GraduationCap,
    Layers3,
    Lightbulb,
    LockKeyhole,
    MessageSquare,
    RefreshCw,
    Rocket,
    ScanSearch,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    Upload,
    UserRound,
    Zap,
} from "lucide-react";

import DashboardLayout from "../components/layouts/DashboardLayout";

import { useAuth } from "../context/AuthContext";

import useDashboard from "../hooks/useDashboard";

import "./dashboard.css";

/* ============================================================
   SAFE TYPES
   ============================================================ */

/**
 * We intentionally do NOT import Resume or ResumeAnalysis
 * from resumeService.ts.
 *
 * This keeps the page independent from service-only typings.
 */

type UnknownRecord = Record<string, unknown>;

interface ResumeViewModel {
    id: string;
    original_filename: string;
    file_type?: string | null;
    is_processed?: boolean | null;
    created_at?: string | null;
}

interface AnalysisViewModel {
    resume_id?: string | null;

    ats_score?: number | null;
    ai_score?: number | null;

    skill_match?: number | null;
    career_readiness?: number | null;
    resume_quality?: number | null;
    technical_skills?: number | null;
    career_alignment?: number | null;
    growth_potential?: number | null;

    skills?: unknown;
    missing_skills?: unknown;
    skill_gaps?: unknown;

    career_recommendations?: unknown;
    career_recommendation?: unknown;

    strengths?: unknown;
    insights?: unknown;
}

/* ============================================================
   GENERIC HELPERS
   ============================================================ */

function asObject(
    value: unknown,
): UnknownRecord {
    if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    ) {
        return value as UnknownRecord;
    }

    return {};
}

/* ------------------------------------------------------------
   Safe number
------------------------------------------------------------ */

function safeNumber(
    value: unknown,
): number | null {
    if (
        typeof value !== "number" ||
        !Number.isFinite(value)
    ) {
        return null;
    }

    return Math.max(
        0,
        Math.min(
            100,
            Math.round(value),
        ),
    );
}

/* ------------------------------------------------------------
   Safe string
------------------------------------------------------------ */

function safeString(
    value: unknown,
): string | null {
    if (
        typeof value !== "string"
    ) {
        return null;
    }

    const result =
        value.trim();

    return result
        ? result
        : null;
}

/* ------------------------------------------------------------
   Safe string array
------------------------------------------------------------ */

function stringArray(
    value: unknown,
): string[] {
    if (
        !Array.isArray(value)
    ) {
        return [];
    }

    return Array.from(
        new Set(
            value
                .filter(
                    (
                        item,
                    ): item is string =>
                        typeof item === "string",
                )
                .map(
                    item =>
                        item.trim(),
                )
                .filter(Boolean),
        ),
    );
}

/* ------------------------------------------------------------
   Normalize backend response
------------------------------------------------------------ */

function unwrap<T>(
    value: unknown,
): T | null {
    const object =
        asObject(value);

    /**
     * Supports:
     *
     * { data: {...} }
     * { resume: {...} }
     * { analysis: {...} }
     * {...}
     */

    const candidate =
        object.data ??
        object.resume ??
        object.analysis ??
        value;

    if (
        candidate === null ||
        candidate === undefined
    ) {
        return null;
    }

    return candidate as T;
}

/* ============================================================
   UI HELPERS
   ============================================================ */

function formatDate(
    value?: string | null,
): string {
    if (!value) {
        return "Recently updated";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return "Recently updated";
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    );
}

/* ------------------------------------------------------------
   Score label
------------------------------------------------------------ */

function scoreLabel(
    score: number | null,
): string {
    if (score === null) {
        return "Pending";
    }

    if (score >= 85) {
        return "Excellent";
    }

    if (score >= 70) {
        return "Strong";
    }

    if (score >= 50) {
        return "Developing";
    }

    return "Needs attention";
}

/* ------------------------------------------------------------
   Score ring
------------------------------------------------------------ */

function ScoreRing({
    value,
    label,
    icon,
    compact = false,
}: {
    value: number | null;
    label: string;
    icon: ReactNode;
    compact?: boolean;
}) {
    const score =
        value ?? 0;

    return (
        <article
            className={
                compact
                    ? "cm-score-card cm-score-card-compact"
                    : "cm-score-card"
            }
        >
            <div className="cm-score-card-header">
                <span>
                    {label}
                </span>

                <div className="cm-score-icon">
                    {icon}
                </div>
            </div>

            <div
                className="cm-score-ring"
                style={
                    {
                        "--score":
                            `${score * 3.6}deg`,
                    } as React.CSSProperties
                }
            >
                <div className="cm-score-ring-inner">
                    <strong>
                        {value === null
                            ? "—"
                            : score}
                    </strong>

                    <small>
                        {value === null
                            ? "PENDING"
                            : "/100"}
                    </small>
                </div>
            </div>

            <div className="cm-score-footer">
                <span>
                    {value === null
                        ? "Intelligence not available"
                        : scoreLabel(
                            value,
                        )}
                </span>

                <span className="cm-ai-state">
                    <span />
                    AI
                </span>
            </div>
        </article>
    );
}

/* ============================================================
   SECTION HEADER
   ============================================================ */

function SectionHeader({
    number,
    eyebrow,
    title,
    description,
    icon,
}: {
    number: string;
    eyebrow: string;
    title: string;
    description: string;
    icon: ReactNode;
}) {
    return (
        <div className="cm-section-header">
            <div className="cm-section-number">
                {number}
            </div>

            <div className="cm-section-icon">
                {icon}
            </div>

            <div className="cm-section-copy">
                <span>
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
   STATUS ITEM
   ============================================================ */

function StatusItem({
    label,
    active,
    pending = false,
}: {
    label: string;
    active: boolean;
    pending?: boolean;
}) {
    return (
        <div className="cm-status-item">
            <span>
                {label}
            </span>

            {active ? (
                <span className="cm-status-ready">
                    <Check
                        size={13}
                    />
                    Ready
                </span>
            ) : pending ? (
                <span className="cm-status-pending">
                    Pending
                </span>
            ) : (
                <span className="cm-status-waiting">
                    Waiting
                </span>
            )}
        </div>
    );
}

/* ============================================================
   MAIN DASHBOARD
   ============================================================ */

export default function Dashboard() {
    const { user } =
        useAuth();

    const {
        dashboard,
        loading,
        analyzing,
        uploading,
        error,
        analysisError,
        refresh,
        upload,
        analyze,
    } = useDashboard();

    const fileInputRef =
        useRef<HTMLInputElement | null>(
            null,
        );

    const [
        uploadMessage,
        setUploadMessage,
    ] = useState<string | null>(
        null,
    );

    const [
        mobileNavOpen,
        setMobileNavOpen,
    ] = useState(false);

    /* ========================================================
       NORMALIZED DATA
    ======================================================== */

    const resume =
        useMemo(
            () =>
                unwrap<ResumeViewModel>(
                    dashboard.resume,
                ),
            [dashboard.resume],
        );

    const analysis =
        useMemo(
            () =>
                unwrap<AnalysisViewModel>(
                    dashboard.analysis,
                ),
            [dashboard.analysis],
        );

    const analysisObject =
        useMemo(
            () =>
                asObject(
                    analysis,
                ),
            [analysis],
        );

    /* ========================================================
       SCORES
    ======================================================== */

    const atsScore =
        safeNumber(
            analysis?.ats_score,
        );

    const aiScore =
        safeNumber(
            analysis?.ai_score,
        );

    const skillScore =
        safeNumber(
            analysis?.skill_match ??
            analysis?.technical_skills,
        );

    const careerReadiness =
        safeNumber(
            analysis?.career_readiness ??
            aiScore,
        );

    const careerAlignment =
        safeNumber(
            analysis?.career_alignment,
        );

    const resumeQuality =
        safeNumber(
            analysis?.resume_quality ??
            atsScore,
        );

    const growthPotential =
        safeNumber(
            analysis?.growth_potential ??
            careerReadiness,
        );

    const profileScore =
        atsScore !== null &&
            aiScore !== null
            ? Math.round(
                (
                    atsScore +
                    aiScore
                ) / 2,
            )
            : atsScore ??
            aiScore;

    /* ========================================================
       SKILLS
    ======================================================== */

    const skills =
        useMemo(
            () => {
                return stringArray(
                    analysis?.skills,
                ).slice(
                    0,
                    18,
                );
            },
            [analysis?.skills],
        );

    /* ========================================================
       SKILL GAPS
    ======================================================== */

    const skillGaps =
        useMemo(
            () => {
                const gaps =
                    [
                        ...stringArray(
                            analysis?.skill_gaps,
                        ),
                        ...stringArray(
                            analysis?.missing_skills,
                        ),
                    ];

                return Array.from(
                    new Set(
                        gaps,
                    ),
                ).slice(
                    0,
                    8,
                );
            },
            [
                analysis?.skill_gaps,
                analysis?.missing_skills,
            ],
        );

    /* ========================================================
       CAREER RECOMMENDATION
    ======================================================== */

    const careerRecommendation =
        useMemo(
            () => {
                const direct =
                    safeString(
                        analysis?.career_recommendation,
                    );

                if (direct) {
                    return direct;
                }

                const recommendations =
                    stringArray(
                        analysis?.career_recommendations,
                    );

                if (
                    recommendations.length
                ) {
                    return recommendations[0];
                }

                return null;
            },
            [
                analysis?.career_recommendation,
                analysis?.career_recommendations,
            ],
        );

    /* ========================================================
       STRENGTHS
    ======================================================== */

    const strengths =
        useMemo(
            () =>
                stringArray(
                    analysis?.strengths,
                ).slice(
                    0,
                    6,
                ),
            [analysis?.strengths],
        );

    /* ========================================================
       INSIGHTS
    ======================================================== */

    const insights =
        useMemo(
            () =>
                stringArray(
                    analysis?.insights,
                ).slice(
                    0,
                    4,
                ),
            [analysis?.insights],
        );

    /* ========================================================
       PROFILE COMPLETENESS
    ======================================================== */

    const profileCompletion =
        useMemo(() => {
            let score = 0;

            if (resume) {
                score += 30;
            }

            if (analysis) {
                score += 30;
            }

            if (skills.length > 0) {
                score += 20;
            }

            if (
                careerRecommendation
            ) {
                score += 20;
            }

            return score;
        }, [
            resume,
            analysis,
            skills.length,
            careerRecommendation,
        ]);

    /* ========================================================
       UPLOAD
    ======================================================== */

    const handleFileChange =
        async (
            event: ChangeEvent<HTMLInputElement>,
        ) => {
            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }

            setUploadMessage(null);

            if (
                file.type !==
                "application/pdf" &&
                !file.name
                    .toLowerCase()
                    .endsWith(".pdf")
            ) {
                setUploadMessage(
                    "Please upload a PDF resume.",
                );

                event.target.value =
                    "";

                return;
            }

            if (
                file.size >
                10 * 1024 * 1024
            ) {
                setUploadMessage(
                    "Resume must be smaller than 10 MB.",
                );

                event.target.value =
                    "";

                return;
            }

            const result =
                await upload(
                    file,
                );

            if (result) {
                setUploadMessage(
                    "Resume connected. Career intelligence is being updated.",
                );
            }

            event.target.value =
                "";
        };

    /* ========================================================
       MANUAL ANALYSIS
    ======================================================== */

    const handleAnalyze =
        async () => {
            if (!resume?.id) {
                return;
            }

            await analyze(
                resume.id,
            );
        };

    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {
        return (
            <div className="cm-dashboard-loading">
                <div className="cm-loading-orbit">
                    <div>
                        <BrainCircuit
                            size={32}
                        />
                    </div>
                </div>

                <span className="cm-loading-label">
                    CAREERMIND AI
                </span>

                <h1>
                    Initializing your
                    intelligence layer.
                </h1>

                <p>
                    Securely loading your
                    professional evidence
                    and career signals.
                </p>

                <div className="cm-loading-progress">
                    <span />
                </div>
            </div>
        );
    }

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <DashboardLayout>
            <main className="cm-dashboard">
                {/* ==================================================
                    TOP SYSTEM BAR
                ================================================== */}

                <header className="cm-topbar">
                    <div className="cm-brand">
                        <div className="cm-brand-mark">
                            <BrainCircuit
                                size={22}
                            />
                        </div>

                        <div>
                            <strong>
                                CareerMind
                            </strong>

                            <span>
                                AI CAREER OS
                            </span>
                        </div>
                    </div>

                    <div className="cm-system-state">
                        <span className="cm-live-dot" />
                        AI SYSTEM ONLINE
                    </div>

                    <div className="cm-user-area">
                        <div className="cm-user-meta">
                            <strong>
                                {
                                    user?.full_name ??
                                    "Career Professional"
                                }
                            </strong>

                            <span>
                                {
                                    user?.role ??
                                    "student"
                                }
                            </span>
                        </div>

                        <div className="cm-user-avatar">
                            {(
                                user?.full_name ??
                                "AK"
                            )
                                .split(
                                    " ",
                                )
                                .map(
                                    part =>
                                        part[0],
                                )
                                .join("")
                                .slice(
                                    0,
                                    2,
                                )
                                .toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* ==================================================
                    NAVIGATION
                ================================================== */}

                <nav className="cm-command-nav">
                    <button
                        className="cm-mobile-nav-button"
                        onClick={() =>
                            setMobileNavOpen(
                                previous =>
                                    !previous,
                            )
                        }
                        type="button"
                    >
                        <Layers3
                            size={17}
                        />
                        Navigation
                    </button>

                    <div
                        className={
                            mobileNavOpen
                                ? "cm-nav-links open"
                                : "cm-nav-links"
                        }
                    >
                        <a href="#overview">
                            Overview
                        </a>

                        <a href="#resume-intelligence">
                            Resume Intelligence
                        </a>

                        <a href="#skill-intelligence">
                            Skill Intelligence
                        </a>

                        <a href="#career-strategy">
                            Career Strategy
                        </a>

                        <a href="#growth-intelligence">
                            Growth Engine
                        </a>

                        <a href="#interview-center">
                            Interview Center
                        </a>
                    </div>
                </nav>

                {/* ==================================================
                    ALERTS
                ================================================== */}

                {(error ||
                    analysisError ||
                    uploadMessage) && (
                        <div
                            className={
                                error
                                    ? "cm-alert cm-alert-error"
                                    : "cm-alert cm-alert-info"
                            }
                        >
                            {error ? (
                                <CircleAlert
                                    size={18}
                                />
                            ) : (
                                <CheckCircle2
                                    size={18}
                                />
                            )}

                            <span>
                                {error ??
                                    analysisError ??
                                    uploadMessage}
                            </span>
                        </div>
                    )}

                {/* ==================================================
                    OVERVIEW
                ================================================== */}

                <section
                    id="overview"
                    className="cm-overview-section"
                >
                    <div className="cm-hero-grid">
                        <div className="cm-hero-copy">
                            <div className="cm-eyebrow">
                                <Sparkles
                                    size={14}
                                />
                                PRIVATE CAREER
                                INTELLIGENCE
                            </div>

                            <h1>
                                Your career,
                                <span>
                                    intelligently
                                    mapped.
                                </span>
                            </h1>

                            <p>
                                CareerMind transforms
                                your professional
                                evidence into a
                                structured intelligence
                                layer — helping you
                                understand your
                                strengths, gaps and
                                highest-impact next
                                move.
                            </p>

                            <div className="cm-hero-actions">
                                <button
                                    className="cm-primary-button"
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={
                                        uploading
                                    }
                                >
                                    <Upload
                                        size={17}
                                    />

                                    {uploading
                                        ? "Analyzing..."
                                        : "Update Resume"}

                                    <ArrowRight
                                        size={16}
                                    />
                                </button>

                                <button
                                    className="cm-secondary-button"
                                    type="button"
                                    onClick={() =>
                                        document
                                            .getElementById(
                                                "career-strategy",
                                            )
                                            ?.scrollIntoView(
                                                {
                                                    behavior:
                                                        "smooth",
                                                },
                                            )
                                    }
                                >
                                    Explore Direction
                                    <ChevronRight
                                        size={16}
                                    />
                                </button>

                                <input
                                    ref={
                                        fileInputRef
                                    }
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    hidden
                                    onChange={
                                        handleFileChange
                                    }
                                />
                            </div>

                            <div className="cm-trust-row">
                                <span>
                                    <ShieldCheck
                                        size={15}
                                    />
                                    Protected profile
                                </span>

                                <span>
                                    <Cpu
                                        size={15}
                                    />
                                    AI-assisted analysis
                                </span>

                                <span>
                                    <LockKeyhole
                                        size={15}
                                    />
                                    Private intelligence
                                </span>
                            </div>
                        </div>

                        <div className="cm-command-card">
                            <div className="cm-command-header">
                                <div>
                                    <span>
                                        INTELLIGENCE
                                        STATE
                                    </span>

                                    <strong>
                                        {analysis
                                            ? "Optimized"
                                            : resume
                                                ? "Processing"
                                                : "Awaiting evidence"}
                                    </strong>
                                </div>

                                <div className="cm-command-status">
                                    <span />
                                    AI ACTIVE
                                </div>
                            </div>

                            <div className="cm-command-score">
                                <div>
                                    <span>
                                        PROFILE
                                        SCORE
                                    </span>

                                    <strong>
                                        {profileScore ??
                                            "—"}
                                    </strong>

                                    <small>
                                        /100
                                    </small>
                                </div>

                                <Gauge
                                    size={42}
                                />
                            </div>

                            <div className="cm-command-bars">
                                <MiniBar
                                    label="ATS"
                                    value={
                                        atsScore
                                    }
                                />

                                <MiniBar
                                    label="AI"
                                    value={
                                        aiScore
                                    }
                                />

                                <MiniBar
                                    label="SKILL"
                                    value={
                                        skillScore
                                    }
                                />

                                <MiniBar
                                    label="FIT"
                                    value={
                                        careerAlignment
                                    }
                                />
                            </div>

                            <div className="cm-command-footer">
                                <span>
                                    Career readiness
                                </span>

                                <strong>
                                    {careerReadiness ??
                                        "—"}
                                    {careerReadiness !==
                                        null &&
                                        "%"}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* SCORE MATRIX */}

                    <div className="cm-score-grid">
                        <ScoreRing
                            value={
                                careerReadiness
                            }
                            label="Career Readiness"
                            icon={
                                <Rocket
                                    size={17}
                                />
                            }
                        />

                        <ScoreRing
                            value={
                                atsScore
                            }
                            label="ATS Intelligence"
                            icon={
                                <FileSearch
                                    size={17}
                                />
                            }
                        />

                        <ScoreRing
                            value={
                                skillScore
                            }
                            label="Skill Intelligence"
                            icon={
                                <Code2
                                    size={17}
                                />
                            }
                        />

                        <ScoreRing
                            value={
                                careerAlignment
                            }
                            label="Career Alignment"
                            icon={
                                <Target
                                    size={17}
                                />
                            }
                        />
                    </div>
                </section>

                {/* ==================================================
                    RESUME INTELLIGENCE
                ================================================== */}

                <section
                    id="resume-intelligence"
                    className="cm-section"
                >
                    <SectionHeader
                        number="01"
                        eyebrow="RESUME INTELLIGENCE"
                        title="Your professional evidence layer."
                        description="Connect your latest resume and transform it into structured career intelligence."
                        icon={
                            <FileSearch />
                        }
                    />

                    <div className="cm-resume-grid">
                        <article className="cm-panel cm-resume-panel">
                            <div className="cm-panel-topline">
                                <span>
                                    RESUME ENGINE
                                </span>

                                <span className="cm-live-badge">
                                    <span />
                                    LIVE
                                </span>
                            </div>

                            {resume ? (
                                <>
                                    <div className="cm-resume-connected">
                                        <div className="cm-file-icon">
                                            <FileSearch
                                                size={25}
                                            />
                                        </div>

                                        <div>
                                            <strong>
                                                {
                                                    resume.original_filename
                                                }
                                            </strong>

                                            <span>
                                                {resume.file_type ??
                                                    "PDF"}{" "}
                                                · Connected
                                            </span>

                                            <small>
                                                Updated{" "}
                                                {formatDate(
                                                    resume.created_at,
                                                )}
                                            </small>
                                        </div>

                                        <CheckCircle2
                                            className="cm-success-icon"
                                            size={21}
                                        />
                                    </div>

                                    <div className="cm-resume-actions">
                                        <button
                                            type="button"
                                            className="cm-secondary-button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            disabled={
                                                uploading
                                            }
                                        >
                                            <Upload
                                                size={16}
                                            />
                                            Upload New
                                        </button>

                                        <button
                                            type="button"
                                            className="cm-primary-button"
                                            onClick={
                                                handleAnalyze
                                            }
                                            disabled={
                                                analyzing
                                            }
                                        >
                                            <BrainCircuit
                                                size={16}
                                            />
                                            {analyzing
                                                ? "Analyzing..."
                                                : "Re-analyze"}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="cm-empty-state">
                                    <div>
                                        <Upload
                                            size={28}
                                        />
                                    </div>

                                    <h3>
                                        Connect your
                                        professional
                                        evidence
                                    </h3>

                                    <p>
                                        Upload a PDF
                                        resume to
                                        activate your
                                        intelligence
                                        workspace.
                                    </p>

                                    <button
                                        className="cm-primary-button"
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        <Upload
                                            size={16}
                                        />
                                        Connect Resume
                                    </button>
                                </div>
                            )}
                        </article>

                        <article className="cm-panel cm-profile-panel">
                            <div className="cm-panel-topline">
                                <span>
                                    PROFILE HEALTH
                                </span>

                                <ShieldCheck
                                    size={18}
                                />
                            </div>

                            <div className="cm-profile-score">
                                <strong>
                                    {
                                        profileCompletion
                                    }
                                    <small>
                                        %
                                    </small>
                                </strong>

                                <span>
                                    Evidence coverage
                                </span>
                            </div>

                            <div className="cm-health-track">
                                <span
                                    style={{
                                        width: `${profileCompletion}%`,
                                    }}
                                />
                            </div>

                            <div className="cm-status-list">
                                <StatusItem
                                    label="Resume"
                                    active={
                                        !!resume
                                    }
                                />

                                <StatusItem
                                    label="AI analysis"
                                    active={
                                        !!analysis
                                    }
                                    pending={
                                        !!resume &&
                                        !analysis
                                    }
                                />

                                <StatusItem
                                    label="Skill intelligence"
                                    active={
                                        skills.length >
                                        0
                                    }
                                    pending={
                                        !!analysis &&
                                        skills.length ===
                                        0
                                    }
                                />

                                <StatusItem
                                    label="Career strategy"
                                    active={
                                        !!careerRecommendation
                                    }
                                    pending={
                                        !!analysis &&
                                        !careerRecommendation
                                    }
                                />
                            </div>
                        </article>
                    </div>
                </section>

                {/* ==================================================
                    ANALYSIS SNAPSHOT
                ================================================== */}

                <section className="cm-section">
                    <SectionHeader
                        number="02"
                        eyebrow="AI ANALYSIS"
                        title="Professional intelligence snapshot."
                        description="Signals extracted from your current professional evidence."
                        icon={
                            <BrainCircuit />
                        }
                    />

                    <div className="cm-intelligence-grid">
                        <InsightCard
                            label="Resume Quality"
                            value={
                                resumeQuality
                            }
                            icon={
                                <ScanSearch />
                            }
                        />

                        <InsightCard
                            label="Technical Depth"
                            value={
                                skillScore
                            }
                            icon={
                                <Code2 />
                            }
                        />

                        <InsightCard
                            label="Growth Potential"
                            value={
                                growthPotential
                            }
                            icon={
                                <TrendingUp />
                            }
                        />

                        <InsightCard
                            label="Career Alignment"
                            value={
                                careerAlignment
                            }
                            icon={
                                <Target />
                            }
                        />
                    </div>

                    {(strengths.length >
                        0 ||
                        insights.length >
                        0) && (
                            <div className="cm-analysis-detail-grid">
                                {strengths.length >
                                    0 && (
                                        <article className="cm-panel">
                                            <div className="cm-panel-topline">
                                                <span>
                                                    SIGNAL
                                                    STRENGTHS
                                                </span>

                                                <TrendingUp
                                                    size={17}
                                                />
                                            </div>

                                            <div className="cm-list">
                                                {strengths.map(
                                                    (
                                                        strength,
                                                        index,
                                                    ) => (
                                                        <div
                                                            key={`${strength}-${index}`}
                                                        >
                                                            <CheckCircle2
                                                                size={
                                                                    17
                                                                }
                                                            />

                                                            <span>
                                                                {
                                                                    strength
                                                                }
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </article>
                                    )}

                                {insights.length >
                                    0 && (
                                        <article className="cm-panel">
                                            <div className="cm-panel-topline">
                                                <span>
                                                    AI INSIGHTS
                                                </span>

                                                <Lightbulb
                                                    size={17}
                                                />
                                            </div>

                                            <div className="cm-list">
                                                {insights.map(
                                                    (
                                                        insight,
                                                        index,
                                                    ) => (
                                                        <div
                                                            key={`${insight}-${index}`}
                                                        >
                                                            <Zap
                                                                size={
                                                                    17
                                                                }
                                                            />

                                                            <span>
                                                                {
                                                                    insight
                                                                }
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </article>
                                    )}
                            </div>
                        )}
                </section>

                {/* ==================================================
                    SKILLS
                ================================================== */}

                <section
                    id="skill-intelligence"
                    className="cm-section"
                >
                    <SectionHeader
                        number="03"
                        eyebrow="SKILL INTELLIGENCE"
                        title="Map your technical DNA."
                        description="Understand the capabilities already present in your professional evidence."
                        icon={
                            <NetworkIcon />
                        }
                    />

                    <div className="cm-skills-layout">
                        <article className="cm-panel cm-capability-panel">
                            <div className="cm-panel-topline">
                                <span>
                                    CAPABILITY GRAPH
                                </span>

                                <span className="cm-ai-badge">
                                    AI MAPPED
                                </span>
                            </div>

                            {skills.length >
                                0 ? (
                                <div className="cm-skill-cloud">
                                    {skills.map(
                                        (
                                            skill,
                                            index,
                                        ) => (
                                            <div
                                                className={`cm-skill-node cm-skill-node-${index % 5}`}
                                                key={`${skill}-${index}`}
                                            >
                                                <Code2
                                                    size={
                                                        14
                                                    }
                                                />

                                                {
                                                    skill
                                                }
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="cm-empty-state cm-empty-state-small">
                                    <BrainCircuit
                                        size={30}
                                    />

                                    <h3>
                                        Skill intelligence
                                        is waiting
                                    </h3>

                                    <p>
                                        Upload and
                                        analyze your
                                        resume to
                                        generate your
                                        capability map.
                                    </p>
                                </div>
                            )}
                        </article>

                        <article className="cm-panel cm-skill-metrics">
                            <div className="cm-panel-topline">
                                <span>
                                    CAPABILITY SIGNAL
                                </span>

                                <Activity
                                    size={18}
                                />
                            </div>

                            <div className="cm-big-metric">
                                <strong>
                                    {
                                        skills.length
                                    }
                                </strong>

                                <span>
                                    detected
                                    capabilities
                                </span>
                            </div>

                            <MetricLine
                                label="Technical"
                                value={
                                    skillScore
                                }
                            />

                            <MetricLine
                                label="Evidence"
                                value={
                                    analysis
                                        ? 100
                                        : null
                                }
                            />

                            <MetricLine
                                label="Market fit"
                                value={
                                    careerAlignment
                                }
                            />
                        </article>
                    </div>
                </section>

                {/* ==================================================
                    CAREER STRATEGY
                ================================================== */}

                <section
                    id="career-strategy"
                    className="cm-section"
                >
                    <SectionHeader
                        number="04"
                        eyebrow="CAREER STRATEGY"
                        title="Turn evidence into direction."
                        description="Use your current evidence to identify the strongest next career move."
                        icon={
                            <BriefcaseBusiness />
                        }
                    />

                    <div className="cm-career-grid">
                        <article className="cm-panel cm-career-card">
                            <div className="cm-panel-topline">
                                <span>
                                    AI CAREER
                                    RECOMMENDATION
                                </span>

                                <Sparkles
                                    size={18}
                                />
                            </div>

                            {careerRecommendation ? (
                                <>
                                    <div className="cm-career-result">
                                        <div className="cm-career-icon">
                                            <BriefcaseBusiness
                                                size={
                                                    25
                                                }
                                            />
                                        </div>

                                        <div>
                                            <span>
                                                Recommended
                                                direction
                                            </span>

                                            <h3>
                                                {
                                                    careerRecommendation
                                                }
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="cm-career-note">
                                        <Target
                                            size={17}
                                        />

                                        <span>
                                            Career
                                            recommendation
                                            generated from
                                            available
                                            profile
                                            intelligence.
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="cm-empty-state cm-empty-state-small">
                                    <BriefcaseBusiness
                                        size={30}
                                    />

                                    <h3>
                                        Career direction
                                        pending
                                    </h3>

                                    <p>
                                        Analyze your
                                        resume to unlock
                                        personalized
                                        career direction.
                                    </p>

                                    {resume && (
                                        <button
                                            className="cm-primary-button"
                                            type="button"
                                            onClick={
                                                handleAnalyze
                                            }
                                            disabled={
                                                analyzing
                                            }
                                        >
                                            <BrainCircuit
                                                size={
                                                    16
                                                }
                                            />
                                            {analyzing
                                                ? "Analyzing..."
                                                : "Analyze Profile"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </article>

                        <article className="cm-panel cm-next-move">
                            <div className="cm-panel-topline">
                                <span>
                                    NEXT BEST MOVE
                                </span>

                                <Rocket
                                    size={18}
                                />
                            </div>

                            <div className="cm-next-move-icon">
                                <Zap
                                    size={22}
                                />
                            </div>

                            <span>
                                HIGHEST IMPACT
                            </span>

                            <h3>
                                {skillGaps.length >
                                    0
                                    ? `Strengthen ${skillGaps[0]}`
                                    : "Strengthen your highest-impact capability."}
                            </h3>

                            <p>
                                CareerMind prioritizes
                                actions based on the
                                intelligence currently
                                available in your
                                profile.
                            </p>

                            <a href="#growth-intelligence">
                                Build your strategy
                                <ArrowRight
                                    size={15}
                                />
                            </a>
                        </article>
                    </div>
                </section>

                {/* ==================================================
                    GAP INTELLIGENCE
                ================================================== */}

                <section className="cm-section">
                    <SectionHeader
                        number="05"
                        eyebrow="GAP INTELLIGENCE"
                        title="Know what to build next."
                        description="Turn missing capabilities into focused professional development priorities."
                        icon={
                            <Target />
                        }
                    />

                    <div className="cm-gap-panel cm-panel">
                        <div className="cm-panel-topline">
                            <span>
                                PRIORITY CAPABILITIES
                            </span>

                            <span>
                                {skillGaps.length}{" "}
                                detected
                            </span>
                        </div>

                        {skillGaps.length >
                            0 ? (
                            <div className="cm-gap-list">
                                {skillGaps.map(
                                    (
                                        gap,
                                        index,
                                    ) => (
                                        <div
                                            className="cm-gap-item"
                                            key={`${gap}-${index}`}
                                        >
                                            <span className="cm-gap-index">
                                                {String(
                                                    index +
                                                    1,
                                                ).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </span>

                                            <div>
                                                <strong>
                                                    {
                                                        gap
                                                    }
                                                </strong>

                                                <span>
                                                    Priority
                                                    capability
                                                </span>
                                            </div>

                                            <ChevronRight
                                                size={
                                                    17
                                                }
                                            />
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : (
                            <div className="cm-empty-inline">
                                <CheckCircle2
                                    size={19}
                                />

                                <span>
                                    No skill gaps are
                                    available yet.
                                    Complete resume
                                    analysis to
                                    generate gap
                                    intelligence.
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* ==================================================
                    GROWTH ENGINE
                ================================================== */}

                <section
                    id="growth-intelligence"
                    className="cm-section"
                >
                    <SectionHeader
                        number="06"
                        eyebrow="GROWTH INTELLIGENCE"
                        title="Build your next professional advantage."
                        description="Convert capability gaps into a structured execution path."
                        icon={
                            <GraduationCap />
                        }
                    />

                    <div className="cm-roadmap-grid">
                        <RoadmapStep
                            number="01"
                            title="Foundation"
                            action="Strengthen"
                            description={
                                skillGaps.length
                                    ? `Focus on ${skillGaps
                                        .slice(
                                            0,
                                            2,
                                        )
                                        .join(
                                            " and ",
                                        )}.`
                                    : "Build the highest-priority capabilities identified by your profile."
                            }
                            active={
                                !!analysis
                            }
                            icon={
                                <Layers3 />
                            }
                        />

                        <RoadmapStep
                            number="02"
                            title="Evidence"
                            action="Build"
                            description="Turn knowledge into projects, portfolio evidence and practical experience."
                            active={
                                skills.length >
                                0
                            }
                            icon={
                                <Code2 />
                            }
                        />

                        <RoadmapStep
                            number="03"
                            title="Opportunity"
                            action="Prepare"
                            description="Improve resume positioning, interview readiness and career applications."
                            active={
                                !!careerRecommendation
                            }
                            icon={
                                <Rocket />
                            }
                        />
                    </div>
                </section>

                {/* ==================================================
                    INTERVIEW CENTER
                ================================================== */}

                <section
                    id="interview-center"
                    className="cm-section"
                >
                    <SectionHeader
                        number="07"
                        eyebrow="INTERVIEW CENTER"
                        title="Prepare for the conversation."
                        description="Use your CareerMind profile as the foundation for technical and behavioral preparation."
                        icon={
                            <MessageSquare />
                        }
                    />

                    <div className="cm-interview-grid">
                        <article className="cm-panel cm-interview-card">
                            <div className="cm-panel-topline">
                                <span>
                                    INTERVIEW
                                    INTELLIGENCE
                                </span>

                                <MessageSquare
                                    size={18}
                                />
                            </div>

                            <h3>
                                Your interview
                                workspace
                            </h3>

                            <p>
                                Prepare for technical,
                                behavioral, project and
                                system-design
                                interviews using your
                                career profile.
                            </p>

                            <div className="cm-interview-types">
                                <span>
                                    Technical
                                </span>

                                <span>
                                    Behavioral
                                </span>

                                <span>
                                    Projects
                                </span>

                                <span>
                                    System Design
                                </span>
                            </div>

                            <div className="cm-interview-status">
                                <div>
                                    <CheckCircle2
                                        size={18}
                                    />

                                    <div>
                                        <strong>
                                            Profile
                                            ready
                                        </strong>

                                        <span>
                                            Interview
                                            intelligence
                                            can use your
                                            analyzed
                                            profile.
                                        </span>
                                    </div>
                                </div>

                                <span className="cm-integration-badge">
                                    READY
                                </span>
                            </div>

                            {/**
                             * Intentionally no call to:
                             *
                             * generateInterviewQuestion()
                             *
                             * because your current backend did not
                             * consistently expose that endpoint.
                             */}
                        </article>

                        <article className="cm-panel cm-activity-card">
                            <div className="cm-panel-topline">
                                <span>
                                    AI ACTIVITY
                                </span>

                                <Activity
                                    size={18}
                                />
                            </div>

                            <div className="cm-timeline">
                                <TimelineItem
                                    active={
                                        !!resume
                                    }
                                    title="Professional evidence connected"
                                    description={
                                        resume
                                            ? resume.original_filename
                                            : "Waiting for resume upload"
                                    }
                                />

                                <TimelineItem
                                    active={
                                        !!analysis
                                    }
                                    title="Career intelligence generated"
                                    description={
                                        analysis
                                            ? "Resume signals analyzed"
                                            : "Waiting for analysis"
                                    }
                                />

                                <TimelineItem
                                    active={
                                        skills.length >
                                        0
                                    }
                                    title="Capability map created"
                                    description={
                                        skills.length
                                            ? `${skills.length} capabilities detected`
                                            : "Waiting for skill intelligence"
                                    }
                                />
                            </div>
                        </article>
                    </div>
                </section>

                {/* ==================================================
                    QUICK ACTIONS
                ================================================== */}

                <section className="cm-quick-section">
                    <div className="cm-quick-header">
                        <div>
                            <span>
                                COMMAND CENTER
                            </span>

                            <h2>
                                High-impact actions
                            </h2>
                        </div>

                        <button
                            className="cm-refresh-button"
                            type="button"
                            onClick={() =>
                                void refresh()
                            }
                        >
                            <RefreshCw
                                size={15}
                            />
                            Refresh intelligence
                        </button>
                    </div>

                    <div className="cm-quick-grid">
                        <QuickAction
                            icon={
                                <Upload />
                            }
                            title="Update resume"
                            description="Connect newer professional evidence."
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                        />

                        <QuickAction
                            icon={
                                <BrainCircuit />
                            }
                            title="Analyze profile"
                            description="Run AI intelligence on your resume."
                            onClick={
                                handleAnalyze
                            }
                            disabled={
                                !resume ||
                                analyzing
                            }
                        />

                        <QuickAction
                            icon={
                                <Target />
                            }
                            title="Review skill gaps"
                            description="See the capabilities you should build."
                            onClick={() =>
                                document
                                    .querySelector(
                                        ".cm-gap-panel",
                                    )
                                    ?.scrollIntoView(
                                        {
                                            behavior:
                                                "smooth",
                                        },
                                    )
                            }
                        />

                        <QuickAction
                            icon={
                                <GraduationCap />
                            }
                            title="Open growth engine"
                            description="Move from intelligence to execution."
                            onClick={() =>
                                document
                                    .getElementById(
                                        "growth-intelligence",
                                    )
                                    ?.scrollIntoView(
                                        {
                                            behavior:
                                                "smooth",
                                        },
                                    )
                            }
                        />
                    </div>
                </section>

                {/* ==================================================
                    TRUST LAYER
                ================================================== */}

                <section className="cm-trust-section">
                    <div className="cm-trust-copy">
                        <span>
                            TRUST LAYER
                        </span>

                        <h2>
                            Built around protected
                            career intelligence.
                        </h2>

                        <p>
                            CareerMind separates
                            authentication,
                            professional profile data
                            and intelligence workflows
                            into a secure career
                            operating environment.
                        </p>
                    </div>

                    <div className="cm-trust-grid">
                        <TrustItem
                            icon={
                                <ShieldCheck />
                            }
                            title="Secure authentication"
                        />

                        <TrustItem
                            icon={
                                <LockKeyhole />
                            }
                            title="Protected profile"
                        />

                        <TrustItem
                            icon={
                                <FileSearch />
                            }
                            title="Resume intelligence"
                        />

                        <TrustItem
                            icon={
                                <Cpu />
                            }
                            title="Responsible AI workflow"
                        />
                    </div>
                </section>

                {/* ==================================================
                    INTELLIGENCE LOOP
                ================================================== */}

                <section className="cm-loop-section">
                    <div className="cm-loop-heading">
                        <span>
                            CAREERMIND INTELLIGENCE
                            LOOP
                        </span>

                        <h2>
                            Evidence
                            <i>→</i>
                            Intelligence
                            <i>→</i>
                            Action.
                        </h2>

                        <p>
                            A continuous operating
                            model for turning
                            professional evidence into
                            measurable career progress.
                        </p>
                    </div>

                    <div className="cm-loop-grid">
                        <LoopItem
                            number="01"
                            title="Connect"
                            description="Connect your latest professional evidence."
                            icon={
                                <Upload />
                            }
                        />

                        <LoopItem
                            number="02"
                            title="Analyze"
                            description="Extract skills, ATS signals and career evidence."
                            icon={
                                <ScanSearch />
                            }
                        />

                        <LoopItem
                            number="03"
                            title="Understand"
                            description="Identify strengths, gaps and career direction."
                            icon={
                                <BrainCircuit />
                            }
                        />

                        <LoopItem
                            number="04"
                            title="Execute"
                            description="Follow the highest-impact next career move."
                            icon={
                                <Rocket />
                            }
                        />
                    </div>
                </section>

                {/* ==================================================
                    FOOTER
                ================================================== */}

                <footer className="cm-dashboard-footer">
                    <div>
                        <strong>
                            CareerMind AI
                        </strong>

                        <span>
                            AI Career Intelligence
                            Platform
                        </span>
                    </div>

                    <div>
                        <span>
                            Intelligence for your
                            next career move.
                        </span>

                        <span className="cm-footer-online">
                            <span />
                            AI ONLINE
                        </span>
                    </div>
                </footer>
            </main>
        </DashboardLayout>
    );
}

/* ============================================================
   MINI BAR
   ============================================================ */

function MiniBar({
    label,
    value,
}: {
    label: string;
    value: number | null;
}) {
    return (
        <div className="cm-mini-bar">
            <span>
                {label}
            </span>

            <div>
                <span
                    style={{
                        width:
                            value === null
                                ? "0%"
                                : `${value}%`,
                    }}
                />
            </div>

            <strong>
                {value === null
                    ? "—"
                    : value}
            </strong>
        </div>
    );
}

/* ============================================================
   INSIGHT CARD
   ============================================================ */

function InsightCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number | null;
    icon: ReactNode;
}) {
    return (
        <article className="cm-insight-card">
            <div className="cm-insight-icon">
                {icon}
            </div>

            <span>
                {label}
            </span>

            <strong>
                {value === null
                    ? "—"
                    : value}
            </strong>

            <small>
                {value === null
                    ? "Pending intelligence"
                    : scoreLabel(value)}
            </small>
        </article>
    );
}

/* ============================================================
   METRIC LINE
   ============================================================ */

function MetricLine({
    label,
    value,
}: {
    label: string;
    value: number | null;
}) {
    return (
        <div className="cm-metric-line">
            <div>
                <span>
                    {label}
                </span>

                <strong>
                    {value === null
                        ? "—"
                        : `${value}%`}
                </strong>
            </div>

            <div className="cm-metric-track">
                <span
                    style={{
                        width:
                            value === null
                                ? "0%"
                                : `${value}%`,
                    }}
                />
            </div>
        </div>
    );
}

/* ============================================================
   ROADMAP STEP
   ============================================================ */

function RoadmapStep({
    number,
    title,
    action,
    description,
    active,
    icon,
}: {
    number: string;
    title: string;
    action: string;
    description: string;
    active: boolean;
    icon: ReactNode;
}) {
    return (
        <article
            className={
                active
                    ? "cm-roadmap-step active"
                    : "cm-roadmap-step"
            }
        >
            <div className="cm-roadmap-number">
                {number}
            </div>

            <div className="cm-roadmap-icon">
                {icon}
            </div>

            <span>
                {active
                    ? "AI PRIORITIZED"
                    : "AWAITING SIGNAL"}
            </span>

            <strong>
                {title}
            </strong>

            <h3>
                {action}
            </h3>

            <p>
                {description}
            </p>

            {active && (
                <CheckCircle2
                    className="cm-roadmap-check"
                    size={18}
                />
            )}
        </article>
    );
}

/* ============================================================
   TIMELINE
   ============================================================ */

function TimelineItem({
    active,
    title,
    description,
}: {
    active: boolean;
    title: string;
    description: string;
}) {
    return (
        <div
            className={
                active
                    ? "cm-timeline-item active"
                    : "cm-timeline-item"
            }
        >
            <div className="cm-timeline-dot">
                {active ? (
                    <Check
                        size={11}
                    />
                ) : (
                    <Clock3
                        size={11}
                    />
                )}
            </div>

            <div>
                <strong>
                    {title}
                </strong>

                <span>
                    {description}
                </span>
            </div>
        </div>
    );
}

/* ============================================================
   QUICK ACTION
   ============================================================ */

function QuickAction({
    icon,
    title,
    description,
    onClick,
    disabled = false,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            className="cm-quick-action"
            onClick={onClick}
            disabled={disabled}
        >
            <div className="cm-quick-icon">
                {icon}
            </div>

            <div>
                <strong>
                    {title}
                </strong>

                <span>
                    {description}
                </span>
            </div>

            <ArrowRight
                size={16}
            />
        </button>
    );
}

/* ============================================================
   TRUST ITEM
   ============================================================ */

function TrustItem({
    icon,
    title,
}: {
    icon: ReactNode;
    title: string;
}) {
    return (
        <div className="cm-trust-item">
            {icon}

            <span>
                {title}
            </span>
        </div>
    );
}

/* ============================================================
   LOOP ITEM
   ============================================================ */

function LoopItem({
    number,
    title,
    description,
    icon,
}: {
    number: string;
    title: string;
    description: string;
    icon: ReactNode;
}) {
    return (
        <article className="cm-loop-item">
            <div className="cm-loop-number">
                {number}
            </div>

            <div className="cm-loop-icon">
                {icon}
            </div>

            <h3>
                {title}
            </h3>

            <p>
                {description}
            </p>
        </article>
    );
}

/* ============================================================
   NETWORK ICON
   ============================================================ */

function NetworkIcon() {
    return (
        <div className="cm-network-icon">
            <Layers3 size={21} />
        </div>
    );
}