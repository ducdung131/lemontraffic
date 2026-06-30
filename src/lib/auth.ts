import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@analytics-hub.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          return { id: 'admin', email: adminEmail, name: 'Admin', role: 'admin' };
        }
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 365 * 24 * 60 * 60, updateAge: 365 * 24 * 60 * 60 },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
