import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { MyAdapter } from "./auth-adapter";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../generated/prisma";
import { checkIfBanned, logLoginAttempt } from "./abuse-detection";
import { sendLoginNotificationEmail } from "../email-service";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: MyAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          if (user) {
            await logLoginAttempt(user.id, 'unknown', 'unknown', false, 'Invalid credentials');
          }
          return null;
        }

        // Check if user is banned
        if (user.isBanned) {
          await logLoginAttempt(user.id, 'unknown', 'unknown', false, 'Account banned');
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          await logLoginAttempt(user.id, 'unknown', 'unknown', false, 'Invalid password');
          return null;
        }

        // Log successful login
        await logLoginAttempt(user.id, 'unknown', 'unknown', true);

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Send login notification email
        if (user.email && user.name) {
          sendLoginNotificationEmail(
            user.email,
            user.name,
            'Unknown IP',
            'Web Browser'
          ).catch(err => console.error('[v0] Failed to send login email:', err));
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          username: user.username,
          profilePictureId: user.profilePictureId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials" && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser && !dbUser.emailVerified) {
          return "/verify-email?error=unverified";
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });
          token.role = dbUser?.role || "hobby";
          token.id = user.id;
          token.username = dbUser?.username || null;
          token.profilePictureId = dbUser?.profilePictureId || null;
        } catch (error) {
          console.error("Error fetching user role:", error);
          token.role = "hobby";
          token.id = user.id;
          token.username = null;
          token.profilePictureId = null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.username = token.username as string | null;
        session.user.profilePictureId = token.profilePictureId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
};
