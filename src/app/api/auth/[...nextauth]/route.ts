import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { AuthService } from "@/modules/auth/auth.interface";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "string_rahasia_untuk_nextauth_kamu",
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        const name = user.name;
        if (!email) {
          return "/login/error?error=EmailRequired";
        }

        try {
          const dbUser = await AuthService.findUserByEmail(email);

          // Generate a temp token to transfer email & name information securely via query params
          const tempToken = await AuthService.createTempOAuthToken(email, name || "");
          const encodedToken = encodeURIComponent(tempToken);

          if (!dbUser) {
            // Skenario A: New User -> redirect to /setup-username?token=...
            return `/setup-username?token=${encodedToken}`;
          }

          // Skenario B: Existing User -> redirect to intermediate route to set final cookies
          return `/login/callback?token=${encodedToken}`;
        } catch (error) {
          console.error("Error in NextAuth signIn callback:", error);
          return "/login/error?error=CallbackError";
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login/error",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
