/**
 * ============================================================
 * CareerMind AI
 * Roadmap Intelligence Service
 * ============================================================
 *
 * Backend:
 * GET /api/v1/roadmap
 *
 * Backend response:
 *
 * {
 *   status: "ready",
 *   resume_id: "...",
 *   recommended_role: "AI / ML Engineer",
 *   roadmap: [
 *     {
 *       phase: 1,
 *       title: "...",
 *       description: "...",
 *       skills: [...],
 *       duration: "...",
 *       status: "active",
 *       priority: "high"
 *     }
 *   ],
 *   total_phases: 4,
 *   next_action: "...",
 *   next_skill: "...",
 *   progress: 0
 * }
 * ============================================================
 */

import api from "./api";

/* ============================================================
   TYPES
============================================================ */

export type RoadmapStatus =
    | "completed"
    | "active"
    | "current"
    | "in_progress"
    | "next"
    | "planned"
    | "locked"
    | "upcoming"
    | "pending"
    | "skipped"
    | string;

export type RoadmapPriority =
    | "high"
    | "medium"
    | "low"
    | string;


/* ============================================================
   ROADMAP PHASE
============================================================ */

export interface RoadmapPhase {
    phase: number | string;
    title: string;
    description: string;
    skills: string[];
    status: RoadmapStatus;
    progress: number;
    duration?: string;
    priority?: RoadmapPriority;
    resources: string[];
}


/* ============================================================
   BACKEND RESPONSE
============================================================ */

export interface RoadmapResponse {
    status?: string;
    resume_id?: string | null;

    career_goal: string;

    recommended_role?: string | null;

    progress: number;

    roadmap: RoadmapPhase[];

    total_phases?: number;

    next_action?: string | null;

    next_skill?: string | null;
}


/* ============================================================
   INTERNAL TYPES
============================================================ */

type UnknownRecord = Record<string, unknown>;


/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_CAREER_GOAL =
    "AI / ML Engineer";

const DEFAULT_PHASE_TITLE =
    "Learning Phase";

const DEFAULT_PHASE_DESCRIPTION =
    "Build the skills and practical evidence required for your career goal.";

const MAX_SKILLS_PER_PHASE = 20;

const MAX_RESOURCES_PER_PHASE = 20;


/* ============================================================
   OBJECT CHECK
============================================================ */

function isObject(
    value: unknown,
): value is UnknownRecord {
    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
}


/* ============================================================
   SAFE STRING
============================================================ */

function safeString(
    value: unknown,
    fallback = "",
): string {

    if (
        typeof value !== "string"
    ) {
        return fallback;
    }

    const result =
        value.trim();

    return result || fallback;
}


/* ============================================================
   SAFE NUMBER
============================================================ */

function safeNumber(
    value: unknown,
    fallback = 0,
): number {

    if (
        typeof value !== "number" ||
        !Number.isFinite(value)
    ) {
        return fallback;
    }

    return value;
}


/* ============================================================
   CLAMP
============================================================ */

function clamp(
    value: number,
    min = 0,
    max = 100,
): number {

    return Math.min(
        Math.max(
            value,
            min,
        ),
        max,
    );
}


/* ============================================================
   SAFE PROGRESS
============================================================ */

function safeProgress(
    value: unknown,
): number {

    const number =
        safeNumber(
            value,
            0,
        );

    return Math.round(
        clamp(number),
    );
}


/* ============================================================
   STRING ARRAY NORMALIZER
============================================================ */

function normalizeStringArray(
    value: unknown,
    limit = 20,
): string[] {

    if (
        Array.isArray(value)
    ) {

        return Array.from(
            new Set(
                value
                    .map(
                        item =>
                            typeof item === "string"
                                ? item.trim()
                                : String(item).trim(),
                    )
                    .filter(Boolean),
            ),
        ).slice(
            0,
            limit,
        );
    }

    /*
     * Also support comma-separated strings.
     */

    if (
        typeof value === "string"
    ) {

        return Array.from(
            new Set(
                value
                    .split(",")
                    .map(
                        item =>
                            item.trim(),
                    )
                    .filter(Boolean),
            ),
        ).slice(
            0,
            limit,
        );
    }

    return [];
}


/* ============================================================
   PHASE NUMBER
============================================================ */

function normalizePhaseNumber(
    value: unknown,
    index: number,
): number | string {

    if (
        typeof value === "number" &&
        Number.isFinite(value)
    ) {
        return value;
    }

    if (
        typeof value === "string" &&
        value.trim()
    ) {
        return value.trim();
    }

    return index + 1;
}


/* ============================================================
   STATUS NORMALIZATION
============================================================ */

