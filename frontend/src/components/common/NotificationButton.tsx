/**
 * ============================================================
 * CareerMind AI
 *
 * Notification Button
 * AI Career Intelligence Workspace
 *
 * Features:
 * - Notification count
 * - Notification popover
 * - Unread indicator
 * - Mark all as read
 * - Click outside to close
 * - Keyboard accessible
 * - Responsive
 * ============================================================
 */

import {
    Bell,
    Check,
    ChevronRight,
    Sparkles,
    Target,
    X,
} from "lucide-react";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import "./notificationButton.css";


// ============================================================
// TYPES
// ============================================================

export interface CareerNotification {
    id: string;

    title: string;

    message: string;

    type:
    | "ai"
    | "career"
    | "resume"
    | "skill";

    time: string;

    read?: boolean;
}


// ============================================================
// DEFAULT NOTIFICATIONS
// ============================================================

const DEFAULT_NOTIFICATIONS: CareerNotification[] = [
    {
        id: "career-1",

        title: "Career intelligence ready",

        message:
            "Your latest profile signals are available for review.",

        type: "ai",

        time: "Just now",

        read: false,
    },

    {
        id: "skill-1",

        title: "Skill gap detected",

        message:
            "SQL has been identified as a high-impact capability to strengthen.",

        type: "skill",

        time: "12 min ago",

        read: false,
    },

    {
        id: "resume-1",

        title: "Resume analysis completed",

        message:
            "Your resume has been processed and ATS intelligence is available.",

        type: "resume",

        time: "32 min ago",

        read: false,
    },

    {
        id: "career-2",

        title: "Next move available",

        message:
            "CareerMind has identified a recommended growth direction.",

        type: "career",

        time: "1 hr ago",

        read: true,
    },
];


// ============================================================
// ICON
// ============================================================

function NotificationIcon({
    type,
}: {
    type: CareerNotification["type"];
}) {
    switch (type) {
        case "skill":
            return <Target size={17} />;

        case "resume":
            return <Check size={17} />;

        case "career":
            return <ChevronRight size={17} />;

        case "ai":
        default:
            return <Sparkles size={17} />;
    }
}


// ============================================================
// COMPONENT
// ============================================================

interface NotificationButtonProps {
    notifications?: CareerNotification[];

    onNotificationClick?: (
        notification: CareerNotification,
    ) => void;
}


