import axios, {
    AxiosHeaders,
    type AxiosError,
} from "axios";

/* =========================================================
   CAREERMIND AI
   API CLIENT
   ========================================================= */

const API_BASE_URL =
    "http://127.0.0.1:8000/api/v1";

const TOKEN_KEY = "token";

/* =========================================================
   AXIOS INSTANCE
   ========================================================= */

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,

    headers: {
        Accept: "application/json",
    },
});

/* =========================================================
   REQUEST INTERCEPTOR
   ========================================================= */

api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem(TOKEN_KEY);

        if (token) {
            /*
             * Axios v1 uses AxiosHeaders.
             * Do NOT use:
             *
             * config.headers = {};
             */

            if (!config.headers) {
                config.headers =
                    new AxiosHeaders();
            }

            config.headers.set(
                "Authorization",
                `Bearer ${token}`
            );
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

/* =========================================================
   RESPONSE INTERCEPTOR
   ========================================================= */

api.interceptors.response.use(
    (response) => {
        return response;
    },

    (error: AxiosError) => {
        const status =
            error.response?.status;

        const requestUrl =
            error.config?.url ?? "";

        if (status === 401) {
            const isLoginRequest =
                requestUrl.includes(
                    "/auth/login"
                );

            const isRegisterRequest =
                requestUrl.includes(
                    "/auth/register"
                );

            /*
             * Do not clear the token for failed
             * login/register requests.
             */

            if (
                !isLoginRequest &&
                !isRegisterRequest
            ) {
                localStorage.removeItem(
                    TOKEN_KEY
                );
            }
        }

        return Promise.reject(error);
    }
);

/* =========================================================
   AUTH HELPERS
   ========================================================= */

export function getAuthToken(): string | null {
    return localStorage.getItem(
        TOKEN_KEY
    );
}

export function setAuthToken(
    token: string
): void {
    localStorage.setItem(
        TOKEN_KEY,
        token
    );
}

export function clearAuthToken(): void {
    localStorage.removeItem(
        TOKEN_KEY
    );
}

/* =========================================================
   EXPORT
   ========================================================= */

export default api;