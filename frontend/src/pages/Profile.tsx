/**
 * ============================================================
 * CareerMind AI
 *
 * Profile Intelligence Center
 *
 * Purpose:
 * - Professional identity
 * - Account readiness
 * - AI career identity
 * - Intelligence capabilities
 * - Security status
 *
 * Stack:
 * - React
 * - TypeScript
 * - React Router
 * - FastAPI JWT authentication
 * - CareerMind AI
 * ============================================================
 */

import type { ReactNode } from "react";

import {
    Activity,
    BadgeCheck,
    BrainCircuit,
    BriefcaseBusiness,
    CheckCircle2,
    CircleAlert,
    CircleUserRound,
    FileCheck2,
    Mail,
    Radar,
    Rocket,
    ShieldCheck,
    Sparkles,
    Target,
    UserCircle2,
    Zap,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import DashboardLayout from "../components/layouts/DashboardLayout";

import "./profile.css";


/* ============================================================
   PROFILE
============================================================ */

export default function Profile() {

    const { user } = useAuth();


    /* ========================================================
       SAFE ACCOUNT DATA
    ======================================================== */

    const fullName =
        typeof user?.full_name === "string" &&
            user.full_name.trim()
            ? user.full_name.trim()
            : "Developer";


    const email =
        typeof user?.email === "string" &&
            user.email.trim()
            ? user.email.trim()
            : "Email unavailable";


    const role =
        typeof user?.role === "string" &&
            user.role.trim()
            ? user.role.trim()
            : "AI Career Explorer";


    const accountActive =
        user?.is_active === true;


    const accountVerified =
        user?.is_verified === true;


    /* ========================================================
       DERIVED DATA
    ======================================================== */

    const profileInitial =
        fullName.charAt(0).toUpperCase();


    const formattedRole =
        formatRole(role);


    const accountState =
        accountActive
            ? "Operational"
            : "Attention Required";


    const verificationState =
        accountVerified
            ? "Verified"
            : "Pending";


    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <DashboardLayout>

            <main className="profile-page">

                {/* =================================================
                   PAGE HEADER
                ================================================= */}

                <header className="profile-page-header">

                    <div>

                        <span className="profile-page-eyebrow">
                            CAREERMIND / IDENTITY
                        </span>

                        <h1>
                            Profile Intelligence
                        </h1>

                        <p>
                            Manage your professional identity and
                            monitor the systems connected to your
                            CareerMind AI workspace.
                        </p>

                    </div>


                    <div
                        className={
                            accountActive
                                ? "profile-live-indicator online"
                                : "profile-live-indicator offline"
                        }
                    >

                        <span className="live-dot" />

                        {accountActive
                            ? "Workspace online"
                            : "Workspace attention required"}

                    </div>

                </header>


                {/* =================================================
                   PROFILE HERO
                ================================================= */}

                <section className="profile-hero">

                    <div className="profile-hero-grid" />

                    <div
                        className="profile-hero-glow glow-left"
                        aria-hidden="true"
                    />

                    <div
                        className="profile-hero-glow glow-right"
                        aria-hidden="true"
                    />


                    {/* =================================================
                       IDENTITY
                    ================================================= */}

                    <div className="profile-identity">

                        <div
                            className="profile-avatar"
                            aria-label={`Profile avatar for ${fullName}`}
                        >

                            <span>
                                {profileInitial}
                            </span>

                            <div
                                className={
                                    accountActive
                                        ? "avatar-status active"
                                        : "avatar-status inactive"
                                }
                            >
                                <span />
                            </div>

                        </div>


                        <div className="profile-identity-content">

                            <div className="profile-badge">

                                <Sparkles size={14} />

                                AI Career Identity

                            </div>


                            <h2>
                                {fullName}
                            </h2>


                            <p className="profile-role">

                                <BriefcaseBusiness size={16} />

                                {formattedRole}

                            </p>


                            <div className="profile-status-row">

                                <StatusBadge
                                    active={accountActive}
                                    label={
                                        accountActive
                                            ? "Account Active"
                                            : "Account Inactive"
                                    }
                                />


                                <StatusBadge
                                    active={accountVerified}
                                    label={
                                        accountVerified
                                            ? "Identity Verified"
                                            : "Verification Pending"
                                    }
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                       AI CORE
                    ================================================= */}

                    <div
                        className="profile-ai-core"
                        aria-hidden="true"
                    >

                        <div className="core-orbit orbit-a" />

                        <div className="core-orbit orbit-b" />

                        <div className="core-node">

                            <BrainCircuit size={28} />

                            <span>
                                AI CORE
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                       HERO METRICS
                    ================================================= */}

                    <div className="profile-hero-metrics">

                        <HeroMetric
                            label="ACCOUNT"
                            value={accountState}
                            icon={
                                <ShieldCheck size={15} />
                            }
                        />


                        <HeroMetric
                            label="IDENTITY"
                            value={verificationState}
                            icon={
                                <BadgeCheck size={15} />
                            }
                        />


                        <HeroMetric
                            label="PROFILE"
                            value="Active"
                            icon={
                                <Zap size={15} />
                            }
                        />

                    </div>

                </section>


                {/* =================================================
                   PROFESSIONAL IDENTITY
                ================================================= */}

                <section className="profile-section">

                    <SectionHeading
                        eyebrow="IDENTITY LAYER"
                        icon={
                            <CircleUserRound />
                        }
                        title="Professional Identity"
                        description="Core information associated with your CareerMind AI account."
                    />


                    <div className="profile-grid">

                        <ProfileInfoCard
                            icon={
                                <UserCircle2 />
                            }
                            title="Full Name"
                            value={fullName}
                            description="Your registered professional identity."
                        />


                        <ProfileInfoCard
                            icon={
                                <Mail />
                            }
                            title="Email Address"
                            value={email}
                            description="Primary communication channel for your account."
                        />


                        <ProfileInfoCard
                            icon={
                                <BriefcaseBusiness />
                            }
                            title="Career Role"
                            value={formattedRole}
                            description="The professional role currently associated with your account."
                        />


                        <ProfileInfoCard
                            icon={
                                <ShieldCheck />
                            }
                            title="Account Status"
                            value={
                                accountActive
                                    ? "Active"
                                    : "Inactive"
                            }
                            description={
                                accountActive
                                    ? "Your workspace is available and authenticated."
                                    : "Your account currently requires attention."
                            }
                            status={accountActive}
                        />

                    </div>

                </section>


                {/* =================================================
                   AI CAREER IDENTITY
                ================================================= */}

                <section className="ai-identity-card">

                    <div
                        className="ai-card-noise"
                        aria-hidden="true"
                    />

                    <div
                        className="ai-card-glow"
                        aria-hidden="true"
                    />


                    <div className="ai-identity-icon">

                        <BrainCircuit size={28} />

                    </div>


                    <div className="ai-identity-content">

                        <span className="section-eyebrow">
                            CAREERMIND INTELLIGENCE
                        </span>

                        <h2>
                            Your professional profile is becoming
                            an intelligence graph.
                        </h2>

                        <p>
                            CareerMind AI is designed to connect
                            your professional identity, resume
                            intelligence, skills, career direction
                            and learning priorities into one
                            unified career workspace.
                        </p>


                        <div className="ai-capability-row">

                            <Capability
                                icon={
                                    <BrainCircuit size={14} />
                                }
                                label="Resume Intelligence"
                            />

                            <Capability
                                icon={
                                    <Target size={14} />
                                }
                                label="Career Matching"
                            />

                            <Capability
                                icon={
                                    <Radar size={14} />
                                }
                                label="Skill Intelligence"
                            />

                            <Capability
                                icon={
                                    <Rocket size={14} />
                                }
                                label="Growth Planning"
                            />

                        </div>

                    </div>


                    <div className="ai-card-status">

                        <span />

                        Intelligence Ready

                    </div>

                </section>


                {/* =================================================
                   INTELLIGENCE SYSTEMS
                ================================================= */}

                <section className="profile-section">

                    <SectionHeading
                        eyebrow="INTELLIGENCE LAYER"
                        icon={
                            <Activity />
                        }
                        title="Career Intelligence Systems"
                        description="AI capabilities available within your CareerMind workspace."
                    />


                    <div className="signal-grid">

                        <IntelligenceSignal
                            icon={
                                <FileCheck2 />
                            }
                            title="Resume Intelligence"
                            value="Ready"
                            description="Upload a resume to activate AI-powered resume analysis and professional signal extraction."
                        />


                        <IntelligenceSignal
                            icon={
                                <BrainCircuit />
                            }
                            title="AI Career Analysis"
                            value="Ready"
                            description="AI-generated career insights can be created from your professional profile."
                        />


                        <IntelligenceSignal
                            icon={
                                <Target />
                            }
                            title="Career Matching"
                            value="Available"
                            description="Career directions can be matched against your skills and professional profile."
                        />


                        <IntelligenceSignal
                            icon={
                                <Rocket />
                            }
                            title="Growth Engine"
                            value="Available"
                            description="Skill gaps and learning priorities can be used to build a personalized growth roadmap."
                        />

                    </div>

                </section>


                {/* =================================================
                   ACCOUNT VERIFICATION
                ================================================= */}

                <section className="profile-verification-card">

                    <div className="verification-icon">

                        {accountVerified
                            ? (
                                <BadgeCheck size={24} />
                            )
                            : (
                                <CircleAlert size={24} />
                            )}

                    </div>


                    <div className="verification-content">

                        <span className="section-eyebrow">
                            IDENTITY VERIFICATION
                        </span>

                        <h2>
                            {accountVerified
                                ? "Your account identity is verified."
                                : "Your account identity is pending verification."}
                        </h2>

                        <p>
                            {accountVerified
                                ? "Your CareerMind account has a verified identity state."
                                : "Complete account verification when verification becomes available to unlock the full trust layer of your career workspace."}
                        </p>

                    </div>


                    <div
                        className={
                            accountVerified
                                ? "verification-status verified"
                                : "verification-status pending"
                        }
                    >

                        {accountVerified
                            ? (
                                <>
                                    <CheckCircle2 size={16} />
                                    Verified
                                </>
                            )
                            : (
                                <>
                                    <Activity size={16} />
                                    Pending
                                </>
                            )}

                    </div>

                </section>


                {/* =================================================
                   SECURITY
                ================================================= */}

                <section className="security-card">

                    <div className="security-icon">

                        <ShieldCheck size={24} />

                    </div>


                    <div className="security-content">

                        <span className="section-eyebrow">
                            SECURITY STATUS
                        </span>

                        <h2>
                            Protected Career Workspace
                        </h2>

                        <p>
                            Your CareerMind AI workspace is available
                            through authenticated account access.
                            Career intelligence is associated with
                            your authorized profile.
                        </p>

                    </div>


                    <div
                        className={
                            accountActive
                                ? "security-status secure"
                                : "security-status warning"
                        }
                    >

                        {accountActive
                            ? (
                                <CheckCircle2 size={16} />
                            )
                            : (
                                <Activity size={16} />
                            )}

                        <span>
                            {accountActive
                                ? "Protected"
                                : "Review Required"}
                        </span>

                    </div>

                </section>


                {/* =================================================
                   FOOTER
                ================================================= */}

                <footer className="profile-footer">

                    <div className="footer-brand">

                        <div className="footer-logo">

                            <BrainCircuit size={17} />

                        </div>


                        <div>

                            <strong>
                                CareerMind AI
                            </strong>

                            <span>
                                AI Career Intelligence Platform
                            </span>

                        </div>

                    </div>


                    <div className="footer-meta">

                        <span>
                            Profile Intelligence Center
                        </span>

                        <span className="footer-separator">
                            /
                        </span>

                        <span>
                            Secure Workspace
                        </span>

                    </div>

                </footer>

            </main>

        </DashboardLayout>
    );
}


