import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from './db/index';
import crypto from 'crypto';
import { UserRegistrationSchema } from './validation/schemas';

// Password hashing utility (simple, production should use bcrypt)
export function hashPassword(password: string): string {
  return crypto
    .pbkdf2Sync(password, process.env.NEXTAUTH_SECRET || 'default-secret', 1000, 64, 'sha512')
    .toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const result = await query(
          'SELECT id, email, name, role FROM users WHERE email = $1',
          [credentials.email]
        );

        const user = result.rows[0];
        if (!user) return null;

        // Verify password
        const passwordHash = await query(
          'SELECT password_hash FROM users WHERE id = $1',
          [user.id]
        );

        if (!passwordHash.rows[0] || !verifyPassword(credentials.password as string, passwordHash.rows[0].password_hash)) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export async function registerUser(data: any) {
  try {
    // Validate input
    const validatedData = UserRegistrationSchema.parse(data);

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [validatedData.email]);
    if (existingUser.rows.length > 0) {
      throw new Error('Email already exists');
    }

    // Hash password and create user
    const passwordHash = hashPassword(validatedData.password);
    const result = await query(
      `INSERT INTO users (email, name, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role`,
      [validatedData.email, validatedData.name, passwordHash, validatedData.role]
    );

    return {
      success: true,
      user: result.rows[0],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateUserProfile(userId: number, data: any) {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.name) {
      fields.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex++;
    }

    if (data.phone) {
      fields.push(`phone = $${paramIndex}`);
      values.push(data.phone);
      paramIndex++;
    }

    if (data.bio) {
      fields.push(`bio = $${paramIndex}`);
      values.push(data.bio);
      paramIndex++;
    }

    if (data.avatar_url) {
      fields.push(`avatar_url = $${paramIndex}`);
      values.push(data.avatar_url);
      paramIndex++;
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return {
      success: true,
      user: result.rows[0],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
