import { NextResponse } from 'next/server';
import prisma from '@/prisma/client';
import { compare } from 'bcrypt';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  // For now, we'll do a direct comparison since we're using plain text passwords
  // In a production environment, you should use proper password hashing
  return plainPassword === hashedPassword;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('No user found with email:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await compare(password, user.password);
    console.log('Password match:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password mismatch for user:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key'));

    console.log('JWT token created successfully');

    // Set cookie
    const response = NextResponse.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5000');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    console.log('Login successful for user:', email);
    return response;
  } catch (error) {
    console.error('Login error details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5000');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
} 