function normalizeStatus(
    value: unknown,
): RoadmapStatus {

    const status =
        safeString(
            value,
            "upcoming",
        )
            .toLowerCase()
            .replace(
                /[\s-]+/g,
                "_",
            );

    switch (status) {

        case "completed":
            return "completed";

        case "active":
            return "active";

        case "current":
            return "current";

        case "in_progress":
            return "in_progress";

        case "next":
            return "next";

        case "planned":
            return "planned";

        case "locked":
            return "locked";

        case "upcoming":
            return "upcoming";

        case "pending":
            return "pending";

        case "skipped":
            return "skipped";

        default:
            return "upcoming";
    }
}


/* ============================================================
   STATUS HELPERS
============================================================ */

function isCompletedStatus(
    status: RoadmapStatus,
): boolean {

    return status === "completed";
}


function isActiveStatus(
    status: RoadmapStatus,
): boolean {

    return (
        status === "active" ||
        status === "current" ||
        status === "in_progress"
    );
}


function isUpcomingStatus(
    status: RoadmapStatus,
): boolean {

    return (
        status === "next" ||
        status === "planned" ||
        status === "upcoming" ||
        status === "pending"
    );
}


/* ============================================================
   PHASE NORMALIZATION
============================================================ */

function normalizePhase(
    value: unknown,
    index: number,
): RoadmapPhase {

    const item =
        isObject(value)
            ? value
            : {};

    const phase =
        normalizePhaseNumber(
            item.phase,
            index,
        );

    const title =
        safeString(
            item.title,
            DEFAULT_PHASE_TITLE,
        );

    const description =
        safeString(
            item.description,
            DEFAULT_PHASE_DESCRIPTION,
        );

    const skills =
        normalizeStringArray(
            item.skills,
            MAX_SKILLS_PER_PHASE,
        );

    const resources =
        normalizeStringArray(
            item.resources,
            MAX_RESOURCES_PER_PHASE,
        );

    const status =
        normalizeStatus(
            item.status,
        );

    /*
     * Backend roadmap currently does not send
     * phase.progress.
     *
     * Therefore derive a sensible default.
     */

    let progress = 0;

    if (
        typeof item.progress === "number"
    ) {

        progress =
            safeProgress(
                item.progress,
            );

    } else if (
        isCompletedStatus(status)
    ) {

        progress = 100;

    } else if (
        isActiveStatus(status)
    ) {

        progress = 50;

    } else {

        progress = 0;
    }


    const duration =
        safeString(
            item.duration,
        );


    const priority =
        safeString(
            item.priority,
            "medium",
        );


    return {

        phase,

        title,

        description,

        skills,

        status,

        progress,

        duration:
            duration ||
            undefined,

        priority,

        resources,
    };
}


/* ============================================================
   RESPONSE UNWRAPPER
============================================================ */

function unwrapRoadmap(
    value: unknown,
): UnknownRecord {

    if (
        !isObject(value)
    ) {
        return {};
    }


    /*
     * { data: {...} }
     */

    if (
        isObject(value.data)
    ) {

        return value.data;
    }


    /*
     * { result: {...} }
     */

    if (
        isObject(value.result)
    ) {

        return value.result;
    }


    /*
     * { roadmap: {...} }
     */

    if (
        isObject(value.roadmap) &&
        !Array.isArray(value.roadmap)
    ) {

        return value.roadmap;
    }


    return value;
}


/* ============================================================
   ROADMAP NORMALIZATION
============================================================ */

function normalizeRoadmap(
    data: unknown,
): RoadmapResponse {

    const source =
        unwrapRoadmap(
            data,
        );


    const rawRoadmap =
        Array.isArray(
            source.roadmap,
        )
            ? source.roadmap
            : [];


    const roadmap =
        rawRoadmap.map(
            (
                phase,
                index,
            ) =>
                normalizePhase(
                    phase,
                    index,
                ),
        );


    /*
     * Backend provides progress.
     */

    const backendProgress =
        safeProgress(
            source.progress,
        );


    /*
     * Calculate progress from phases
     * when backend progress is unavailable.
     */

    const calculatedProgress =
        calculatePhaseProgress(
            roadmap,
        );


    const hasBackendProgress =
        typeof source.progress ===
        "number" &&
        Number.isFinite(
            source.progress,
        );


    const progress =
        hasBackendProgress
            ? backendProgress
            : calculatedProgress;


    /*
     * Backend uses recommended_role.
     *
     * Older frontend used career_goal.
     *
     * Support both.
     */

    const recommendedRole =
        safeString(
            source.recommended_role,
            safeString(
                source.career_goal,
                DEFAULT_CAREER_GOAL,
            ),
        );


    return {

        status:
            safeString(
                source.status,
                roadmap.length
                    ? "ready"
                    : "awaiting_resume",
            ),

        resume_id:
            typeof source.resume_id === "string"
                ? source.resume_id
                : null,

        career_goal:
            recommendedRole,

        recommended_role:
            recommendedRole,

        progress,

        roadmap,

        total_phases:
            typeof source.total_phases === "number"
                ? source.total_phases
                : roadmap.length,

        next_action:
            safeString(
                source.next_action,
            ) || null,

        next_skill:
            safeString(
                source.next_skill,
            ) || null,
    };
}


