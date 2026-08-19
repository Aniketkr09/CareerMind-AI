/**
 * ============================================================
 * CareerMind AI
 *
 * Dashboard Intelligence Service
 * ============================================================
 *
 * PURPOSE
 * ------------------------------------------------------------
 *
 * This service transforms raw Resume + Resume Analysis data
 * into a unified CareerMind Intelligence Dashboard.
 *
 * DATA FLOW
 * ------------------------------------------------------------
 *
 *                 FastAPI
 *                    │
 *                    ▼
 *              Latest Resume
 *                    │
 *                    ▼
 *             Resume Analysis
 *                    │
 *                    ▼
 *        Dashboard Intelligence Layer
 *                    │
 *          ┌─────────┼─────────┐
 *          ▼         ▼         ▼
 *       Resume     Skills    Career
 *       Quality   Intelligence Direction
 *          │         │         │
 *          └─────────┼─────────┘
 *                    ▼
 *             Career Readiness
 *                    │
 *                    ▼
 *             Dashboard UI
 *
 * ============================================================
 *
 * IMPORTANT
 * ------------------------------------------------------------
 *
 * This service does NOT modify backend ATS or AI scores.
 *
 * Backend scores remain authoritative.
 *
 * Frontend-derived metrics are calculated only for
 * presentation and intelligence visualization.
 *
 * ============================================================
 */

import type {
    ResumeResponse,
    ResumeAnalysisData,
} from "./resumeService";

// ============================================================
// DASHBOARD USER
// ============================================================

export interface DashboardUser {

    name: string;

    email: string;
}

// ============================================================
// RESUME INTELLIGENCE
// ============================================================

export interface DashboardResume {

    uploaded: boolean;

    id: string | null;

    filename: string | null;

    fileType: string | null;

    processed: boolean;

    uploadedAt: string | null;

    atsScore: number;

    aiScore: number;

    qualityScore: number;
}

// ============================================================
// SKILL INTELLIGENCE
// ============================================================

export interface DashboardSkills {

    total: number;

    technical: number;

    programming: number;

    frameworks: number;

    tools: number;

    detected: string[];

    topSkills: string[];

    missingSkills: string[];
}

// ============================================================
// CAREER INTELLIGENCE
// ============================================================

export interface DashboardCareer {

    role: string;

    nextStep: string;

    readiness: number;

    readinessLabel: string;

    progress: number;

    interviewReadiness: number;
}

// ============================================================
// PROFILE INTELLIGENCE
// ============================================================

export interface DashboardProfile {

    experience: number;

    education: number;

    projects: number;

    words: number;

    profileDepth: number;
}

// ============================================================
// RESUME SIGNALS
// ============================================================

export interface DashboardSignals {

    strengths: string[];

    improvements: string[];

    recommendations: string[];
}

// ============================================================
// DASHBOARD DATA
// ============================================================

export interface DashboardData {

    user: DashboardUser;

    resume: DashboardResume;

    skills: DashboardSkills;

    career: DashboardCareer;

    profile: DashboardProfile;

    signals: DashboardSignals;

    analysis: ResumeAnalysisData | null;

    message: string;
}

// ============================================================
// DASHBOARD INSIGHTS
// ============================================================

export interface DashboardInsights {

    careerScore: number;

    resumeScore: number;

    atsScore: number;

    aiScore: number;

    skillCoverage: number;

    profileDepth: number;

    careerLabel: string;

    interviewLabel: string;

    hasResume: boolean;

    hasAnalysis: boolean;

    skillsCount: number;

    topSkill: string | null;

    careerRole: string;

    skillGaps: string[];
}

// ============================================================
// API ERROR
// ============================================================

interface DashboardApiError {

    detail?: string;

    message?: string;
}

// ============================================================
// SCORE NORMALIZER
// ============================================================

export function normalizeScore(
    value: unknown,
): number {

    const numericValue =
        Number(value);

    if (
        !Number.isFinite(
            numericValue,
        )
    ) {
        return 0;
    }

    return Math.round(
        Math.min(
            Math.max(
                numericValue,
                0,
            ),
            100,
        ),
    );
}

