/**
 * ============================================================
 * CareerMind AI
 * AI Career Intelligence Platform
 *
 * Register Page
 * ============================================================
 *
 * Backend:
 *   POST /api/v1/auth/register
 *
 * Request:
 *   {
 *      full_name: string,
 *      email: string,
 *      password: string
 *   }
 *
 * Authentication:
 *   useAuth().register()
 *
 * Route:
 *   /register
 *
 * Design:
 *   - Premium AI SaaS
 *   - Deep-space interface
 *   - Professional onboarding
 *   - Responsive
 *   - Accessible form controls
 *   - No fake AI intelligence
 * ============================================================
 */

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    ChangeEvent,
    FormEvent,
} from "react";

import {
    ArrowRight,
    Brain,
    Check,
    CheckCircle2,
    CircleAlert,
    Eye,
    EyeOff,
    Fingerprint,
    LockKeyhole,
    Mail,
    Network,
    Rocket,
    ShieldCheck,
    Sparkles,
    User,
    UserPlus,
    Zap,
} from "lucide-react";

import {
    Link,
    Navigate,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import "../styles/auth.css";

/* ============================================================
   TYPES
============================================================ */

interface RegisterForm {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface PasswordRule {
    label: string;
    valid: boolean;
}

/* ============================================================
   HELPERS
============================================================ */

function normalizeEmail(
    value: string,
): string {
    return value
        .trim()
        .toLowerCase();
}

function getErrorMessage(
    error: unknown,
): string {
    if (
        error &&
        typeof error === "object"
    ) {
        const object =
            error as Record<
                string,
                unknown
            >;

        const response =
            object.response;

        if (
            response &&
            typeof response === "object"
        ) {
            const responseObject =
                response as Record<
                    string,
                    unknown
                >;

            const data =
                responseObject.data;

            if (
                data &&
                typeof data === "object"
            ) {
                const dataObject =
                    data as Record<
                        string,
                        unknown
                    >;

                if (
                    typeof dataObject.detail ===
                    "string"
                ) {
                    return dataObject.detail;
                }

                if (
                    typeof dataObject.message ===
                    "string"
                ) {
                    return dataObject.message;
                }

                if (
                    Array.isArray(
                        dataObject.detail,
                    )
                ) {
                    const first =
                        dataObject.detail[0];

                    if (
                        first &&
                        typeof first === "object"
                    ) {
                        const firstObject =
                            first as Record<
                                string,
                                unknown
                            >;

                        if (
                            typeof firstObject.msg ===
                            "string"
                        ) {
                            return firstObject.msg;
                        }
                    }
                }
            }
        }

        if (
            typeof object.message ===
            "string"
        ) {
            return object.message;
        }
    }

    return "Unable to create your CareerMind account. Please try again.";
}

/* ============================================================
   PASSWORD RULES
============================================================ */

function getPasswordRules(
    password: string,
): PasswordRule[] {
    return [
        {
            label: "At least 8 characters",
            valid:
                password.length >= 8,
        },
        {
            label: "One uppercase letter",
            valid:
                /[A-Z]/.test(password),
        },
        {
            label: "One lowercase letter",
            valid:
                /[a-z]/.test(password),
        },
        {
            label: "One number",
            valid:
                /\d/.test(password),
        },
    ];
}

/* ============================================================
   REGISTER PAGE
============================================================ */

export default function Register() {
    const navigate =
        useNavigate();

    const {
        user,
        register,
    } = useAuth();

    /* ========================================================
       FORM
    ======================================================== */

    const [
        form,
        setForm,
    ] = useState<RegisterForm>({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    const [
        success,
        setSuccess,
    ] = useState<string | null>(
        null,
    );

    /* ========================================================
       REDIRECT AUTHENTICATED USER
    ======================================================== */

    if (user) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    /* ========================================================
       PASSWORD INTELLIGENCE
    ======================================================== */

    const passwordRules =
        useMemo(
            () =>
                getPasswordRules(
                    form.password,
                ),
            [form.password],
        );

    const passwordScore =
        passwordRules.filter(
            rule => rule.valid,
        ).length;

    const passwordStrength =
        form.password.length === 0
            ? "EMPTY"
            : passwordScore <= 1
                ? "WEAK"
                : passwordScore === 2
                    ? "FAIR"
                    : passwordScore === 3
                        ? "GOOD"
                        : "STRONG";

    const passwordsMatch =
        form.confirmPassword.length > 0 &&
        form.password ===
        form.confirmPassword;

    /* ========================================================
       FORM HANDLER
    ======================================================== */

    const handleChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const {
            name,
            value,
        } = event.target;

        setForm(
            previous => ({
                ...previous,
                [name]: value,
            }),
        );

        if (error) {
            setError(null);
        }

        if (success) {
            setSuccess(null);
        }
    };

    /* ========================================================
       SUBMIT
    ======================================================== */

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        setError(null);
        setSuccess(null);

        const fullName =
            form.fullName.trim();

        const email =
            normalizeEmail(
                form.email,
            );

        const password =
            form.password;

        const confirmPassword =
            form.confirmPassword;

        /* ----------------------------------------------------
           NAME
        ---------------------------------------------------- */

        if (fullName.length < 2) {
            setError(
                "Please enter your full name.",
            );
            return;
        }

        /* ----------------------------------------------------
           EMAIL
        ---------------------------------------------------- */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailPattern.test(email)
        ) {
            setError(
                "Please enter a valid email address.",
            );
            return;
        }

        /* ----------------------------------------------------
           PASSWORD
        ---------------------------------------------------- */

        if (password.length < 8) {
            setError(
                "Password must contain at least 8 characters.",
            );
            return;
        }

        if (!/[A-Z]/.test(password)) {
            setError(
                "Password must contain at least one uppercase letter.",
            );
            return;
        }

        if (!/[a-z]/.test(password)) {
            setError(
                "Password must contain at least one lowercase letter.",
            );
            return;
        }

        if (!/\d/.test(password)) {
            setError(
                "Password must contain at least one number.",
            );
            return;
        }

        /* ----------------------------------------------------
           CONFIRM PASSWORD
        ---------------------------------------------------- */

        if (
            password !==
            confirmPassword
        ) {
            setError(
                "Passwords do not match.",
            );
            return;
        }

        /* ----------------------------------------------------
           API
        ---------------------------------------------------- */

        setLoading(true);

        try {
            await register({
                full_name: fullName,
                email,
                password,
            });

            setSuccess(
                "Your CareerMind account has been created successfully.",
            );

            /*
             * Give the success state a moment to render,
             * then move the user to login.
             */
            window.setTimeout(() => {
                navigate(
                    "/login",
                    {
                        replace: true,
                        state: {
                            registered: true,
                            email,
                        },
                    },
                );
            }, 1000);

        } catch (registrationError) {
            console.error(
                "CareerMind registration error:",
                registrationError,
            );

            setError(
                getErrorMessage(
                    registrationError,
                ),
            );
        } finally {
            setLoading(false);
        }
    };

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <div className="cm-auth-page">

            {/* =================================================
                BACKGROUND
            ================================================= */}

            <div
                className="cm-auth-background"
                aria-hidden="true"
            >
                <div className="cm-auth-grid" />

                <div className="cm-auth-orb orb-one" />
                <div className="cm-auth-orb orb-two" />
                <div className="cm-auth-orb orb-three" />

                <div className="cm-auth-noise" />
            </div>

            {/* =================================================
                TOP BRAND
            ================================================= */}

            <header className="cm-auth-topbar">

                <Link
                    to="/"
                    className="cm-auth-logo"
                    aria-label="CareerMind AI home"
                >
                    <div className="cm-auth-logo-icon">
                        <Brain size={22} />
                    </div>

                    <div className="cm-auth-logo-copy">
                        <strong>
                            CareerMind
                            <span> AI</span>
                        </strong>

                        <small>
                            CAREER INTELLIGENCE
                        </small>
                    </div>
                </Link>

                <div className="cm-auth-top-status">
                    <span />
                    SECURE ONBOARDING
                </div>

            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="cm-register-shell">

                {/* =================================================
                    LEFT INTELLIGENCE PANEL
                ================================================= */}

                <section className="cm-register-visual">

                    <div className="cm-register-visual-content">

                        <div className="cm-register-eyebrow">
                            <Sparkles size={14} />
                            AI CAREER OPERATING SYSTEM
                        </div>

                        <h1>
                            Build the career
                            <br />
                            <span>
                                intelligence layer
                            </span>
                            <br />
                            behind your next move.
                        </h1>

                        <p>
                            Create your CareerMind profile
                            and turn your professional
                            evidence into a structured,
                            intelligent career workspace.
                        </p>

                        {/* -----------------------------------------
                            AI CORE
                        ----------------------------------------- */}

                        <div className="cm-register-core">

                            <div className="cm-register-orbit orbit-one" />
                            <div className="cm-register-orbit orbit-two" />
                            <div className="cm-register-orbit orbit-three" />

                            <div className="cm-register-core-center">

                                <Brain
                                    size={38}
                                />

                                <span>
                                    AI
                                </span>

                            </div>

                            <div className="cm-register-node node-one">
                                <Network size={15} />
                            </div>

                            <div className="cm-register-node node-two">
                                <Zap size={15} />
                            </div>

                            <div className="cm-register-node node-three">
                                <Rocket size={15} />
                            </div>

                        </div>

                        {/* -----------------------------------------
                            SYSTEM CAPABILITIES
                        ----------------------------------------- */}

                        <div className="cm-register-capabilities">

                            <div className="cm-capability">
                                <div>
                                    <ShieldCheck
                                        size={16}
                                    />
                                </div>

                                <span>
                                    Protected profile
                                </span>
                            </div>

                            <div className="cm-capability">
                                <div>
                                    <Network
                                        size={16}
                                    />
                                </div>

                                <span>
                                    Skill intelligence
                                </span>
                            </div>

                            <div className="cm-capability">
                                <div>
                                    <Rocket
                                        size={16}
                                    />
                                </div>

                                <span>
                                    Career strategy
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* ---------------------------------------------
                        VISUAL FOOTER
                    --------------------------------------------- */}

                    <div className="cm-register-visual-footer">

                        <span>
                            <Fingerprint size={14} />
                            AUTHENTICATED WORKSPACE
                        </span>

                        <span>
                            <LockKeyhole size={14} />
                            PRIVATE BY DESIGN
                        </span>

                    </div>

                </section>

                {/* =================================================
                    REGISTER CARD
                ================================================= */}

                <section className="cm-register-card">

                    <div className="cm-register-card-glow" />

                    <div className="cm-register-card-inner">

                        {/* -----------------------------------------
                            HEADER
                        ----------------------------------------- */}

                        <div className="cm-register-header">

                            <div className="cm-register-icon">
                                <UserPlus
                                    size={22}
                                />
                            </div>

                            <div>

                                <span>
                                    CREATE PROFILE
                                </span>

                                <h2>
                                    Start your
                                    <br />
                                    career intelligence.
                                </h2>

                            </div>

                        </div>

                        <p className="cm-register-description">
                            Create your account to access
                            your personalized CareerMind
                            workspace.
                        </p>

                        {/* -----------------------------------------
                            ALERT
                        ----------------------------------------- */}

                        {error && (
                            <div
                                className="cm-auth-alert error"
                                role="alert"
                            >
                                <CircleAlert
                                    size={17}
                                />

                                <span>
                                    {error}
                                </span>
                            </div>
                        )}

                        {success && (
                            <div
                                className="cm-auth-alert success"
                                role="status"
                            >
                                <CheckCircle2
                                    size={17}
                                />

                                <span>
                                    {success}
                                </span>
                            </div>
                        )}

                        {/* -----------------------------------------
                            FORM
                        ----------------------------------------- */}

                        <form
                            className="cm-register-form"
                            onSubmit={
                                handleSubmit
                            }
                            noValidate
                        >

                            {/* -------------------------------------
                                FULL NAME
                            ------------------------------------- */}

                            <div className="cm-field">

                                <label
                                    htmlFor="fullName"
                                >
                                    FULL NAME
                                </label>

                                <div className="cm-input-shell">

                                    <User
                                        size={17}
                                    />

                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Aniket Kumar"
                                        value={
                                            form.fullName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            loading
                                        }
                                        required
                                    />

                                </div>

                            </div>

                            {/* -------------------------------------
                                EMAIL
                            ------------------------------------- */}

                            <div className="cm-field">

                                <label
                                    htmlFor="email"
                                >
                                    EMAIL ADDRESS
                                </label>

                                <div className="cm-input-shell">

                                    <Mail
                                        size={17}
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={
                                            form.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            loading
                                        }
                                        required
                                    />

                                </div>

                            </div>

                            {/* -------------------------------------
                                PASSWORD
                            ------------------------------------- */}

                            <div className="cm-field">

                                <div className="cm-field-label-row">

                                    <label
                                        htmlFor="password"
                                    >
                                        PASSWORD
                                    </label>

                                    {form.password && (
                                        <span
                                            className={`cm-password-strength strength-${passwordStrength.toLowerCase()}`}
                                        >
                                            {passwordStrength}
                                        </span>
                                    )}

                                </div>

                                <div className="cm-input-shell">

                                    <LockKeyhole
                                        size={17}
                                    />

                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="new-password"
                                        placeholder="Create a strong password"
                                        value={
                                            form.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            loading
                                        }
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="cm-input-action"
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
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                size={17}
                                            />
                                        ) : (
                                            <Eye
                                                size={17}
                                            />
                                        )}
                                    </button>

                                </div>

                                {/* ---------------------------------
                                    PASSWORD RULES
                                --------------------------------- */}

                                {form.password && (
                                    <div className="cm-password-rules">

                                        {passwordRules.map(
                                            rule => (
                                                <span
                                                    key={
                                                        rule.label
                                                    }
                                                    className={
                                                        rule.valid
                                                            ? "valid"
                                                            : ""
                                                    }
                                                >
                                                    <Check
                                                        size={12}
                                                    />

                                                    {rule.label}
                                                </span>
                                            ),
                                        )}

                                    </div>
                                )}

                            </div>

                            {/* -------------------------------------
                                CONFIRM PASSWORD
                            ------------------------------------- */}

                            <div className="cm-field">

                                <label
                                    htmlFor="confirmPassword"
                                >
                                    CONFIRM PASSWORD
                                </label>

                                <div
                                    className={`cm-input-shell ${form.confirmPassword &&
                                            passwordsMatch
                                            ? "confirmed"
                                            : ""
                                        }`}
                                >

                                    <CheckCircle2
                                        size={17}
                                    />

                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="new-password"
                                        placeholder="Repeat your password"
                                        value={
                                            form.confirmPassword
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            loading
                                        }
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="cm-input-action"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                previous =>
                                                    !previous,
                                            )
                                        }
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirmation password"
                                                : "Show confirmation password"
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff
                                                size={17}
                                            />
                                        ) : (
                                            <Eye
                                                size={17}
                                            />
                                        )}
                                    </button>

                                </div>

                                {form.confirmPassword &&
                                    passwordsMatch && (
                                        <div className="cm-password-match">
                                            <CheckCircle2
                                                size={13}
                                            />
                                            Passwords match
                                        </div>
                                    )}

                            </div>

                            {/* -------------------------------------
                                TRUST
                            ------------------------------------- */}

                            <div className="cm-register-trust">

                                <ShieldCheck
                                    size={16}
                                />

                                <span>
                                    Your account is protected
                                    by authenticated access.
                                </span>

                            </div>

                            {/* -------------------------------------
                                SUBMIT
                            ------------------------------------- */}

                            <button
                                type="submit"
                                className="cm-register-submit"
                                disabled={
                                    loading
                                }
                            >

                                {loading ? (
                                    <>
                                        <span className="cm-button-spinner" />
                                        Creating intelligence profile...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles
                                            size={17}
                                        />

                                        Create CareerMind Account

                                        <ArrowRight
                                            size={17}
                                        />
                                    </>
                                )}

                            </button>

                        </form>

                        {/* -----------------------------------------
                            LOGIN
                        ----------------------------------------- */}

                        <div className="cm-register-login">

                            <span>
                                Already have an account?
                            </span>

                            <Link
                                to="/login"
                            >
                                Sign in
                                <ArrowRight
                                    size={14}
                                />
                            </Link>

                        </div>

                        {/* -----------------------------------------
                            FOOTER
                        ----------------------------------------- */}

                        <div className="cm-register-footer">

                            <span>
                                <LockKeyhole
                                    size={12}
                                />
                                Secure authentication
                            </span>

                            <span>
                                CareerMind AI
                            </span>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}