import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from "next-auth/adapters";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export function MyAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const created = await prisma.user.create({
        data: {
          email: user.email!,
          name: user.name,
          emailVerified: user.emailVerified,
          image: user.image,
          role: "hobby",
        },
      });
      return {
        id: created.id,
        email: created.email!,
        emailVerified: created.emailVerified,
        name: created.name,
        image: created.image,
        role: created.role,
        username: created.username,
        profilePictureId: created.profilePictureId,
      } as AdapterUser;
    },

    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email!,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
        role: user.role,
        username: user.username,
        profilePictureId: user.profilePictureId,
      } as AdapterUser;
    },

    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email!,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
        role: user.role,
        username: user.username,
        profilePictureId: user.profilePictureId,
      } as AdapterUser;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: { provider, providerAccountId },
        },
      });
      if (!account) return null;

      const user = await prisma.user.findUnique({
        where: { id: account.userId },
      });
      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
        role: user.role,
        username: user.username,
        profilePictureId: user.profilePictureId,
      } as AdapterUser;
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
        },
      });
      return {
        id: updated.id,
        email: updated.email!,
        emailVerified: updated.emailVerified,
        name: updated.name,
        image: updated.image,
        role: updated.role,
        username: updated.username,
        profilePictureId: updated.profilePictureId,
      } as AdapterUser;
    },

    async linkAccount(account: AdapterAccount) {
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      });
      return account;
    },

    async createSession({ sessionToken, userId, expires }) {
      const session = await prisma.session.create({
        data: {
          sessionToken,
          userId,
          expires,
        },
      });
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      } as AdapterSession;
    },

    async getSessionAndUser(sessionToken: string) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!session || !session.user) return null;

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        } as AdapterSession,
        user: {
          id: session.user.id,
          email: session.user.email!,
          emailVerified: session.user.emailVerified,
          name: session.user.name,
          image: session.user.image,
          role: session.user.role,
          username: session.user.username,
          profilePictureId: session.user.profilePictureId,
        } as AdapterUser,
      };
    },

    async updateSession({ sessionToken, ...data }) {
      const session = await prisma.session.update({
        where: { sessionToken },
        data: { expires: data.expires },
      });
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      } as AdapterSession;
    },

    async deleteSession(sessionToken: string) {
      await prisma.session.delete({ where: { sessionToken } });
    },

    async createVerificationToken({ identifier, expires, token }) {
      const verificationToken = await prisma.verificationToken.create({
        data: { identifier, token, expires },
      });
      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      } as VerificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const verificationToken = await prisma.verificationToken.delete({
          where: {
            identifier_token: { identifier, token },
          },
        });
        return {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
          expires: verificationToken.expires,
        } as VerificationToken;
      } catch {
        return null;
      }
    },
  };
}
