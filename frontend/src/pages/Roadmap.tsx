/**
 * ============================================================
 * CareerMind AI
 *
 * Roadmap Intelligence
 *
 * Responsibilities:
 * - Load personalized learning roadmap
 * - Display career direction
 * - Display roadmap progress
 * - Show learning phases
 * - Highlight current / next phase
 * - Display skill gaps
 * - Show next best action
 * - Handle missing resume state
 * - Handle API errors
 *
 * Backend:
 * GET /api/v1/roadmap
 * ============================================================
 */

import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    BrainCircuit,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Code2,
    Compass,
    Lock,
    PlayCircle,
    RefreshCw,
    Rocket,
    Sparkles,
    Target,
    TrendingUp,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getLearningRoadmap,
    type RoadmapPhase,
    type RoadmapResponse,
} from "../services/roadmapService";

import "../styles/roadmap.css";

/* ============================================================
   TYPES
============================================================ */

type RoadmapPhaseStatus =
    | "completed"
    | "current"
    | "in_progress"
    | "active"
    | "next"
    | "upcoming"
    | "planned"
    | "pending"
    | "locked"
    | string;

interface RoadmapApiResponse
    extends Partial<RoadmapResponse> {
    status?: string;
    message?: string;
    recommended_role?: string | null;
    total_phases?: number;
    next_action?: string | null;
    next_skill?: string | null;
    resume_id?: string;
}

/* ============================================================
   NORMALIZED PHASE
============================================================ */

interface NormalizedPhase extends RoadmapPhase {
    phase: string;
    title: string;
    description: string;
    skills: string[];
    status: RoadmapPhaseStatus;
    progress: number;
    duration?: string;
    priority?: string;
}

/* ============================================================
   HELPERS
============================================================ */

function clamp(
    value: number,
    min = 0,
    max = 100
): number {
    if (!Number.isFinite(value)) {
        return min;
    }

    return Math.min(
        Math.max(value, min),
        max
    );
}

/* ------------------------------------------------------------
   Normalize backend phase
------------------------------------------------------------ */

function normalizePhase(
    phase: RoadmapPhase,
    index: number
): NormalizedPhase {
    const rawPhase = phase as RoadmapPhase & {
        phase?: string | number;
        status?: RoadmapPhaseStatus;
        priority?: string;
    };

    return {
        ...phase,

        phase:
            rawPhase.phase !== undefined
                ? String(rawPhase.phase)
                : String(index + 1),

        title:
            phase.title?.trim() ||
            `Learning Phase ${index + 1}`,

        description:
            phase.description?.trim() ||
            "Build practical capability and strengthen your career readiness.",

        skills:
            Array.isArray(phase.skills)
                ? phase.skills.filter(
                    (skill): skill is string =>
                        typeof skill === "string" &&
                        skill.trim().length > 0
                )
                : [],

        status:
            rawPhase.status ||
            "planned",

        progress:
            typeof phase.progress === "number"
                ? clamp(phase.progress)
                : rawPhase.status === "completed"
                    ? 100
                    : 0,

        duration:
            phase.duration?.trim() ||
            undefined,

        priority:
            rawPhase.priority ||
            undefined,
    };
}

/* ------------------------------------------------------------
   Status helpers
------------------------------------------------------------ */

function isCompleted(
    status: RoadmapPhaseStatus
): boolean {
    return status === "completed";
}

function isCurrent(
    status: RoadmapPhaseStatus
): boolean {
    return (
        status === "current" ||
        status === "in_progress" ||
        status === "active"
    );
}

function isNext(
    status: RoadmapPhaseStatus
): boolean {
    return (
        status === "next" ||
        status === "upcoming"
    );
}

function isLocked(
    status: RoadmapPhaseStatus
): boolean {
    return (
        status === "locked" ||
        status === "pending"
    );
}

/* ------------------------------------------------------------
   Status label
------------------------------------------------------------ */

function getStatusLabel(
    status: RoadmapPhaseStatus
): string {
    if (isCompleted(status)) {
        return "Completed";
    }

    if (isCurrent(status)) {
        return "In Progress";
    }

    if (isNext(status)) {
        return "Next Up";
    }

    if (isLocked(status)) {
        return "Locked";
    }

    return "Planned";
}

/* ------------------------------------------------------------
   Status icon
------------------------------------------------------------ */

function getStatusIcon(
    status: RoadmapPhaseStatus
) {
    if (isCompleted(status)) {
        return CheckCircle2;
    }

    if (isCurrent(status)) {
        return PlayCircle;
    }

    if (isLocked(status)) {
        return Lock;
    }

    return BookOpen;
}

/* ------------------------------------------------------------
   Error extraction
------------------------------------------------------------ */