// ============================================================
// STRING ARRAY NORMALIZER
// ============================================================

function normalizeStringArray(
    value: unknown,
): string[] {

    if (!Array.isArray(value)) {
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

        unique.set(
            clean.toLowerCase(),
            clean,
        );
    }

    return Array.from(
        unique.values(),
    );
}

// ============================================================
// PROFILE DEPTH
// ============================================================
//
// Measures how much professional evidence exists.
//
// This is a presentation metric.
// It does not replace backend AI scoring.
//
// ============================================================

export function calculateProfileDepth(
    analysis:
        ResumeAnalysisData | null,
): number {

    if (!analysis) {
        return 0;
    }

    const experience =
        analysis.experience?.length ?? 0;

    const education =
        analysis.education?.length ?? 0;

    const projects =
        analysis.projects?.length ?? 0;

    const evidence =
        experience +
        education +
        projects;

    return normalizeScore(
        evidence * 15,
    );
}

// ============================================================
// SKILL COVERAGE
// ============================================================
//
// Skill coverage is derived from detected skills.
//
// It is intentionally capped at 100.
//
// ============================================================

export function calculateSkillCoverage(
    analysis:
        ResumeAnalysisData | null,
): number {

    if (!analysis) {
        return 0;
    }

    const skills =
        getAllSkills(
            analysis,
        );

    return normalizeScore(
        skills.length * 5,
    );
}

// ============================================================
// CAREER READINESS
// ============================================================
//
// Intelligence model:
//
// ATS      → 35%
// AI       → 35%
// Skills   → 20%
// Profile  → 10%
//
// Backend ATS and AI values remain unchanged.
//
// ============================================================

export function calculateCareerReadiness(
    analysis:
        ResumeAnalysisData | null,
): number {

    if (!analysis) {
        return 0;
    }

    const ats =
        normalizeScore(
            analysis.ats_score,
        );

    const ai =
        normalizeScore(
            analysis.ai_score,
        );

    const skills =
        calculateSkillCoverage(
            analysis,
        );

    const profile =
        calculateProfileDepth(
            analysis,
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

    return normalizeScore(
        readiness,
    );
}

// ============================================================
// RESUME QUALITY
// ============================================================

export function calculateResumeQuality(
    analysis:
        ResumeAnalysisData | null,
): number {

    if (!analysis) {
        return 0;
    }

    const ats =
        normalizeScore(
            analysis.ats_score,
        );

    const ai =
        normalizeScore(
            analysis.ai_score,
        );

    const skills =
        calculateSkillCoverage(
            analysis,
        );

    return normalizeScore(
        (
            ats +
            ai +
            skills
        ) / 3,
    );
}

// ============================================================
// READINESS LABEL
// ============================================================

export function getCareerReadinessLabel(
    score: number,
): string {

    const value =
        normalizeScore(
            score,
        );

    if (value >= 90) {
        return "Exceptional";
    }

    if (value >= 80) {
        return "Strong professional signal";
    }

    if (value >= 70) {
        return "Career ready";
    }

    if (value >= 50) {
        return "Developing profile";
    }

    if (value > 0) {
        return "Needs stronger signals";
    }

    return "Awaiting analysis";
}

// ============================================================
// INTERVIEW READINESS
// ============================================================
//
// Interview readiness is estimated from:
// - Resume quality
// - Skill coverage
// - Career readiness
//
// If your backend eventually provides an interview score,
// use that backend value instead.
//
// ============================================================

export function calculateInterviewReadiness(
    analysis:
        ResumeAnalysisData | null,
): number {

    if (!analysis) {
        return 0;
    }

    const ats =
        normalizeScore(
            analysis.ats_score,
        );

    const ai =
        normalizeScore(
            analysis.ai_score,
        );

    const skills =
        calculateSkillCoverage(
            analysis,
        );

    return normalizeScore(
        (
            ats * 0.30
        ) +
        (
            ai * 0.40
        ) +
        (
            skills * 0.30
        ),
    );
}

// ============================================================
// INTERVIEW LABEL
// ============================================================

export function getInterviewReadinessLabel(
    score: number,
): string {

    const value =
        normalizeScore(
            score,
        );

    if (value >= 90) {
        return "Interview exceptional";
    }

    if (value >= 80) {
        return "Interview ready";
    }

    if (value >= 70) {
        return "Almost ready";
    }

    if (value >= 50) {
        return "Needs practice";
    }

    if (value > 0) {
        return "Build interview confidence";
    }

    return "Awaiting analysis";
}

// ============================================================
// GET ALL UNIQUE SKILLS
// ============================================================

export function getAllSkills(
    analysis:
        ResumeAnalysisData | null,
): string[] {

    if (!analysis?.skills) {
        return [];
    }

    return normalizeStringArray([
        ...(
            analysis.skills
                .technical_skills ?? []
        ),

        ...(
            analysis.skills
                .programming_languages ?? []
        ),

        ...(
            analysis.skills
                .frameworks ?? []
        ),

        ...(
            analysis.skills
                .tools ?? []
        ),
    ]);
}

// ============================================================
// SKILL STATISTICS
// ============================================================

export interface SkillStatistics {

    total: number;

    technical: number;

    programming: number;

    frameworks: number;

    tools: number;
}

// ============================================================
// GET SKILL STATISTICS
// ============================================================

export function getSkillStatistics(
    analysis:
        ResumeAnalysisData | null,
): SkillStatistics {

    if (!analysis?.skills) {

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
                analysis,
            ).length,

        technical:
            analysis.skills
                .technical_skills
                ?.length ?? 0,

        programming:
            analysis.skills
                .programming_languages
                ?.length ?? 0,

        frameworks:
            analysis.skills
                .frameworks
                ?.length ?? 0,

        tools:
            analysis.skills
                .tools
                ?.length ?? 0,
    };
}

