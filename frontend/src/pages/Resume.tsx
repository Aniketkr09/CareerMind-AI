/**
 * ============================================================
 * CareerMind AI
 *
 * Resume Intelligence Command Center
 *
 * Enterprise AI Career Workspace
 *
 * Backend Contract
 * ------------------------------------------------------------
 * POST /api/v1/resume/upload
 * GET  /api/v1/resume/latest
 * POST /api/v1/resume-analysis/{resume_id}
 *
 * ============================================================
 */

import {
    ChangeEvent,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    AlertCircle,
    ArrowDownRight,
    ArrowRight,
    Brain,
    BriefcaseBusiness,
    Check,
    CheckCircle2,
    ChevronRight,
    CircleDot,
    CloudUpload,
    Code2,
    Cpu,
    FileCheck2,
    FileText,
    GraduationCap,
    Lightbulb,
    Loader2,
    LockKeyhole,
    RefreshCw,
    Rocket,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    UploadCloud,
    Wrench,
    X,
    Zap,
} from "lucide-react";

import DashboardLayout from "../components/layouts/DashboardLayout";

import {
    getLatestResume,
    getResumeAnalysis,
    uploadResume,
    type ResumeAnalysisData,
    type ResumeResponse,
} from "../services/resumeService";

import "./resume.css";


/* ============================================================
   CONSTANTS
============================================================ */

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = [
    ".pdf",
    ".docx",
] as const;

const ACCEPTED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

type IntelligenceSection =
    | "overview"
    | "skills"
    | "career"
    | "gaps"
    | "evidence";


