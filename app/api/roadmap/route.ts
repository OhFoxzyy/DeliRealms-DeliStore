import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.roadmapItem.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        order: true,
        eta: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("[roadmap] GET error", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, status, order, eta, slug } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.roadmapItem.create({
      data: {
        title,
        description,
        status: status || "planned",
        order: order || 0,
        eta,
        slug,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("[roadmap] POST error", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
