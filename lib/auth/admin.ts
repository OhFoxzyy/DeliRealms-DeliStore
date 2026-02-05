import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  if (session.user.role !== "admin") {
    throw new Error("Forbidden");
  }
  
  return session;
}

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}
