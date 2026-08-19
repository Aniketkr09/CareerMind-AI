/**
 * ============================================================
 * CareerMind AI
 *
 * AI Career OS — Global Navigation
 *
 * Responsibilities:
 * - Authenticated user identity
 * - AI system status
 * - Global career intelligence search
 * - Notification center
 * - Profile menu
 * - Logout
 * - Responsive navigation
 *
 * Stack:
 * React + TypeScript
 * Lucide React
 * AuthContext
 * ============================================================
 */

import {
    Bell,
    BrainCircuit,
    ChevronDown,
    Command,
    LogOut,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    UserRound,
    X,
} from "lucide-react";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { useAuth } from "../../hooks/useAuth";

import "./navbar.css";


// ============================================================
// TYPES
// ============================================================

interface SearchItem {
    id: string;
    title: string;
    description: string;
    href: string;
    keywords: string[];
}


// ============================================================
// SEARCH INDEX
// ============================================================

const SEARCH_ITEMS: SearchItem[] = [
    {
        id: "resume",
        title: "Resume Intelligence",
        description: "Analyze ATS score, resume quality and evidence.",
        href: "#resume-intelligence",
        keywords: [
            "resume",
            "cv",
            "ats",
            "analysis",
            "profile",
        ],
    },
    {
        id: "skills",
        title: "Skill Intelligence",
        description: "Explore your technical capability map.",
        href: "#skill-intelligence",
        keywords: [
            "skills",
            "technical",
            "capabilities",
            "skill gap",
        ],
    },
    {
        id: "career",
        title: "Career Strategy",
        description: "Discover your strongest career direction.",
        href: "#career-strategy",
        keywords: [
            "career",
            "jobs",
            "direction",
            "recommendation",
        ],
    },
    {
        id: "growth",
        title: "Growth Intelligence",
        description: "Build your personalized development roadmap.",
        href: "#growth-intelligence",
        keywords: [
            "growth",
            "roadmap",
            "learning",
            "development",
        ],
    },
    {
        id: "interview",
        title: "Interview Center",
        description: "Prepare for technical and behavioral interviews.",
        href: "#interview-center",
        keywords: [
            "interview",
            "technical",
            "behavioral",
            "system design",
        ],
    },
];


// ============================================================
// COMPONENT
// ============================================================

