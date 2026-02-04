import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    if (new Date() > verification.expires) {
      await prisma.emailVerification.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        emailVerified: new Date(),
        role: 'hobby',
      },
    });

    await prisma.emailVerification.delete({
      where: { token },
    });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