export default function NotificationButton({
    notifications = DEFAULT_NOTIFICATIONS,

    onNotificationClick,
}: NotificationButtonProps) {
    const [
        open,
        setOpen,
    ] = useState(false);

    const [
        items,
        setItems,
    ] = useState<CareerNotification[]>(
        notifications,
    );

    const containerRef =
        useRef<HTMLDivElement | null>(null);


    // ========================================================
    // UNREAD COUNT
    // ========================================================

    const unreadCount =
        items.filter(
            (notification) =>
                !notification.read,
        ).length;


    // ========================================================
    // CLICK OUTSIDE
    // ========================================================

    useEffect(() => {
        function handleOutsideClick(
            event: MouseEvent,
        ) {
            if (
                !containerRef.current
            ) {
                return;
            }

            if (
                !containerRef.current.contains(
                    event.target as Node,
                )
            ) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener(
                "mousedown",
                handleOutsideClick,
            );
        }

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick,
            );
        };
    }, [open]);


    // ========================================================
    // ESCAPE KEY
    // ========================================================

    useEffect(() => {
        function handleEscape(
            event: KeyboardEvent,
        ) {
            if (
                event.key === "Escape"
            ) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener(
                "keydown",
                handleEscape,
            );
        }

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape,
            );
        };
    }, [open]);


    // ========================================================
    // MARK ALL AS READ
    // ========================================================

    const markAllAsRead = () => {
        setItems(
            (previous) =>
                previous.map(
                    (notification) => ({
                        ...notification,

                        read: true,
                    }),
                ),
        );
    };


    // ========================================================
    // HANDLE NOTIFICATION
    // ========================================================

    const handleNotificationClick = (
        notification: CareerNotification,
    ) => {
        setItems(
            (previous) =>
                previous.map(
                    (item) =>
                        item.id ===
                            notification.id
                            ? {
                                ...item,

                                read: true,
                            }
                            : item,
                ),
        );

        onNotificationClick?.(
            notification,
        );
    };


    // ========================================================
    // CLEAR ALL
    // ========================================================

    const clearNotifications = () => {
        setItems([]);
    };


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div
            className="cm-notification"
            ref={containerRef}
        >

            {/* ==================================================
                TRIGGER
            ================================================== */}

            <button
                type="button"
                className={
                    `cm-notification-trigger ${open
                        ? "is-active"
                        : ""
                    }`
                }
                aria-label={
                    unreadCount > 0
                        ? `${unreadCount} unread notifications`
                        : "Notifications"
                }
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() =>
                    setOpen(
                        (previous) =>
                            !previous,
                    )
                }
            >

                <Bell
                    size={19}
                    strokeWidth={1.9}
                />

                {unreadCount > 0 && (
                    <span
                        className="cm-notification-badge"
                        aria-hidden="true"
                    >
                        {
                            unreadCount > 9
                                ? "9+"
                                : unreadCount
                        }
                    </span>
                )}

            </button>


            {/* ==================================================
                POPOVER
            ================================================== */}

            {open && (
                <div
                    className="cm-notification-panel"
                    role="dialog"
                    aria-label="CareerMind notifications"
                >

                    {/* HEADER */}

                    <div className="cm-notification-header">

                        <div>

                            <div className="cm-notification-title-row">

                                <Sparkles
                                    size={15}
                                />

                                <span>
                                    AI Activity
                                </span>

                            </div>

                            <h3>
                                Intelligence
                                updates
                            </h3>

                        </div>


                        <button
                            type="button"
                            className="cm-notification-close"
                            aria-label="Close notifications"
                            onClick={() =>
                                setOpen(false)
                            }
                        >
                            <X
                                size={17}
                            />
                        </button>

                    </div>


                    {/* STATUS */}

                    <div className="cm-notification-status">

                        <span className="cm-notification-status-dot" />

                        <span>
                            CareerMind AI
                            is monitoring
                            your profile
                        </span>

                        {unreadCount > 0 && (
                            <strong>
                                {unreadCount}
                            </strong>
                        )}

                    </div>


                    {/* ACTION BAR */}

                    {items.length > 0 && (
                        <div className="cm-notification-actions">

                            <span>
                                Recent activity
                            </span>

                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={
                                        markAllAsRead
                                    }
                                >
                                    Mark all read
                                </button>
                            )}

                        </div>
                    )}


                    {/* NOTIFICATIONS */}

                    <div className="cm-notification-list">

                        {items.length === 0 ? (
                            <div className="cm-notification-empty">

                                <div className="cm-notification-empty-icon">
                                    <Bell
                                        size={20}
                                    />
                                </div>

                                <strong>
                                    All caught up
                                </strong>

                                <span>
                                    No new career
                                    intelligence
                                    updates.
                                </span>

                            </div>
                        ) : (
                            items.map(
                                (
                                    notification,
                                ) => (
                                    <button
                                        type="button"
                                        key={
                                            notification.id
                                        }
                                        className={
                                            `cm-notification-item ${!notification.read
                                                ? "is-unread"
                                                : ""
                                            }`
                                        }
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification,
                                            )
                                        }
                                    >

                                        <span
                                            className={
                                                `cm-notification-item-icon notification-${notification.type}`
                                            }
                                        >
                                            <NotificationIcon
                                                type={
                                                    notification.type
                                                }
                                            />
                                        </span>


                                        <span className="cm-notification-item-content">

                                            <span className="cm-notification-item-top">

                                                <strong>
                                                    {
                                                        notification.title
                                                    }
                                                </strong>

                                                {!notification.read && (
                                                    <span className="cm-notification-unread-dot" />
                                                )}

                                            </span>

                                            <span className="cm-notification-message">
                                                {
                                                    notification.message
                                                }
                                            </span>

                                            <span className="cm-notification-time">
                                                {
                                                    notification.time
                                                }
                                            </span>

                                        </span>

                                    </button>
                                ),
                            )
                        )}

                    </div>


                    {/* FOOTER */}

                    {items.length > 0 && (
                        <div className="cm-notification-footer">

                            <button
                                type="button"
                                onClick={
                                    clearNotifications
                                }
                            >
                                Clear activity
                            </button>

                            <span>
                                CareerMind AI
                            </span>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
}