/* ============================================================
   FETCH ROADMAP
============================================================ */

/**
 * Fetch personalized roadmap from FastAPI.
 */
export async function getLearningRoadmap(): Promise<RoadmapResponse> {

    try {

        const response =
            await api.get(
                "/roadmap",
            );


        return normalizeRoadmap(
            response.data,
        );

    } catch (error) {

        console.error(
            "CareerMind AI: failed to load learning roadmap.",
            error,
        );

        throw error;
    }
}


/* ============================================================
   CURRENT PHASE
============================================================ */

export function getCurrentRoadmapPhase(
    roadmap: RoadmapResponse,
): RoadmapPhase | null {

    if (
        roadmap.roadmap.length === 0
    ) {
        return null;
    }


    /*
     * Prefer active/current phase.
     */

    const active =
        roadmap.roadmap.find(
            phase =>
                isActiveStatus(
                    phase.status,
                ),
        );


    if (active) {
        return active;
    }


    /*
     * Then next phase.
     */

    const next =
        roadmap.roadmap.find(
            phase =>
                phase.status ===
                "next",
        );


    if (next) {
        return next;
    }


    /*
     * Then upcoming/planned.
     */

    const upcoming =
        roadmap.roadmap.find(
            phase =>
                isUpcomingStatus(
                    phase.status,
                ),
        );


    if (upcoming) {
        return upcoming;
    }


    return (
        roadmap.roadmap[0] ??
        null
    );
}


/* ============================================================
   COMPLETED PHASES
============================================================ */

export function getCompletedRoadmapPhases(
    roadmap: RoadmapResponse,
): RoadmapPhase[] {

    return roadmap.roadmap.filter(
        phase =>
            isCompletedStatus(
                phase.status,
            ),
    );
}


/* ============================================================
   ACTIVE PHASES
============================================================ */

export function getActiveRoadmapPhases(
    roadmap: RoadmapResponse,
): RoadmapPhase[] {

    return roadmap.roadmap.filter(
        phase =>
            isActiveStatus(
                phase.status,
            ),
    );
}


/* ============================================================
   UPCOMING PHASES
============================================================ */

export function getUpcomingRoadmapPhases(
    roadmap: RoadmapResponse,
): RoadmapPhase[] {

    return roadmap.roadmap.filter(
        phase =>
            isUpcomingStatus(
                phase.status,
            ),
    );
}


/* ============================================================
   LOCKED PHASES
============================================================ */

export function getLockedRoadmapPhases(
    roadmap: RoadmapResponse,
): RoadmapPhase[] {

    return roadmap.roadmap.filter(
        phase =>
            phase.status ===
            "locked",
    );
}


/* ============================================================
   CALCULATE PHASE PROGRESS
============================================================ */

export function calculatePhaseProgress(
    roadmap: RoadmapPhase[],
): number {

    if (
        roadmap.length === 0
    ) {
        return 0;
    }


    const total =
        roadmap.reduce(
            (
                sum,
                phase,
            ) =>
                sum +
                safeProgress(
                    phase.progress,
                ),
            0,
        );


    return Math.round(
        total /
        roadmap.length,
    );
}


/* ============================================================
   CALCULATE ROADMAP PROGRESS
============================================================ */

export function calculateRoadmapProgress(
    roadmap: RoadmapResponse,
): number {

    if (
        roadmap.roadmap.length === 0
    ) {
        return 0;
    }


    return calculatePhaseProgress(
        roadmap.roadmap,
    );
}


/* ============================================================
   COMPLETED COUNT
============================================================ */

export function getCompletedPhaseCount(
    roadmap: RoadmapResponse,
): number {

    return getCompletedRoadmapPhases(
        roadmap,
    ).length;
}


/* ============================================================
   TOTAL PHASE COUNT
============================================================ */

export function getTotalPhaseCount(
    roadmap: RoadmapResponse,
): number {

    return roadmap.roadmap.length;
}


/* ============================================================
   REMAINING PHASE COUNT
============================================================ */

export function getRemainingPhaseCount(
    roadmap: RoadmapResponse,
): number {

    return roadmap.roadmap.filter(
        phase =>
            !isCompletedStatus(
                phase.status,
            ),
    ).length;
}


/* ============================================================
   ROADMAP SKILLS
============================================================ */

