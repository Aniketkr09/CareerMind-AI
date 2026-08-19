/**
 * ============================================================
 * CareerMind AI
 *
 * Career Intelligence Service
 *
 * Responsibilities:
 * - AI career recommendation
 * - Career confidence scoring
 * - Career explanation
 * - Required skill analysis
 * - Next-step recommendations
 * - Career readiness helpers
 *
 * Backend:
 * GET /api/v1/career/recommendation
 *
 * ============================================================
 */

import api from "./api";

// ============================================================
// Constants
// ============================================================

const CAREER_ENDPOINT = "/career";

// ============================================================
// Backend Response
// ============================================================

export interface CareerRecommendationResponse {
    recommended_role: string;
    confidence_score: number;
    explanation: string;
    next_steps: string[];
    skills_required: string[];
}

// ============================================================
// Frontend Career Intelligence
// ============================================================

export interface CareerIntelligence {
    role: string;
    confidence: number;
    confidenceLabel: string;
    matchLevel:
    | "exceptional"
    | "strong"
    | "moderate"
    | "developing";
    explanation: string;
    nextSteps: string[];
    requiredSkills: string[];
    skillCount: number;
}

// ============================================================
// API Error
// ============================================================

interface CareerApiError {
    detail?: string;
    message?: string;
}

// ============================================================
// Error Message
// ============================================================

function getCareerErrorMessage(
    error: unknown
): string {

    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {

        const response =
            (
                error as {
                    response?: {
                        data?: CareerApiError;
                    };
                }
            ).response;

        const message =
            response?.data?.detail ??
            response?.data?.message;

        if (message) {
            return message;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return (
        "Unable to load your career intelligence."
    );
}

// ============================================================
// Normalize Confidence
// ============================================================

function normalizeConfidence(
    value: unknown
): number {

    const confidence = Number(value);

    if (!Number.isFinite(confidence)) {
        return 0;
    }

    return Math.round(
        Math.min(
            Math.max(
                confidence,
                0
            ),
            100
        )
    );
}

// ============================================================
// Normalize String
// ============================================================

function normalizeString(
    value: unknown,
    fallback = ""
): string {

    if (
        typeof value !== "string"
    ) {
        return fallback;
    }

    return value.trim() || fallback;
}

// ============================================================
// Normalize String Array
// ============================================================

function normalizeStringArray(
    value: unknown
): string[] {

    if (!Array.isArray(value)) {
        return [];
    }

    return Array.from(
        new Set(
            value
                .filter(
                    (
                        item
                    ): item is string =>
                        typeof item === "string"
                )
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean)
        )
    );
}

// ============================================================
// Normalize Career Recommendation
// ============================================================

function normalizeCareerRecommendation(
    data: Partial<CareerRecommendationResponse>
): CareerRecommendationResponse {

    return {

        recommended_role:
            normalizeString(
                data?.recommended_role,
                "AI / ML Engineer"
            ),

        confidence_score:
            normalizeConfidence(
                data?.confidence_score
            ),

        explanation:
            normalizeString(
                data?.explanation,
                "CareerMind AI generated this recommendation from your professional profile and detected capabilities."
            ),

        next_steps:
            normalizeStringArray(
                data?.next_steps
            ),

        skills_required:
            normalizeStringArray(
                data?.skills_required
            ),
    };
}

// ============================================================
// Get Career Recommendation
//
// GET /api/v1/career/recommendation
// ============================================================

export async function getCareerRecommendation():
    Promise<CareerRecommendationResponse> {

    try {

        const response =
            await api.get<
                CareerRecommendationResponse
            >(
                `${CAREER_ENDPOINT}/recommendation`
            );

        if (!response.data) {

            throw new Error(
                "Career recommendation was not returned by the server."
            );
        }

        return normalizeCareerRecommendation(
            response.data
        );

    } catch (error: unknown) {

        console.error(
            "CareerMind AI career recommendation error:",
            error
        );

        throw new Error(
            getCareerErrorMessage(
                error
            )
        );
    }
}

// ============================================================
// Get Complete Career Intelligence
//
// Used directly by Dashboard.tsx
// ============================================================

export async function getCareerIntelligence():
    Promise<CareerIntelligence> {

    const recommendation =
        await getCareerRecommendation();

    const confidence =
        recommendation.confidence_score;

    const requiredSkills =
        recommendation.skills_required;

    return {

        role:
            recommendation.recommended_role,

        confidence,

        confidenceLabel:
            getConfidenceLabel(
                confidence
            ),

        matchLevel:
            getCareerMatchLevel(
                confidence
            ),

        explanation:
            recommendation.explanation,

        nextSteps:
            recommendation.next_steps,

        requiredSkills,

        skillCount:
            requiredSkills.length,
    };
}

// ============================================================
// Confidence Label
// ============================================================

export function getConfidenceLabel(
    score: number
): string {

    const confidence =
        normalizeConfidence(score);

    if (confidence >= 90) {
        return "Very High Confidence";
    }

    if (confidence >= 80) {
        return "High Confidence";
    }

    if (confidence >= 70) {
        return "Strong Career Match";
    }

    if (confidence >= 60) {
        return "Moderate Career Match";
    }

    if (confidence >= 40) {
        return "Developing Career Match";
    }

    return "Early Career Match";
}

// ============================================================
// Career Match Level
// ============================================================

export function getCareerMatchLevel(
    score: number
):
    | "exceptional"
    | "strong"
    | "moderate"
    | "developing" {

    const confidence =
        normalizeConfidence(score);

    if (confidence >= 90) {
        return "exceptional";
    }

    if (confidence >= 75) {
        return "strong";
    }

    if (confidence >= 60) {
        return "moderate";
    }

    return "developing";
}

// ============================================================
// Top Career Skills
// ============================================================

export function getTopCareerSkills(
    recommendation:
        CareerRecommendationResponse,
    limit = 6
): string[] {

    const safeLimit =
        Math.min(
            Math.max(
                Math.floor(limit),
                1
            ),
            20
        );

    return recommendation.skills_required
        .slice(
            0,
            safeLimit
        );
}

// ============================================================
// Priority Next Steps
// ============================================================

export function getPriorityNextSteps(
    recommendation:
        CareerRecommendationResponse,
    limit = 3
): string[] {

    const safeLimit =
        Math.min(
            Math.max(
                Math.floor(limit),
                1
            ),
            10
        );

    return recommendation.next_steps
        .slice(
            0,
            safeLimit
        );
}

// ============================================================
// Career Readiness Description
// ============================================================

export function getCareerReadinessDescription(
    score: number
): string {

    const confidence =
        normalizeConfidence(score);

    if (confidence >= 90) {
        return (
            "Your current profile shows exceptional alignment with this career direction."
        );
    }

    if (confidence >= 80) {
        return (
            "Your profile demonstrates strong alignment with this career direction."
        );
    }

    if (confidence >= 70) {
        return (
            "You have a solid foundation, with a few areas that can increase your competitiveness."
        );
    }

    if (confidence >= 60) {
        return (
            "You are developing toward this career direction and should focus on the recommended skills."
        );
    }

    return (
        "Your profile is at an early stage. Building the recommended capabilities can significantly improve your alignment."
    );
}

// ============================================================
// Career Service
// ============================================================

export const careerService = {

    getRecommendation:
        getCareerRecommendation,

    getIntelligence:
        getCareerIntelligence,

    getConfidenceLabel,

    getCareerMatchLevel,

    getCareerReadinessDescription,

    getTopCareerSkills,

    getPriorityNextSteps,
};

// ============================================================
// Default Export
// ============================================================

export default careerService;