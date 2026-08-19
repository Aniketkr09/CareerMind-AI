/**
 * ============================================================
 * CareerMind AI
 *
 * HOME / PUBLIC LANDING PAGE
 *
 * AI Career Intelligence Platform
 *
 * Core product capabilities:
 * - Resume Intelligence
 * - ATS Optimization
 * - Skill Intelligence
 * - Skill Gap Detection
 * - Career Recommendations
 * - Learning Roadmap
 * - AI Interview Preparation
 *
 * Public routes:
 * /        -> Home
 * /login   -> Login
 * /register -> Register
 * ============================================================
 */

import {
    ArrowRight,
    BarChart3,
    BrainCircuit,
    BriefcaseBusiness,
    Check,
    ChevronRight,
    CircleCheck,
    FileSearch,
    Gauge,
    GraduationCap,
    Layers3,
    LockKeyhole,
    Menu,
    Network,
    Play,
    Route,
    Search,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    UserRound,
    UsersRound,
    X,
    Zap,
} from "lucide-react";

import {
    useState,
    type ReactNode,
} from "react";

import {
    Link,
} from "react-router-dom";

import "./home.css";


/* ============================================================
   TYPES
============================================================ */

interface Feature {
    icon: ReactNode;
    eyebrow: string;
    title: string;
    description: string;
    tag: string;
}

interface Step {
    number: string;
    icon: ReactNode;
    title: string;
    description: string;
}


/* ============================================================
   FEATURE DATA
============================================================ */

const FEATURES: Feature[] = [

    {
        icon: <FileSearch />,
        eyebrow: "01 / RESUME INTELLIGENCE",
        title: "Turn your resume into career intelligence.",
        description:
            "Upload your resume and transform unstructured professional experience into a structured profile of skills, experience and career signals.",
        tag: "AI Resume Analysis",
    },

    {
        icon: <Gauge />,
        eyebrow: "02 / ATS INTELLIGENCE",
        title: "Understand how your resume performs.",
        description:
            "Analyze resume quality, discover missing signals and identify opportunities to make your profile stronger for modern hiring systems.",
        tag: "ATS Optimization",
    },

    {
        icon: <Network />,
        eyebrow: "03 / SKILL INTELLIGENCE",
        title: "See what you actually know.",
        description:
            "Build a structured view of your technical capabilities and understand which skills are strongest, developing or missing.",
        tag: "Skill Extraction",
    },

    {
        icon: <Target />,
        eyebrow: "04 / GAP INTELLIGENCE",
        title: "Know what is holding your career back.",
        description:
            "Identify the highest-impact capability gaps between your current profile and the career direction you want to pursue.",
        tag: "Skill Gap Detection",
    },

    {
        icon: <BriefcaseBusiness />,
        eyebrow: "05 / CAREER INTELLIGENCE",
        title: "Discover roles that fit your trajectory.",
        description:
            "Connect your experience, skills and interests with potential career directions instead of relying on generic job recommendations.",
        tag: "Career Recommendations",
    },

    {
        icon: <Route />,
        eyebrow: "06 / GROWTH INTELLIGENCE",
        title: "Convert gaps into an execution plan.",
        description:
            "Create a practical learning roadmap around the capabilities, projects and milestones that matter for your target direction.",
        tag: "Learning Roadmap",
    },

    {
        icon: <UsersRound />,
        eyebrow: "07 / INTERVIEW INTELLIGENCE",
        title: "Prepare for the conversation that matters.",
        description:
            "Practice technical and behavioral questions around your professional profile and target career direction.",
        tag: "AI Interview Prep",
    },

    {
        icon: <BarChart3 />,
        eyebrow: "08 / CAREER ANALYTICS",
        title: "Measure your professional progress.",
        description:
            "Track career readiness, skill development and profile improvement from one centralized AI workspace.",
        tag: "Career Dashboard",
    },

];


/* ============================================================
   WORKFLOW DATA
============================================================ */

const WORKFLOW: Step[] = [

    {
        number: "01",
        icon: <FileSearch />,
        title: "Upload",
        description:
            "Connect your latest resume and give CareerMind the professional evidence it needs.",
    },

    {
        number: "02",
        icon: <BrainCircuit />,
        title: "Analyze",
        description:
            "CareerMind extracts experience, skills and meaningful career signals from your profile.",
    },

    {
        number: "03",
        icon: <Target />,
        title: "Understand",
        description:
            "Discover strengths, skill gaps, career opportunities and areas that need attention.",
    },

    {
        number: "04",
        icon: <Route />,
        title: "Execute",
        description:
            "Follow a personalized roadmap and continuously improve your professional profile.",
    },

];


