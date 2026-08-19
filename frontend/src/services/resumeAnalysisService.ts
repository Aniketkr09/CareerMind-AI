/**
 * ============================================================
 * CareerMind AI
 *
 * Resume Analysis Intelligence Service
 *
 * Enterprise-grade frontend intelligence layer.
 *
 * Responsibilities:
 * - Fetch resume analysis
 * - Normalize FastAPI responses
 * - Protect UI from malformed API payloads
 * - ATS intelligence
 * - AI resume quality
 * - Skill intelligence
 * - Skill-gap intelligence
 * - Career direction
 * - Career readiness
 * - Resume profile signals
 * - Learning roadmap support
 *
 * Backend:
 * FastAPI + PostgreSQL + SQLAlchemy
 *
 * Endpoint:
 * GET /api/v1/resume-analysis/{resume_id}
 *
 * Expected backend envelope:
 *
 * {
 *   "success": true,
 *   "data": {
 *      ...
 *   },
 *   "message": "..."
 * }
 *
 * ============================================================
 */

import api from "./api";

/* ============================================================
   CORE TYPES
============================================================ */

export type StringList = string[];

/* ============================================================
   SKILL INTELLIGENCE
============================================================ */

export interface SkillAnalysis {
    technical_skills: string[];
    programming_languages: string[];
    frameworks: string[];
    tools: string[];
}

/* ============================================================
   CAREER INSIGHTS
============================================================ */

export interface CareerInsights {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    learning_path: string[];
}

/* ============================================================
   CAREER RECOMMENDATION
============================================================ */

export interface CareerRecommendation {
    role: string;
    next_step: string;
}

/* ============================================================
   RESUME ANALYSIS
============================================================ */

export interface ResumeAnalysisData {
    resume_id: string;

    ats_score: number;

    ai_score: number;

    skills: SkillAnalysis;

    experience: string[];

    education: string[];

    projects: string[];

    word_count: number;

    summary: string;

    career_insights: CareerInsights;

    missing_skills: string[];

    career_recommendation: CareerRecommendation;

    message?: string;
}

/* ============================================================
   BACKEND RESPONSE
============================================================ */

export interface ResumeAnalysisResponse {
    success: boolean;

    data: ResumeAnalysisData | null;

    message?: string;
}

/**
 * Some FastAPI implementations may return the analysis
 * directly instead of using the envelope.
 */
export type ResumeAnalysisApiPayload =
    | ResumeAnalysisResponse
    | Partial<ResumeAnalysisData>;

/* ============================================================
   LEGACY RESPONSE
============================================================ */

export interface LegacyResumeAnalysisResponse {
    resume_id: string;

    ats_score: number;

    ai_score: number;

    skills_detected: string[];

    skills_count: number;

    missing_skills: string[];

    career_recommendation?: CareerRecommendation;

    message?: string;
}

/* ============================================================
   API ERROR TYPES
============================================================ */

interface ApiErrorData {
    detail?: unknown;

    message?: unknown;
}

interface ApiErrorResponse {
    status?: number;

    data?: ApiErrorData;
}

interface ApiErrorShape {
    response?: ApiErrorResponse;

    message?: string;

    code?: string;
}

/* ============================================================
   SCORE HELPERS
============================================================ */

/**
 * Safely converts any backend score into:
 *
 * 0 <= score <= 100
 */
export function clampScore(
    value: unknown
): number {

    const numericValue =
        Number(value);

    if (
        !Number.isFinite(
            numericValue
        )
    ) {
        return 0;
    }

    return Math.round(
        Math.min(
            100,
            Math.max(
                0,
                numericValue
            )
        )
    );
}

/* ============================================================
   NUMBER NORMALIZER
============================================================ */

function normalizeNonNegativeNumber(
    value: unknown
): number {

    const numericValue =
        Number(value);

    if (
        !Number.isFinite(
            numericValue
        )
    ) {
        return 0;
    }

    return Math.max(
        0,
        Math.round(
            numericValue
        )
    );
}

/* ============================================================
   STRING NORMALIZER
============================================================ */

function normalizeString(
    value: unknown
): string {

    if (
        typeof value !==
        "string"
    ) {
        return "";
    }

    return value.trim();
}

/* ============================================================
   STRING ARRAY NORMALIZER
============================================================ */

