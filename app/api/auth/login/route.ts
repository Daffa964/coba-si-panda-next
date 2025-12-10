// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email dan kata sandi diperlukan' },
        { status: 400 }
      );
    }

    // Find user by email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!existingUser) {
      return Response.json(
        { success: false, message: 'Email atau kata sandi salah' },
        { status: 400 }
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, existingUser.password);

    if (!validPassword) {
      return Response.json(
        { success: false, message: 'Email atau kata sandi salah' },
        { status: 400 }
      );
    }

    // Create session
    const session = await auth.createSession(existingUser.id.toString(), {
      nama: existingUser.nama,
      email: existingUser.email,
      role: existingUser.role,
      posyanduId: existingUser.posyanduId,
    });

    // Set session cookie
    const sessionCookie = auth.createSessionCookie(session);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return Response.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: existingUser.id,
        nama: existingUser.nama,
        email: existingUser.email,
        role: existingUser.role,
        posyanduId: existingUser.posyanduId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { success: false, message: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}