import { Role } from "@/generated/prisma"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      username: string | null
      profilePictureId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: Role
    username: string | null
    profilePictureId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    username: string | null
    profilePictureId: string | null
  }
}