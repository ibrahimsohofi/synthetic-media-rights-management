import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";
import { JWT } from "next-auth/jwt";

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize function called with email:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          console.log("User found:", user ? "yes" : "no");

          if (!user) {
            console.log("No user found with email:", credentials.email);
            return null;
          }

          console.log("Comparing password...");
          // Dynamically import bcrypt to avoid client-side issues
          const { compare } = await import("bcrypt");
          const passwordValid = await compare(credentials.password, user.passwordHash);
          console.log("Password valid:", passwordValid);

          if (!passwordValid) {
            console.log("Invalid password");
            return null;
          }

          console.log("Login successful for user:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
          };
        } catch (error) {
          console.error("Error during authorization:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.username) {
        session.user.username = token.username as string;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = user as User;
        token.username = dbUser.username;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Export the auth function for Next Auth v5
 */
export const { auth, handlers } = NextAuth(authOptions);

/**
 * Type definition for NextAuth session
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      username?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string | null;
  }
}