/**
 * Converts an unknown value into a clean,
 * deduplicated string array.
 *
 * Duplicate comparison is case-insensitive,
 * while original capitalization is preserved.
 */
export function normalizeStringArray(
    value: unknown
): string[] {

    if (
        !Array.isArray(value)
    ) {
        return [];
    }

    const unique =
        new Map<string, string>();

    for (
        const item
        of value
    ) {

        if (
            typeof item !==
            "string"
        ) {
            continue;
        }

        const clean =
            item.trim();

        if (!clean) {
            continue;
        }

        const key =
            clean.toLowerCase();

        if (
            !unique.has(key)
        ) {
            unique.set(
                key,
                clean
            );
        }
    }

    return Array.from(
        unique.values()
    );
}

/* ============================================================
   SKILL NORMALIZATION
============================================================ */

export function normalizeSkills(
    skills?:
        Partial<SkillAnalysis> |
        null
): SkillAnalysis {

    return {

        technical_skills:
            normalizeStringArray(
                skills?.technical_skills
            ),

        programming_languages:
            normalizeStringArray(
                skills?.programming_languages
            ),

        frameworks:
            normalizeStringArray(
                skills?.frameworks
            ),

        tools:
            normalizeStringArray(
                skills?.tools
            ),
    };
}

/* ============================================================
   CAREER INSIGHTS NORMALIZATION
============================================================ */

export function normalizeCareerInsights(
    insights?:
        Partial<CareerInsights> |
        null
): CareerInsights {

    return {

        strengths:
            normalizeStringArray(
                insights?.strengths
            ),

        weaknesses:
            normalizeStringArray(
                insights?.weaknesses
            ),

        recommendations:
            normalizeStringArray(
                insights?.recommendations
            ),

        learning_path:
            normalizeStringArray(
                insights?.learning_path
            ),
    };
}

/* ============================================================
   CAREER RECOMMENDATION NORMALIZATION
============================================================ */

export function normalizeCareerRecommendation(
    recommendation?:
        Partial<CareerRecommendation> |
        null
): CareerRecommendation {

    return {

        role:
            normalizeString(
                recommendation?.role
            ),

        next_step:
            normalizeString(
                recommendation?.next_step
            ),
    };
}

/* ============================================================
   COMPLETE ANALYSIS NORMALIZER
============================================================ */

export function normalizeAnalysis(
    analysis:
        Partial<ResumeAnalysisData>
): ResumeAnalysisData {

    return {

        resume_id:
            normalizeString(
                analysis.resume_id
            ),

        ats_score:
            clampScore(
                analysis.ats_score
            ),

        ai_score:
            clampScore(
                analysis.ai_score
            ),

        skills:
            normalizeSkills(
                analysis.skills
            ),

        experience:
            normalizeStringArray(
                analysis.experience
            ),

        education:
            normalizeStringArray(
                analysis.education
            ),

        projects:
            normalizeStringArray(
                analysis.projects
            ),

        word_count:
            normalizeNonNegativeNumber(
                analysis.word_count
            ),

        summary:
            normalizeString(
                analysis.summary
            ),

        career_insights:
            normalizeCareerInsights(
                analysis.career_insights
            ),

        missing_skills:
            normalizeStringArray(
                analysis.missing_skills
            ),

        career_recommendation:
            normalizeCareerRecommendation(
                analysis.career_recommendation
            ),

        message:
            analysis.message
                ? normalizeString(
                    analysis.message
                )
                : undefined,
    };
}

/* ============================================================
   API ERROR RESOLVER
============================================================ */

export function resolveApiError(
    error: unknown,
    fallback: string
): string {

    const apiError =
        error as ApiErrorShape;

    const detail =
        apiError
            ?.response
            ?.data
            ?.detail;

    const message =
        apiError
            ?.response
            ?.data
            ?.message;

    if (
        typeof detail ===
        "string" &&
        detail.trim()
    ) {

        return detail.trim();
    }

    if (
        Array.isArray(detail)
    ) {

        const messages =
            detail
                .map(
                    item => {

                        if (
                            typeof item ===
                            "string"
                        ) {
                            return item;
                        }

                        if (
                            typeof item ===
                            "object" &&
                            item !== null &&
                            "msg" in item
                        ) {

                            return String(
                                (
                                    item as {
                                        msg?: unknown;
                                    }
                                ).msg ?? ""
                            );
                        }

                        return "";
                    }
                )
                .filter(Boolean);

        if (
            messages.length
        ) {

            return messages.join(
                ", "
            );
        }
    }

    if (
        typeof message ===
        "string" &&
        message.trim()
    ) {

        return message.trim();
    }

    if (
        error instanceof Error &&
        error.message.trim()
    ) {

        return error.message.trim();
    }

    return fallback;
}

