/**

* ============================================================
* CareerMind AI
* Authentication Type Definitions
* ============================================================
*
* Frontend types corresponding to the FastAPI authentication
* layer.
*
* Backend:
* * POST /api/v1/auth/register
* * POST /api/v1/auth/login
* * GET  /api/v1/auth/me
*
* Authentication:
* * OAuth2 Password Flow
* * JWT Bearer Authentication
* ============================================================
  */

/**

* Authenticated CareerMind AI user.
*
* Matches the user object returned by the FastAPI backend.
  */
export interface User {
  /**

  * Unique user UUID.
    */
  id: string;

  /**

  * User's full name.
    */
  full_name: string;

  /**

  * Registered email address.
    */
  email: string;

  /**

  * Application role.
  *
  * Example:
  * "student"
    */
  role: string;

  /**

  * Whether the account is currently active.
    */
  is_active: boolean;

  /**

  * Whether the account has been verified.
    */
  is_verified: boolean;

  /**

  * Account creation timestamp.
    */
  created_at?: string;
}

/**

* ============================================================
* Register Request
* ============================================================
*
* POST /api/v1/auth/register
*
* Backend payload:
*
* {
* ```
  full_name: string,
  ```
* ```
  email: string,
  ```
* ```
  password: string
  ```
* }
  */
export interface RegisterRequest {
  /**

  * User's full name.
    */
  full_name: string;

  /**

  * Account email address.
    */
  email: string;

  /**

  * Plain-text password supplied during registration.
  *
  * The backend is responsible for securely hashing it.
    */
  password: string;
}

/**

* ============================================================
* Login Request
* ============================================================
*
* Frontend representation of login credentials.
*
* The backend currently uses OAuth2PasswordRequestForm.
*
* Therefore authService.ts converts:
*
* email    -> username
* password -> password
  */
export interface LoginRequest {
  /**

  * Registered account email.
    */
  email: string;

  /**

  * Account password.
    */
  password: string;
}

/**

* ============================================================
* Login Response
* ============================================================
*
* POST /api/v1/auth/login
*
* Backend response:
*
* {
* ```
  access_token: string,
  ```
* ```
  token_type: "bearer",
  ```
* ```
  user: {
  ```
* ```
      ...
  ```
* ```
  }
  ```
* }
  */
export interface LoginResponse {
  /**

  * JWT access token returned by the backend.
    */
  access_token: string;

  /**

  * Authentication scheme.
  *
  * Normally:
  * "bearer"
    */
  token_type: "bearer" | string;

  /**

  * Authenticated user profile.
    */
  user: User;
}

/**

* ============================================================
* Authentication Context
* ============================================================
*
* Shared authentication state and actions used throughout
* the CareerMind AI React application.
  */
export interface AuthContextType {
  /**

  * Currently authenticated user.
  *
  * null means no authenticated session exists.
    */
  user: User | null;

  /**

  * Indicates whether authentication state is being
  * initialized or restored.
    */
  loading: boolean;

  /**

  * Indicates whether a valid authenticated user exists.
    */
  isAuthenticated: boolean;

  /**

  * Authenticate an existing user.
    */
  login: (
    email: string,
    password: string
  ) => Promise<void>;

  /**

  * Create a new CareerMind AI account.
    */
  register: (
    data: RegisterRequest
  ) => Promise<void>;

  /**

  * End the current authenticated session.
    */
  logout: () => void;
}