function getErrorMessage(
    error: unknown
): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (
        typeof error === "object" &&
        error !== null
    ) {
        const possibleError =
            error as {
                response?: {
                    data?: {
                        detail?: string;
                        message?: string;
                    };
                };
                message?: string;
            };

        return (
            possibleError.response?.data?.detail ||
            possibleError.response?.data?.message ||
            possibleError.message ||
            "Unable to load your learning roadmap."
        );
    }

    return "Unable to load your learning roadmap.";
}

/* ============================================================
   COMPONENT
============================================================ */

export default function Roadmap() {
    /* --------------------------------------------------------
       State
    -------------------------------------------------------- */

    const [data, setData] =
        useState<RoadmapApiResponse | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    /* ========================================================
       LOAD ROADMAP
    ======================================================== */

    const loadRoadmap =
        useCallback(async () => {
            setLoading(true);
            setError(null);

            try {
                const response =
                    await getLearningRoadmap();

                setData(
                    response as RoadmapApiResponse
                );
            } catch (err: unknown) {
                console.error(
                    "CareerMind AI roadmap error:",
                    err
                );

                setError(
                    getErrorMessage(err)
                );
            } finally {
                setLoading(false);
            }
        }, []);

    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {
        void loadRoadmap();
    }, [loadRoadmap]);

    /* ========================================================
       NORMALIZED ROADMAP
    ======================================================== */

    const phases =
        useMemo<NormalizedPhase[]>(() => {
            if (
                !data ||
                !Array.isArray(data.roadmap)
            ) {
                return [];
            }

            return data.roadmap.map(
                normalizePhase
            );
        }, [data]);

    /* ========================================================
       PROGRESS
    ======================================================== */

    const calculatedProgress =
        useMemo(() => {
            if (!phases.length) {
                return 0;
            }

            const total =
                phases.reduce(
                    (sum, phase) =>
                        sum +
                        (
                            isCompleted(
                                phase.status
                            )
                                ? 100
                                : phase.progress
                        ),
                    0
                );

            return Math.round(
                total / phases.length
            );
        }, [phases]);

    const progress =
        typeof data?.progress === "number"
            ? clamp(data.progress)
            : calculatedProgress;

    /* ========================================================
       CURRENT PHASE
    ======================================================== */

    const currentPhase =
        useMemo(() => {
            return (
                phases.find(
                    (phase) =>
                        isCurrent(
                            phase.status
                        )
                ) ||
                phases.find(
                    (phase) =>
                        isNext(
                            phase.status
                        )
                ) ||
                phases[0] ||
                null
            );
        }, [phases]);

    /* ========================================================
       COMPLETED COUNT
    ======================================================== */

    const completedCount =
        phases.filter(
            (phase) =>
                isCompleted(
                    phase.status
                )
        ).length;

    /* ========================================================
       NO RESUME STATE
    ======================================================== */

    const awaitingResume =
        data?.status ===
        "awaiting_resume";

    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {
        return (
            <div className="roadmap-page">

                <div className="roadmap-loading">

                    <div className="roadmap-loading-orb">
                        <BrainCircuit
                            size={34}
                        />
                    </div>

                    <h2>
                        Building your career roadmap
                    </h2>

                    <p>
                        CareerMind AI is analyzing
                        your career intelligence...
                    </p>

                    <div className="roadmap-loading-bar">
                        <span />
                    </div>

                </div>

            </div>
        );
    }

    /* ========================================================
       ERROR
    ======================================================== */

    if (error) {
        return (
            <div className="roadmap-page">

                <main className="roadmap-container">

                    <section className="roadmap-error">

                        <div className="roadmap-error-icon">
                            <AlertCircle
                                size={30}
                            />
                        </div>

                        <h2>
                            Roadmap unavailable
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            className="roadmap-primary-button"
                            onClick={() =>
                                void loadRoadmap()
                            }
                        >
                            <RefreshCw
                                size={17}
                            />

                            Try Again
                        </button>

                    </section>

                </main>

            </div>
        );
    }

    /* ========================================================
       AWAITING RESUME
    ======================================================== */

    if (
        awaitingResume ||
        phases.length === 0
    ) {
        return (
            <div className="roadmap-page">

                <header className="roadmap-header">

                    <div className="roadmap-header-content">

                        <div className="roadmap-brand">

                            <div className="roadmap-brand-icon">
                                <Compass
                                    size={25}
                                />
                            </div>

                            <div>
                                <span className="roadmap-eyebrow">
                                    CAREERMIND AI
                                </span>

                                <h1>
                                    Learning Roadmap
                                </h1>

                                <p>
                                    Your intelligent path
                                    from skills to career.
                                </p>
                            </div>

                        </div>

                        <div className="roadmap-ai-badge">
                            <Sparkles
                                size={16}
                            />
                            AI Career Intelligence
                        </div>

                    </div>

                </header>

                <main className="roadmap-container">

                    <section className="roadmap-empty">

                        <div className="roadmap-empty-orb">
                            <Rocket
                                size={38}
                            />
                        </div>

                        <span className="roadmap-eyebrow">
                            ROADMAP ENGINE
                        </span>

                        <h2>
                            Your career path starts
                            with your resume
                        </h2>

                        <p>
                            Upload and analyze your
                            resume to unlock a
                            personalized AI learning
                            roadmap based on your
                            skills, gaps and target
                            career direction.
                        </p>

                        <div className="roadmap-empty-features">

                            <div>
                                <Target
                                    size={18}
                                />
                                Skill-gap analysis
                            </div>

                            <div>
                                <TrendingUp
                                    size={18}
                                />
                                Career progression
                            </div>

                            <div>
                                <Code2
                                    size={18}
                                />
                                Portfolio projects
                            </div>

                        </div>

                    </section>

                </main>

            </div>
        );
    }

    /* ========================================================
       MAIN UI
    ======================================================== */

    return (
        <div className="roadmap-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="roadmap-header">

                <div className="roadmap-header-content">

                    <div className="roadmap-brand">

                        <div className="roadmap-brand-icon">
                            <Compass
                                size={25}
                            />
                        </div>

                        <div>

                            <span className="roadmap-eyebrow">
                                CAREERMIND AI
                            </span>

                            <h1>
                                Learning Roadmap
                            </h1>

                            <p>
                                Your personalized
                                intelligence-driven
                                career journey.
                            </p>

                        </div>

                    </div>

                    <div className="roadmap-ai-badge">
                        <Sparkles
                            size={16}
                        />

                        AI Career Engine
                    </div>

                </div>

            </header>

            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="roadmap-container">

                {/* ==================================================
                    HERO
                ================================================== */}

                <section className="roadmap-hero">

                    <div className="roadmap-hero-content">

                        <span className="roadmap-eyebrow">
                            RECOMMENDED CAREER DIRECTION
                        </span>

                        <h2>
                            {data?.recommended_role ||
                                "AI / ML Engineer"}
                        </h2>

                        <p>
                            CareerMind AI has mapped
                            your current capabilities
                            into a focused learning
                            journey designed to close
                            your highest-value skill gaps.
                        </p>

                        <div className="roadmap-hero-meta">

                            <div>
                                <CheckCircle2
                                    size={17}
                                />

                                <span>
                                    {completedCount}
                                    {" "}
                                    of{" "}
                                    {phases.length}
                                    {" "}
                                    phases completed
                                </span>
                            </div>

                            <div>
                                <Target
                                    size={17}
                                />

                                <span>
                                    {phases.reduce(
                                        (
                                            total,
                                            phase
                                        ) =>
                                            total +
                                            phase.skills.length,
                                        0
                                    )}
                                    {" "}
                                    skills mapped
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* Progress */}

                    <div className="roadmap-progress-card">

                        <div className="roadmap-progress-ring">

                            <div>
                                <strong>
                                    {Math.round(
                                        progress
                                    )}
                                    %
                                </strong>

                                <span>
                                    Complete
                                </span>
                            </div>

                        </div>

                        <span>
                            Career Progress
                        </span>

                    </div>

                </section>

                {/* ==================================================
                    NEXT BEST ACTION
                ================================================== */}

                {currentPhase && (
                    <section className="next-action-card">

                        <div className="next-action-icon">
                            <ZapIcon />
                        </div>

                        <div className="next-action-content">

                            <span>
                                NEXT BEST ACTION
                            </span>

                            <h3>
                                {data?.next_action ||
                                    currentPhase.title}
                            </h3>

                            <p>
                                Focus on{" "}
                                <strong>
                                    {data?.next_skill ||
                                        currentPhase.skills[0] ||
                                        "your next skill"}
                                </strong>
                                {" "}
                                to move your career
                                roadmap forward.
                            </p>

                        </div>

                        <ArrowRight
                            size={21}
                        />

                    </section>
                )}

                {/* ==================================================
                    PROGRESS BAR
                ================================================== */}

                <section className="roadmap-progress-section">

                    <div className="roadmap-section-heading">

                        <div>

                            <span className="roadmap-eyebrow">
                                CAREER PROGRESS
                            </span>

                            <h2>
                                Your learning trajectory
                            </h2>

                        </div>

                        <strong>
                            {Math.round(progress)}%
                        </strong>

                    </div>

                    <div className="roadmap-progress-track">

                        <span
                            style={{
                                width: `${progress}%`,
                            }}
                        />

                    </div>

                </section>

                {/* ==================================================
                    PHASES
                ================================================== */}

                <section className="roadmap-phases">

                    <div className="roadmap-section-heading">

                        <div>

                            <span className="roadmap-eyebrow">
                                INTELLIGENT ROADMAP
                            </span>

                            <h2>
                                Your career journey
                            </h2>

                        </div>

                        <span className="roadmap-phase-count">
                            {phases.length}
                            {" "}
                            phases
                        </span>

                    </div>

                    <div className="roadmap-timeline">

                        {phases.map(
                            (phase, index) => {

                                const StatusIcon =
                                    getStatusIcon(
                                        phase.status
                                    );

                                const completed =
                                    isCompleted(
                                        phase.status
                                    );

                                const current =
                                    isCurrent(
                                        phase.status
                                    );

                                return (
                                    <article
                                        key={`${phase.phase}-${index}`}
                                        className={[
                                            "roadmap-phase-card",
                                            completed
                                                ? "completed"
                                                : "",
                                            current
                                                ? "current"
                                                : "",
                                            isLocked(
                                                phase.status
                                            )
                                                ? "locked"
                                                : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >

                                        {/* Timeline */}

                                        <div className="roadmap-timeline-marker">

                                            <div className="roadmap-phase-number">
                                                {index + 1}
                                            </div>

                                            {index <
                                                phases.length -
                                                1 && (
                                                    <span />
                                                )}

                                        </div>

                                        {/* Card */}

                                        <div className="roadmap-phase-content">

                                            <div className="roadmap-phase-top">

                                                <div>

                                                    <div className="roadmap-phase-status">

                                                        <StatusIcon
                                                            size={
                                                                15
                                                            }
                                                        />

                                                        {
                                                            getStatusLabel(
                                                                phase.status
                                                            )
                                                        }

                                                    </div>

                                                    <h3>
                                                        {
                                                            phase.title
                                                        }
                                                    </h3>

                                                </div>

                                                {phase.priority && (
                                                    <span className="roadmap-priority">
                                                        {
                                                            phase.priority
                                                        }
                                                    </span>
                                                )}

                                            </div>

                                            <p>
                                                {
                                                    phase.description
                                                }
                                            </p>

                                            {/* Duration */}

                                            {phase.duration && (
                                                <div className="roadmap-phase-duration">

                                                    <Clock3
                                                        size={
                                                            15
                                                        }
                                                    />

                                                    {
                                                        phase.duration
                                                    }

                                                </div>
                                            )}

                                            {/* Skills */}

                                            {phase.skills.length >
                                                0 && (
                                                    <div className="roadmap-skills">

                                                        {phase.skills.map(
                                                            (
                                                                skill,
                                                                skillIndex
                                                            ) => (
                                                                <span
                                                                    key={`${skill}-${skillIndex}`}
                                                                >
                                                                    <Code2
                                                                        size={
                                                                            13
                                                                        }
                                                                    />

                                                                    {
                                                                        skill
                                                                    }
                                                                </span>
                                                            )
                                                        )}

                                                    </div>
                                                )}

                                            {/* Phase progress */}

                                            <div className="roadmap-phase-progress">

                                                <div>

                                                    <span>
                                                        Phase
                                                        progress
                                                    </span>

                                                    <strong>
                                                        {
                                                            Math.round(
                                                                phase.progress
                                                            )
                                                        }
                                                        %
                                                    </strong>

                                                </div>

                                                <div className="roadmap-mini-track">

                                                    <span
                                                        style={{
                                                            width: `${phase.progress}%`,
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                            {current && (
                                                <div className="roadmap-current-indicator">

                                                    <PlayCircle
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    Current
                                                    learning
                                                    focus

                                                </div>
                                            )}

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>

                </section>

                {/* ==================================================
                    FOOTER ACTION
                ================================================== */}

                <section className="roadmap-footer-card">

                    <div className="roadmap-footer-icon">
                        <BrainCircuit
                            size={25}
                        />
                    </div>

                    <div>

                        <span>
                            CAREERMIND INTELLIGENCE
                        </span>

                        <h3>
                            Keep building evidence,
                            not just knowledge.
                        </h3>

                        <p>
                            Complete each phase with
                            practical projects,
                            measurable outcomes and
                            portfolio-ready work.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            void loadRoadmap()
                        }
                    >
                        <RefreshCw
                            size={16}
                        />

                        Refresh
                    </button>

                </section>

            </main>

        </div>
    );
}

/* ============================================================
   SMALL ICON
============================================================ */

function ZapIcon() {
    return (
        <Sparkles size={21} />
    );
}