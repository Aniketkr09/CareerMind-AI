/**
 * ============================================================
 * CareerMind AI
 * Interview Intelligence Service
 * ============================================================
 */

import api from "./api";

/* ============================================================
   CONSTANTS
============================================================ */

const INTERVIEW_ENDPOINT = "/interview";

/* ============================================================
   TYPES
============================================================ */

export type InterviewCategory =
    | "technical"
    | "behavioral"
    | "ai_ml"
    | "coding"
    | "system_design"
    | "general";

export type InterviewDifficulty =
    | "easy"
    | "medium"
    | "hard"
    | "expert";

/**
 * Matches FastAPI InterviewQuestionResponse.
 */
export interface InterviewQuestion {
    question: string;
    category: string;
    difficulty: string;
    skill?: string | null;
    interview_type?: string | null;
    tip?: string | null;
}

/**
 * Backward-compatible alias.
 */
export type InterviewResponse = InterviewQuestion;

/* ============================================================
   REQUEST TYPES
============================================================ */

export interface GenerateQuestionOptions {
    category?: string;
    difficulty?: InterviewDifficulty | string;
}

export interface EvaluationRequest {
    question: string;
    answer: string;
    category?: string;
    difficulty?: string;
}

/* ============================================================
   EVALUATION
============================================================ */

export interface InterviewEvaluation {
    score: number;
    strengths: string[];
    improvements: string[];

    feedback?: string;
    recommendation?: string;

    category?: string;
    difficulty?: string;

    confidence?: number;

    ideal_answer?: string;

    missing_points?: string[];
}

/* ============================================================
   SESSION
============================================================ */

export interface InterviewSession {
    question: InterviewQuestion;
    started_at: string;
}

/* ============================================================
   ERROR HANDLING
============================================================ */

interface ApiErrorResponse {
    detail?: string | string[];
    message?: string;
}

interface AxiosLikeError {
    response?: {
        data?: ApiErrorResponse;
        status?: number;
    };
    message?: string;
}

