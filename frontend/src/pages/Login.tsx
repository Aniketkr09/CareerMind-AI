/**
 * ============================================================
 * CareerMind AI
 * Login.tsx
 *
 * AI Career Intelligence Authentication
 *
 * Features
 * ------------------------------------------------------------
 * - Professional AI startup / MNC-level UI
 * - React + TypeScript
 * - React Router compatible
 * - Existing useAuth() compatible
 * - JWT authentication through AuthContext
 * - Email + password validation
 * - Show / hide password
 * - Loading state
 * - Error state
 * - Remember visual state
 * - Password recovery link
 * - Register CTA
 * - Responsive layout
 * - No fake API calls
 * - No direct backend dependency
 * ============================================================
 */

import {
    ArrowLeft,
    ArrowRight,
    Brain,
    CheckCircle2,
    Eye,
    EyeOff,
    FileSearch,
    LockKeyhole,
    Network,
    ScanSearch,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    UserRound,
    Zap,
} from "lucide-react";

import {
    FormEvent,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import "../styles/auth.css";


/* ============================================================
   TYPES
============================================================ */

interface LoginForm {
    email: string;
    password: string;
}

interface LoginErrors {
    email?: string;
    password?: string;
}


/* ============================================================
   LOGO
============================================================ */

function LoginLogo() {
    return (
        <div className="login-logo-mark">

            <div className="login-logo-core">
                <Brain size={22} />
            </div>

            <span className="login-logo-ring login-ring-one" />
            <span className="login-logo-ring login-ring-two" />

        </div>
    );
}


/* ============================================================
   FEATURE
============================================================ */

function IntelligenceFeature({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="login-intelligence-feature">

            <div className="login-feature-icon">
                {icon}
            </div>

            <div>
                <strong>
                    {title}
                </strong>

                <span>
                    {description}
                </span>
            </div>

        </div>
    );
}


/* ============================================================
   SIGNAL
============================================================ */

function SignalBar({
    label,
    value,
    width,
}: {
    label: string;
    value: string;
    width: string;
}) {
    return (
        <div className="login-signal">

            <div className="login-signal-heading">

                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>

            </div>

            <div className="login-signal-track">
                <span
                    style={{
                        width,
                    }}
                />
            </div>

        </div>
    );
}


/* ============================================================
   LOGIN PAGE
============================================================ */

export default function Login() {

    const navigate = useNavigate();

    const location = useLocation();

    const {
        login,
        isAuthenticated,
        loading: authLoading,
    } = useAuth();


    /* ========================================================
       STATE
    ======================================================== */

    const [
        form,
        setForm,
    ] = useState<LoginForm>({
        email: "",
        password: "",
    });


    const [
        errors,
        setErrors,
    ] = useState<LoginErrors>({});


    const [
        submitError,
        setSubmitError,
    ] = useState("");


    const [
        submitting,
        setSubmitting,
    ] = useState(false);


    const [
        showPassword,
        setShowPassword,
    ] = useState(false);


    const [
        rememberMe,
        setRememberMe,
    ] = useState(true);


    const [
        focusedField,
        setFocusedField,
    ] = useState<
        "email" |
        "password" |
        ""
    >("");


    /* ========================================================
       REDIRECT IF ALREADY AUTHENTICATED
    ======================================================== */

    useEffect(() => {

        if (
            !authLoading &&
            isAuthenticated
        ) {
            navigate(
                "/dashboard",
                {
                    replace: true,
                },
            );
        }

    }, [
        authLoading,
        isAuthenticated,
        navigate,
    ]);


    /* ========================================================
       RETURN URL
    ======================================================== */

    const returnTo = useMemo(
        () => {

            const state =
                location.state as
                | {
                    from?: {
                        pathname?: string;
                    };
                }
                | null;

            const pathname =
                state?.from?.pathname;

            if (
                pathname &&
                pathname !== "/login" &&
                pathname !== "/register"
            ) {
                return pathname;
            }

            return "/dashboard";

        },
        [location.state],
    );


    /* ========================================================
       FIELD CHANGE
    ======================================================== */

    const handleChange = (
        field: keyof LoginForm,
        value: string,
    ) => {

        setForm(
            previous => ({
                ...previous,
                [field]: value,
            }),
        );


        setSubmitError("");


        setErrors(
            previous => ({
                ...previous,
                [field]: undefined,
            }),
        );
    };


    /* ========================================================
       VALIDATION
    ======================================================== */

    const validate = (): boolean => {

        const nextErrors: LoginErrors = {};


        const email =
            form.email.trim();


        if (!email) {

            nextErrors.email =
                "Email address is required.";

        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email,
            )
        ) {

            nextErrors.email =
                "Enter a valid email address.";

        }


        if (!form.password) {

            nextErrors.password =
                "Password is required.";

        } else if (
            form.password.length < 6
        ) {

            nextErrors.password =
                "Password must contain at least 6 characters.";

        }


        setErrors(nextErrors);


        return (
            Object.keys(nextErrors).length === 0
        );
    };


    /* ========================================================
       LOGIN
    ======================================================== */

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {

        event.preventDefault();


        if (submitting) {
            return;
        }


        const valid =
            validate();


        if (!valid) {
            return;
        }


        try {

            setSubmitting(true);

            setSubmitError("");


            /*
             * Your AuthContext is responsible for:
             *
             * - calling authService
             * - sending credentials
             * - storing JWT
             * - updating authenticated user
             */

            await login(
                form.email.trim(),
                form.password,
            );


            /*
             * AuthContext should now have
             * the authenticated user.
             */

            if (rememberMe) {

                localStorage.setItem(
                    "careermind_remember",
                    "true",
                );

            } else {

                localStorage.removeItem(
                    "careermind_remember",
                );
            }


            navigate(
                returnTo,
                {
                    replace: true,
                },
            );

        } catch (error) {

            console.error(
                "CareerMind login failed:",
                error,
            );


            let message =
                "Unable to sign in. Please check your credentials and try again.";


            if (
                error instanceof Error &&
                error.message
            ) {
                message =
                    error.message;
            }


            /*
             * Convert common backend messages
             * into user-friendly messages.
             */

            const normalized =
                message.toLowerCase();


            if (
                normalized.includes(
                    "401",
                ) ||
                normalized.includes(
                    "incorrect",
                ) ||
                normalized.includes(
                    "invalid credentials",
                ) ||
                normalized.includes(
                    "unauthorized",
                )
            ) {

                message =
                    "Email or password is incorrect.";

            } else if (
                normalized.includes(
                    "network",
                ) ||
                normalized.includes(
                    "failed to fetch",
                )
            ) {

                message =
                    "CareerMind cannot reach the AI server. Make sure the backend is running.";

            }


            setSubmitError(message);

        } finally {

            setSubmitting(false);

        }
    };


    /* ========================================================
       PASSWORD STRENGTH
    ======================================================== */

    const passwordStrength =
        form.password.length === 0
            ? 0
            : form.password.length < 6
                ? 25
                : form.password.length < 9
                    ? 55
                    : form.password.length < 12
                        ? 75
                        : 100;


    const passwordStrengthLabel =
        passwordStrength === 0
            ? "Enter password"
            : passwordStrength < 50
                ? "Weak"
                : passwordStrength < 75
                    ? "Good"
                    : "Strong";


    /* ========================================================
       LOADING SCREEN
    ======================================================== */

    if (authLoading) {

        return (
            <main className="login-page">

                <div className="login-background">

                    <div className="login-grid" />

                    <div className="login-orb login-orb-one" />
                    <div className="login-orb login-orb-two" />

                </div>

                <div className="login-initializing">

                    <div className="login-initializing-orb">
                        <Brain size={28} />
                    </div>

                    <strong>
                        Initializing CareerMind
                    </strong>

                    <span>
                        Establishing secure intelligence session...
                    </span>

                    <div className="login-loading-line">
                        <span />
                    </div>

                </div>

            </main>
        );
    }


    /* ========================================================
       MAIN
    ======================================================== */

    return (

        <main className="login-page">

            {/* ==================================================
                BACKGROUND
            ================================================== */}

            <div
                className="login-background"
                aria-hidden="true"
            >

                <div className="login-grid" />

                <div className="login-orb login-orb-one" />

                <div className="login-orb login-orb-two" />

                <div className="login-orb login-orb-three" />

                <div className="login-noise" />

            </div>


            {/* ==================================================
                TOP BAR
            ================================================== */}

            <header className="login-topbar">

                <Link
                    to="/"
                    className="login-brand"
                >

                    <LoginLogo />

                    <div>

                        <strong>
                            CareerMind
                        </strong>

                        <span>
                            AI CAREER INTELLIGENCE
                        </span>

                    </div>

                </Link>


                <div className="login-topbar-right">

                    <div className="login-system-status">

                        <span />

                        AI SYSTEM ONLINE

                    </div>


                    <Link
                        to="/"
                        className="login-back-home"
                    >

                        <ArrowLeft size={15} />

                        Back to platform

                    </Link>

                </div>

            </header>


            {/* ==================================================
                MAIN AUTH CONTAINER
            ================================================== */}

            <section className="login-container">


                {/* ==================================================
                    LEFT INTELLIGENCE PANEL
                ================================================== */}

                <aside className="login-intelligence-panel">


                    <div className="login-intelligence-header">

                        <div className="login-live-badge">

                            <span />

                            LIVE INTELLIGENCE

                        </div>

                        <h1>

                            Your career
                            <br />

                            <span>
                                starts with
                            </span>

                            <br />

                            intelligence.

                        </h1>

                        <p>
                            Sign in to continue building
                            your professional intelligence
                            profile with CareerMind AI.
                        </p>

                    </div>


                    {/* ==================================================
                        SIGNAL VISUAL
                    ================================================== */}

                    <div className="login-signal-console">

                        <div className="login-console-top">

                            <div>

                                <span>
                                    CAREERMIND ENGINE
                                </span>

                                <strong>
                                    PROFESSIONAL SIGNAL
                                </strong>

                            </div>

                            <div className="login-console-online">

                                <span />

                                ONLINE

                            </div>

                        </div>


                        <div className="login-console-core">

                            <div className="login-ai-orbit orbit-one" />
                            <div className="login-ai-orbit orbit-two" />
                            <div className="login-ai-orbit orbit-three" />


                            <div className="login-ai-core">

                                <Brain size={30} />

                                <span>
                                    AI
                                </span>

                            </div>


                            <div className="login-floating-signal signal-top">

                                <Sparkles size={13} />

                                <span>
                                    Career Fit
                                </span>

                                <strong>
                                    AI
                                </strong>

                            </div>


                            <div className="login-floating-signal signal-right">

                                <Network size={13} />

                                <span>
                                    Skill Graph
                                </span>

                                <strong>
                                    AI
                                </strong>

                            </div>


                            <div className="login-floating-signal signal-bottom">

                                <Target size={13} />

                                <span>
                                    Direction
                                </span>

                                <strong>
                                    AI
                                </strong>

                            </div>


                            <div className="login-floating-signal signal-left">

                                <TrendingUp size={13} />

                                <span>
                                    Growth
                                </span>

                                <strong>
                                    AI
                                </strong>

                            </div>

                        </div>


                        <div className="login-console-signals">

                            <SignalBar
                                label="Resume Intelligence"
                                value="ACTIVE"
                                width="88%"
                            />

                            <SignalBar
                                label="Career Alignment"
                                value="ACTIVE"
                                width="76%"
                            />

                            <SignalBar
                                label="Growth Engine"
                                value="READY"
                                width="92%"
                            />

                        </div>

                    </div>


                    {/* ==================================================
                        FEATURES
                    ================================================== */}

                    <div className="login-intelligence-features">

                        <IntelligenceFeature
                            icon={
                                <FileSearch size={17} />
                            }
                            title="Resume Intelligence"
                            description="Turn professional evidence into structured signals."
                        />

                        <IntelligenceFeature
                            icon={
                                <Network size={17} />
                            }
                            title="Skill Intelligence"
                            description="Map your capabilities and discover skill gaps."
                        />

                        <IntelligenceFeature
                            icon={
                                <Target size={17} />
                            }
                            title="Career Direction"
                            description="Find the highest-impact path for your profile."
                        />

                    </div>


                    {/* ==================================================
                        TRUST
                    ================================================== */}

                    <div className="login-trust-row">

                        <span>
                            <ShieldCheck size={14} />
                            Protected profile
                        </span>

                        <span>
                            <LockKeyhole size={14} />
                            Secure access
                        </span>

                        <span>
                            <Zap size={14} />
                            AI powered
                        </span>

                    </div>

                </aside>


                {/* ==================================================
                    LOGIN PANEL
                ================================================== */}

                <section className="login-form-panel">


                    <div className="login-form-wrapper">


                        {/* ==================================================
                            FORM HEADER
                        ================================================== */}

                        <div className="login-form-header">

                            <div className="login-form-icon">

                                <UserRound size={22} />

                                <span />

                            </div>


                            <div className="login-form-eyebrow">

                                <span />

                                AUTHENTICATED ACCESS

                            </div>


                            <h2>
                                Welcome back.
                            </h2>


                            <p>
                                Sign in to your CareerMind
                                intelligence workspace.
                            </p>

                        </div>


                        {/* ==================================================
                            ERROR
                        ================================================== */}

                        {submitError && (

                            <div
                                className="login-error"
                                role="alert"
                            >

                                <div className="login-error-icon">
                                    !
                                </div>

                                <div>

                                    <strong>
                                        Sign in failed
                                    </strong>

                                    <span>
                                        {submitError}
                                    </span>

                                </div>

                            </div>

                        )}


                        {/* ==================================================
                            FORM
                        ================================================== */}

                        <form
                            className="login-form"
                            onSubmit={handleSubmit}
                            noValidate
                        >


                            {/* EMAIL */}

                            <div
                                className={
                                    `login-field ${focusedField === "email"
                                        ? "is-focused"
                                        : ""
                                    } ${errors.email
                                        ? "has-error"
                                        : ""
                                    }`
                                }
                            >

                                <label htmlFor="login-email">
                                    Email address
                                </label>


                                <div className="login-input-wrapper">

                                    <div className="login-input-icon">

                                        <UserRound
                                            size={17}
                                        />

                                    </div>


                                    <input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={event =>
                                            handleChange(
                                                "email",
                                                event.target.value,
                                            )
                                        }
                                        onFocus={() =>
                                            setFocusedField(
                                                "email",
                                            )
                                        }
                                        onBlur={() =>
                                            setFocusedField(
                                                "",
                                            )
                                        }
                                        disabled={submitting}
                                    />

                                </div>


                                {errors.email && (

                                    <span className="login-field-error">
                                        {errors.email}
                                    </span>

                                )}

                            </div>


                            {/* PASSWORD */}

                            <div
                                className={
                                    `login-field ${focusedField === "password"
                                        ? "is-focused"
                                        : ""
                                    } ${errors.password
                                        ? "has-error"
                                        : ""
                                    }`
                                }
                            >

                                <div className="login-password-label">

                                    <label htmlFor="login-password">
                                        Password
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="login-forgot"
                                    >
                                        Forgot password?
                                    </Link>

                                </div>


                                <div className="login-input-wrapper">

                                    <div className="login-input-icon">

                                        <LockKeyhole
                                            size={17}
                                        />

                                    </div>


                                    <input
                                        id="login-password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={event =>
                                            handleChange(
                                                "password",
                                                event.target.value,
                                            )
                                        }
                                        onFocus={() =>
                                            setFocusedField(
                                                "password",
                                            )
                                        }
                                        onBlur={() =>
                                            setFocusedField(
                                                "",
                                            )
                                        }
                                        disabled={submitting}
                                    />


                                    <button
                                        type="button"
                                        className="login-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                previous =>
                                                    !previous,
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        disabled={submitting}
                                    >

                                        {showPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}

                                    </button>

                                </div>


                                {errors.password && (

                                    <span className="login-field-error">
                                        {errors.password}
                                    </span>

                                )}


                                {form.password && !errors.password && (

                                    <div className="login-password-strength">

                                        <div>

                                            <span>
                                                Password strength
                                            </span>

                                            <strong>
                                                {passwordStrengthLabel}
                                            </strong>

                                        </div>

                                        <div className="login-strength-track">

                                            <span
                                                style={{
                                                    width:
                                                        `${passwordStrength}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                )}

                            </div>


                            {/* OPTIONS */}

                            <div className="login-form-options">

                                <label className="login-checkbox">

                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={event =>
                                            setRememberMe(
                                                event.target.checked,
                                            )
                                        }
                                        disabled={submitting}
                                    />

                                    <span className="login-custom-checkbox">
                                        <CheckCircle2
                                            size={13}
                                        />
                                    </span>

                                    <span>
                                        Keep me signed in
                                    </span>

                                </label>


                                <span className="login-session">

                                    <ShieldCheck size={13} />

                                    Secure session

                                </span>

                            </div>


                            {/* SUBMIT */}

                            <button
                                type="submit"
                                className="login-submit"
                                disabled={submitting}
                            >

                                {submitting ? (

                                    <>
                                        <span className="login-spinner" />

                                        Establishing secure session...

                                    </>

                                ) : (

                                    <>
                                        <Sparkles size={17} />

                                        Enter CareerMind

                                        <ArrowRight
                                            size={17}
                                        />

                                    </>

                                )}

                            </button>


                            {/* SECURITY MESSAGE */}

                            <div className="login-security-message">

                                <ShieldCheck size={15} />

                                <span>
                                    Your session is protected by
                                    authenticated access and encrypted
                                    credential transmission.
                                </span>

                            </div>

                        </form>


                        {/* ==================================================
                            REGISTER
                        ================================================== */}

                        <div className="login-register">

                            <span>
                                New to CareerMind?
                            </span>

                            <Link
                                to="/register"
                            >
                                Create your intelligence profile

                                <ArrowRight
                                    size={14}
                                />

                            </Link>

                        </div>


                        {/* ==================================================
                            FOOTER
                        ================================================== */}

                        <div className="login-form-footer">

                            <span>
                                CareerMind AI
                            </span>

                            <i />

                            <span>
                                AI Career Intelligence Platform
                            </span>

                        </div>

                    </div>

                </section>

            </section>


            {/* ==================================================
                BOTTOM STATUS
            ================================================== */}

            <footer className="login-bottom">

                <div>

                    <span className="login-bottom-dot" />

                    CareerMind Intelligence Engine

                </div>

                <span>
                    © 2026 CareerMind AI
                </span>

                <span>
                    Secure workspace
                </span>

            </footer>

        </main>
    );
}