// ============================================================
// BUILD DASHBOARD DATA
// ============================================================
//
// Combines:
// - Resume
// - Resume analysis
// - Skills
// - Career direction
// - Profile signals
//
// ============================================================

export function buildDashboardData(
    resume:
        ResumeResponse | null,

    analysis:
        ResumeAnalysisData | null,

    user?: DashboardUser | null,
): DashboardData {

    const skillStats =
        getSkillStatistics(
            analysis,
        );

    const allSkills =
        getAllSkills(
            analysis,
        );

    const readiness =
        calculateCareerReadiness(
            analysis,
        );

    const quality =
        calculateResumeQuality(
            analysis,
        );

    const interviewReadiness =
        calculateInterviewReadiness(
            analysis,
        );

    const careerRole =
        analysis
            ?.career_recommendation
            ?.role ??
        "Career direction awaiting analysis";

    const nextStep =
        analysis
            ?.career_recommendation
            ?.next_step ??
        "Upload and analyze your resume to unlock your next best move.";

    return {

        user: {

            name:
                user?.name ??
                "Developer",

            email:
                user?.email ??
                "",
        },

        resume: {

            uploaded:
                Boolean(
                    resume,
                ),

            id:
                resume?.id ??
                null,

            filename:
                resume
                    ?.original_filename ??
                null,

            fileType:
                resume
                    ?.file_type ??
                null,

            processed:
                Boolean(
                    resume
                        ?.is_processed,
                ),

            uploadedAt:
                resume
                    ?.created_at ??
                null,

            atsScore:
                normalizeScore(
                    analysis
                        ?.ats_score ??
                    resume
                        ?.ats_score ??
                    0,
                ),

            aiScore:
                normalizeScore(
                    analysis
                        ?.ai_score ??
                    resume
                        ?.ai_score ??
                    0,
                ),

            qualityScore:
                quality,
        },

        skills: {

            total:
                skillStats.total,

            technical:
                skillStats.technical,

            programming:
                skillStats.programming,

            frameworks:
                skillStats.frameworks,

            tools:
                skillStats.tools,

            detected:
                allSkills,

            topSkills:
                allSkills.slice(
                    0,
                    8,
                ),

            missingSkills:
                normalizeStringArray(
                    analysis
                        ?.missing_skills ??
                    [],
                ),
        },

        career: {

            role:
                careerRole,

            nextStep,

            readiness,

            readinessLabel:
                getCareerReadinessLabel(
                    readiness,
                ),

            progress:
                readiness,

            interviewReadiness,

        },

        profile: {

            experience:
                analysis
                    ?.experience
                    ?.length ??
                0,

            education:
                analysis
                    ?.education
                    ?.length ??
                0,

            projects:
                analysis
                    ?.projects
                    ?.length ??
                0,

            words:
                Math.max(
                    0,
                    Number(
                        analysis
                            ?.word_count ??
                        0,
                    ),
                ),

            profileDepth:
                calculateProfileDepth(
                    analysis,
                ),
        },

        signals: {

            strengths:
                normalizeStringArray(
                    analysis
                        ?.career_insights
                        ?.strengths ??
                    analysis
                        ?.strengths ??
                    [],
                ),

            improvements:
                normalizeStringArray(
                    analysis
                        ?.career_insights
                        ?.weaknesses ??
                    analysis
                        ?.improvements ??
                    [],
                ),

            recommendations:
                normalizeStringArray(
                    analysis
                        ?.career_insights
                        ?.recommendations ??
                    [],
                ),
        },

        analysis,

        message:
            analysis
                ? "Career intelligence generated from your active resume."
                : resume
                    ? "Resume connected. Analysis is ready to be generated."
                    : "Upload a resume to activate CareerMind intelligence.",
    };
}