function getApiErrorMessage(
    error: unknown,
    fallback: string
): string {
    if (
        typeof error === "object" &&
        error !== null
    ) {
        const axiosError =
            error as AxiosLikeError;

        const detail =
            axiosError.response?.data?.detail;

        if (Array.isArray(detail)) {
            return detail
                .map((item) =>
                    typeof item === "string"
                        ? item
                        : JSON.stringify(item)
                )
                .join(", ");
        }

        if (typeof detail === "string") {
            return detail;
        }

        const message =
            axiosError.response?.data?.message;

        if (message) {
            return message;
        }

        if (axiosError.message) {
            return axiosError.message;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
}

/* ============================================================
   NORMALIZATION
============================================================ */

function normalizeQuestion(
    data: Partial<InterviewQuestion> | null | undefined
): InterviewQuestion {
    return {
        question:
            typeof data?.question === "string"
                ? data.question.trim()
                : "",

        category:
            typeof data?.category === "string" &&
                data.category.trim()
                ? data.category.trim()
                : "General",

        difficulty:
            typeof data?.difficulty === "string" &&
                data.difficulty.trim()
                ? data.difficulty.trim()
                : "Medium",

        skill:
            typeof data?.skill === "string" &&
                data.skill.trim()
                ? data.skill.trim()
                : null,

        interview_type:
            typeof data?.interview_type === "string" &&
                data.interview_type.trim()
                ? data.interview_type.trim()
                : null,

        tip:
            typeof data?.tip === "string" &&
                data.tip.trim()
                ? data.tip.trim()
                : null,
    };
}

function normalizeEvaluation(
    data: Partial<InterviewEvaluation> | null | undefined
): InterviewEvaluation {
    const rawScore = Number(data?.score);

    const score = Number.isFinite(rawScore)
        ? Math.min(Math.max(Math.round(rawScore), 0), 100)
        : 0;

    const rawConfidence =
        data?.confidence !== undefined
            ? Number(data.confidence)
            : undefined;

    const confidence =
        rawConfidence !== undefined &&
            Number.isFinite(rawConfidence)
            ? Math.min(
                Math.max(Math.round(rawConfidence), 0),
                100
            )
            : undefined;

    return {
        score,

        strengths:
            Array.isArray(data?.strengths)
                ? data.strengths
                    .filter(
                        (item): item is string =>
                            typeof item === "string"
                    )
                    .map((item) => item.trim())
                    .filter(Boolean)
                : [],

        improvements:
            Array.isArray(data?.improvements)
                ? data.improvements
                    .filter(
                        (item): item is string =>
                            typeof item === "string"
                    )
                    .map((item) => item.trim())
                    .filter(Boolean)
                : [],

        feedback:
            typeof data?.feedback === "string"
                ? data.feedback.trim() || undefined
                : undefined,

        recommendation:
            typeof data?.recommendation === "string"
                ? data.recommendation.trim() || undefined
                : undefined,

        category:
            typeof data?.category === "string"
                ? data.category.trim() || undefined
                : undefined,

        difficulty:
            typeof data?.difficulty === "string"
                ? data.difficulty.trim() || undefined
                : undefined,

        confidence,

        ideal_answer:
            typeof data?.ideal_answer === "string"
                ? data.ideal_answer.trim() || undefined
                : undefined,

        missing_points:
            Array.isArray(data?.missing_points)
                ? data.missing_points
                    .filter(
                        (item): item is string =>
                            typeof item === "string"
                    )
                    .map((item) => item.trim())
                    .filter(Boolean)
                : undefined,
    };
}

/* ============================================================
   VALIDATION
============================================================ */

function validateQuestion(
    question: string
): void {
    if (!question.trim()) {
        throw new Error(
            "Interview question cannot be empty."
        );
    }
}

function validateAnswer(
    answer: string
): void {
    const cleaned = answer.trim();

    if (!cleaned) {
        throw new Error(
            "Please provide an answer before submitting."
        );
    }

    if (cleaned.length < 10) {
        throw new Error(
            "Please provide a more detailed answer."
        );
    }
}

/* ============================================================
   GENERATE QUESTION
============================================================ */

export async function generateInterviewQuestion(
    options?: GenerateQuestionOptions
): Promise<InterviewQuestion> {
    try {
        const params: Record<string, string> = {};

        if (options?.category) {
            params.category = options.category;
        }

        if (options?.difficulty) {
            params.difficulty = options.difficulty;
        }

        const response =
            await api.get<InterviewQuestion>(
                `${INTERVIEW_ENDPOINT}/question`,
                {
                    params,
                }
            );

        const question =
            normalizeQuestion(response.data);

        if (!question.question) {
            throw new Error(
                "The interview service returned an empty question."
            );
        }

        return question;
    } catch (error: unknown) {
        console.error(
            "CareerMind AI interview question error:",
            error
        );

        throw new Error(
            getApiErrorMessage(
                error,
                "Unable to generate interview question."
            )
        );
    }
}

/* ============================================================
   EVALUATE ANSWER
============================================================ */

export async function evaluateInterviewAnswer(
    question: string,
    answer: string,
    options?: {
        category?: string;
        difficulty?: string;
    }
): Promise<InterviewEvaluation> {
    validateQuestion(question);
    validateAnswer(answer);

    const payload: EvaluationRequest = {
        question: question.trim(),
        answer: answer.trim(),
    };

    if (options?.category) {
        payload.category = options.category;
    }

    if (options?.difficulty) {
        payload.difficulty = options.difficulty;
    }

    try {
        const response =
            await api.post<InterviewEvaluation>(
                `${INTERVIEW_ENDPOINT}/evaluate`,
                payload
            );

        return normalizeEvaluation(
            response.data
        );
    } catch (error: unknown) {
        console.error(
            "CareerMind AI interview evaluation error:",
            error
        );

        throw new Error(
            getApiErrorMessage(
                error,
                "Unable to evaluate your interview answer."
            )
        );
    }
}

/* ============================================================
   SESSION
============================================================ */

export async function startInterviewSession(
    options?: GenerateQuestionOptions
): Promise<InterviewSession> {
    const question =
        await generateInterviewQuestion(
            options
        );

    return {
        question,
        started_at:
            new Date().toISOString(),
    };
}

/* ============================================================
   ALIAS
============================================================ */

export async function submitInterviewAnswer(
    question: string,
    answer: string,
    options?: {
        category?: string;
        difficulty?: string;
    }
): Promise<InterviewEvaluation> {
    return evaluateInterviewAnswer(
        question,
        answer,
        options
    );
}

/* ============================================================
   SCORE HELPERS
============================================================ */

export function normalizeInterviewScore(
    score: number
): number {
    if (!Number.isFinite(score)) {
        return 0;
    }

    return Math.min(
        Math.max(Math.round(score), 0),
        100
    );
}

export function getInterviewScoreLabel(
    score: number
): string {
    const value =
        normalizeInterviewScore(score);

    if (value >= 90) {
        return "Exceptional";
    }

    if (value >= 80) {
        return "Strong";
    }

    if (value >= 70) {
        return "Good";
    }

    if (value >= 60) {
        return "Developing";
    }

    return "Needs Improvement";
}

export function getInterviewScoreStatus(
    score: number
):
    | "excellent"
    | "strong"
    | "developing"
    | "critical" {
    const value =
        normalizeInterviewScore(score);

    if (value >= 90) {
        return "excellent";
    }

    if (value >= 75) {
        return "strong";
    }

    if (value >= 60) {
        return "developing";
    }

    return "critical";
}

export function getInterviewReadiness(
    score: number
): string {
    const value =
        normalizeInterviewScore(score);

    if (value >= 90) {
        return "Excellent interview readiness.";
    }

    if (value >= 80) {
        return "Strong interview readiness.";
    }

    if (value >= 70) {
        return "Good foundation. Continue refining your answers.";
    }

    if (value >= 60) {
        return "Developing. More practice will improve your confidence.";
    }

    return "Focus on structured answers and strengthen your fundamentals.";
}

/* ============================================================
   LABEL HELPERS
============================================================ */

export function getInterviewCategoryLabel(
    category: string
): string {
    const labels: Record<string, string> = {
        technical: "Technical",
        Technical: "Technical",

        behavioral: "Behavioral",
        Behavioral: "Behavioral",

        ai_ml: "AI / ML",
        "AI / ML": "AI / ML",

        coding: "Coding",
        Coding: "Coding",

        system_design: "System Design",
        "System Design": "System Design",

        general: "General",
        General: "General",

        "Machine Learning": "Machine Learning",
        "Data Science": "Data Science",
        Python: "Python",
        "AI Engineering": "AI Engineering",
        "Backend Engineering": "Backend Engineering",
    };

    return (
        labels[category] ??
        category
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            )
    );
}

export function getInterviewDifficultyLabel(
    difficulty: string
): string {
    const normalized =
        difficulty.toLowerCase();

    const labels: Record<string, string> = {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        expert: "Expert",
    };

    return (
        labels[normalized] ??
        difficulty
    );
}

/* ============================================================
   SERVICE OBJECT
============================================================ */

export const interviewService = {
    generateQuestion:
        generateInterviewQuestion,

    evaluateAnswer:
        evaluateInterviewAnswer,

    startSession:
        startInterviewSession,

    submitAnswer:
        submitInterviewAnswer,

    normalizeScore:
        normalizeInterviewScore,

    getScoreLabel:
        getInterviewScoreLabel,

    getScoreStatus:
        getInterviewScoreStatus,

    getReadiness:
        getInterviewReadiness,

    getCategoryLabel:
        getInterviewCategoryLabel,

    getDifficultyLabel:
        getInterviewDifficultyLabel,
};

export default interviewService;