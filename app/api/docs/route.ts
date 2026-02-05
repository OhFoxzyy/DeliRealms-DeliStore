import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const publishedOnly = url.searchParams.get("published") === "true";

    const where: any = {};
    if (session?.user?.role !== "admin") {
      where.published = true;
    } else if (publishedOnly) {
      where.published = true;
    }

    const pages = await prisma.docPage.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("[docs] GET error", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, slug, content, published } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.docPage.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const page = await prisma.docPage.create({
      data: {
        title,
        slug,
        content,
        published: published || false,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("[docs] POST error", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
