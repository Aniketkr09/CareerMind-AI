import { useCallback, useEffect, useState } from "react";

import {
    BrainCircuit,
    CheckCircle2,
    ChevronRight,
    Code2,
    Loader2,
    MessageSquareText,
    RefreshCw,
    Send,
    Sparkles,
    Target,
    Trophy,
    Zap,
} from "lucide-react";

import {
    evaluateInterviewAnswer,
    generateInterviewQuestion,
    getInterviewCategoryLabel,
    getInterviewDifficultyLabel,
    getInterviewReadiness,
    getInterviewScoreLabel,
    getInterviewScoreStatus,
    type InterviewDifficulty,
    type InterviewEvaluation,
    type InterviewQuestion,
} from "../services/interviewService";

import "../styles/interview.css";

/* ============================================================
   TYPES
============================================================ */

type InterviewMode =
    | "technical"
    | "behavioral"
    | "system_design"
    | "general";

interface InterviewStats {
    questionsAnswered: number;
    averageScore: number;
    bestScore: number;
}

interface CategoryOption {
    value: InterviewMode;
    label: string;
    icon: typeof BrainCircuit;
}

/* ============================================================
   CONSTANTS
============================================================ */

const CATEGORY_OPTIONS: CategoryOption[] = [
    {
        value: "technical",
        label: "Technical",
        icon: Code2,
    },
    {
        value: "behavioral",
        label: "Behavioral",
        icon: MessageSquareText,
    },
    {
        value: "system_design",
        label: "System Design",
        icon: BrainCircuit,
    },
    {
        value: "general",
        label: "General",
        icon: Target,
    },
];

const DIFFICULTY_OPTIONS: InterviewDifficulty[] = [
    "easy",
    "medium",
    "hard",
    "expert",
];

/* ============================================================
   HELPERS
============================================================ */

/**
 * Convert frontend mode into the category expected by
 * the FastAPI interview router.
 *
 * Backend:
 * Technical
 * Behavioral
 * System Design
 */
function getBackendCategory(
    mode: InterviewMode
): string | undefined {
    switch (mode) {
        case "technical":
            return "Technical";

        case "behavioral":
            return "Behavioral";

        case "system_design":
            return "System Design";

        case "general":
        default:
            return undefined;
    }
}

/**
 * Backend returns:
 *
 * Easy
 * Medium
 * Hard
 *
 * Frontend uses lowercase values.
 */
function normalizeDifficulty(
    value: string | undefined
): InterviewDifficulty {
    const normalized =
        value?.trim().toLowerCase();

    switch (normalized) {
        case "easy":
            return "easy";

        case "medium":
            return "medium";

        case "hard":
            return "hard";

        case "expert":
            return "expert";

        default:
            return "medium";
    }
}

/**
 * Safely normalize score.
 */
function normalizeScore(
    value: number | undefined
): number {
    const score = Number(value);

    if (!Number.isFinite(score)) {
        return 0;
    }

    return Math.min(
        Math.max(Math.round(score), 0),
        100
    );
}

/**
 * Safely normalize question.
 */
function normalizeQuestion(
    value: InterviewQuestion
): InterviewQuestion {
    return {
        ...value,

        question:
            value.question?.trim() ||
            "Interview question unavailable.",

        category:
            value.category?.trim() ||
            "General",

        difficulty:
            value.difficulty?.trim() ||
            "Medium",

        skill:
            value.skill?.trim() ||
            undefined,

        interview_type:
            value.interview_type?.trim() ||
            undefined,

        tip:
            value.tip?.trim() ||
            undefined,
    };
}

/* ============================================================
   COMPONENT
============================================================ */