export default function Navbar() {

    const {
        user,
        logout,
    } = useAuth();


    // --------------------------------------------------------
    // UI STATE
    // --------------------------------------------------------

    const [
        profileOpen,
        setProfileOpen,
    ] = useState(false);

    const [
        searchOpen,
        setSearchOpen,
    ] = useState(false);

    const [
        searchValue,
        setSearchValue,
    ] = useState("");

    const [
        notificationOpen,
        setNotificationOpen,
    ] = useState(false);


    // --------------------------------------------------------
    // REFS
    // --------------------------------------------------------

    const profileRef =
        useRef<HTMLDivElement | null>(null);

    const notificationRef =
        useRef<HTMLDivElement | null>(null);

    const searchInputRef =
        useRef<HTMLInputElement | null>(null);


    // ========================================================
    // DERIVED USER DATA
    // ========================================================

    const fullName =
        user?.full_name?.trim() ||
        "CareerMind User";

    const role =
        user?.role?.trim() ||
        "Student";

    const initials =
        fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (part) =>
                    part.charAt(0).toUpperCase(),
            )
            .join("") || "CM";


    // ========================================================
    // SEARCH RESULTS
    // ========================================================

    const normalizedSearch =
        searchValue
            .trim()
            .toLowerCase();

    const searchResults =
        normalizedSearch
            ? SEARCH_ITEMS.filter(
                (item) => {

                    const searchable =
                        [
                            item.title,
                            item.description,
                            ...item.keywords,
                        ]
                            .join(" ")
                            .toLowerCase();

                    return searchable.includes(
                        normalizedSearch,
                    );
                },
            )
            : SEARCH_ITEMS.slice(0, 4);


    // ========================================================
    // CLOSE MENUS WHEN CLICKING OUTSIDE
    // ========================================================

    useEffect(() => {

        const handlePointerDown =
            (event: MouseEvent) => {

                const target =
                    event.target as Node;

                if (
                    profileRef.current &&
                    !profileRef.current.contains(target)
                ) {
                    setProfileOpen(false);
                }

                if (
                    notificationRef.current &&
                    !notificationRef.current.contains(target)
                ) {
                    setNotificationOpen(false);
                }
            };


        document.addEventListener(
            "mousedown",
            handlePointerDown,
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handlePointerDown,
            );

        };

    }, []);


    // ========================================================
    // KEYBOARD SHORTCUT
    // ========================================================

    useEffect(() => {

        const handleKeyboard =
            (event: KeyboardEvent) => {

                const isCommand =
                    event.ctrlKey ||
                    event.metaKey;


                if (
                    isCommand &&
                    event.key.toLowerCase() === "k"
                ) {

                    event.preventDefault();

                    setSearchOpen(true);

                    window.setTimeout(
                        () => {
                            searchInputRef.current?.focus();
                        },
                        50,
                    );
                }


                if (
                    event.key === "Escape"
                ) {

                    setSearchOpen(false);

                    setProfileOpen(false);

                    setNotificationOpen(false);

                }

            };


        document.addEventListener(
            "keydown",
            handleKeyboard,
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyboard,
            );

        };

    }, []);


    // ========================================================
    // SEARCH NAVIGATION
    // ========================================================

    const handleSearchNavigation =
        (href: string) => {

            setSearchOpen(false);

            setSearchValue("");

            window.location.hash =
                href.replace("#", "");

        };


    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout =
        async () => {

            setProfileOpen(false);

            try {

                await logout();

            } catch (error) {

                console.error(
                    "CareerMind AI | Logout failed:",
                    error,
                );

            }

        };


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <header
            className="cm-navbar"
            role="banner"
        >

            <div className="cm-navbar-inner">


                {/* =================================================
                    BRAND
                ================================================= */}

                <a
                    href="/dashboard"
                    className="cm-brand"
                    aria-label="CareerMind AI dashboard"
                >

                    <div
                        className="cm-brand-mark"
                        aria-hidden="true"
                    >

                        <BrainCircuit size={21} />

                        <span className="cm-brand-pulse" />

                    </div>


                    <div className="cm-brand-copy">

                        <strong>
                            CareerMind
                        </strong>

                        <span>
                            AI CAREER OS
                        </span>

                    </div>

                </a>


                {/* =================================================
                    CENTER SEARCH
                ================================================= */}

                <div className="cm-search-area">

                    <button
                        type="button"
                        className="cm-search-trigger"
                        onClick={() => {

                            setSearchOpen(true);

                            window.setTimeout(
                                () => {
                                    searchInputRef.current?.focus();
                                },
                                50,
                            );

                        }}
                        aria-label="Search CareerMind"
                    >

                        <Search size={17} />

                        <span>
                            Search career intelligence...
                        </span>

                        <kbd>
                            <Command size={12} />
                            K
                        </kbd>

                    </button>

                </div>


                {/* =================================================
                    RIGHT CONTROLS
                ================================================= */}

                <div className="cm-navbar-actions">


                    {/* AI STATUS */}

                    <div
                        className="cm-ai-status"
                        title="CareerMind AI systems are online"
                    >

                        <span className="cm-ai-status-dot" />

                        <span>
                            AI Online
                        </span>

                    </div>


                    {/* NOTIFICATIONS */}

                    <div
                        className="cm-action-wrapper"
                        ref={notificationRef}
                    >

                        <button
                            type="button"
                            className="cm-icon-button"
                            aria-label="Open notifications"
                            aria-expanded={
                                notificationOpen
                            }
                            onClick={() => {

                                setNotificationOpen(
                                    (value) => !value,
                                );

                                setProfileOpen(false);

                            }}
                        >

                            <Bell size={18} />

                            <span className="cm-notification-count">
                                3
                            </span>

                        </button>


                        {notificationOpen && (

                            <div className="cm-popover cm-notification-popover">

                                <div className="cm-popover-header">

                                    <div>

                                        <strong>
                                            Intelligence Center
                                        </strong>

                                        <span>
                                            Recent activity
                                        </span>

                                    </div>

                                    <span className="cm-live-label">
                                        LIVE
                                    </span>

                                </div>


                                <div className="cm-notification-list">

                                    <div className="cm-notification-item">

                                        <div className="cm-notification-icon">
                                            <Sparkles size={15} />
                                        </div>

                                        <div>

                                            <strong>
                                                AI analysis available
                                            </strong>

                                            <span>
                                                Your latest resume has intelligence signals.
                                            </span>

                                        </div>

                                    </div>


                                    <div className="cm-notification-item">

                                        <div className="cm-notification-icon">
                                            <BrainCircuit size={15} />
                                        </div>

                                        <div>

                                            <strong>
                                                Skill intelligence
                                            </strong>

                                            <span>
                                                Review your highest-impact capabilities.
                                            </span>

                                        </div>

                                    </div>


                                    <div className="cm-notification-item">

                                        <div className="cm-notification-icon">
                                            <ShieldCheck size={15} />
                                        </div>

                                        <div>

                                            <strong>
                                                Profile protected
                                            </strong>

                                            <span>
                                                Your career workspace is secured.
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        PROFILE
                    ================================================= */}

                    <div
                        className="cm-profile-wrapper"
                        ref={profileRef}
                    >

                        <button
                            type="button"
                            className="cm-profile-button"
                            onClick={() => {

                                setProfileOpen(
                                    (value) => !value,
                                );

                                setNotificationOpen(false);

                            }}
                            aria-expanded={
                                profileOpen
                            }
                            aria-label={`Open profile menu for ${fullName}`}
                        >

                            <div className="cm-avatar">

                                {initials}

                            </div>


                            <div className="cm-profile-copy">

                                <strong>
                                    {fullName}
                                </strong>

                                <span>
                                    {role}
                                </span>

                            </div>


                            <ChevronDown
                                size={16}
                                className={
                                    profileOpen
                                        ? "cm-chevron-open"
                                        : ""
                                }
                            />

                        </button>


                        {profileOpen && (

                            <div className="cm-popover cm-profile-popover">

                                <div className="cm-profile-header">

                                    <div className="cm-avatar cm-avatar-large">
                                        {initials}
                                    </div>

                                    <div>

                                        <strong>
                                            {fullName}
                                        </strong>

                                        <span>
                                            {user?.email ||
                                                "Protected career profile"}
                                        </span>

                                    </div>

                                </div>


                                <div className="cm-profile-status">

                                    <span className="cm-status-check">
                                        <ShieldCheck size={14} />
                                    </span>

                                    <div>

                                        <strong>
                                            Protected workspace
                                        </strong>

                                        <span>
                                            Your career intelligence is private.
                                        </span>

                                    </div>

                                </div>


                                <div className="cm-profile-menu">

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            window.location.hash =
                                                "profile";
                                        }}
                                    >

                                        <UserRound size={16} />

                                        <span>
                                            Profile
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            window.location.hash =
                                                "settings";
                                        }}
                                    >

                                        <Settings size={16} />

                                        <span>
                                            Settings
                                        </span>

                                    </button>

                                </div>


                                <div className="cm-profile-footer">

                                    <button
                                        type="button"
                                        className="cm-logout-button"
                                        onClick={handleLogout}
                                    >

                                        <LogOut size={16} />

                                        <span>
                                            Sign out
                                        </span>

                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
                SEARCH OVERLAY
            ================================================= */}

            {searchOpen && (

                <div
                    className="cm-search-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="CareerMind search"
                >

                    <div
                        className="cm-search-backdrop"
                        onClick={() => {
                            setSearchOpen(false);
                            setSearchValue("");
                        }}
                    />


                    <div className="cm-search-panel">

                        <div className="cm-search-panel-top">

                            <div className="cm-search-input-wrap">

                                <Search size={19} />

                                <input
                                    ref={searchInputRef}
                                    value={searchValue}
                                    onChange={(event) =>
                                        setSearchValue(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Search resume, skills, career strategy..."
                                    autoComplete="off"
                                />

                            </div>


                            <button
                                type="button"
                                className="cm-search-close"
                                onClick={() => {

                                    setSearchOpen(false);

                                    setSearchValue("");

                                }}
                                aria-label="Close search"
                            >

                                <X size={18} />

                            </button>

                        </div>


                        <div className="cm-search-meta">

                            <span>
                                CAREER INTELLIGENCE
                            </span>

                            <span>
                                {searchResults.length} results
                            </span>

                        </div>


                        <div className="cm-search-results">

                            {searchResults.length > 0 ? (

                                searchResults.map(
                                    (item) => (

                                        <button
                                            type="button"
                                            key={item.id}
                                            className="cm-search-result"
                                            onClick={() =>
                                                handleSearchNavigation(
                                                    item.href,
                                                )
                                            }
                                        >

                                            <div className="cm-search-result-icon">

                                                <BrainCircuit
                                                    size={17}
                                                />

                                            </div>


                                            <div className="cm-search-result-copy">

                                                <strong>
                                                    {item.title}
                                                </strong>

                                                <span>
                                                    {item.description}
                                                </span>

                                            </div>


                                            <span className="cm-search-arrow">
                                                →
                                            </span>

                                        </button>

                                    ),
                                )

                            ) : (

                                <div className="cm-search-empty">

                                    <Search size={24} />

                                    <strong>
                                        No intelligence found
                                    </strong>

                                    <span>
                                        Try searching for resume, skills,
                                        career or interview.
                                    </span>

                                </div>

                            )}

                        </div>


                        <div className="cm-search-footer">

                            <span>
                                ESC to close
                            </span>

                            <span>
                                CareerMind Intelligence Search
                            </span>

                        </div>

                    </div>

                </div>

            )}

        </header>

    );
}