/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function Resume() {

    /* ========================================================
       CORE STATE
    ======================================================== */

    const [resume, setResume] =
        useState<ResumeResponse | null>(null);

    const [analysis, setAnalysis] =
        useState<ResumeAnalysisData | null>(null);

    const [selectedFile, setSelectedFile] =
        useState<File | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [uploading, setUploading] =
        useState(false);

    const [analyzing, setAnalyzing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [activeSection, setActiveSection] =
        useState<IntelligenceSection>("overview");

    const fileInputRef =
        useRef<HTMLInputElement | null>(null);


    /* ========================================================
       LOAD RESUME INTELLIGENCE
    ======================================================== */

    const loadResumeIntelligence =
        useCallback(async (): Promise<void> => {

            try {

                setLoading(true);
                setError("");

                const latestResume =
                    await getLatestResume();

                if (!latestResume?.id) {

                    setResume(null);
                    setAnalysis(null);

                    return;
                }

                setResume(latestResume);

                try {

                    const resumeAnalysis =
                        await getResumeAnalysis(
                            latestResume.id
                        );

                    setAnalysis(
                        resumeAnalysis ?? null
                    );

                } catch (analysisError) {

                    /*
                     * Resume can exist before analysis is ready.
                     * This is not treated as a fatal page error.
                     */

                    console.info(
                        "Resume analysis is not ready:",
                        analysisError
                    );

                    setAnalysis(null);
                }

            } catch (resumeError) {

                console.error(
                    "Failed to load resume intelligence:",
                    resumeError
                );

                setResume(null);
                setAnalysis(null);

                setError(
                    getErrorMessage(
                        resumeError,
                        "Unable to load your resume intelligence."
                    )
                );

            } finally {

                setLoading(false);
            }

        }, []);


    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {

        void loadResumeIntelligence();

    }, [loadResumeIntelligence]);


    /* ========================================================
       FILE VALIDATION
    ======================================================== */

    const validateFile =
        useCallback(
            (file: File): string | null => {

                const extension =
                    `.${file.name
                        .split(".")
                        .pop()
                        ?.toLowerCase()}`;

                const validExtension =
                    ACCEPTED_EXTENSIONS.includes(
                        extension as ".pdf" | ".docx"
                    );

                const validMime =
                    !file.type ||
                    ACCEPTED_MIME_TYPES.includes(
                        file.type as
                        | "application/pdf"
                        | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    );

                if (!validExtension) {

                    return (
                        "Unsupported file format. Upload a PDF or DOCX resume."
                    );
                }

                /*
                 * Some browsers do not provide a MIME type.
                 * Therefore MIME validation is only enforced
                 * when the browser provides one.
                 */

                if (!validMime) {

                    return (
                        "The selected file type does not match the resume format."
                    );
                }

                if (file.size <= 0) {

                    return (
                        "The selected resume appears to be empty."
                    );
                }

                if (file.size > MAX_FILE_SIZE) {

                    return (
                        "Resume size must be smaller than 10 MB."
                    );
                }

                return null;
            },
            []
        );


    /* ========================================================
       FILE SELECTION
    ======================================================== */

    const handleFileChange =
        (
            event: ChangeEvent<HTMLInputElement>
        ): void => {

            const file =
                event.target.files?.[0];

            setError("");
            setSuccess("");

            if (!file) {

                setSelectedFile(null);

                return;
            }

            const validationError =
                validateFile(file);

            if (validationError) {

                setSelectedFile(null);

                setError(
                    validationError
                );

                event.target.value = "";

                return;
            }

            setSelectedFile(file);
        };


    /* ========================================================
       UPLOAD + ANALYZE
    ======================================================== */

    const handleAnalyzeResume =
        async (): Promise<void> => {

            if (!selectedFile) {

                setError(
                    "Choose a resume before starting AI analysis."
                );

                return;
            }

            try {

                setUploading(true);

                setError("");
                setSuccess("");

                /*
                 * ------------------------------------------------
                 * STEP 1
                 * Upload resume.
                 * ------------------------------------------------
                 */

                const uploadResponse =
                    await uploadResume(
                        selectedFile
                    );

                const uploadedResume =
                    uploadResponse?.resume;

                if (!uploadedResume?.id) {

                    throw new Error(
                        "Resume upload completed, but no resume ID was returned by the backend."
                    );
                }

                setResume(
                    uploadedResume
                );

                setAnalysis(null);

                setSelectedFile(null);

                if (fileInputRef.current) {

                    fileInputRef.current.value = "";
                }

                setSuccess(
                    "Resume uploaded successfully. CareerMind AI is preparing your intelligence profile."
                );

                /*
                 * ------------------------------------------------
                 * STEP 2
                 * Request AI analysis.
                 * ------------------------------------------------
                 */

                setUploading(false);
                setAnalyzing(true);

                const resumeAnalysis =
                    await getResumeAnalysis(
                        uploadedResume.id
                    );

                setAnalysis(
                    resumeAnalysis ?? null
                );

                setSuccess(
                    "Career intelligence generated successfully."
                );

            } catch (analysisOrUploadError) {

                console.error(
                    "Resume intelligence pipeline failed:",
                    analysisOrUploadError
                );

                setError(
                    getErrorMessage(
                        analysisOrUploadError,
                        "CareerMind could not complete resume analysis."
                    )
                );

            } finally {

                setUploading(false);
                setAnalyzing(false);
            }
        };


    /* ========================================================
       REFRESH
    ======================================================== */

    const handleRefresh =
        async (): Promise<void> => {

            setError("");
            setSuccess("");

            await loadResumeIntelligence();
        };


    /* ========================================================
       DERIVED SKILLS
    ======================================================== */

    const allSkills =
        useMemo<string[]>(() => {

            if (!analysis?.skills) {

                return [];
            }

            return Array.from(
                new Set([
                    ...(analysis.skills.technical_skills ?? []),
                    ...(analysis.skills.programming_languages ?? []),
                    ...(analysis.skills.frameworks ?? []),
                    ...(analysis.skills.tools ?? []),
                ])
            );

        }, [analysis]);


    /* ========================================================
       PROFILE SIGNALS
    ======================================================== */

    const skillCoverage =
        useMemo(() => {

            if (!allSkills.length) {

                return 0;
            }

            /*
             * This is a visual capability signal.
             * It is NOT an official backend AI score.
             */

            return Math.min(
                100,
                Math.round(
                    allSkills.length * 5
                )
            );

        }, [allSkills]);


    const careerReadiness =
        useMemo(() => {

            if (!analysis) {

                return 0;
            }

            /*
             * Derived UI signal.
             *
             * Backend-provided:
             * - ATS score
             * - AI score
             *
             * Frontend-derived:
             * - skill coverage
             */

            return Math.round(
                (
                    Number(
                        analysis.ats_score ?? 0
                    ) +
                    Number(
                        analysis.ai_score ?? 0
                    ) +
                    skillCoverage
                ) / 3
            );

        }, [
            analysis,
            skillCoverage,
        ]);


    const qualityLabel =
        getScoreLabel(
            careerReadiness
        );


    /* ========================================================
       PROFILE COUNTS
    ======================================================== */

    const experienceCount =
        analysis?.experience?.length ?? 0;

    const educationCount =
        analysis?.education?.length ?? 0;

    const projectCount =
        analysis?.projects?.length ?? 0;

    const wordCount =
        Number(
            analysis?.word_count ?? 0
        );


    /* ========================================================
       SECTION NAVIGATION
    ======================================================== */

    const scrollToSection =
        (
            section: IntelligenceSection
        ): void => {

            setActiveSection(section);

            document
                .getElementById(section)
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
        };


    /* ========================================================
       LOADING SCREEN
    ======================================================== */

    if (loading) {

        return (

            <DashboardLayout>

                <div className="resume-loading-screen">

                    <div className="resume-loading-core">

                        <div className="resume-loading-orb">

                            <Brain size={34} />

                        </div>

                        <div>

                            <span>
                                CAREERMIND AI
                            </span>

                            <h2>
                                Initializing intelligence
                            </h2>

                            <p>
                                Connecting your professional
                                profile to the CareerMind
                                analysis engine.
                            </p>

                        </div>

                    </div>

                    <div className="resume-loading-track">

                        <div />

                    </div>

                </div>

            </DashboardLayout>
        );
    }


    /* ========================================================
       MAIN VIEW
    ======================================================== */

    return (

        <DashboardLayout>

            <main className="resume-page">


                {/* ==================================================
                    COMMAND HEADER
                ================================================== */}

                <header className="resume-command-bar">

                    <div className="command-brand">

                        <div className="command-brand-icon">

                            <Sparkles size={19} />

                        </div>

                        <div>

                            <span>
                                CAREERMIND AI
                            </span>

                            <strong>
                                Resume Intelligence
                            </strong>

                        </div>

                    </div>


                    <div className="command-status">

                        <span className="live-dot" />

                        Intelligence Engine Online

                    </div>


                    <button
                        type="button"
                        className="refresh-intelligence"
                        onClick={handleRefresh}
                        disabled={
                            uploading ||
                            analyzing
                        }
                    >

                        <RefreshCw size={16} />

                        Refresh

                    </button>

                </header>


                {/* ==================================================
                    HERO
                ================================================== */}

                <section className="resume-hero">

                    <div className="resume-hero-copy">

                        <span className="resume-badge">

                            <Sparkles size={15} />

                            AI RESUME INTELLIGENCE

                        </span>


                        <h1>

                            Your career.

                            <br />

                            <span>
                                Decoded by intelligence.
                            </span>

                        </h1>


                        <p>

                            CareerMind AI converts your resume
                            into a structured career intelligence
                            profile — helping you understand
                            your strengths, skills, opportunities
                            and next professional moves.

                        </p>


                        <div className="hero-trust">

                            <span>

                                <ShieldCheck size={15} />

                                Secure analysis

                            </span>

                            <span>

                                <Cpu size={15} />

                                AI-powered

                            </span>

                            <span>

                                <Target size={15} />

                                Career focused

                            </span>

                        </div>

                    </div>


                    {/* ==============================================
                        HERO INTELLIGENCE CARD
                    ============================================== */}

                    <div className="resume-hero-intelligence">

                        <div className="hero-intelligence-glow" />

                        <div className="hero-intelligence-card">

                            <div className="hero-intelligence-top">

                                <span>
                                    LIVE PROFILE
                                </span>

                                <span className="connected-state">

                                    <CircleDot size={12} />

                                    Connected

                                </span>

                            </div>


                            <div className="hero-score">

                                <div>

                                    <strong>

                                        {analysis
                                            ? careerReadiness
                                            : "--"}

                                    </strong>

                                    <span>
                                        /100
                                    </span>

                                </div>

                                <div>

                                    <small>
                                        CAREER READINESS
                                    </small>

                                    <p>

                                        {analysis
                                            ? qualityLabel
                                            : "Awaiting analysis"}

                                    </p>

                                </div>

                            </div>


                            <div className="hero-signal">

                                <span />

                            </div>


                            <div className="hero-intelligence-footer">

                                <div>

                                    <span>
                                        AI SIGNALS
                                    </span>

                                    <strong>
                                        {allSkills.length}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        PROJECTS
                                    </span>

                                    <strong>
                                        {projectCount}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        WORDS
                                    </span>

                                    <strong>
                                        {wordCount}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    ALERTS
                ================================================== */}

                {error && (

                    <div
                        className="resume-alert resume-alert-error"
                        role="alert"
                    >

                        <AlertCircle size={18} />

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Close error"
                        >

                            <X size={17} />

                        </button>

                    </div>
                )}


                {success && (

                    <div
                        className="resume-alert resume-alert-success"
                        role="status"
                    >

                        <CheckCircle2 size={18} />

                        <span>
                            {success}
                        </span>

                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            aria-label="Close success"
                        >

                            <X size={17} />

                        </button>

                    </div>
                )}


                {/* ==================================================
                    INTELLIGENCE NAVIGATION
                ================================================== */}

                {analysis && (

                    <nav
                        className="intelligence-nav"
                        aria-label="Resume intelligence sections"
                    >

                        {(
                            [
                                ["overview", "Overview"],
                                ["skills", "Skills"],
                                ["career", "Career"],
                                ["gaps", "Skill Gaps"],
                                ["evidence", "Evidence"],
                            ] as const
                        ).map(
                            ([id, label]) => (

                                <button
                                    key={id}
                                    type="button"
                                    className={
                                        activeSection === id
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        scrollToSection(id)
                                    }
                                >

                                    {label}

                                </button>
                            )
                        )}

                    </nav>
                )}


                {/* ==================================================
                    UPLOAD WORKSPACE
                ================================================== */}

                <section className="resume-upload-workspace">

                    <div className="workspace-heading">

                        <div>

                            <span>
                                PROFESSIONAL DATASET
                            </span>

                            <h2>
                                {resume
                                    ? "Update your intelligence profile"
                                    : "Build your intelligence profile"}
                            </h2>

                            <p>
                                Upload your latest resume to
                                refresh your CareerMind profile.
                            </p>

                        </div>


                        <div className="workspace-engine">

                            <span />

                            AI ENGINE READY

                        </div>

                    </div>


                    <div className="upload-grid">


                        {/* ==========================================
                            UPLOAD ZONE
                        ========================================== */}

                        <div className="upload-zone">

                            <div className="upload-zone-icon">

                                {uploading || analyzing ? (

                                    <Loader2
                                        size={32}
                                        className="spin"
                                    />

                                ) : (

                                    <UploadCloud size={32} />

                                )}

                            </div>


                            <h3>

                                {selectedFile
                                    ? selectedFile.name
                                    : resume
                                        ? "Replace your current resume"
                                        : "Upload your resume"}

                            </h3>


                            <p>

                                {selectedFile
                                    ? `${formatFileSize(
                                        selectedFile.size
                                    )} · Ready for AI analysis`
                                    : "PDF or DOCX · Maximum 10 MB"}

                            </p>


                            <div className="upload-actions">

                                <label className="resume-file-button">

                                    <CloudUpload size={17} />

                                    Choose Resume

                                    <input
                                        ref={fileInputRef}
                                        hidden
                                        type="file"
                                        accept=".pdf,.docx"
                                        onChange={
                                            handleFileChange
                                        }
                                        disabled={
                                            uploading ||
                                            analyzing
                                        }
                                    />

                                </label>


                                {selectedFile && (

                                    <button
                                        type="button"
                                        className="analyze-button"
                                        onClick={
                                            handleAnalyzeResume
                                        }
                                        disabled={
                                            uploading ||
                                            analyzing
                                        }
                                    >

                                        {uploading ||
                                            analyzing ? (

                                            <>
                                                <Loader2
                                                    size={17}
                                                    className="spin"
                                                />

                                                {uploading
                                                    ? "Uploading..."
                                                    : "Analyzing..."}
                                            </>

                                        ) : (

                                            <>
                                                <Sparkles size={17} />

                                                Analyze Resume

                                                <ArrowRight size={16} />
                                            </>
                                        )}

                                    </button>
                                )}

                            </div>


                            <div className="upload-security">

                                <LockKeyhole size={14} />

                                Authenticated CareerMind
                                session protected.

                            </div>

                        </div>


                        {/* ==========================================
                            ACTIVE RESUME
                        ========================================== */}

                        {resume && (

                            <div className="active-resume-card">

                                <div className="active-resume-top">

                                    <span>
                                        ACTIVE DATASET
                                    </span>

                                    <span className="dataset-connected">

                                        <CheckCircle2 size={13} />

                                        Connected

                                    </span>

                                </div>


                                <div className="active-file">

                                    <div className="active-file-icon">

                                        <FileText size={25} />

                                    </div>

                                    <div>

                                        <strong>
                                            {resume.original_filename}
                                        </strong>

                                        <span>
                                            {resume.file_type
                                                ?.toUpperCase()}
                                        </span>

                                    </div>

                                </div>


                                <div className="active-file-meta">

                                    <div>

                                        <span>
                                            STATUS
                                        </span>

                                        <strong>

                                            {analysis
                                                ? "Analyzed"
                                                : resume.is_processed
                                                    ? "Processed"
                                                    : "Processing"}

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            UPLOADED
                                        </span>

                                        <strong>

                                            {resume.created_at
                                                ? formatDate(
                                                    resume.created_at
                                                )
                                                : "—"}

                                        </strong>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={
                                        uploading ||
                                        analyzing
                                    }
                                >

                                    <RefreshCw size={15} />

                                    Replace Resume

                                </button>

                            </div>
                        )}

                    </div>

                </section>


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {!analysis && (

                    <section className="resume-empty-state">

                        <div className="empty-state-icon">

                            <Brain size={38} />

                        </div>

                        <span>
                            AI INTELLIGENCE WAITING
                        </span>

                        <h2>
                            Your professional profile
                            is ready to be decoded.
                        </h2>

                        <p>
                            Upload and analyze your resume to
                            unlock ATS intelligence, skill mapping,
                            career direction, skill gaps and
                            AI-powered recommendations.
                        </p>


                        {!resume && (

                            <button
                                type="button"
                                onClick={() =>
                                    document
                                        .querySelector(
                                            ".upload-zone"
                                        )
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                        })
                                }
                            >

                                <UploadCloud size={17} />

                                Start With My Resume

                                <ArrowRight size={16} />

                            </button>
                        )}

                    </section>
                )}


                {analysis && (

                    <>

                        {/* ==================================================
                            OVERVIEW
                        ================================================== */}

                        <section
                            id="overview"
                            className="intelligence-section"
                        >

                            <SectionHeading
                                eyebrow="CAREER READINESS INDEX"
                                title="Your professional signal"
                                description="CareerMind combines the strongest available signals from your resume to understand your current career positioning."
                            />


                            <div className="score-grid">

                                <ScoreCard
                                    icon={<FileCheck2 />}
                                    label="ATS Compatibility"
                                    value={
                                        Number(
                                            analysis.ats_score ?? 0
                                        )
                                    }
                                    description="Recruiter system compatibility"
                                />


                                <ScoreCard
                                    icon={<Brain />}
                                    label="AI Resume Quality"
                                    value={
                                        Number(
                                            analysis.ai_score ?? 0
                                        )
                                    }
                                    description="Content intelligence"
                                />


                                <ScoreCard
                                    icon={<Code2 />}
                                    label="Skill Coverage"
                                    value={
                                        skillCoverage
                                    }
                                    description={`${allSkills.length} capabilities detected`}
                                />


                                <ScoreCard
                                    icon={<Rocket />}
                                    label="Career Readiness"
                                    value={
                                        careerReadiness
                                    }
                                    description={
                                        "Derived profile signal"
                                    }
                                />

                            </div>


                            <div className="profile-snapshot">

                                <div className="snapshot-main">

                                    <div className="snapshot-score">

                                        <strong>
                                            {careerReadiness}
                                        </strong>

                                        <span>
                                            /100
                                        </span>

                                    </div>


                                    <div>

                                        <span>
                                            CAREER READINESS
                                        </span>

                                        <h3>
                                            {qualityLabel}
                                        </h3>

                                        <p>
                                            Your profile currently
                                            shows measurable signals
                                            across resume quality,
                                            ATS compatibility and
                                            technical evidence.
                                        </p>

                                    </div>

                                </div>


                                <div className="snapshot-metrics">

                                    <Metric
                                        label="Skills"
                                        value={
                                            allSkills.length
                                        }
                                    />

                                    <Metric
                                        label="Projects"
                                        value={
                                            projectCount
                                        }
                                    />

                                    <Metric
                                        label="Experience"
                                        value={
                                            experienceCount
                                        }
                                    />

                                    <Metric
                                        label="Education"
                                        value={
                                            educationCount
                                        }
                                    />

                                </div>

                            </div>

                        </section>


                        {/* ==================================================
                            EXECUTIVE INSIGHT
                        ================================================== */}

                        <section className="ai-executive-card">

                            <div className="executive-icon">

                                <Sparkles size={25} />

                            </div>

                            <div className="executive-content">

                                <span>
                                    CAREERMIND INTELLIGENCE
                                </span>

                                <h2>
                                    Executive Resume Insight
                                </h2>

                                <p>
                                    {analysis.summary ||
                                        "CareerMind has analyzed your professional profile and generated your current intelligence signal."}
                                </p>

                            </div>

                        </section>


                        {/* ==================================================
                            CAREER
                        ================================================== */}

                        <section
                            id="career"
                            className="intelligence-section"
                        >

                            <SectionHeading
                                eyebrow="AI CAREER DIRECTION"
                                title="Where your profile can go next"
                                description="CareerMind identifies the strongest career direction from the technical and professional evidence available in your resume."
                            />


                            {analysis.career_recommendation ? (

                                <div className="career-direction">

                                    <div className="career-direction-main">

                                        <div className="career-direction-icon">

                                            <Rocket size={30} />

                                        </div>

                                        <div>

                                            <span>
                                                RECOMMENDED DIRECTION
                                            </span>

                                            <h2>
                                                {
                                                    analysis
                                                        .career_recommendation
                                                        .role
                                                }
                                            </h2>

                                            <p>
                                                This direction is
                                                supported by your
                                                current technical
                                                evidence, projects
                                                and professional
                                                signals.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="career-next-move">

                                        <span>
                                            NEXT BEST MOVE
                                        </span>

                                        <strong>
                                            {
                                                analysis
                                                    .career_recommendation
                                                    .next_step
                                            }
                                        </strong>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                scrollToSection(
                                                    "gaps"
                                                )
                                            }
                                        >

                                            Explore Next Skills

                                            <ArrowRight size={16} />

                                        </button>

                                    </div>

                                </div>

                            ) : (

                                <EmptyPanel
                                    icon={<Target />}
                                    title="Career direction unavailable"
                                    text="Career direction will appear when the backend returns a career recommendation."
                                />

                            )}

                        </section>


                        {/* ==================================================
                            SKILLS
                        ================================================== */}

                        <section
                            id="skills"
                            className="intelligence-section"
                        >

                            <SectionHeading
                                eyebrow="AI SKILL GRAPH"
                                title="Your technical DNA"
                                description="Capabilities detected across your professional profile and organized into useful intelligence groups."
                            />


                            <div className="skill-overview">

                                <div className="skill-total">

                                    <span>
                                        DETECTED SKILLS
                                    </span>

                                    <strong>
                                        {allSkills.length}
                                    </strong>

                                    <p>
                                        Unique capabilities
                                        identified by CareerMind.
                                    </p>

                                </div>


                                <SkillStat
                                    icon={<Code2 />}
                                    label="Programming"
                                    value={
                                        analysis.skills
                                            ?.programming_languages
                                            ?.length ?? 0
                                    }
                                />


                                <SkillStat
                                    icon={<Brain />}
                                    label="Technical"
                                    value={
                                        analysis.skills
                                            ?.technical_skills
                                            ?.length ?? 0
                                    }
                                />


                                <SkillStat
                                    icon={<BriefcaseBusiness />}
                                    label="Frameworks"
                                    value={
                                        analysis.skills
                                            ?.frameworks
                                            ?.length ?? 0
                                    }
                                />


                                <SkillStat
                                    icon={<Wrench />}
                                    label="Tools"
                                    value={
                                        analysis.skills
                                            ?.tools
                                            ?.length ?? 0
                                    }
                                />

                            </div>


                            <div className="skill-groups-grid">

                                <SkillGroup
                                    title="Programming Languages"
                                    icon={<Code2 />}
                                    skills={
                                        analysis.skills
                                            ?.programming_languages ?? []
                                    }
                                />

                                <SkillGroup
                                    title="AI & Technical Skills"
                                    icon={<Brain />}
                                    skills={
                                        analysis.skills
                                            ?.technical_skills ?? []
                                    }
                                />

                                <SkillGroup
                                    title="Frameworks"
                                    icon={<BriefcaseBusiness />}
                                    skills={
                                        analysis.skills
                                            ?.frameworks ?? []
                                    }
                                />

                                <SkillGroup
                                    title="Tools & Platforms"
                                    icon={<Wrench />}
                                    skills={
                                        analysis.skills
                                            ?.tools ?? []
                                    }
                                />

                            </div>

                        </section>


                        {/* ==================================================
                            SKILL GAPS
                        ================================================== */}

                        <section
                            id="gaps"
                            className="intelligence-section"
                        >

                            <SectionHeading
                                eyebrow="SKILL GAP INTELLIGENCE"
                                title="What to unlock next"
                                description="These capabilities can strengthen your competitiveness for the career direction identified by CareerMind."
                            />


                            {analysis.missing_skills?.length ? (

                                <div className="gap-grid">

                                    {analysis.missing_skills.map(
                                        (
                                            skill,
                                            index
                                        ) => (

                                            <article
                                                className="gap-card"
                                                key={`${skill}-${index}`}
                                            >

                                                <div className="gap-number">

                                                    {String(
                                                        index + 1
                                                    ).padStart(
                                                        2,
                                                        "0"
                                                    )}

                                                </div>


                                                <div className="gap-icon">

                                                    <TrendingUp
                                                        size={18}
                                                    />

                                                </div>


                                                <div className="gap-content">

                                                    <span>
                                                        RECOMMENDED CAPABILITY
                                                    </span>

                                                    <h3>
                                                        {skill}
                                                    </h3>

                                                    <p>
                                                        Developing this
                                                        capability can
                                                        strengthen your
                                                        target-role
                                                        readiness.
                                                    </p>

                                                </div>


                                                <ChevronRight
                                                    size={18}
                                                />

                                            </article>
                                        )
                                    )}

                                </div>

                            ) : (

                                <EmptyPanel
                                    icon={<CheckCircle2 />}
                                    title="Strong skill alignment"
                                    text="No major missing skills were returned by the current CareerMind analysis."
                                />

                            )}

                        </section>


                        {/* ==================================================
                            EVIDENCE
                        ================================================== */}

                        <section
                            id="evidence"
                            className="intelligence-section"
                        >

                            <SectionHeading
                                eyebrow="PROFESSIONAL FINGERPRINT"
                                title="How CareerMind sees your profile"
                                description="Structural evidence extracted from the resume and converted into measurable profile signals."
                            />


                            <div className="evidence-grid">

                                <EvidenceCard
                                    icon={<BriefcaseBusiness />}
                                    title="Experience"
                                    value={
                                        experienceCount
                                    }
                                    label="sections detected"
                                />

                                <EvidenceCard
                                    icon={<GraduationCap />}
                                    title="Education"
                                    value={
                                        educationCount
                                    }
                                    label="entries detected"
                                />

                                <EvidenceCard
                                    icon={<Rocket />}
                                    title="Projects"
                                    value={
                                        projectCount
                                    }
                                    label="projects detected"
                                />

                                <EvidenceCard
                                    icon={<FileText />}
                                    title="Resume Content"
                                    value={
                                        wordCount
                                    }
                                    label="words analyzed"
                                />

                            </div>


                            <div className="insights-grid">

                                <InsightPanel
                                    title="Professional Strengths"
                                    icon={<CheckCircle2 />}
                                    items={
                                        analysis
                                            .career_insights
                                            ?.strengths ?? []
                                    }
                                    positive
                                />


                                <InsightPanel
                                    title="Growth Signals"
                                    icon={<TrendingUp />}
                                    items={
                                        analysis
                                            .career_insights
                                            ?.weaknesses ?? []
                                    }
                                />


                                <InsightPanel
                                    title="AI Recommendations"
                                    icon={<Lightbulb />}
                                    items={
                                        analysis
                                            .career_insights
                                            ?.recommendations ?? []
                                    }
                                />

                            </div>

                        </section>


                        {/* ==================================================
                            CAREER ACTION CENTER
                        ================================================== */}

                        <section className="career-action-center">

                            <div className="action-center-glow" />

                            <div className="action-center-icon">

                                <Zap size={26} />

                            </div>

                            <span>
                                CAREERMIND AI COPILOT
                            </span>

                            <h2>
                                Your profile has a direction.
                            </h2>

                            <p>
                                Turn your resume intelligence
                                into your next career move.
                            </p>


                            <div className="action-center-buttons">

                                <button
                                    type="button"
                                    onClick={() =>
                                        scrollToSection(
                                            "gaps"
                                        )
                                    }
                                >

                                    <Target size={17} />

                                    Build My Career Plan

                                    <ArrowRight size={16} />

                                </button>


                                <button
                                    type="button"
                                    className="secondary-action"
                                    onClick={() =>
                                        scrollToSection(
                                            "skills"
                                        )
                                    }
                                >

                                    <Brain size={17} />

                                    Explore My Skills

                                </button>

                            </div>

                        </section>

                    </>
                )}


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <footer className="resume-footer">

                    <div>

                        <div className="footer-brand">

                            <div>

                                <Sparkles size={16} />

                            </div>

                            <strong>
                                CareerMind AI
                            </strong>

                        </div>

                        <span>
                            AI Career Intelligence Platform
                        </span>

                    </div>


                    <div className="footer-status">

                        <span className="live-dot" />

                        Intelligence Engine Operational

                    </div>


                    <span>
                        Analyze. Improve. Build. Advance.
                    </span>

                </footer>

            </main>

        </DashboardLayout>
    );
}