export function getRoadmapSkills(
    roadmap: RoadmapResponse,
): string[] {

    const skills =
        roadmap.roadmap.flatMap(
            phase =>
                phase.skills,
        );


    return Array.from(
        new Set(
            skills
                .map(
                    skill =>
                        skill.trim(),
                )
                .filter(Boolean),
        ),
    );
}


/* ============================================================
   NEXT SKILLS
============================================================ */

export function getNextSkills(
    roadmap: RoadmapResponse,
): string[] {

    /*
     * Backend explicitly provides next_skill.
     */

    if (
        roadmap.next_skill
    ) {

        return [
            roadmap.next_skill,
        ];
    }


    const current =
        getCurrentRoadmapPhase(
            roadmap,
        );


    if (!current) {
        return [];
    }


    return current.skills;
}


/* ============================================================
   NEXT ACTION
============================================================ */

export function getNextRoadmapAction(
    roadmap: RoadmapResponse,
): string {

    if (
        roadmap.next_action
    ) {

        return roadmap.next_action;
    }


    const current =
        getCurrentRoadmapPhase(
            roadmap,
        );


    if (!current) {

        return "Upload and analyze your resume";
    }


    return current.title;
}


/* ============================================================
   ROADMAP STATUS
============================================================ */

export function getRoadmapStatus(
    roadmap: RoadmapResponse,
):
    | "completed"
    | "in_progress"
    | "not_started" {

    if (
        roadmap.roadmap.length === 0
    ) {

        return "not_started";
    }


    if (
        roadmap.roadmap.every(
            phase =>
                isCompletedStatus(
                    phase.status,
                ),
        )
    ) {

        return "completed";
    }


    if (
        roadmap.roadmap.some(
            phase =>
                isActiveStatus(
                    phase.status,
                ) ||
                phase.progress > 0,
        )
    ) {

        return "in_progress";
    }


    return "not_started";
}


/* ============================================================
   ROADMAP SUMMARY
============================================================ */

export interface RoadmapSummary {

    totalPhases: number;

    completedPhases: number;

    remainingPhases: number;

    progress: number;

    currentPhase:
    RoadmapPhase | null;

    totalSkills: number;

    nextSkill:
    string | null;

    nextAction:
    string | null;

    status:
    | "completed"
    | "in_progress"
    | "not_started";
}


/* ============================================================
   SUMMARY
============================================================ */

export function getRoadmapSummary(
    roadmap: RoadmapResponse,
): RoadmapSummary {

    const currentPhase =
        getCurrentRoadmapPhase(
            roadmap,
        );


    const skills =
        getRoadmapSkills(
            roadmap,
        );


    return {

        totalPhases:
            getTotalPhaseCount(
                roadmap,
            ),

        completedPhases:
            getCompletedPhaseCount(
                roadmap,
            ),

        remainingPhases:
            getRemainingPhaseCount(
                roadmap,
            ),

        progress:
            calculateRoadmapProgress(
                roadmap,
            ),

        currentPhase,

        totalSkills:
            skills.length,

        nextSkill:
            roadmap.next_skill ??
            currentPhase?.skills[0] ??
            null,

        nextAction:
            roadmap.next_action ??
            currentPhase?.title ??
            null,

        status:
            getRoadmapStatus(
                roadmap,
            ),
    };
}


/* ============================================================
   PHASE HELPERS
============================================================ */

export function isPhaseCompleted(
    phase: RoadmapPhase,
): boolean {

    return isCompletedStatus(
        phase.status,
    );
}


export function isPhaseActive(
    phase: RoadmapPhase,
): boolean {

    return isActiveStatus(
        phase.status,
    );
}


export function isPhaseUpcoming(
    phase: RoadmapPhase,
): boolean {

    return isUpcomingStatus(
        phase.status,
    );
}


export function getPhaseProgress(
    phase: RoadmapPhase,
): number {

    return safeProgress(
        phase.progress,
    );
}


/* ============================================================
   DEFAULT EXPORT
============================================================ */

const roadmapService = {

    getLearningRoadmap,

    getCurrentRoadmapPhase,

    getCompletedRoadmapPhases,

    getActiveRoadmapPhases,

    getUpcomingRoadmapPhases,

    getLockedRoadmapPhases,

    calculatePhaseProgress,

    calculateRoadmapProgress,

    getCompletedPhaseCount,

    getTotalPhaseCount,

    getRemainingPhaseCount,

    getRoadmapSkills,

    getNextSkills,

    getNextRoadmapAction,

    getRoadmapStatus,

    getRoadmapSummary,

    isPhaseCompleted,

    isPhaseActive,

    isPhaseUpcoming,

    getPhaseProgress,
};

export default roadmapService;