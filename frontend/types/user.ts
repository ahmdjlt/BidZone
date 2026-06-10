export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: "User" | "Buyer" | "Seller" | "Admin";
  avatarUrl?: string | null;
  createdAt: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresAtUtc: string;
  user: User;
}