/* ============================================================
   RESUME ID VALIDATION
============================================================ */

function validateResumeId(
    resumeId: string
): string {

    const id =
        normalizeString(
            resumeId
        );

    if (!id) {

        throw new Error(
            "Resume ID is required for CareerMind analysis."
        );
    }

    return id;
}

/* ============================================================
   RESPONSE EXTRACTION
============================================================ */

/**
 * Supports:
 *
 * 1. {
 *      success: true,
 *      data: {...}
 *    }
 *
 * 2. {
 *      resume_id: "...",
 *      ats_score: 90,
 *      ...
 *    }
 */
function extractAnalysisPayload(
    payload:
        ResumeAnalysisApiPayload
): Partial<ResumeAnalysisData> {

    if (
        !payload ||
        typeof payload !==
        "object"
    ) {

        throw new Error(
            "CareerMind AI returned an invalid analysis response."
        );
    }

    if (
        "success" in payload
    ) {

        const envelope =
            payload as ResumeAnalysisResponse;

        if (
            envelope.success === false
        ) {

            throw new Error(
                envelope.message ||
                "Resume analysis failed."
            );
        }

        if (
            !envelope.data
        ) {

            throw new Error(
                envelope.message ||
                "Resume analysis data is not available yet."
            );
        }

        return envelope.data;
    }

    return payload;
}

/* ============================================================
   GET RESUME ANALYSIS
============================================================ */

/**
 * GET
 *
 * /api/v1/resume-analysis/{resume_id}
 */
export async function getResumeAnalysis(
    resumeId: string
): Promise<ResumeAnalysisData> {

    const id =
        validateResumeId(
            resumeId
        );

    try {

        const response =
            await api.get<
                ResumeAnalysisApiPayload
            >(
                `/resume-analysis/${encodeURIComponent(id)}`
            );

        if (
            !response?.data
        ) {

            throw new Error(
                "CareerMind AI returned an empty analysis response."
            );
        }

        const rawAnalysis =
            extractAnalysisPayload(
                response.data
            );

        const normalized =
            normalizeAnalysis(
                rawAnalysis
            );

        /**
         * Backend should normally return the same
         * resume ID that was requested.
         *
         * We warn instead of breaking the UI because
         * the analysis itself may still be valid.
         */
        if (
            normalized.resume_id &&
            normalized.resume_id !== id
        ) {

            console.warn(
                "CareerMind AI | Resume ID mismatch.",
                {
                    requested: id,
                    received:
                        normalized.resume_id,
                }
            );
        }

        return normalized;

    } catch (
    error: unknown
    ) {

        console.error(
            "CareerMind AI | Resume analysis request failed:",
            error
        );

        const apiError =
            error as ApiErrorShape;

        const status =
            apiError
                ?.response
                ?.status;

        /* ----------------------------------------------------
           Authentication
        ---------------------------------------------------- */

        if (
            status === 401
        ) {

            throw new Error(
                "Your CareerMind session has expired. Please log in again."
            );
        }

        /* ----------------------------------------------------
           Authorization
        ---------------------------------------------------- */

        if (
            status === 403
        ) {

            throw new Error(
                "You do not have permission to access this resume."
            );
        }

        /* ----------------------------------------------------
           Not Found
        ---------------------------------------------------- */

        if (
            status === 404
        ) {

            throw new Error(
                "Resume analysis is not available for this resume yet."
            );
        }

        /* ----------------------------------------------------
           Validation
        ---------------------------------------------------- */

        if (
            status === 422
        ) {

            throw new Error(
                resolveApiError(
                    error,
                    "CareerMind could not validate the resume analysis request."
                )
            );
        }

        /* ----------------------------------------------------
           Server Error
        ---------------------------------------------------- */

        if (
            typeof status ===
            "number" &&
            status >= 500
        ) {

            const backendMessage =
                resolveApiError(
                    error,
                    ""
                );

            if (
                backendMessage
            ) {

                throw new Error(
                    backendMessage
                );
            }

            throw new Error(
                "CareerMind AI analysis service is temporarily unavailable. Please try again."
            );
        }

        /* ----------------------------------------------------
           Network Error
        ---------------------------------------------------- */

        if (
            apiError.code ===
            "ERR_NETWORK"
        ) {

            throw new Error(
                "CareerMind backend is unreachable. Make sure the FastAPI server is running."
            );
        }

        /* ----------------------------------------------------
           Generic Error
        ---------------------------------------------------- */

        throw new Error(
            resolveApiError(
                error,
                "Unable to load resume intelligence."
            )
        );
    }
}