/* ============================================================
   HOME
============================================================ */

export default function Home() {

    const [
        mobileMenuOpen,
        setMobileMenuOpen,
    ] = useState(false);


    const closeMenu = () => {
        setMobileMenuOpen(false);
    };


    return (

        <div className="cm-home">

            {/* ==================================================
                BACKGROUND
            ================================================== */}

            <div
                className="cm-background"
                aria-hidden="true"
            >

                <div className="cm-background-grid" />

                <div className="cm-background-glow cm-glow-one" />

                <div className="cm-background-glow cm-glow-two" />

                <div className="cm-background-glow cm-glow-three" />

            </div>


            {/* ==================================================
                NAVBAR
            ================================================== */}

            <header className="cm-navbar">

                <div className="cm-navbar-inner">


                    {/* BRAND */}

                    <Link
                        to="/"
                        className="cm-brand"
                        onClick={closeMenu}
                    >

                        <span className="cm-brand-icon">

                            <BrainCircuit
                                size={22}
                            />

                        </span>


                        <span className="cm-brand-name">

                            CareerMind

                            <small>
                                AI
                            </small>

                        </span>

                    </Link>


                    {/* DESKTOP NAVIGATION */}

                    <nav className="cm-main-nav">

                        <a href="#platform">
                            Platform
                        </a>

                        <a href="#intelligence">
                            Intelligence
                        </a>

                        <a href="#workflow">
                            How it works
                        </a>

                        <a href="#security">
                            Security
                        </a>

                    </nav>


                    {/* ACTIONS */}

                    <div className="cm-navbar-actions">

                        <Link
                            to="/login"
                            className="cm-signin"
                        >
                            Sign in
                        </Link>


                        <Link
                            to="/register"
                            className="cm-nav-button"
                        >

                            Start free

                            <ArrowRight
                                size={15}
                            />

                        </Link>

                    </div>


                    {/* MOBILE MENU */}

                    <button
                        type="button"
                        className="cm-menu-button"
                        aria-label="Toggle navigation"
                        aria-expanded={mobileMenuOpen}
                        onClick={() =>
                            setMobileMenuOpen(
                                !mobileMenuOpen
                            )
                        }
                    >

                        {mobileMenuOpen
                            ? <X size={21} />
                            : <Menu size={21} />
                        }

                    </button>

                </div>


                {/* MOBILE NAV */}

                {mobileMenuOpen && (

                    <div className="cm-mobile-navigation">

                        <a
                            href="#platform"
                            onClick={closeMenu}
                        >
                            Platform
                        </a>

                        <a
                            href="#intelligence"
                            onClick={closeMenu}
                        >
                            Intelligence
                        </a>

                        <a
                            href="#workflow"
                            onClick={closeMenu}
                        >
                            How it works
                        </a>

                        <a
                            href="#security"
                            onClick={closeMenu}
                        >
                            Security
                        </a>


                        <div className="cm-mobile-actions">

                            <Link
                                to="/login"
                                onClick={closeMenu}
                            >
                                Sign in
                            </Link>

                            <Link
                                to="/register"
                                onClick={closeMenu}
                            >
                                Start free
                                <ArrowRight size={15} />
                            </Link>

                        </div>

                    </div>

                )}

            </header>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main>


                {/* ==================================================
                    HERO
                ================================================== */}

                <section className="cm-hero">

                    <div className="cm-hero-inner">


                        {/* LEFT */}

                        <div className="cm-hero-content">

                            <div className="cm-status-badge">

                                <span className="cm-status-dot" />

                                <span>
                                    CAREERMIND AI ENGINE
                                </span>

                                <strong>
                                    ONLINE
                                </strong>

                            </div>


                            <div className="cm-hero-eyebrow">

                                AI CAREER INTELLIGENCE

                            </div>


                            <h1>

                                Build your career

                                <span>
                                    with intelligence.
                                </span>

                            </h1>


                            <p className="cm-hero-description">

                                CareerMind AI turns your resume,
                                skills and experience into a living
                                career intelligence profile — helping
                                you understand your strengths, identify
                                skill gaps and plan your next move.

                            </p>


                            {/* CTA */}

                            <div className="cm-hero-buttons">

                                <Link
                                    to="/register"
                                    className="cm-primary-button"
                                >

                                    Build My Career Profile

                                    <ArrowRight
                                        size={18}
                                    />

                                </Link>


                                <a
                                    href="#platform"
                                    className="cm-secondary-button"
                                >

                                    <Play
                                        size={15}
                                        fill="currentColor"
                                    />

                                    Explore CareerMind

                                </a>

                            </div>


                            {/* TRUST */}

                            <div className="cm-trust-points">

                                <span>

                                    <Check size={14} />

                                    Free to start

                                </span>


                                <span>

                                    <LockKeyhole size={14} />

                                    Secure authentication

                                </span>


                                <span>

                                    <ShieldCheck size={14} />

                                    Private career profile

                                </span>

                            </div>

                        </div>


                        {/* RIGHT / AI WORKSPACE */}

                        <div className="cm-hero-product">

                            <div className="cm-product-glow" />


                            <div className="cm-product-window">


                                {/* WINDOW HEADER */}

                                <div className="cm-product-header">

                                    <div className="cm-product-brand">

                                        <div className="cm-product-icon">

                                            <Sparkles
                                                size={16}
                                            />

                                        </div>

                                        <div>

                                            <strong>
                                                CareerMind Intelligence
                                            </strong>

                                            <span>
                                                AI Career Workspace
                                            </span>

                                        </div>

                                    </div>


                                    <span className="cm-live-status">

                                        <i />

                                        LIVE PREVIEW

                                    </span>

                                </div>


                                {/* PROFILE */}

                                <div className="cm-profile-row">

                                    <div>

                                        <span>
                                            CAREER PROFILE
                                        </span>

                                        <h2>
                                            Professional Intelligence
                                        </h2>

                                    </div>


                                    <div className="cm-profile-user">

                                        <UserRound
                                            size={18}
                                        />

                                    </div>

                                </div>


                                {/* SCORE */}

                                <div className="cm-readiness">

                                    <div>

                                        <span>
                                            CAREER READINESS
                                        </span>

                                        <strong>
                                            89
                                            <small>
                                                /100
                                            </small>
                                        </strong>

                                        <p>
                                            Product preview
                                        </p>

                                    </div>


                                    <div className="cm-readiness-ring">

                                        <div>

                                            <strong>
                                                89%
                                            </strong>

                                            <span>
                                                READY
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                {/* METRICS */}

                                <div className="cm-product-metrics">

                                    <PreviewMetric
                                        label="ATS SCORE"
                                        value="92%"
                                        status="Strong"
                                    />

                                    <PreviewMetric
                                        label="SKILL MATCH"
                                        value="86%"
                                        status="Advanced"
                                    />

                                    <PreviewMetric
                                        label="CAREER FIT"
                                        value="91%"
                                        status="Aligned"
                                    />

                                </div>


                                {/* SIGNALS */}

                                <div className="cm-signal-card">

                                    <div className="cm-signal-header">

                                        <span>
                                            CAREER SIGNALS
                                        </span>

                                        <strong>
                                            ANALYZED
                                        </strong>

                                    </div>


                                    <Signal
                                        label="Resume strength"
                                        value={92}
                                    />

                                    <Signal
                                        label="Technical capability"
                                        value={86}
                                    />

                                    <Signal
                                        label="Career alignment"
                                        value={91}
                                    />

                                </div>


                                {/* AI RECOMMENDATION */}

                                <div className="cm-ai-recommendation">

                                    <div className="cm-ai-recommendation-icon">

                                        <BrainCircuit
                                            size={17}
                                        />

                                    </div>


                                    <div>

                                        <span>
                                            AI RECOMMENDATION
                                        </span>

                                        <p>
                                            Strengthen applied AI
                                            engineering experience
                                            through practical projects.
                                        </p>

                                    </div>

                                </div>


                                {/* FOOTER */}

                                <div className="cm-product-footer">

                                    <div>
                                        <span>
                                            Skills
                                        </span>

                                        <strong>
                                            18
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Career match
                                        </span>

                                        <strong>
                                            94%
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Profile
                                        </span>

                                        <strong>
                                            READY
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* HERO SYSTEM LINE */}

                    <div className="cm-system-line">

                        <span>
                            <Zap size={13} />
                            AI ENGINE
                        </span>

                        <i />

                        <span>
                            RESUME
                        </span>

                        <i />

                        <span>
                            SKILLS
                        </span>

                        <i />

                        <span>
                            CAREER
                        </span>

                        <i />

                        <span>
                            ROADMAP
                        </span>

                        <i />

                        <span>
                            INTERVIEW
                        </span>

                    </div>

                </section>


                {/* ==================================================
                    PLATFORM INTRO
                ================================================== */}

                <section
                    className="cm-platform-intro"
                    id="platform"
                >

                    <SectionHeading
                        eyebrow="ONE CAREER INTELLIGENCE SYSTEM"
                        title={
                            <>
                                Your career is more than a resume.
                                <span>
                                    CareerMind connects the whole picture.
                                </span>
                            </>
                        }
                        description="Instead of using disconnected tools for resumes, skills, career planning and interview preparation, CareerMind brings the intelligence layer into one workspace."
                    />


                    <div className="cm-feature-grid">

                        {FEATURES.map(
                            (feature) => (

                                <FeatureCard
                                    key={feature.eyebrow}
                                    {...feature}
                                />

                            )
                        )}

                    </div>

                </section>


                {/* ==================================================
                    INTELLIGENCE SECTION
                ================================================== */}

                <section
                    className="cm-intelligence"
                    id="intelligence"
                >

                    <div className="cm-intelligence-inner">


                        {/* COPY */}

                        <div className="cm-intelligence-copy">

                            <span className="cm-eyebrow">
                                CAREER INTELLIGENCE LAYER
                            </span>


                            <h2>

                                From scattered information

                                <span>
                                    to one career picture.
                                </span>

                            </h2>


                            <p>

                                CareerMind connects the signals inside
                                your resume, skills and experience to
                                create a more useful understanding of
                                your professional direction.

                            </p>


                            <div className="cm-check-list">

                                <CheckPoint>
                                    Extract skills from your resume
                                </CheckPoint>

                                <CheckPoint>
                                    Evaluate ATS and resume strength
                                </CheckPoint>

                                <CheckPoint>
                                    Detect priority skill gaps
                                </CheckPoint>

                                <CheckPoint>
                                    Recommend relevant career directions
                                </CheckPoint>

                                <CheckPoint>
                                    Generate an actionable learning roadmap
                                </CheckPoint>

                                <CheckPoint>
                                    Prepare for technical interviews
                                </CheckPoint>

                            </div>


                            <Link
                                to="/register"
                                className="cm-outline-button"
                            >

                                Discover My Career Intelligence

                                <ArrowRight
                                    size={16}
                                />

                            </Link>

                        </div>


                        {/* INTELLIGENCE PANEL */}

                        <div className="cm-intelligence-panel">

                            <div className="cm-panel-top">

                                <div>

                                    <span>
                                        CAREER INTELLIGENCE
                                    </span>

                                    <strong>
                                        Profile Analysis
                                    </strong>

                                </div>

                                <span className="cm-panel-active">
                                    ACTIVE
                                </span>

                            </div>


                            <div className="cm-intelligence-flow">

                                <IntelligenceNode
                                    icon={<UserRound />}
                                    label="PROFILE"
                                    title="Your Experience"
                                    active
                                />

                                <div className="cm-flow-line">
                                    <span />
                                </div>

                                <IntelligenceNode
                                    icon={<Network />}
                                    label="CAPABILITY"
                                    title="Your Skills"
                                />

                                <div className="cm-flow-line">
                                    <span />
                                </div>

                                <IntelligenceNode
                                    icon={<Target />}
                                    label="DIRECTION"
                                    title="Target Career"
                                />

                                <div className="cm-flow-line">
                                    <span />
                                </div>

                                <IntelligenceNode
                                    icon={<TrendingUp />}
                                    label="GROWTH"
                                    title="Next Skills"
                                />

                            </div>


                            <div className="cm-panel-insight">

                                <div>

                                    <BrainCircuit
                                        size={17}
                                    />

                                </div>

                                <section>

                                    <span>
                                        AI SIGNAL
                                    </span>

                                    <p>
                                        Your strongest opportunity is
                                        converting technical knowledge
                                        into demonstrable project
                                        experience.
                                    </p>

                                </section>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    CAREER ENGINE
                ================================================== */}

                <section className="cm-career-engine">

                    <div className="cm-career-engine-header">

                        <span className="cm-eyebrow">
                            CAREER DIRECTION ENGINE
                        </span>

                        <h2>

                            Don't just search for jobs.

                            <span>
                                Understand your direction.
                            </span>

                        </h2>

                        <p>
                            CareerMind helps connect your current
                            capabilities with the professional direction
                            you want to build toward.
                        </p>

                    </div>


                    <div className="cm-career-cards">

                        <CareerDirection
                            rank="01"
                            title="AI / ML Engineer"
                            match="94%"
                            description="Strong alignment with Python, machine learning and technical foundations."
                        />

                        <CareerDirection
                            rank="02"
                            title="Data Scientist"
                            match="88%"
                            description="Strong analytical foundation with opportunities to deepen applied modeling."
                        />

                        <CareerDirection
                            rank="03"
                            title="AI Product Engineer"
                            match="82%"
                            description="Potential path combining software engineering with applied AI systems."
                        />

                    </div>

                </section>


                {/* ==================================================
                    WORKFLOW
                ================================================== */}

                <section
                    className="cm-workflow"
                    id="workflow"
                >

                    <SectionHeading
                        eyebrow="THE CAREER INTELLIGENCE LOOP"
                        title={
                            <>
                                Upload once.
                                <span>
                                    Build continuously.
                                </span>
                            </>
                        }
                        description="CareerMind is designed as a continuous career intelligence workflow — not a one-time resume checker."
                    />


                    <div className="cm-workflow-grid">

                        {WORKFLOW.map(
                            (step) => (

                                <WorkflowCard
                                    key={step.number}
                                    {...step}
                                />

                            )
                        )}

                    </div>

                </section>


                {/* ==================================================
                    ROADMAP
                ================================================== */}

                <section className="cm-roadmap">

                    <div className="cm-roadmap-header">

                        <div>

                            <span className="cm-eyebrow">
                                AI LEARNING ROADMAP
                            </span>

                            <h2>

                                Turn skill gaps into

                                <span>
                                    measurable progress.
                                </span>

                            </h2>

                        </div>


                        <div className="cm-generated">

                            <Sparkles
                                size={14}
                            />

                            AI GENERATED

                        </div>

                    </div>


                    <div className="cm-roadmap-grid">

                        <RoadmapCard
                            number="01"
                            title="Strengthen"
                            subtitle="Foundation"
                            description="Build the highest-priority technical capabilities identified by your profile."
                        />

                        <RoadmapCard
                            number="02"
                            title="Build"
                            subtitle="Evidence"
                            description="Turn knowledge into projects, portfolio evidence and practical experience."
                        />

                        <RoadmapCard
                            number="03"
                            title="Prepare"
                            subtitle="Opportunity"
                            description="Improve resume positioning, interview readiness and career applications."
                        />

                    </div>

                </section>


                {/* ==================================================
                    INTERVIEW SECTION
                ================================================== */}

                <section className="cm-interview">

                    <div className="cm-interview-card">

                        <div className="cm-interview-copy">

                            <span className="cm-eyebrow">
                                AI INTERVIEW COPILOT
                            </span>

                            <h2>

                                Practice the questions

                                <span>
                                    your profile deserves.
                                </span>

                            </h2>

                            <p>

                                Prepare around your actual skills,
                                projects and target career direction
                                instead of practicing generic interview
                                questions.

                            </p>


                            <div className="cm-interview-points">

                                <CheckPoint>
                                    Technical interview preparation
                                </CheckPoint>

                                <CheckPoint>
                                    Behavioral questions
                                </CheckPoint>

                                <CheckPoint>
                                    Project-based questions
                                </CheckPoint>

                            </div>


                            <Link
                                to="/register"
                                className="cm-primary-button"
                            >

                                Prepare With AI

                                <ArrowRight
                                    size={17}
                                />

                            </Link>

                        </div>


                        <div className="cm-interview-preview">

                            <div className="cm-interview-top">

                                <span>
                                    INTERVIEW SESSION
                                </span>

                                <strong>
                                    AI READY
                                </strong>

                            </div>


                            <div className="cm-question">

                                <span>
                                    QUESTION 01
                                </span>

                                <h3>
                                    Explain a machine learning
                                    project you built and the
                                    decisions behind it.
                                </h3>

                            </div>


                            <div className="cm-answer-analysis">

                                <div>

                                    <span>
                                        COMMUNICATION
                                    </span>

                                    <strong>
                                        Strong
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        TECHNICAL DEPTH
                                    </span>

                                    <strong>
                                        Developing
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        PROJECT SIGNAL
                                    </span>

                                    <strong>
                                        Strong
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    SECURITY
                ================================================== */}

                <section
                    className="cm-security"
                    id="security"
                >

                    <SectionHeading
                        eyebrow="TRUST & SECURITY"
                        title={
                            <>
                                Career intelligence should feel
                                <span>
                                    private by design.
                                </span>
                            </>
                        }
                        description="CareerMind is designed around authenticated access, protected professional information and responsible AI-assisted career workflows."
                    />


                    <div className="cm-security-grid">

                        <SecurityItem
                            icon={<ShieldCheck />}
                            title="Authenticated Access"
                            description="Your CareerMind workspace is protected by account authentication."
                        />

                        <SecurityItem
                            icon={<LockKeyhole />}
                            title="Protected Profile"
                            description="Professional information is handled as private career data."
                        />

                        <SecurityItem
                            icon={<BrainCircuit />}
                            title="Responsible AI"
                            description="AI recommendations are intended to support career decisions, not replace your judgment."
                        />

                    </div>

                </section>


                {/* ==================================================
                    FINAL CTA
                ================================================== */}

                <section className="cm-final-cta">

                    <div className="cm-final-glow" />


                    <div className="cm-final-content">

                        <span className="cm-eyebrow">
                            BUILD YOUR CAREER INTELLIGENCE
                        </span>


                        <h2>

                            Your next move

                            <span>
                                should be intentional.
                            </span>

                        </h2>


                        <p>

                            Upload your resume, understand your
                            professional profile and start building
                            toward the career you actually want.

                        </p>


                        <div className="cm-final-actions">

                            <Link
                                to="/register"
                                className="cm-primary-button"
                            >

                                Create My Career Profile

                                <ArrowRight
                                    size={18}
                                />

                            </Link>


                            <span>

                                Already have an account?

                                <Link to="/login">
                                    Sign in
                                </Link>

                            </span>

                        </div>

                    </div>

                </section>

            </main>


            {/* ==================================================
                FOOTER
            ================================================== */}

            <footer className="cm-footer">

                <div className="cm-footer-main">


                    <div className="cm-footer-brand">

                        <Link
                            to="/"
                            className="cm-brand"
                        >

                            <span className="cm-brand-icon">

                                <BrainCircuit
                                    size={19}
                                />

                            </span>

                            <span className="cm-brand-name">

                                CareerMind

                                <small>
                                    AI
                                </small>

                            </span>

                        </Link>


                        <p>

                            AI-powered career intelligence
                            for your next professional move.

                        </p>

                    </div>


                    <FooterColumn
                        title="Platform"
                        links={[
                            ["Resume Intelligence", "#platform"],
                            ["Skill Intelligence", "#intelligence"],
                            ["Career Matching", "#intelligence"],
                            ["Learning Roadmap", "#workflow"],
                        ]}
                    />


                    <FooterColumn
                        title="Resources"
                        links={[
                            ["How it works", "#workflow"],
                            ["Interview Copilot", "#workflow"],
                            ["Security", "#security"],
                        ]}
                    />


                    <FooterColumn
                        title="Account"
                        links={[
                            ["Sign in", "/login"],
                            ["Create account", "/register"],
                        ]}
                    />


                </div>


                <div className="cm-footer-bottom">

                    <span>
                        © 2026 CareerMind AI
                    </span>

                    <span>
                        AI Career Intelligence Platform
                    </span>

                </div>

            </footer>

        </div>
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
    title: ReactNode;
    description: string;
}) {

    return (

        <div className="cm-section-heading">

            <span className="cm-eyebrow">
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
   FEATURE CARD
============================================================ */

function FeatureCard({
    icon,
    eyebrow,
    title,
    description,
    tag,
}: Feature) {

    return (

        <article className="cm-feature-card">

            <div className="cm-feature-top">

                <div className="cm-feature-icon">
                    {icon}
                </div>

                <span>
                    {tag}
                </span>

            </div>


            <span className="cm-feature-eyebrow">
                {eyebrow}
            </span>


            <h3>
                {title}
            </h3>


            <p>
                {description}
            </p>


            <div className="cm-feature-arrow">

                Explore capability

                <ChevronRight
                    size={15}
                />

            </div>

        </article>

    );
}


/* ============================================================
   PREVIEW METRIC
============================================================ */

function PreviewMetric({
    label,
    value,
    status,
}: {
    label: string;
    value: string;
    status: string;
}) {

    return (

        <div className="cm-preview-metric">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

            <small>
                {status}
            </small>

        </div>

    );
}


/* ============================================================
   SIGNAL
============================================================ */

function Signal({
    label,
    value,
}: {
    label: string;
    value: number;
}) {

    return (

        <div className="cm-signal">

            <div className="cm-signal-label">

                <span>
                    {label}
                </span>

                <strong>
                    {value}%
                </strong>

            </div>


            <div className="cm-signal-track">

                <span
                    style={{
                        width: `${value}%`,
                    }}
                />

            </div>

        </div>

    );
}


/* ============================================================
   CHECK POINT
============================================================ */

function CheckPoint({
    children,
}: {
    children: ReactNode;
}) {

    return (

        <div className="cm-check-point">

            <span>

                <Check
                    size={13}
                />

            </span>

            <p>
                {children}
            </p>

        </div>

    );
}


/* ============================================================
   INTELLIGENCE NODE
============================================================ */

function IntelligenceNode({
    icon,
    label,
    title,
    active = false,
}: {
    icon: ReactNode;
    label: string;
    title: string;
    active?: boolean;
}) {

    return (

        <div
            className={
                `cm-intelligence-node ${active ? "active" : ""
                }`
            }
        >

            <div className="cm-node-icon">
                {icon}
            </div>

            <span>
                {label}
            </span>

            <strong>
                {title}
            </strong>

        </div>

    );
}


/* ============================================================
   CAREER DIRECTION
============================================================ */

function CareerDirection({
    rank,
    title,
    match,
    description,
}: {
    rank: string;
    title: string;
    match: string;
    description: string;
}) {

    return (

        <article className="cm-career-direction">

            <div className="cm-career-direction-top">

                <span>
                    {rank}
                </span>

                <strong>
                    {match}
                </strong>

            </div>


            <div className="cm-career-direction-icon">

                <BriefcaseBusiness
                    size={19}
                />

            </div>


            <h3>
                {title}
            </h3>


            <p>
                {description}
            </p>


            <div className="cm-match-bar">

                <span
                    style={{
                        width: match,
                    }}
                />

            </div>


            <small>
                Profile alignment
            </small>

        </article>

    );
}


/* ============================================================
   WORKFLOW CARD
============================================================ */

function WorkflowCard({
    number,
    icon,
    title,
    description,
}: Step) {

    return (

        <article className="cm-workflow-card">

            <div className="cm-workflow-number">
                {number}
            </div>


            <div className="cm-workflow-icon">
                {icon}
            </div>


            <span className="cm-workflow-label">
                CAREER INTELLIGENCE
            </span>


            <h3>
                {title}
            </h3>


            <p>
                {description}
            </p>


            <div className="cm-workflow-line" />

        </article>

    );
}


/* ============================================================
   ROADMAP CARD
============================================================ */

function RoadmapCard({
    number,
    title,
    subtitle,
    description,
}: {
    number: string;
    title: string;
    subtitle: string;
    description: string;
}) {

    return (

        <article className="cm-roadmap-card">

            <div className="cm-roadmap-number">
                {number}
            </div>


            <span>
                {subtitle}
            </span>


            <h3>
                {title}
            </h3>


            <p>
                {description}
            </p>


            <div className="cm-roadmap-status">

                <CircleCheck
                    size={15}
                />

                AI PRIORITIZED

            </div>

        </article>

    );
}


/* ============================================================
   SECURITY ITEM
============================================================ */

function SecurityItem({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description: string;
}) {

    return (

        <article className="cm-security-item">

            <div className="cm-security-icon">
                {icon}
            </div>


            <div>

                <h3>
                    {title}
                </h3>

                <p>
                    {description}
                </p>

            </div>

        </article>

    );
}


/* ============================================================
   FOOTER COLUMN
============================================================ */

function FooterColumn({
    title,
    links,
}: {
    title: string;
    links: string[][];
}) {

    return (

        <div className="cm-footer-column">

            <strong>
                {title}
            </strong>


            {links.map(
                ([label, href]) => (

                    href.startsWith("/")
                        ? (
                            <Link
                                key={label}
                                to={href}
                            >
                                {label}
                            </Link>
                        )
                        : (
                            <a
                                key={label}
                                href={href}
                            >
                                {label}
                            </a>
                        )

                )
            )}

        </div>

    );
}