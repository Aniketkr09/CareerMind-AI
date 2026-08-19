/**
 * ============================================================
 * CareerMind AI
 * Dashboard Domain Types
 * ============================================================
 *
 * Single source of truth for:
 *
 * - Resume
 * - Resume analysis
 * - Career recommendations
 * - Skill gaps
 * - Dashboard state
 *
 * ============================================================
 */

// ============================================================
// RESUME
// ============================================================

export interface Resume {
    id: string;

    user_id?: string;

    original_filename: string;

    stored_filename?: string;

    file_path?: string;

    file_type?: string;

    extracted_text?: string;

    is_processed?: boolean;

    created_at?: string;

    updated_at?: string;
}


// ============================================================
// CAREER RECOMMENDATION
// ============================================================

export interface CareerRecommendation {
    title: string;

    description?: string;

    match_score?: number;

    score?: number;

    reason?: string;

    required_skills?: string[];

    missing_skills?: string[];
}


// ============================================================
// SKILL GAP
// ============================================================

export interface SkillGap {
    name: string;

    current_level?: number;

    required_level?: number;

    gap?: number;

    priority?: string;

    importance?: string;
}


// ============================================================
// RESUME ANALYSIS
// ============================================================

export interface ResumeAnalysis {
    resume_id: string;

    ats_score?: number;

    ai_score?: number;

    career_fit?: number;

    profile_strength?: number;

    readiness?: number;

    skills?: string[];

    extracted_skills?: string[];

    missing_skills?: string[];

    skill_gaps?: SkillGap[];

    strengths?: string[];

    weaknesses?: string[];

    career_recommendations?: CareerRecommendation[];

    recommendations?: CareerRecommendation[];

    summary?: string;

    improvement_suggestions?: string[];

    created_at?: string;

    updated_at?: string;

    /**
     * Allows the frontend to remain compatible
     * with additional AI fields returned later.
     */
    [key: string]: unknown;
}


// ============================================================
// UPLOAD RESPONSE
// ============================================================

export interface ResumeUploadResponse {
    resume: Resume;

    message?: string;

    status?: string;
}


// ============================================================
// DASHBOARD STATE
// ============================================================

export interface DashboardState {
    resume: Resume | null;

    analysis: ResumeAnalysis | null;
}


// ============================================================
// DASHBOARD METRIC
// ============================================================

export interface DashboardMetric {
    label: string;

    value: string | number;

    suffix?: string;

    description?: string;

    status?: string;

    icon?: string;

    tone?:
    | "cyan"
    | "blue"
    | "violet"
    | "green"
    | "yellow"
    | "red";
}


// ============================================================
// DASHBOARD ACTIVITY
// ============================================================

export interface DashboardActivity {
    id: string;

    title: string;

    description?: string;

    timestamp?: string;

    type?:
    | "resume"
    | "analysis"
    | "career"
    | "skill"
    | "interview"
    | "system";
}


// ============================================================
// DASHBOARD RETURN TYPE
// ============================================================

export interface UseDashboardReturn {
    dashboard: DashboardState;

    loading: boolean;

    analyzing: boolean;

    uploading: boolean;

    error: string | null;

    analysisError: string | null;

    refresh: () => Promise<void>;

    upload: (
        file: File,
    ) => Promise<Resume | null>;

    analyze: (
        resumeId?: string,
    ) => Promise<ResumeAnalysis | null>;
}