// ============================================================
// DASHBOARD INSIGHTS
// ============================================================

export function getDashboardInsights(
    dashboard:
        DashboardData,
): DashboardInsights {

    return {

        careerScore:
            dashboard
                .career
                .readiness,

        resumeScore:
            dashboard
                .resume
                .qualityScore,

        atsScore:
            dashboard
                .resume
                .atsScore,

        aiScore:
            dashboard
                .resume
                .aiScore,

        skillCoverage:
            calculateSkillCoverage(
                dashboard.analysis,
            ),

        profileDepth:
            dashboard
                .profile
                .profileDepth,

        careerLabel:
            dashboard
                .career
                .readinessLabel,

        interviewLabel:
            getInterviewReadinessLabel(
                dashboard
                    .career
                    .interviewReadiness,
            ),

        hasResume:
            dashboard
                .resume
                .uploaded,

        hasAnalysis:
            Boolean(
                dashboard.analysis,
            ),

        skillsCount:
            dashboard
                .skills
                .total,

        topSkill:
            dashboard
                .skills
                .topSkills
            ?.[0] ??
            null,

        careerRole:
            dashboard
                .career
                .role,

        skillGaps:
            dashboard
                .skills
                .missingSkills,
    };
}

// ============================================================
// EMPTY DASHBOARD
// ============================================================
//
// Useful before the user uploads a resume.
//
// ============================================================

export function createEmptyDashboard(
    user?: DashboardUser | null,
): DashboardData {

    return buildDashboardData(
        null,
        null,
        user,
    );
}

// ============================================================
// DASHBOARD CONFIGURATION
// ============================================================

export const DASHBOARD_CONFIG = {

    readinessWeights: {

        ats:
            0.35,

        ai:
            0.35,

        skills:
            0.20,

        profile:
            0.10,
    },

    interviewWeights: {

        ats:
            0.30,

        ai:
            0.40,

        skills:
            0.30,
    },

    topSkillsLimit:
        8,

    readinessThresholds: {

        exceptional:
            90,

        strong:
            80,

        ready:
            70,

        developing:
            50,
    },

} as const;

// ============================================================
// SERVICE OBJECT
// ============================================================

export const dashboardService = {

    normalizeScore,

    calculateProfileDepth,

    calculateSkillCoverage,

    calculateCareerReadiness,

    calculateResumeQuality,

    calculateInterviewReadiness,

    getCareerReadinessLabel,

    getInterviewReadinessLabel,

    getAllSkills,

    getSkillStatistics,

    buildDashboardData,

    getDashboardInsights,

    createEmptyDashboard,
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default dashboardService;