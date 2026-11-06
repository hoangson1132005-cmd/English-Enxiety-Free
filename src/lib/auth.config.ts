import type { NextAuthConfig } from 'next-auth';

// Cấu hình nhẹ, an toàn cho Edge (không import prisma/bcrypt)
export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: 'student' | 'admin' }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as 'student' | 'admin';
      return session;
    },
  },
} satisfies NextAuthConfig;