/* ============================================================
   ANALYZE RESUME ALIAS
============================================================ */

/**
 * Kept as a semantic alias so UI code can use:
 *
 * analyzeResume(resumeId)
 *
 * The current backend exposes analysis through GET.
 */
export async function analyzeResume(
    resumeId: string
): Promise<ResumeAnalysisData> {

    return getResumeAnalysis(
        resumeId
    );
}

/* ============================================================
   ALL UNIQUE SKILLS
============================================================ */

export function getAllSkills(
    analysis?:
        ResumeAnalysisData |
        null
): string[] {

    if (
        !analysis?.skills
    ) {

        return [];
    }

    return normalizeStringArray([
        ...analysis.skills
            .technical_skills,

        ...analysis.skills
            .programming_languages,

        ...analysis.skills
            .frameworks,

        ...analysis.skills
            .tools,
    ]);
}

/* ============================================================
   SKILL STATISTICS
============================================================ */

export interface SkillStatistics {

    total: number;

    technical: number;

    programming: number;

    frameworks: number;

    tools: number;
}

export function getSkillStatistics(
    analysis?:
        ResumeAnalysisData |
        null
): SkillStatistics {

    if (
        !analysis?.skills
    ) {

        return {
            total: 0,
            technical: 0,
            programming: 0,
            frameworks: 0,
            tools: 0,
        };
    }

    return {

        total:
            getAllSkills(
                analysis
            ).length,

        technical:
            analysis.skills
                .technical_skills
                .length,

        programming:
            analysis.skills
                .programming_languages
                .length,

        frameworks:
            analysis.skills
                .frameworks
                .length,

        tools:
            analysis.skills
                .tools
                .length,
    };
}

/* ============================================================
   SKILL COVERAGE
============================================================ */

/**
 * Frontend-derived presentation metric.
 *
 * This does NOT replace:
 *
 * - ATS score
 * - AI score
 *
 * It represents breadth of detected capabilities.
 */
export function calculateSkillCoverage(
    analysis?:
        ResumeAnalysisData |
        null
): number {

    if (
        !analysis
    ) {

        return 0;
    }

    const totalSkills =
        getAllSkills(
            analysis
        ).length;

    if (
        totalSkills === 0
    ) {

        return 0;
    }

    const coverage =
        (
            totalSkills /
            20
        ) * 100;

    return clampScore(
        coverage
    );
}

/* ============================================================
   PROFILE DEPTH
============================================================ */

/**
 * Measures structural evidence in the resume:
 *
 * Experience
 * Education
 * Projects
 *
 * This is a UI intelligence metric,
 * not an AI-generated score.
 */
export function calculateProfileDepth(
    analysis?:
        ResumeAnalysisData |
        null
): number {

    if (
        !analysis
    ) {

        return 0;
    }

    const signals =
        analysis.experience.length +
        analysis.education.length +
        analysis.projects.length;

    if (
        signals === 0
    ) {

        return 0;
    }

    return clampScore(
        (
            signals /
            10
        ) * 100
    );
}

/* ============================================================
   CAREER READINESS
============================================================ */

/**
 * Career readiness model:
 *
 * ATS compatibility  -> 35%
 * AI quality         -> 35%
 * Skill coverage     -> 20%
 * Profile depth      -> 10%
 *
 * Important:
 *
 * This is a frontend-derived intelligence indicator.
 * It is not a backend score.
 */
