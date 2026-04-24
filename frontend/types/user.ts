export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: "Buyer" | "Seller" | "Admin";
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
  role: "Buyer" | "Seller";
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresAtUtc: string;
  user: User;
}
