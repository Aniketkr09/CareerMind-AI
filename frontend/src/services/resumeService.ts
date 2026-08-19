import api from "./api";

/* =========================================================
   CAREERMIND AI
   RESUME SERVICE
========================================================= */


/* =========================================================
   RESUME RESPONSE
========================================================= */

export interface ResumeResponse {
    id: string;

    original_filename?: string;
    stored_filename?: string;

    file_path?: string;
    file_type?: string;

    extracted_text?: string | null;

    is_processed?: boolean;

    created_at?: string;
    updated_at?: string;
}


/* =========================================================
   CAREER RECOMMENDATION
========================================================= */

export interface CareerRecommendation {
    role?: string;
    next_step?: string;
}


/* =========================================================
   RESUME ANALYSIS
========================================================= */

export interface ResumeAnalysisData {
    id?: string;

    resume_id?: string;

    ats_score?: number | null;

    ai_score?: number | null;

    skills?: string[];

    skills_detected?: string[];

    extracted_skills?: string[];

    technical_skills?: string[];

    soft_skills?: string[];

    missing_skills?: string[];

    skill_gaps?: string[];

    career_recommendations?: string[];

    career_matches?: string[];

    recommendations?: string[];

    strengths?: string[];

    weaknesses?: string[];

    summary?: string | null;

    career_direction?: string | null;

    career_recommendation?: CareerRecommendation;

    created_at?: string;

    updated_at?: string;
}


/* =========================================================
   UPLOAD RESPONSE
========================================================= */

export interface ResumeUploadResponse {
    resume: ResumeResponse;

    success?: boolean;

    message?: string;
}


/* =========================================================
   UPLOAD RESUME
========================================================= */

export async function uploadResume(
    file: File
): Promise<ResumeUploadResponse> {

    if (!file) {
        throw new Error(
            "Please select a resume file."
        );
    }


    const isPdf =
        file.type === "application/pdf" ||
        file.name
            .toLowerCase()
            .endsWith(".pdf");


    if (!isPdf) {
        throw new Error(
            "Only PDF resume files are supported."
        );
    }


    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {
        throw new Error(
            "Resume file must be smaller than 10 MB."
        );
    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    /*
     * IMPORTANT:
     *
     * Do not manually set
     * Content-Type here.
     *
     * Axios/browser automatically
     * creates the multipart boundary.
     */

    const response =
        await api.post<ResumeUploadResponse>(
            "/resume/upload",
            formData
        );


    const body =
        response.data;


    console.log(
        "Resume upload response:",
        body
    );


    if (
        !body ||
        !body.resume ||
        !body.resume.id
    ) {
        throw new Error(
            "Resume uploaded but the server did not return a resume ID."
        );
    }


    return body;
}


/* =========================================================
   GET LATEST RESUME
========================================================= */

export async function getLatestResume():
    Promise<ResumeResponse | null> {

    try {

        const response =
            await api.get(
                "/resume/latest"
            );


        const body =
            response.data;


        /*
         * Supports:
         *
         * { data: resume }
         *
         * { resume: resume }
         *
         * direct resume object
         */

        const resume =
            body?.data ??
            body?.resume ??
            body;


        if (
            !resume ||
            !resume.id
        ) {
            return null;
        }


        return resume as ResumeResponse;

    }
    catch (error: any) {

        if (
            error?.response?.status ===
            404
        ) {
            return null;
        }


        throw error;
    }
}


/* =========================================================
   GET RESUME ANALYSIS
========================================================= */

export async function getResumeAnalysis(
    resumeId: string
): Promise<ResumeAnalysisData> {

    if (!resumeId) {
        throw new Error(
            "Resume ID is required."
        );
    }


    const id =
        String(resumeId).trim();


    if (!id) {
        throw new Error(
            "Resume ID is required."
        );
    }


    const response =
        await api.get(
            `/resume-analysis/${encodeURIComponent(id)}`
        );


    const body =
        response.data;


    console.log(
        "Resume analysis response:",
        body
    );


    /*
     * Your backend response is expected
     * to be:
     *
     * {
     *     success: true,
     *     data: {
     *         ...
     *     }
     * }
     */


    const analysis =
        body?.data ?? body;


    if (
        !analysis ||
        typeof analysis !== "object"
    ) {
        throw new Error(
            "Resume analysis data is not available."
        );
    }


    return analysis as ResumeAnalysisData;
}


/* =========================================================
   ANALYZE RESUME
========================================================= */

export async function analyzeResume(
    resumeId: string
): Promise<ResumeAnalysisData> {

    if (!resumeId) {
        throw new Error(
            "Resume ID is required."
        );
    }


    return getResumeAnalysis(
        resumeId
    );
}


/* =========================================================
   DEFAULT SERVICE
========================================================= */

const resumeService = {
    uploadResume,
    getLatestResume,
    getResumeAnalysis,
    analyzeResume,
};


export default resumeService;