/* ============================================================
   HERO METRIC
============================================================ */

function HeroMetric({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: ReactNode;
}) {

    return (
        <div className="hero-metric">

            <div className="hero-metric-icon">
                {icon}
            </div>


            <div>

                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>

            </div>

        </div>
    );
}


/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
    eyebrow,
    icon,
    title,
    description,
}: {
    eyebrow: string;
    icon: ReactNode;
    title: string;
    description: string;
}) {

    return (
        <div className="profile-section-heading">

            <div className="section-heading-icon">
                {icon}
            </div>


            <div>

                <span className="section-eyebrow">
                    {eyebrow}
                </span>

                <h2>
                    {title}
                </h2>

                <p>
                    {description}
                </p>

            </div>

        </div>
    );
}


/* ============================================================
   PROFILE INFORMATION CARD
============================================================ */

function ProfileInfoCard({
    icon,
    title,
    value,
    description,
    status,
}: {
    icon: ReactNode;
    title: string;
    value: string;
    description: string;
    status?: boolean;
}) {

    return (
        <article className="profile-info-card">

            <div className="profile-info-icon">
                {icon}
            </div>


            <div className="profile-info-content">

                <span>
                    {title}
                </span>

                <h3>
                    {value}
                </h3>

                <p>
                    {description}
                </p>

            </div>


            {status !== undefined && (
                <div
                    className={
                        status
                            ? "info-status active"
                            : "info-status inactive"
                    }
                >

                    <span />

                    {status
                        ? "ACTIVE"
                        : "INACTIVE"}

                </div>
            )}

        </article>
    );
}


