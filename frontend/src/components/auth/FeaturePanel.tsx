/**
 * ============================================================
 * CareerMind AI
 *
 * Premium AI Authentication Feature Panel
 *
 * Features:
 * - Futuristic AI career experience
 * - Intelligent feature cards
 * - AI status indicator
 * - Dynamic feature visualization
 * - Professional SaaS onboarding
 * - Accessible structure
 * ============================================================
 */

import {
    FileSearch,
    Target,
    Brain,
    Rocket,
    Mic2,
    Sparkles,
    ArrowUpRight,
    Activity,
    CheckCircle2,
} from "lucide-react";

import "../../styles/auth.css";


/* ============================================================
   FEATURE DATA
============================================================ */

const features = [
    {
        icon: FileSearch,
        title: "AI Resume Intelligence",
        description:
            "Analyze your resume with AI-powered ATS scoring, skill extraction and actionable improvements.",
        metric: "ATS",
        value: "89%",
    },

    {
        icon: Target,
        title: "Career Roadmap",
        description:
            "Build a personalized learning path aligned with your target role and career direction.",
        metric: "PATH",
        value: "AI",
    },

    {
        icon: Brain,
        title: "Skill Gap Detection",
        description:
            "Identify missing technical skills and understand exactly what you should learn next.",
        metric: "GAP",
        value: "LIVE",
    },

    {
        icon: Mic2,
        title: "AI Interview Coach",
        description:
            "Practice realistic interviews and receive intelligent feedback to improve your confidence.",
        metric: "COACH",
        value: "24/7",
    },

    {
        icon: Rocket,
        title: "Career Growth Engine",
        description:
            "Turn your skills, projects and experience into an industry-ready career strategy.",
        metric: "GROW",
        value: "∞",
    },
];


/* ============================================================
   FEATURE PANEL
============================================================ */

export default function FeaturePanel() {

    return (
        <section
            className="feature-panel"
            aria-label="CareerMind AI features"
        >

            {/* =================================================
                AI PLATFORM BADGE
            ================================================= */}

            <div className="feature-badge">

                <span className="feature-live-dot" />

                <Sparkles
                    size={15}
                    aria-hidden="true"
                />

                <span>
                    AI CAREER INTELLIGENCE
                </span>

            </div>


            {/* =================================================
                MAIN HEADER
            ================================================= */}

            <header className="feature-header">

                <div className="feature-status">

                    <Activity
                        size={14}
                        aria-hidden="true"
                    />

                    <span>
                        Career intelligence system online
                    </span>

                    <span className="feature-status-dot" />

                </div>


                <h2>

                    Build Your Future

                    <br />

                    <span>
                        With Intelligence.
                    </span>

                </h2>


                <p>

                    CareerMind AI transforms your resume,
                    skills and career goals into a personalized
                    roadmap for becoming industry ready.

                </p>

            </header>


            {/* =================================================
                AI FEATURE MATRIX
            ================================================= */}

            <div className="feature-list">

                {features.map((feature, index) => {

                    const Icon = feature.icon;

                    return (
                        <article
                            className={`feature-item feature-item-${index + 1}`}
                            key={feature.title}
                        >

                            {/* Feature Icon */}

                            <div className="feature-icon">

                                <Icon
                                    size={21}
                                    strokeWidth={1.9}
                                    aria-hidden="true"
                                />

                            </div>


                            {/* Feature Content */}

                            <div className="feature-content">

                                <div className="feature-title-row">

                                    <h3>
                                        {feature.title}
                                    </h3>

                                    <ArrowUpRight
                                        size={15}
                                        className="feature-arrow"
                                        aria-hidden="true"
                                    />

                                </div>


                                <p>
                                    {feature.description}
                                </p>


                                {/* AI Feature Status */}

                                <div className="feature-meta">

                                    <span>

                                        <CheckCircle2
                                            size={12}
                                            aria-hidden="true"
                                        />

                                        AI Enabled

                                    </span>

                                    <span className="feature-metric">

                                        {feature.metric}

                                        <strong>
                                            {feature.value}
                                        </strong>

                                    </span>

                                </div>

                            </div>

                        </article>
                    );

                })}

            </div>


            {/* =================================================
                AI SYSTEM FOOTER
            ================================================= */}

            <div className="feature-footer">

                <div className="footer-ai-icon">

                    <Brain
                        size={17}
                        aria-hidden="true"
                    />

                </div>


                <div>

                    <strong>
                        Your career. Powered by AI.
                    </strong>

                    <span>
                        One intelligent system. One clear direction.
                    </span>

                </div>


                <div className="footer-status">

                    <span />

                    LIVE

                </div>

            </div>

        </section>
    );
}