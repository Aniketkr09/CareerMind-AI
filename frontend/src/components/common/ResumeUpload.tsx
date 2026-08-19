import {
    ChangeEvent,
    DragEvent,
    useRef,
    useState,
} from "react";

import {
    BrainCircuit,
    CheckCircle2,
    CircleAlert,
    CloudUpload,
    FileText,
    Loader2,
    Sparkles,
    Target,
    TrendingUp,
    X,
} from "lucide-react";

import {
    uploadResume,
    analyzeResume,
} from "../../services/resumeService";

import type {
    ResumeAnalysisData,
} from "../../services/resumeService";

import "../../styles/resume-upload.css";


/* =========================================================
   CAREERMIND AI
   RESUME UPLOAD + AI INTELLIGENCE
========================================================= */

export default function ResumeUpload() {

    /* =====================================================
       REFS
    ===================================================== */

    const inputRef =
        useRef<HTMLInputElement | null>(null);


    /* =====================================================
       STATE
    ===================================================== */

    const [file, setFile] =
        useState<File | null>(null);

    const [resumeId, setResumeId] =
        useState<string>("");

    const [uploading, setUploading] =
        useState(false);

    const [analyzing, setAnalyzing] =
        useState(false);

    const [dragActive, setDragActive] =
        useState(false);

    const [message, setMessage] =
        useState<string>("");

    const [messageType, setMessageType] =
        useState<
            "success" |
            "error" |
            "info"
        >("info");

    const [analysis, setAnalysis] =
        useState<ResumeAnalysisData | null>(
            null
        );


    /* =====================================================
       MESSAGE
    ===================================================== */

    const showMessage = (
        text: string,
        type:
            | "success"
            | "error"
            | "info"
    ) => {

        setMessage(text);
        setMessageType(type);
    };


    /* =====================================================
       ERROR MESSAGE
    ===================================================== */

    const getErrorMessage = (
        error: any
    ): string => {

        const detail =
            error?.response?.data?.detail;


        if (
            typeof detail ===
            "string"
        ) {
            return detail;
        }


        if (
            Array.isArray(detail)
        ) {

            const messages =
                detail
                    .map(
                        (item: any) =>
                            item?.msg
                    )
                    .filter(Boolean);


            if (
                messages.length > 0
            ) {

                return messages.join(
                    ", "
                );
            }
        }


        if (
            typeof error?.message ===
            "string"
        ) {

            return error.message;
        }


        return (
            "Something went wrong. Please try again."
        );
    };


    /* =====================================================
       PROCESS FILE
    ===================================================== */

    const processFile = (
        selectedFile: File
    ) => {

        setMessage("");

        setAnalysis(null);

        setResumeId("");


        /* -------------------------------------------------
           PDF CHECK
        ------------------------------------------------- */

        const isPdf =
            selectedFile.type ===
            "application/pdf" ||
            selectedFile.name
                .toLowerCase()
                .endsWith(".pdf");


        if (!isPdf) {

            setFile(null);

            showMessage(
                "Only PDF resumes are supported.",
                "error"
            );

            return;
        }


        /* -------------------------------------------------
           SIZE CHECK
           10 MB
        ------------------------------------------------- */

        const maxSize =
            10 * 1024 * 1024;


        if (
            selectedFile.size >
            maxSize
        ) {

            setFile(null);

            showMessage(
                "Resume file must be smaller than 10 MB.",
                "error"
            );

            return;
        }


        /* -------------------------------------------------
           SAVE FILE
        ------------------------------------------------- */

        setFile(
            selectedFile
        );


        showMessage(
            "Resume ready for upload.",
            "success"
        );
    };


    /* =====================================================
       FILE INPUT
    ===================================================== */

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {

        const selectedFile =
            event.target.files?.[0];


        if (!selectedFile) {
            return;
        }


        processFile(
            selectedFile
        );
    };


    /* =====================================================
       DRAG OVER
    ===================================================== */

    const handleDragOver = (
        event: DragEvent<HTMLLabelElement>
    ) => {

        event.preventDefault();

        event.stopPropagation();

        setDragActive(true);
    };


    /* =====================================================
       DRAG LEAVE
    ===================================================== */

    const handleDragLeave = (
        event: DragEvent<HTMLLabelElement>
    ) => {

        event.preventDefault();

        event.stopPropagation();

        setDragActive(false);
    };


    /* =====================================================
       DROP
    ===================================================== */

    const handleDrop = (
        event: DragEvent<HTMLLabelElement>
    ) => {

        event.preventDefault();

        event.stopPropagation();

        setDragActive(false);


        const droppedFile =
            event.dataTransfer.files?.[0];


        if (!droppedFile) {
            return;
        }


        processFile(
            droppedFile
        );
    };


    /* =====================================================
       REMOVE FILE
    ===================================================== */

    const removeFile = () => {

        setFile(null);

        setResumeId("");

        setAnalysis(null);

        setMessage("");


        if (
            inputRef.current
        ) {

            inputRef.current.value =
                "";
        }
    };


    /* =====================================================
       UPLOAD RESUME
    ===================================================== */

    const handleUpload = async () => {

        if (!file) {

            showMessage(
                "Please select your resume PDF first.",
                "error"
            );

            return;
        }


        if (
            uploading ||
            analyzing
        ) {
            return;
        }


        try {

            setUploading(true);


            showMessage(
                "Uploading your resume...",
                "info"
            );


            /* ---------------------------------------------
               CALL SERVICE
            --------------------------------------------- */

            const response =
                await uploadResume(
                    file
                );


            console.log(
                "CareerMind Resume Upload Response:",
                response
            );


            /* ---------------------------------------------
               CORRECT RESPONSE STRUCTURE
               
               response = {
                   resume: {
                       id: "..."
                   }
               }
            --------------------------------------------- */

            const id =
                response.resume.id;


            if (!id) {

                throw new Error(
                    "Resume uploaded, but no resume ID was returned by the server."
                );
            }


            /* ---------------------------------------------
               SAVE RESUME ID
            --------------------------------------------- */

            setResumeId(
                id
            );


            showMessage(
                "Resume uploaded successfully. You can now start AI analysis.",
                "success"
            );

        }
        catch (error: any) {

            console.error(
                "CareerMind Resume Upload Error:",
                error
            );


            showMessage(
                getErrorMessage(error),
                "error"
            );

        }
        finally {

            setUploading(false);
        }
    };


    /* =====================================================
       ANALYZE RESUME
    ===================================================== */

    const handleAnalyze = async () => {

        if (!resumeId) {

            showMessage(
                "Please upload your resume before starting AI analysis.",
                "error"
            );

            return;
        }


        if (
            uploading ||
            analyzing
        ) {
            return;
        }


        try {

            setAnalyzing(true);


            showMessage(
                "CareerMind AI is analyzing your resume...",
                "info"
            );


            /* ---------------------------------------------
               CALL SERVICE
            --------------------------------------------- */

            const result =
                await analyzeResume(
                    resumeId
                );


            console.log(
                "CareerMind AI Analysis:",
                result
            );


            /* ---------------------------------------------
               IMPORTANT

               analyzeResume() already returns
               ResumeAnalysisData.

               DO NOT call normalizeAnalysis().
            --------------------------------------------- */

            setAnalysis(
                result
            );


            showMessage(
                "AI resume analysis completed successfully.",
                "success"
            );

        }
        catch (error: any) {

            console.error(
                "CareerMind Resume Analysis Error:",
                error
            );


            showMessage(
                getErrorMessage(error),
                "error"
            );

        }
        finally {

            setAnalyzing(false);
        }
    };


    /* =====================================================
       SCORE LABEL
    ===================================================== */

    const getScoreLabel = (
        score:
            | number
            | null
            | undefined
    ) => {

        const value =
            Number(
                score ?? 0
            );


        if (
            value >= 85
        ) {

            return "Excellent";
        }


        if (
            value >= 70
        ) {

            return "Strong";
        }


        if (
            value >= 50
        ) {

            return "Needs Improvement";
        }


        return "Needs Attention";
    };


    /* =====================================================
       SAFE SCORES
    ===================================================== */

    const atsScore =
        Number(
            analysis?.ats_score ?? 0
        );


    const aiScore =
        Number(
            analysis?.ai_score ?? 0
        );


    /* =====================================================
       SAFE SKILLS
    ===================================================== */

    const detectedSkills =
        analysis?.skills_detected ??
        analysis?.skills ??
        analysis?.extracted_skills ??
        [];


    const missingSkills =
        analysis?.missing_skills ??
        analysis?.skill_gaps ??
        [];


    /* =====================================================
       CAREER RECOMMENDATION
    ===================================================== */

    const careerRole =
        analysis
            ?.career_recommendation
            ?.role ??
        analysis
            ?.career_direction ??
        analysis
            ?.career_recommendations?.[0] ??
        "Career path not available";


    const careerNextStep =
        analysis
            ?.career_recommendation
            ?.next_step ??
        analysis
            ?.recommendations?.[0] ??
        "Continue improving your skills and resume profile.";


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <section className="resume-intelligence">


            {/* =================================================
               HEADER
            ================================================= */}

            <div className="resume-intelligence-header">

                <div className="resume-title-group">

                    <div className="resume-ai-logo">

                        <BrainCircuit
                            size={24}
                        />

                    </div>


                    <div>

                        <span className="resume-eyebrow">

                            CAREERMIND AI

                        </span>


                        <h2>

                            Resume Intelligence

                        </h2>


                        <p>

                            Transform your resume
                            into actionable career
                            intelligence.

                        </p>

                    </div>

                </div>


                <div className="ai-status">

                    <span className="ai-status-dot" />

                    AI Engine Online

                </div>

            </div>


            {/* =================================================
               UPLOAD AREA
            ================================================= */}

            <label
                className={`
                    resume-dropzone
                    ${dragActive
                        ? "drag-active"
                        : ""
                    }
                    ${file
                        ? "has-file"
                        : ""
                    }
                `}
                onDragOver={
                    handleDragOver
                }
                onDragLeave={
                    handleDragLeave
                }
                onDrop={
                    handleDrop
                }
            >

                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={
                        handleFileChange
                    }
                    hidden
                />


                {!file ? (

                    <>

                        <div className="upload-icon-container">

                            <CloudUpload
                                size={32}
                            />

                        </div>


                        <h3>

                            Drop your resume here

                        </h3>


                        <p>

                            or click to browse
                            from your computer

                        </p>


                        <div className="upload-meta">

                            <span>

                                <FileText
                                    size={14}
                                />

                                PDF only

                            </span>


                            <span>

                                Maximum 10 MB

                            </span>


                            <span>

                                Secure processing

                            </span>

                        </div>

                    </>

                ) : (

                    <div className="selected-file">

                        <div className="selected-file-icon">

                            <FileText
                                size={28}
                            />

                        </div>


                        <div className="selected-file-info">

                            <strong>

                                {file.name}

                            </strong>


                            <span>

                                {(
                                    file.size /
                                    1024 /
                                    1024
                                ).toFixed(2)}

                                {" "}MB

                            </span>

                        </div>


                        <button
                            type="button"
                            className="remove-file"
                            aria-label="Remove resume"
                            onClick={(
                                event
                            ) => {

                                event.preventDefault();

                                event.stopPropagation();

                                removeFile();
                            }}
                        >

                            <X
                                size={18}
                            />

                        </button>

                    </div>

                )}

            </label>


            {/* =================================================
               ACTIONS
            ================================================= */}

            <div className="resume-action-bar">


                <button
                    type="button"
                    className="resume-primary-button"
                    onClick={
                        handleUpload
                    }
                    disabled={
                        !file ||
                        uploading ||
                        analyzing
                    }
                >

                    {uploading ? (

                        <>

                            <Loader2
                                size={18}
                                className="spin"
                            />

                            Uploading...

                        </>

                    ) : (

                        <>

                            <CloudUpload
                                size={18}
                            />

                            Upload Resume

                        </>

                    )}

                </button>


                <button
                    type="button"
                    className="resume-secondary-button"
                    onClick={
                        handleAnalyze
                    }
                    disabled={
                        !resumeId ||
                        uploading ||
                        analyzing
                    }
                >

                    {analyzing ? (

                        <>

                            <Loader2
                                size={18}
                                className="spin"
                            />

                            Analyzing...

                        </>

                    ) : (

                        <>

                            <Sparkles
                                size={18}
                            />

                            Analyze with AI

                        </>

                    )}

                </button>

            </div>


            {/* =================================================
               STATUS
            ================================================= */}

            {message && (

                <div
                    className={`
                        resume-status
                        ${messageType}
                    `}
                >

                    {messageType ===
                        "success" && (

                            <CheckCircle2
                                size={17}
                            />

                        )}


                    {messageType ===
                        "error" && (

                            <CircleAlert
                                size={17}
                            />

                        )}


                    {messageType ===
                        "info" && (

                            <Loader2
                                size={17}
                                className="spin"
                            />

                        )}


                    <span>

                        {message}

                    </span>

                </div>

            )}


            {/* =================================================
               ANALYSIS
            ================================================= */}

            {analysis && (

                <div className="resume-analysis">


                    {/* =========================================
                       REPORT HEADER
                    ========================================= */}

                    <div className="analysis-header">

                        <div>

                            <span className="analysis-eyebrow">

                                AI CAREER REPORT

                            </span>


                            <h3>

                                Resume Intelligence

                            </h3>


                            <p>

                                AI-generated insights
                                from your resume.

                            </p>

                        </div>


                        <div className="analysis-complete">

                            <CheckCircle2
                                size={16}
                            />

                            Analysis Complete

                        </div>

                    </div>


                    {/* =========================================
                       SCORE CARDS
                    ========================================= */}

                    <div className="resume-score-grid">


                        {/* ATS */}

                        <div className="resume-score-card">

                            <div className="score-card-top">

                                <div className="score-icon ats">

                                    <Target
                                        size={20}
                                    />

                                </div>


                                <span>

                                    ATS SCORE

                                </span>

                            </div>


                            <div className="score-value">

                                {atsScore}

                                <small>

                                    /100

                                </small>

                            </div>


                            <div className="score-bottom">

                                {getScoreLabel(
                                    atsScore
                                )}

                            </div>

                        </div>


                        {/* AI */}

                        <div className="resume-score-card">

                            <div className="score-card-top">

                                <div className="score-icon ai">

                                    <BrainCircuit
                                        size={20}
                                    />

                                </div>


                                <span>

                                    AI SCORE

                                </span>

                            </div>


                            <div className="score-value">

                                {aiScore}

                                <small>

                                    /100

                                </small>

                            </div>


                            <div className="score-bottom">

                                {getScoreLabel(
                                    aiScore
                                )}

                            </div>

                        </div>

                    </div>


                    {/* =========================================
                       SKILLS
                    ========================================= */}

                    <div className="analysis-section">

                        <div className="analysis-section-heading">

                            <TrendingUp
                                size={18}
                            />

                            <h4>

                                Skills Intelligence

                            </h4>

                        </div>


                        {/* DETECTED */}

                        <div className="skill-block">

                            <span className="skill-label detected">

                                Detected Skills

                            </span>


                            <div className="skills-list">

                                {detectedSkills.length >
                                    0 ? (

                                    detectedSkills.map(
                                        (
                                            skill,
                                            index
                                        ) => (

                                            <span
                                                className="skill-tag"
                                                key={
                                                    `${skill}-${index}`
                                                }
                                            >

                                                {skill}

                                            </span>

                                        )
                                    )

                                ) : (

                                    <span className="empty-skill">

                                        No skills detected.

                                    </span>

                                )}

                            </div>

                        </div>


                        {/* MISSING */}

                        <div className="skill-block">

                            <span className="skill-label missing">

                                Skill Gaps

                            </span>


                            <div className="skills-list">

                                {missingSkills.length >
                                    0 ? (

                                    missingSkills.map(
                                        (
                                            skill,
                                            index
                                        ) => (

                                            <span
                                                className="skill-tag missing-tag"
                                                key={
                                                    `${skill}-${index}`
                                                }
                                            >

                                                {skill}

                                            </span>

                                        )
                                    )

                                ) : (

                                    <span className="empty-skill">

                                        No major skill gaps detected.

                                    </span>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* =========================================
                       CAREER RECOMMENDATION
                    ========================================= */}

                    <div className="career-recommendation">

                        <div className="recommendation-icon">

                            <Sparkles
                                size={22}
                            />

                        </div>


                        <div className="recommendation-content">

                            <span>

                                AI CAREER RECOMMENDATION

                            </span>


                            <h4>

                                {careerRole}

                            </h4>


                            <p>

                                {careerNextStep}

                            </p>

                        </div>

                    </div>

                </div>

            )}

        </section>
    );
}