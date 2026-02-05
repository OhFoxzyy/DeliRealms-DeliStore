import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    const page = await prisma.docPage.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!page.published && !isAdmin) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("[docs/:slug] GET error", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const body = await req.json();
    const { title, slug: newSlug, content, published } = body;

    if (!title || !newSlug || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newSlug !== slug) {
      const existing = await prisma.docPage.findUnique({ where: { slug: newSlug } });
      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    const page = await prisma.docPage.update({
      where: { slug },
      data: {
        title,
        slug: newSlug,
        content,
        published: published !== undefined ? published : false,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("[docs/:slug] PUT error", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;

    await prisma.docPage.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[docs/:slug] DELETE error", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
