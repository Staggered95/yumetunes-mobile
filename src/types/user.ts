export type UserRole = "user" | "admin" | string;

/** Returned by GET /auth/me */
export interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username: string;
  email: string;
  user_image: string | null;
  banner_image?: string | null;
  role: UserRole;
  created_at: string;
}

/** Returned inside array by GET /user/details */
export interface UserDetails {
  first_name: string | null;
  last_name: string | null;
  username: string;
  email: string;
  created_at: string;
  user_image: string | null;
  banner_image: string | null;
  role: UserRole;
}

/* --- Auth Payloads & Responses --- */

export interface RegisterPayload {
  first_name?: string;
  last_name?: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface GoogleAuthPayload {
  credential: string;
}

export interface AuthTokenResponse {
  success: boolean;
  token: string;
}

export interface RegisterResponse extends AuthTokenResponse {
  data: {
    id: number;
    username: string;
    email: string;
  };
}

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  user: User;
}

export interface UploadImageResponse {
  success: boolean;
  imageUrl: string;
}

export interface ToggleLikeResponse {
  success: boolean;
  message: "liked" | "disliked";
}

export interface ContactFormPayload {
  name: string;
  email: string;
  type: string;
  message: string;
}