/* ============================================================
   INTELLIGENCE SIGNAL
============================================================ */

function IntelligenceSignal({
    icon,
    title,
    value,
    description,
}: {
    icon: ReactNode;
    title: string;
    value: string;
    description: string;
}) {

    return (
        <article className="intelligence-signal">

            <div className="signal-icon">
                {icon}
            </div>


            <div className="signal-content">

                <div className="signal-heading">

                    <h3>
                        {title}
                    </h3>

                    <span className="signal-active">
                        {value}
                    </span>

                </div>


                <p>
                    {description}
                </p>

            </div>


            <div className="signal-check">
                <CheckCircle2 size={15} />
            </div>

        </article>
    );
}


/* ============================================================
   CAPABILITY
============================================================ */

function Capability({
    icon,
    label,
}: {
    icon: ReactNode;
    label: string;
}) {

    return (
        <span className="ai-capability">

            {icon}

            {label}

        </span>
    );
}


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
    active,
    label,
}: {
    active: boolean;
    label: string;
}) {

    return (
        <span
            className={
                active
                    ? "profile-status active"
                    : "profile-status pending"
            }
        >

            {active
                ? <BadgeCheck size={14} />
                : <Activity size={14} />
            }

            {label}

        </span>
    );
}


/* ============================================================
   ROLE FORMATTER
============================================================ */

function formatRole(role: string): string {

    return role
        .trim()
        .replace(/[_-]+/g, " ")
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}