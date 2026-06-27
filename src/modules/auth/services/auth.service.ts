import { prisma } from "@/lib/prisma";
import { User, AuthType } from "@prisma/client";
import * as jose from "jose";
import { formatMediaUrl } from "@/modules/media/media.interface";

const JWT_SECRET = process.env.JWT_SECRET || "buat_string_acak_dan_panjang_untuk_security_jwt";
const secret = new TextEncoder().encode(JWT_SECRET);

export const authService = {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  },

  async checkUsernameExists(username: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    return !!user;
  },

  async createUserFromGoogle(data: {
    email: string;
    name: string;
    username: string;
    picture?: string | null;
  }): Promise<User> {
    // Check for existing username or email to avoid collisions
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username }
        ]
      }
    });

    if (existingUser) {
      throw new Error("User with that email or username already exists");
    }

    let photoProfileId: string | null = null;
    if (data.picture) {
      const media = await prisma.media.create({
        data: {
          url: data.picture,
        },
      });
      photoProfileId = media.id;
    }

    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        username: data.username,
        auth_type: AuthType.GOOGLE,
        is_verified: true, // Google OAuth signup is immediately verified
        photo_profile_id: photoProfileId,
      },
    });
  },

  async generateTokens(user: Pick<User, "id" | "email" | "username">) {
    const accessTokenExpiry = Number(process.env.AUTH_ACCESS_TOKEN_EXPIRY) || 14400; // 4 hours in seconds
    const refreshTokenExpiry = Number(process.env.AUTH_REFRESH_TOKEN_EXPIRY) || 2592000; // 30 days in seconds

    const accessToken = await new jose.SignJWT({
      sub: user.id,
      email: user.email,
      username: user.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${accessTokenExpiry}s`)
      .sign(secret);

    const refreshToken = await new jose.SignJWT({
      sub: user.id,
      email: user.email,
      username: user.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${refreshTokenExpiry}s`)
      .sign(secret);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiry,
      refreshTokenExpiry,
    };
  },

  async createTempOAuthToken(email: string, name: string, picture?: string | null): Promise<string> {
    return new jose.SignJWT({
      email,
      name,
      picture: picture || null,
      type: "google_signup_temp",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("10m") // 10 minutes temporary hold window
      .sign(secret);
  },

  async verifyJWT(token: string): Promise<any> {
    try {
      const { payload } = await jose.jwtVerify(token, secret);
      return payload;
    } catch (error) {
      return null;
    }
  },

  async getCurrentUser(token: string): Promise<any> {
    const payload = await this.verifyJWT(token);
    if (!payload || !payload.sub) return null;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      include: {
        photo_profile: true,
      },
    });
    if (!user) return null;
    return {
      ...user,
      photo_profile: formatMediaUrl(user.photo_profile?.url),
    };
  },
};