export function calculateCareerReadiness(
    analysis?:
        ResumeAnalysisData |
        null
): number {

    if (
        !analysis
    ) {

        return 0;
    }

    const ats =
        clampScore(
            analysis.ats_score
        );

    const ai =
        clampScore(
            analysis.ai_score
        );

    const skills =
        calculateSkillCoverage(
            analysis
        );

    const profile =
        calculateProfileDepth(
            analysis
        );

    const readiness =
        (
            ats * 0.35
        ) +
        (
            ai * 0.35
        ) +
        (
            skills * 0.20
        ) +
        (
            profile * 0.10
        );

    return clampScore(
        readiness
    );
}

/* ============================================================
   RESUME QUALITY
============================================================ */

export interface ResumeQuality {

    ats: number;

    ai: number;

    skills: number;

    overall: number;
}

export function calculateResumeQuality(
    analysis?:
        ResumeAnalysisData |
        null
): ResumeQuality {

    if (
        !analysis
    ) {

        return {
            ats: 0,
            ai: 0,
            skills: 0,
            overall: 0,
        };
    }

    const ats =
        clampScore(
            analysis.ats_score
        );

    const ai =
        clampScore(
            analysis.ai_score
        );

    const skills =
        calculateSkillCoverage(
            analysis
        );

    const overall =
        (
            ats +
            ai +
            skills
        ) / 3;

    return {

        ats,

        ai,

        skills,

        overall:
            clampScore(
                overall
            ),
    };
}

/* ============================================================
   READINESS LABEL
============================================================ */

export function getReadinessLabel(
    score: number
): string {

    const value =
        clampScore(
            score
        );

    if (
        value >= 90
    ) {

        return "Exceptional professional signal";
    }

    if (
        value >= 80
    ) {

        return "Strong professional signal";
    }

    if (
        value >= 70
    ) {

        return "Career-ready profile";
    }

    if (
        value >= 50
    ) {

        return "Developing professional profile";
    }

    if (
        value > 0
    ) {

        return "Profile needs stronger signals";
    }

    return "Awaiting resume analysis";
}

/* ============================================================
   SCORE CATEGORY
============================================================ */

export type ScoreCategory =
    | "exceptional"
    | "strong"
    | "developing"
    | "weak";

export function getScoreCategory(
    score: number
): ScoreCategory {

    const value =
        clampScore(
            score
        );

    if (
        value >= 90
    ) {

        return "exceptional";
    }

    if (
        value >= 75
    ) {

        return "strong";
    }

    if (
        value >= 50
    ) {

        return "developing";
    }

    return "weak";
}

/* ============================================================
   CAREER DIRECTION
============================================================ */

export function getCareerDirection(
    analysis?:
        ResumeAnalysisData |
        null
): CareerRecommendation {

    if (
        !analysis
    ) {

        return {
            role: "",
            next_step: "",
        };
    }

    return normalizeCareerRecommendation(
        analysis.career_recommendation
    );
}

/* ============================================================
   HAS CAREER DIRECTION
============================================================ */

export function hasCareerDirection(
    analysis?:
        ResumeAnalysisData |
        null
): boolean {

    const career =
        getCareerDirection(
            analysis
        );

    return Boolean(
        career.role ||
        career.next_step
    );
}

/* ============================================================
   STRENGTHS
============================================================ */

export function getStrengths(
    analysis?:
        ResumeAnalysisData |
        null
): string[] {

    return normalizeStringArray(
        analysis
            ?.career_insights
            ?.strengths
    );
}

/* ============================================================
   IMPROVEMENT AREAS
============================================================ */

export function getImprovementAreas(
    analysis?:
        ResumeAnalysisData |
        null
): string[] {

    return normalizeStringArray(
        analysis
            ?.career_insights
            ?.weaknesses
    );
}

/* ============================================================
   RECOMMENDATIONS
============================================================ */

export function getRecommendations(
    analysis?:
        ResumeAnalysisData |
        null
): string[] {

    return normalizeStringArray(
        analysis
            ?.career_insights
            ?.recommendations
    );
}

/* ============================================================
   LEARNING ROADMAP
============================================================ */

export function getLearningRoadmap(
    analysis?:
        ResumeAnalysisData |
        null
): string[] {

    return normalizeStringArray(
        analysis
            ?.career_insights
            ?.learning_path
    );
}

/* ============================================================
   SKILL GAPS
============================================================ */

export function getSkillGaps(
    analysis?:
        ResumeAnalysisData |
        null
): string[] {

    return normalizeStringArray(
        analysis
            ?.missing_skills
    );
}

