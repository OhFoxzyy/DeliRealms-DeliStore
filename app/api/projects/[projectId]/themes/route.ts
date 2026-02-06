import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { PrismaClient } from "@/generated/prisma";
import type { PageTheme, PageThemePalette, PageThemeGradient } from "@/lib/page-builder/types";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

function getProject(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { projectId } = await params;
    const project = await getProject(projectId, session.user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const customThemes = (project.customThemes as PageTheme[] | null) ?? [];
    return NextResponse.json(customThemes);
  } catch (error) {
    console.error("Failed to fetch themes:", error);
    return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { projectId } = await params;
    const project = await getProject(projectId, session.user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const palette = body.palette as PageThemePalette | undefined;
    const gradients = body.gradients as PageThemeGradient[] | undefined;
    if (!name || !palette || typeof palette !== "object") {
      return NextResponse.json(
        { error: "name and palette are required" },
        { status: 400 }
      );
    }
    const requiredKeys = ["primary", "secondary", "accent", "background", "surface", "text"];
    for (const key of requiredKeys) {
      if (typeof palette[key as keyof PageThemePalette] !== "string") {
        return NextResponse.json(
          { error: `palette.${key} must be a string` },
          { status: 400 }
        );
      }
    }
    const id = `custom-${randomUUID()}`;
    const newTheme: PageTheme = {
      id,
      name,
      palette: { ...palette },
      gradients: Array.isArray(gradients) ? gradients : [],
    };
    const current = (project.customThemes as PageTheme[] | null) ?? [];
    const updated = [...current, newTheme];
    await prisma.project.update({
      where: { id: projectId },
      data: { customThemes: updated as unknown as object },
    });
    return NextResponse.json(newTheme);
  } catch (error) {
    console.error("Failed to create theme:", error);
    return NextResponse.json({ error: "Failed to create theme" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { projectId } = await params;
    const project = await getProject(projectId, session.user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id query param required" }, { status: 400 });
    }
    const current = (project.customThemes as PageTheme[] | null) ?? [];
    const updated = current.filter((t) => t.id !== id);
    if (updated.length === current.length) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }
    await prisma.project.update({
      where: { id: projectId },
      data: { customThemes: updated as unknown as object },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete theme:", error);
    return NextResponse.json({ error: "Failed to delete theme" }, { status: 500 });
  }
}