/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {

    return (

        <div className="section-heading">

            <span>
                {eyebrow}
            </span>

            <h2>
                {title}
            </h2>

            <p>
                {description}
            </p>

        </div>
    );
}


/* ============================================================
   SCORE CARD
============================================================ */

function ScoreCard({
    icon,
    label,
    value,
    description,
}: {
    icon: ReactNode;
    label: string;
    value: number;
    description: string;
}) {

    const safeValue =
        Math.min(
            100,
            Math.max(
                0,
                Number(value) || 0
            )
        );

    return (

        <article className="score-card">

            <div className="score-card-header">

                <div className="score-icon">
                    {icon}
                </div>

                <span>
                    {label}
                </span>

            </div>


            <div className="score-value">

                <strong>
                    {Math.round(safeValue)}
                </strong>

                <span>
                    /100
                </span>

            </div>


            <div className="score-track">

                <div
                    style={{
                        width: `${safeValue}%`,
                    }}
                />

            </div>


            <div className="score-description">

                <span>
                    {getScoreLabel(safeValue)}
                </span>

                <small>
                    {description}
                </small>

            </div>

        </article>
    );
}


/* ============================================================
   METRIC
============================================================ */

function Metric({
    label,
    value,
}: {
    label: string;
    value: number;
}) {

    return (

        <div className="snapshot-metric">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


/* ============================================================
   SKILL STAT
============================================================ */

function SkillStat({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: number;
}) {

    return (

        <div className="skill-stat">

            <div className="skill-stat-icon">

                {icon}

            </div>

            <strong>
                {value}
            </strong>

            <span>
                {label}
            </span>

        </div>
    );
}


/* ============================================================
   SKILL GROUP
============================================================ */

function SkillGroup({
    title,
    icon,
    skills,
}: {
    title: string;
    icon: ReactNode;
    skills: string[];
}) {

    if (!skills?.length) {

        return null;
    }

    return (

        <article className="skill-group">

            <div className="skill-group-header">

                <div className="skill-group-icon">

                    {icon}

                </div>

                <div>

                    <span>
                        CAPABILITY GROUP
                    </span>

                    <h3>
                        {title}
                    </h3>

                </div>

                <strong>
                    {skills.length}
                </strong>

            </div>


            <div className="skill-tags">

                {skills.map(
                    (
                        skill,
                        index
                    ) => (

                        <span
                            key={`${skill}-${index}`}
                        >

                            <Check size={12} />

                            {skill}

                        </span>
                    )
                )}

            </div>

        </article>
    );
}


/* ============================================================
   EVIDENCE CARD
============================================================ */

function EvidenceCard({
    icon,
    title,
    value,
    label,
}: {
    icon: ReactNode;
    title: string;
    value: number;
    label: string;
}) {

    return (

        <article className="evidence-card">

            <div className="evidence-icon">
                {icon}
            </div>

            <span>
                {title}
            </span>

            <strong>
                {value}
            </strong>

            <small>
                {label}
            </small>

        </article>
    );
}


/* ============================================================
   INSIGHT PANEL
============================================================ */

function InsightPanel({
    title,
    icon,
    items,
    positive = false,
}: {
    title: string;
    icon: ReactNode;
    items: string[];
    positive?: boolean;
}) {

    return (

        <article className="insight-panel">

            <div className="insight-header">

                <div className="insight-icon">
                    {icon}
                </div>

                <h3>
                    {title}
                </h3>

            </div>


            {items?.length ? (

                <ul>

                    {items
                        .slice(0, 6)
                        .map(
                            (
                                item,
                                index
                            ) => (

                                <li
                                    key={`${item}-${index}`}
                                >

                                    <span
                                        className={
                                            positive
                                                ? "insight-check"
                                                : "insight-bullet"
                                        }
                                    >

                                        {positive ? (

                                            <CheckCircle2
                                                size={14}
                                            />

                                        ) : (

                                            <ArrowDownRight
                                                size={14}
                                            />

                                        )}

                                    </span>

                                    <span>
                                        {item}
                                    </span>

                                </li>
                            )
                        )}

                </ul>

            ) : (

                <div className="insight-empty">

                    <CircleDot size={15} />

                    <span>
                        No additional intelligence returned.
                    </span>

                </div>

            )}

        </article>
    );
}


/* ============================================================
   EMPTY PANEL
============================================================ */

function EmptyPanel({
    icon,
    title,
    text,
}: {
    icon: ReactNode;
    title: string;
    text: string;
}) {

    return (

        <div className="intelligence-empty-panel">

            <div>
                {icon}
            </div>

            <h3>
                {title}
            </h3>

            <p>
                {text}
            </p>

        </div>
    );
}


/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(
    value: string
): string {

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}


/* ============================================================
   FILE SIZE FORMATTER
============================================================ */

function formatFileSize(
    bytes: number
): string {

    if (bytes < 1024) {

        return `${bytes} B`;
    }

    if (
        bytes <
        1024 * 1024
    ) {

        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}


/* ============================================================
   SCORE LABEL
============================================================ */

function getScoreLabel(
    score: number
): string {

    if (score >= 90) {

        return "Exceptional";
    }

    if (score >= 80) {

        return "Strong";
    }

    if (score >= 70) {

        return "Good";
    }

    if (score >= 50) {

        return "Developing";
    }

    return "Needs improvement";
}


/* ============================================================
   ERROR HANDLER
============================================================ */

function getErrorMessage(
    error: unknown,
    fallback: string
): string {

    if (
        error instanceof Error &&
        error.message
    ) {

        return error.message;
    }

    /*
     * Axios-compatible error handling without
     * coupling this component directly to Axios.
     */

    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {

        const response =
            (
                error as {
                    response?: {
                        data?: {
                            detail?: string;
                            message?: string;
                        };
                    };
                }
            ).response;

        const detail =
            response?.data?.detail ??
            response?.data?.message;

        if (detail) {

            return detail;
        }
    }

    return fallback;
}