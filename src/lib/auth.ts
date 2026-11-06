import NextAuth, { CredentialsSignin, type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { isThrottled, recordFailure, clearFailures } from '@/lib/loginThrottle';
import { authConfig } from '@/lib/auth.config';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'student' | 'admin';
    } & DefaultSession['user'];
  }
  interface User {
    role: 'student' | 'admin';
  }
}

// Báo riêng cho giao diện biết tài khoản đang bị tạm khóa vì nhập sai nhiều lần
class TooManyAttempts extends CredentialsSignin {
  code = 'too_many_attempts';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials, request) => {
        const email = typeof credentials?.email === 'string' ? credentials.email : undefined;
        const password = typeof credentials?.password === 'string' ? credentials.password : undefined;
        if (!email || !password) return null;

        const ip = request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
        if (isThrottled(email, ip)) throw new TooManyAttempts(); // quá nhiều lần sai: tạm khóa 15 phút

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.status === 'disabled') {
          recordFailure(email, ip);
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          recordFailure(email, ip);
          return null;
        }
        clearFailures(email, ip);

        await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
});