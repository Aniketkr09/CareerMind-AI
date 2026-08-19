/**
 * ============================================================
 * CareerMind AI
 * useDashboard Hook
 * ============================================================
 */

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    analyzeResume,
    getLatestResume,
    uploadResume,
} from "../services/resumeService";


// ============================================================
// TYPES
// ============================================================

export interface Resume {
    id: string;
    user_id?: string;

    original_filename?: string;
    filename?: string;

    stored_filename?: string;
    file_path?: string;
    file_type?: string;

    extracted_text?: string;

    is_processed?: boolean;

    created_at?: string;
    updated_at?: string;
}


// ============================================================
// RESUME ANALYSIS
// ============================================================

export interface ResumeAnalysis {
    resume_id: string;

    ats_score?: number;
    ai_score?: number;

    skills?: string[];

    missing_skills?: string[];

    career_recommendations?: string[];

    recommendations?: string[];

    skill_gaps?: string[];

    strengths?: string[];

    weaknesses?: string[];

    summary?: string;

    career_fit?: number;

    profile_strength?: number;

    readiness?: number;

    [key: string]: unknown;
}


// ============================================================
// DASHBOARD STATE
// ============================================================

export interface DashboardState {
    resume: Resume | null;
    analysis: ResumeAnalysis | null;
}


// ============================================================
// HOOK RETURN
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


// ============================================================
// INITIAL STATE
// ============================================================

const INITIAL_DASHBOARD: DashboardState = {
    resume: null,
    analysis: null,
};


// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(
    error: unknown,
    fallback: string,
): string {

    if (error instanceof Error) {
        return error.message;
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
    ) {
        const message = (
            error as {
                message?: unknown;
            }
        ).message;

        if (typeof message === "string") {
            return message;
        }
    }

    return fallback;
}


// ============================================================
// HOOK
// ============================================================

export function useDashboard(): UseDashboardReturn {

    const [
        dashboard,
        setDashboard,
    ] = useState<DashboardState>(
        INITIAL_DASHBOARD,
    );


    const [
        loading,
        setLoading,
    ] = useState<boolean>(true);


    const [
        analyzing,
        setAnalyzing,
    ] = useState<boolean>(false);


    const [
        uploading,
        setUploading,
    ] = useState<boolean>(false);


    const [
        error,
        setError,
    ] = useState<string | null>(null);


    const [
        analysisError,
        setAnalysisError,
    ] = useState<string | null>(null);


    // ========================================================
    // ANALYZE RESUME
    // ========================================================

    const loadAnalysis = useCallback(
        async (
            resumeId: string,
        ): Promise<ResumeAnalysis | null> => {

            if (!resumeId.trim()) {
                setAnalysisError(
                    "Invalid resume ID.",
                );

                return null;
            }


            setAnalyzing(true);
            setAnalysisError(null);


            try {

                const result = (
                    await analyzeResume(resumeId)
                ) as ResumeAnalysis;


                setDashboard(
                    previous => ({
                        ...previous,
                        analysis: result,
                    }),
                );


                return result;

            } catch (error: unknown) {

                const message =
                    getErrorMessage(
                        error,
                        "Unable to analyze your resume.",
                    );


                console.error(
                    "CareerMind AI | Resume analysis failed:",
                    error,
                );


                setAnalysisError(message);


                setDashboard(
                    previous => ({
                        ...previous,
                        analysis: null,
                    }),
                );


                return null;

            } finally {

                setAnalyzing(false);

            }
        },
        [],
    );


    // ========================================================
    // LOAD DASHBOARD
    // ========================================================

    const refresh = useCallback(
        async (): Promise<void> => {

            setLoading(true);
            setError(null);
            setAnalysisError(null);


            try {

                const latestResume =
                    await getLatestResume();


                // ------------------------------------------------
                // No resume
                // ------------------------------------------------

                if (!latestResume) {

                    setDashboard(
                        INITIAL_DASHBOARD,
                    );

                    return;
                }


                // ------------------------------------------------
                // Store resume immediately
                // ------------------------------------------------

                const resume =
                    latestResume as Resume;


                setDashboard({
                    resume,
                    analysis: null,
                });


                // ------------------------------------------------
                // Load analysis
                // ------------------------------------------------

                await loadAnalysis(
                    resume.id,
                );

            } catch (error: unknown) {

                const message =
                    getErrorMessage(
                        error,
                        "Unable to load CareerMind AI dashboard.",
                    );


                console.error(
                    "CareerMind AI | Dashboard load failed:",
                    error,
                );


                setError(message);


                setDashboard(
                    INITIAL_DASHBOARD,
                );

            } finally {

                setLoading(false);

            }

        },
        [loadAnalysis],
    );


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        void refresh();

    }, [refresh]);


    // ========================================================
    // UPLOAD RESUME
    // ========================================================

    const upload = useCallback(
        async (
            file: File,
        ): Promise<Resume | null> => {

            setUploading(true);

            setError(null);
            setAnalysisError(null);


            try {

                // ------------------------------------------------
                // Validate file
                // ------------------------------------------------

                if (!file) {

                    throw new Error(
                        "Please select a resume.",
                    );

                }


                if (
                    file.type !==
                    "application/pdf"
                ) {

                    throw new Error(
                        "Only PDF resumes are supported.",
                    );

                }


                // ------------------------------------------------
                // Upload
                // ------------------------------------------------

                const response =
                    await uploadResume(file);


                /**
                 * Backend response is expected to be:
                 *
                 * {
                 *   resume: {...}
                 * }
                 *
                 * But we also support a direct resume object.
                 */

                const uploadedResume =
                    (
                        response as {
                            resume?: Resume;
                        }
                    )?.resume ??
                    response as unknown as Resume;


                if (!uploadedResume?.id) {

                    throw new Error(
                        "Resume uploaded but the server returned an invalid resume.",
                    );

                }


                // ------------------------------------------------
                // Update UI immediately
                // ------------------------------------------------

                setDashboard({
                    resume:
                        uploadedResume,

                    analysis:
                        null,
                });


                // ------------------------------------------------
                // Automatically analyze
                // ------------------------------------------------

                await loadAnalysis(
                    uploadedResume.id,
                );


                return uploadedResume;

            } catch (error: unknown) {

                const message =
                    getErrorMessage(
                        error,
                        "Unable to upload your resume.",
                    );


                console.error(
                    "CareerMind AI | Resume upload failed:",
                    error,
                );


                setError(message);

                return null;

            } finally {

                setUploading(false);

            }

        },
        [loadAnalysis],
    );


    // ========================================================
    // MANUAL ANALYSIS
    // ========================================================

    const analyze = useCallback(
        async (
            resumeId?: string,
        ): Promise<ResumeAnalysis | null> => {

            const id =
                resumeId ||
                dashboard.resume?.id;


            if (!id) {

                setAnalysisError(
                    "No resume is available for analysis.",
                );

                return null;
            }


            return loadAnalysis(id);

        },
        [
            dashboard.resume?.id,
            loadAnalysis,
        ],
    );


    // ========================================================
    // RETURN
    // ========================================================

    return {

        dashboard,

        loading,

        analyzing,

        uploading,

        error,

        analysisError,

        refresh,

        upload,

        analyze,

    };
}


export default useDashboard;