/* ============================================================
   PROFILE SIGNALS
============================================================ */

export interface ProfileSignals {

    experience: number;

    education: number;

    projects: number;

    words: number;

    skills: number;
}

export function getProfileSignals(
    analysis?:
        ResumeAnalysisData |
        null
): ProfileSignals {

    if (
        !analysis
    ) {

        return {
            experience: 0,
            education: 0,
            projects: 0,
            words: 0,
            skills: 0,
        };
    }

    return {

        experience:
            analysis.experience.length,

        education:
            analysis.education.length,

        projects:
            analysis.projects.length,

        words:
            normalizeNonNegativeNumber(
                analysis.word_count
            ),

        skills:
            getAllSkills(
                analysis
            ).length,
    };
}

/* ============================================================
   ANALYSIS STATE
============================================================ */

export type AnalysisState =
    | "idle"
    | "loading"
    | "analyzing"
    | "complete"
    | "error";

/* ============================================================
   ANALYSIS STATUS
============================================================ */

export interface AnalysisStatus {

    state: AnalysisState;

    isLoading: boolean;

    isAnalyzing: boolean;

    isComplete: boolean;

    hasError: boolean;
}

export function getAnalysisStatus(
    state: AnalysisState
): AnalysisStatus {

    return {

        state,

        isLoading:
            state === "loading",

        isAnalyzing:
            state === "analyzing",

        isComplete:
            state === "complete",

        hasError:
            state === "error",
    };
}

/* ============================================================
   COMPLETE DASHBOARD INTELLIGENCE
============================================================ */

export interface DashboardIntelligence {

    hasAnalysis: boolean;

    readiness: number;

    readinessLabel: string;

    readinessCategory: ScoreCategory;

    quality: ResumeQuality;

    skillCoverage: number;

    profileDepth: number;

    skillStatistics: SkillStatistics;

    profileSignals: ProfileSignals;

    career: CareerRecommendation;

    hasCareerDirection: boolean;

    strengths: string[];

    improvements: string[];

    recommendations: string[];

    learningPath: string[];

    skillGaps: string[];

    allSkills: string[];
}

/* ============================================================
   BUILD DASHBOARD INTELLIGENCE
============================================================ */

export function buildDashboardIntelligence(
    analysis?:
        ResumeAnalysisData |
        null
): DashboardIntelligence {

    const hasAnalysis =
        Boolean(
            analysis
        );

    const readiness =
        calculateCareerReadiness(
            analysis
        );

    const career =
        getCareerDirection(
            analysis
        );

    return {

        hasAnalysis,

        readiness,

        readinessLabel:
            getReadinessLabel(
                readiness
            ),

        readinessCategory:
            getScoreCategory(
                readiness
            ),

        quality:
            calculateResumeQuality(
                analysis
            ),

        skillCoverage:
            calculateSkillCoverage(
                analysis
            ),

        profileDepth:
            calculateProfileDepth(
                analysis
            ),

        skillStatistics:
            getSkillStatistics(
                analysis
            ),

        profileSignals:
            getProfileSignals(
                analysis
            ),

        career,

        hasCareerDirection:
            hasCareerDirection(
                analysis
            ),

        strengths:
            getStrengths(
                analysis
            ),

        improvements:
            getImprovementAreas(
                analysis
            ),

        recommendations:
            getRecommendations(
                analysis
            ),

        learningPath:
            getLearningRoadmap(
                analysis
            ),

        skillGaps:
            getSkillGaps(
                analysis
            ),

        allSkills:
            getAllSkills(
                analysis
            ),
    };
}

/* ============================================================
   ANALYSIS CONFIGURATION
============================================================ */

export const RESUME_ANALYSIS_CONFIG = {

    endpoint:
        "/resume-analysis",

    method:
        "GET",

    scoreWeights: {

        ats: 0.35,

        ai: 0.35,

        skills: 0.20,

        profile: 0.10,
    },

    limits: {

        skillCoverageFull:
            20,

        profileDepthFull:
            10,

        maxDisplayedInsights:
            6,
    },

    status: {

        idle:
            "idle",

        loading:
            "loading",

        analyzing:
            "analyzing",

        complete:
            "complete",

        error:
            "error",
    },

} as const;