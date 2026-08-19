import api from "./api";

/* =========================================================
   TYPES
   ========================================================= */

export interface User {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    created_at?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    full_name: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

/* =========================================================
   LOGIN
   ========================================================= */

export async function loginUser(
    email: string,
    password: string
): Promise<LoginResponse> {

    /*
     * FastAPI OAuth2PasswordRequestForm expects
     * application/x-www-form-urlencoded data.
     */

    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post<LoginResponse>(
        "/auth/login",
        formData,
        {
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",
            },
        }
    );

    return response.data;
}

/* =========================================================
   REGISTER
   ========================================================= */

export async function registerUser(
    data: RegisterRequest
) {
    const response = await api.post(
        "/auth/register",
        data,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
}

/* =========================================================
   CURRENT USER
   ========================================================= */

export async function getCurrentUser(): Promise<User> {

    const response = await api.get<User>(
        "/auth/me"
    );

    return response.data;
}