export default function Interview() {
    /* --------------------------------------------------------
       STATE
    -------------------------------------------------------- */

    const [category, setCategory] =
        useState<InterviewMode>("technical");

    const [difficulty, setDifficulty] =
        useState<InterviewDifficulty>("medium");

    const [question, setQuestion] =
        useState<InterviewQuestion | null>(null);

    const [answer, setAnswer] =
        useState("");

    const [evaluation, setEvaluation] =
        useState<InterviewEvaluation | null>(null);

    const [loadingQuestion, setLoadingQuestion] =
        useState(false);

    const [evaluating, setEvaluating] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [stats, setStats] =
        useState<InterviewStats>({
            questionsAnswered: 0,
            averageScore: 0,
            bestScore: 0,
        });

    /* ========================================================
       LOAD QUESTION
    ======================================================== */

    const loadQuestion = useCallback(
        async () => {
            setLoadingQuestion(true);
            setError(null);
            setEvaluation(null);
            setAnswer("");

            try {
                const backendCategory =
                    getBackendCategory(category);

                const result =
                    await generateInterviewQuestion({
                        /*
                         * Your service accepts InterviewCategory.
                         * The backend supports Technical,
                         * Behavioral and System Design.
                         */
                        category:
                            backendCategory as
                            | "technical"
                            | "behavioral"
                            | "system_design"
                            | "general"
                            | undefined,

                        difficulty,
                    });

                setQuestion(
                    normalizeQuestion(result)
                );
            } catch (err: unknown) {
                console.error(
                    "CareerMind AI interview question error:",
                    err
                );

                setQuestion(null);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to generate interview question."
                );
            } finally {
                setLoadingQuestion(false);
            }
        },
        [category, difficulty]
    );

    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {
        void loadQuestion();
    }, [loadQuestion]);

    /* ========================================================
       CATEGORY CHANGE
    ======================================================== */

    const handleCategoryChange = (
        value: InterviewMode
    ) => {
        setCategory(value);
    };

    /* ========================================================
       DIFFICULTY CHANGE
    ======================================================== */

    const handleDifficultyChange = (
        value: InterviewDifficulty
    ) => {
        setDifficulty(value);
    };

    /* ========================================================
       SUBMIT ANSWER
    ======================================================== */

    const handleSubmitAnswer = async () => {
        if (!question) {
            setError(
                "Please generate an interview question first."
            );
            return;
        }

        const cleanedAnswer =
            answer.trim();

        if (!cleanedAnswer) {
            setError(
                "Please write your answer before submitting."
            );
            return;
        }

        if (cleanedAnswer.length < 10) {
            setError(
                "Please provide a more detailed answer."
            );
            return;
        }

        setEvaluating(true);
        setError(null);

        try {
            const result =
                await evaluateInterviewAnswer(
                    question.question,
                    cleanedAnswer,
                    {
                        category:
                            question.category,

                        difficulty:
                            question.difficulty,
                    }
                );

            setEvaluation(result);

            const score =
                normalizeScore(result.score);

            setStats((previous) => {
                const total =
                    previous.questionsAnswered + 1;

                const average =
                    (
                        previous.averageScore *
                        previous.questionsAnswered +
                        score
                    ) / total;

                return {
                    questionsAnswered: total,

                    averageScore:
                        Math.round(average),

                    bestScore:
                        Math.max(
                            previous.bestScore,
                            score
                        ),
                };
            });
        } catch (err: unknown) {
            console.error(
                "CareerMind AI interview evaluation error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to evaluate your answer."
            );
        } finally {
            setEvaluating(false);
        }
    };

    /* ========================================================
       NEXT QUESTION
    ======================================================== */

    const handleNextQuestion = async () => {
        if (loadingQuestion || evaluating) {
            return;
        }

        await loadQuestion();
    };

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <div className="interview-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="interview-header">
                <div className="interview-header-content">

                    <div className="interview-brand">

                        <div className="interview-brand-icon">
                            <BrainCircuit size={24} />
                        </div>

                        <div>
                            <span className="eyebrow">
                                CAREERMIND AI
                            </span>

                            <h1>
                                Interview Intelligence
                            </h1>

                            <p>
                                Practice smarter. Answer better.
                                Become interview ready.
                            </p>
                        </div>

                    </div>

                    <div className="interview-header-badge">
                        <Sparkles size={16} />
                        AI Career Coach
                    </div>

                </div>
            </header>

            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="interview-container">

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="interview-error">

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError(null)
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {/* ==================================================
                    CONTROLS
                ================================================== */}

                <section className="interview-control-panel">

                    {/* CATEGORY */}

                    <div className="control-section">

                        <div className="control-label">
                            <Target size={16} />
                            Interview Mode
                        </div>

                        <div className="category-grid">

                            {CATEGORY_OPTIONS.map(
                                (option) => {
                                    const Icon =
                                        option.icon;

                                    const active =
                                        category ===
                                        option.value;

                                    return (
                                        <button
                                            key={
                                                option.value
                                            }
                                            type="button"
                                            className={
                                                active
                                                    ? "category-button active"
                                                    : "category-button"
                                            }
                                            onClick={() =>
                                                handleCategoryChange(
                                                    option.value
                                                )
                                            }
                                        >

                                            <Icon size={17} />

                                            <span>
                                                {
                                                    option.label
                                                }
                                            </span>

                                        </button>
                                    );
                                }
                            )}

                        </div>

                    </div>

                    {/* DIFFICULTY */}

                    <div className="control-section">

                        <div className="control-label">
                            <Zap size={16} />
                            Difficulty
                        </div>

                        <div className="difficulty-selector">

                            {DIFFICULTY_OPTIONS.map(
                                (level) => {

                                    const active =
                                        difficulty ===
                                        level;

                                    return (
                                        <button
                                            key={level}
                                            type="button"
                                            className={
                                                active
                                                    ? "difficulty-button active"
                                                    : "difficulty-button"
                                            }
                                            onClick={() =>
                                                handleDifficultyChange(
                                                    level
                                                )
                                            }
                                        >
                                            {
                                                getInterviewDifficultyLabel(
                                                    level
                                                )
                                            }
                                        </button>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </section>

                {/* ==================================================
                    STATS
                ================================================== */}

                <section className="interview-stats">

                    <div className="stat-card">

                        <div className="stat-icon">
                            <MessageSquareText
                                size={19}
                            />
                        </div>

                        <div>
                            <span>
                                Questions
                            </span>

                            <strong>
                                {
                                    stats.questionsAnswered
                                }
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon">
                            <Target size={19} />
                        </div>

                        <div>
                            <span>
                                Average Score
                            </span>

                            <strong>
                                {stats.averageScore}%
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon">
                            <Trophy size={19} />
                        </div>

                        <div>
                            <span>
                                Best Score
                            </span>

                            <strong>
                                {stats.bestScore}%
                            </strong>
                        </div>

                    </div>

                </section>

                {/* ==================================================
                    WORKSPACE
                ================================================== */}

                <section className="interview-workspace">

                    {/* ==================================================
                        QUESTION PANEL
                    ================================================== */}

                    <div className="question-panel">

                        {loadingQuestion ? (

                            <div className="interview-loading">

                                <div className="loading-orb">

                                    <Loader2
                                        size={32}
                                        className="spin"
                                    />

                                </div>

                                <h2>
                                    AI is preparing
                                    your question
                                </h2>

                                <p>
                                    Personalizing your
                                    interview challenge...
                                </p>

                            </div>

                        ) : question ? (

                            <>

                                {/* QUESTION META */}

                                <div className="question-meta">

                                    <span className="question-category">
                                        {
                                            getInterviewCategoryLabel(
                                                question.category
                                            )
                                        }
                                    </span>

                                    <span className="question-difficulty">
                                        {
                                            getInterviewDifficultyLabel(
                                                normalizeDifficulty(
                                                    question.difficulty
                                                )
                                            )
                                        }
                                    </span>

                                    {question.interview_type && (
                                        <span className="question-type">
                                            {
                                                question.interview_type
                                            }
                                        </span>
                                    )}

                                </div>

                                {/* QUESTION */}

                                <div className="question-content">

                                    <div className="question-number">
                                        AI INTERVIEW QUESTION
                                    </div>

                                    <h2>
                                        {
                                            question.question
                                        }
                                    </h2>

                                </div>

                                {/* INTELLIGENCE */}

                                <div className="intelligence-grid">

                                    {question.skill && (
                                        <div className="intelligence-item">

                                            <span>
                                                Skill
                                            </span>

                                            <strong>
                                                {
                                                    question.skill
                                                }
                                            </strong>

                                        </div>
                                    )}

                                    {question.interview_type && (
                                        <div className="intelligence-item">

                                            <span>
                                                Type
                                            </span>

                                            <strong>
                                                {
                                                    question.interview_type
                                                }
                                            </strong>

                                        </div>
                                    )}

                                    <div className="intelligence-item">

                                        <span>
                                            Category
                                        </span>

                                        <strong>
                                            {
                                                getInterviewCategoryLabel(
                                                    question.category
                                                )
                                            }
                                        </strong>

                                    </div>

                                    <div className="intelligence-item">

                                        <span>
                                            Difficulty
                                        </span>

                                        <strong>
                                            {
                                                getInterviewDifficultyLabel(
                                                    normalizeDifficulty(
                                                        question.difficulty
                                                    )
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>

                                {/* AI TIP */}

                                {question.tip && (
                                    <div className="interview-tip">

                                        <Sparkles
                                            size={17}
                                        />

                                        <div>

                                            <strong>
                                                AI Coach Tip
                                            </strong>

                                            <p>
                                                {
                                                    question.tip
                                                }
                                            </p>

                                        </div>

                                    </div>
                                )}

                            </>

                        ) : (

                            <div className="interview-empty">

                                <BrainCircuit
                                    size={40}
                                />

                                <h2>
                                    Ready when you are
                                </h2>

                                <p>
                                    Generate your first
                                    interview question.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        void loadQuestion()
                                    }
                                >
                                    <Sparkles size={17} />
                                    Generate Question
                                </button>

                            </div>

                        )}

                    </div>

                    {/* ==================================================
                        ANSWER PANEL
                    ================================================== */}

                    <div className="answer-panel">

                        <div className="answer-header">

                            <div>

                                <span>
                                    YOUR RESPONSE
                                </span>

                                <h3>
                                    Answer the interviewer
                                </h3>

                            </div>

                            <span className="character-count">
                                {answer.length} chars
                            </span>

                        </div>

                        <textarea
                            value={answer}
                            onChange={(event) =>
                                setAnswer(
                                    event.target.value
                                )
                            }
                            placeholder={
                                "Structure your answer clearly. " +
                                "For behavioral questions, use STAR. " +
                                "For technical questions, explain your reasoning, " +
                                "trade-offs and implementation..."
                            }
                            disabled={
                                !question ||
                                evaluating
                            }
                        />

                        <div className="answer-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    void handleNextQuestion()
                                }
                                disabled={
                                    loadingQuestion ||
                                    evaluating
                                }
                            >
                                <RefreshCw size={17} />
                                New Question
                            </button>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={() =>
                                    void handleSubmitAnswer()
                                }
                                disabled={
                                    !question ||
                                    evaluating ||
                                    !answer.trim()
                                }
                            >
                                {evaluating ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="spin"
                                        />

                                        Evaluating...
                                    </>
                                ) : (
                                    <>
                                        <Send size={17} />
                                        Evaluate Answer
                                    </>
                                )}
                            </button>

                        </div>

                    </div>

                </section>

                {/* ==================================================
                    EVALUATION
                ================================================== */}

                {evaluation && (
                    <section className="evaluation-panel">

                        <div className="evaluation-header">

                            <div>

                                <span className="eyebrow">
                                    AI EVALUATION
                                </span>

                                <h2>
                                    Interview Performance
                                </h2>

                            </div>

                            <div className="score-circle">

                                <strong>
                                    {
                                        normalizeScore(
                                            evaluation.score
                                        )
                                    }
                                </strong>

                                <span>
                                    / 100
                                </span>

                            </div>

                        </div>

                        <div className="score-summary">

                            <div>

                                <span>
                                    Performance
                                </span>

                                <strong>
                                    {
                                        getInterviewScoreLabel(
                                            evaluation.score
                                        )
                                    }
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Readiness
                                </span>

                                <strong
                                    className={
                                        `status-${getInterviewScoreStatus(
                                            evaluation.score
                                        )}`
                                    }
                                >
                                    {
                                        getInterviewReadiness(
                                            evaluation.score
                                        )
                                    }
                                </strong>

                            </div>

                        </div>

                        {/* ==================================================
                            EVALUATION GRID
                        ================================================== */}

                        <div className="evaluation-grid">

                            {/* STRENGTHS */}

                            <div className="evaluation-card">

                                <div className="evaluation-card-title">

                                    <CheckCircle2
                                        size={18}
                                    />

                                    <h3>
                                        Strengths
                                    </h3>

                                </div>

                                {evaluation.strengths?.length ? (

                                    <ul>
                                        {evaluation.strengths.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <li
                                                    key={
                                                        `${item}-${index}`
                                                    }
                                                >
                                                    {item}
                                                </li>
                                            )
                                        )}
                                    </ul>

                                ) : (

                                    <p>
                                        No specific
                                        strengths were
                                        returned.
                                    </p>

                                )}

                            </div>

                            {/* IMPROVEMENTS */}

                            <div className="evaluation-card">

                                <div className="evaluation-card-title">

                                    <ChevronRight
                                        size={18}
                                    />

                                    <h3>
                                        Improvement Areas
                                    </h3>

                                </div>

                                {evaluation.improvements?.length ? (

                                    <ul>
                                        {evaluation.improvements.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <li
                                                    key={
                                                        `${item}-${index}`
                                                    }
                                                >
                                                    {item}
                                                </li>
                                            )
                                        )}
                                    </ul>

                                ) : (

                                    <p>
                                        Your answer was
                                        evaluated
                                        positively.
                                    </p>

                                )}

                            </div>

                        </div>

                        {/* ==================================================
                            FEEDBACK
                        ================================================== */}

                        {evaluation.feedback && (
                            <div className="ai-feedback">

                                <Sparkles
                                    size={18}
                                />

                                <div>

                                    <strong>
                                        AI Feedback
                                    </strong>

                                    <p>
                                        {
                                            evaluation.feedback
                                        }
                                    </p>

                                </div>

                            </div>
                        )}

                        {/* ==================================================
                            RECOMMENDATION
                        ================================================== */}

                        {evaluation.recommendation && (
                            <div className="ai-recommendation">

                                <Zap size={18} />

                                <div>

                                    <strong>
                                        Next Best Action
                                    </strong>

                                    <p>
                                        {
                                            evaluation.recommendation
                                        }
                                    </p>

                                </div>

                            </div>
                        )}

                        {/* ==================================================
                            IDEAL ANSWER
                        ================================================== */}

                        {evaluation.ideal_answer && (
                            <details className="ideal-answer">

                                <summary>
                                    View AI ideal answer
                                </summary>

                                <p>
                                    {
                                        evaluation.ideal_answer
                                    }
                                </p>

                            </details>
                        )}

                        {/* ==================================================
                            NEXT QUESTION
                        ================================================== */}

                        <button
                            type="button"
                            className="next-question-button"
                            onClick={() =>
                                void handleNextQuestion()
                            }
                            disabled={
                                loadingQuestion ||
                                evaluating
                            }
                        >
                            <RefreshCw size={17} />
                            Practice Next Question
                        </button>

                    </section>
                )}

            </main>

        </div>
    );
}