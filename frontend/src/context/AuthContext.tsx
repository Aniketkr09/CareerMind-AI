import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    getCurrentUser,
    loginUser,
    registerUser,
    type LoginResponse,
    type RegisterRequest,
    type User,
} from "../services/authService";

/* ============================================================
   TYPES
   ============================================================ */

interface AuthContextType {
    user: User | null;

    loading: boolean;
    isAuthenticated: boolean;

    error: string | null;

    login: (
        email: string,
        password: string
    ) => Promise<User>;

    register: (
        data: RegisterRequest
    ) => Promise<User>;

    logout: () => void;

    refreshUser: () => Promise<User | null>;

    clearError: () => void;
}

/* ============================================================
   CONTEXT
   IMPORTANT:
   This is a NAMED export.
   Your useAuth.ts can safely import AuthContext.
   ============================================================ */

export const AuthContext =
    createContext<AuthContextType | undefined>(
        undefined
    );

/* ============================================================
   PROVIDER
   ============================================================ */

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    /* ========================================================
       LOGOUT
       ======================================================== */

    const logout = useCallback(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");

        setUser(null);
        setError(null);
    }, []);

    /* ========================================================
       CURRENT USER
       ======================================================== */

    const refreshUser =
        useCallback(async (): Promise<User | null> => {
            const token =
                localStorage.getItem("access_token") ||
                localStorage.getItem("token");

            if (!token) {
                setUser(null);
                return null;
            }

            try {
                const currentUser =
                    await getCurrentUser();

                setUser(currentUser);

                return currentUser;
            } catch (err: unknown) {
                console.error(
                    "CareerMind AI | Failed to restore session:",
                    err
                );

                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem("token");

                setUser(null);

                return null;
            }
        }, []);

    /* ========================================================
       INITIAL SESSION RESTORE
       ======================================================== */

    useEffect(() => {
        let active = true;

        async function restoreSession() {
            try {
                const token =
                    localStorage.getItem(
                        "access_token"
                    ) ||
                    localStorage.getItem("token");

                if (!token) {
                    if (active) {
                        setUser(null);
                        setLoading(false);
                    }

                    return;
                }

                const currentUser =
                    await getCurrentUser();

                if (active) {
                    setUser(currentUser);
                }
            } catch (err) {
                console.warn(
                    "CareerMind AI | No valid authenticated session."
                );

                if (active) {
                    localStorage.removeItem(
                        "access_token"
                    );

                    localStorage.removeItem(
                        "token"
                    );

                    setUser(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void restoreSession();

        return () => {
            active = false;
        };
    }, []);

    /* ========================================================
       LOGIN
       ======================================================== */

    const login = useCallback(
        async (
            email: string,
            password: string
        ): Promise<User> => {
            setError(null);

            try {
                const response: LoginResponse =
                    await loginUser(
                        email.trim(),
                        password
                    );

                if (!response?.access_token) {
                    throw new Error(
                        "Authentication token was not returned by the server."
                    );
                }

                /*
                 * Use ONE canonical token key.
                 */
                localStorage.setItem(
                    "access_token",
                    response.access_token
                );

                /*
                 * Keep the old key synchronized temporarily
                 * so older services/components do not break.
                 */
                localStorage.setItem(
                    "token",
                    response.access_token
                );

                let authenticatedUser =
                    response.user;

                /*
                 * If backend login does not return user,
                 * fetch /auth/me.
                 */
                if (!authenticatedUser) {
                    authenticatedUser =
                        await getCurrentUser();
                }

                setUser(authenticatedUser);

                return authenticatedUser;
            } catch (err: any) {
                console.error(
                    "CareerMind AI | Login failed:",
                    err
                );

                const message =
                    err?.response?.data?.detail ||
                    err?.message ||
                    "Unable to sign in. Please check your credentials.";

                setError(message);

                /*
                 * Never leave a broken token behind.
                 */
                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "token"
                );

                setUser(null);

                throw new Error(message);
            }
        },
        []
    );

    /* ========================================================
       REGISTER
       ======================================================== */

    const register = useCallback(
        async (
            data: RegisterRequest
        ): Promise<User> => {
            setError(null);

            try {
                const response =
                    await registerUser(data);

                /*
                 * Some backend implementations return:
                 *
                 * {
                 *   access_token,
                 *   token_type,
                 *   user
                 * }
                 *
                 * Others return only user information.
                 */

                if (response?.access_token) {
                    localStorage.setItem(
                        "access_token",
                        response.access_token
                    );

                    localStorage.setItem(
                        "token",
                        response.access_token
                    );

                    let registeredUser =
                        response.user;

                    if (!registeredUser) {
                        registeredUser =
                            await getCurrentUser();
                    }

                    setUser(registeredUser);

                    return registeredUser;
                }

                /*
                 * If registration does not automatically
                 * authenticate the user, log in after
                 * successful registration.
                 */
                const authenticatedUser =
                    await login(
                        data.email,
                        data.password
                    );

                return authenticatedUser;
            } catch (err: any) {
                console.error(
                    "CareerMind AI | Registration failed:",
                    err
                );

                const message =
                    err?.response?.data?.detail ||
                    err?.message ||
                    "Unable to create your account.";

                setError(message);

                throw new Error(message);
            }
        },
        [login]
    );

    /* ========================================================
       CLEAR ERROR
       ======================================================== */

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /* ========================================================
       AUTHENTICATION STATE
       ======================================================== */

    const isAuthenticated =
        Boolean(user);

    /* ========================================================
       CONTEXT VALUE
       ======================================================== */

    const value = useMemo<AuthContextType>(
        () => ({
            user,

            loading,

            isAuthenticated,

            error,

            login,

            register,

            logout,

            refreshUser,

            clearError,
        }),
        [
            user,
            loading,
            isAuthenticated,
            error,
            login,
            register,
            logout,
            refreshUser,
            clearError,
        ]
    );

    /* ========================================================
       PROVIDER
       ======================================================== */

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/* ============================================================
   useAuth
   ============================================================ */

export function useAuth(): AuthContextType {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }

    return context;
}

/* ============================================================
   DEFAULT EXPORT
   ============================================================ */

export default AuthContext;