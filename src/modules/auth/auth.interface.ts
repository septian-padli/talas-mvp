import { User } from "@prisma/client";

export interface IAuthService {
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  createUserFromGoogle(data: {
    email: string;
    name: string;
    username: string;
  }): Promise<User>;
  checkUsernameExists(username: string): Promise<boolean>;
  generateTokens(user: Pick<User, "id" | "email" | "username">): Promise<{
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: number;
    refreshTokenExpiry: number;
  }>;
  createTempOAuthToken(email: string, name: string): Promise<string>;
  verifyJWT(token: string): Promise<any>;
}

// In the modular monolith architecture, we export the interface-conforming implementation as a facade.
export const AuthService: IAuthService = {
  async findUserByEmail(email: string) {
    const { authService } = await import("./services/auth.service");
    return authService.findUserByEmail(email);
  },

  async findUserByUsername(username: string) {
    const { authService } = await import("./services/auth.service");
    return authService.findUserByUsername(username);
  },

  async createUserFromGoogle(data) {
    const { authService } = await import("./services/auth.service");
    return authService.createUserFromGoogle(data);
  },

  async checkUsernameExists(username: string) {
    const { authService } = await import("./services/auth.service");
    return authService.checkUsernameExists(username);
  },

  async generateTokens(user) {
    const { authService } = await import("./services/auth.service");
    return authService.generateTokens(user);
  },

  async createTempOAuthToken(email: string, name: string) {
    const { authService } = await import("./services/auth.service");
    return authService.createTempOAuthToken(email, name);
  },

  async verifyJWT(token: string) {
    const { authService } = await import("./services/auth.service");
    return authService.verifyJWT(token);
  }
};
