import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/resend";
import crypto from "crypto";
import { getClientIp, getUserAgent } from "@/lib/auth/ip-utils";
import { checkForAbuse } from "@/lib/auth/abuse-detection";

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    // Get IP and user agent for tracking
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Check for abuse patterns
    const abuseCheck = await checkForAbuse(email, ipAddress, userAgent);
    if (abuseCheck.isAbusive) {
      console.log("[v0] Registration blocked - abuse detected:", abuseCheck.reason);
      return NextResponse.json(
        { 
          error: "Registration temporarily unavailable. Please try again later or contact support.",
          code: "ABUSE_DETECTED"
        },
        { status: 429 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: "hobby",
        lastLoginIp: ipAddress,
      },
    });

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json(
      {
        message: "Account created successfully. Please check your email to verify your account.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
