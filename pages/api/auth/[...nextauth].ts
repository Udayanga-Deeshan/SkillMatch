import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../lib/prisma";
import { verifyPassword } from "../../../lib";

export const authOptions: any = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: { email?: string; password?: string } | undefined) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await verifyPassword(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  // Revert to JWT strategy because Credentials provider requires it
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  debug: false, // Disabled for production
  secret: process.env.NEXTAUTH_SECRET ?? "AB6E7C8D9F0G1H2I3J4K5L6M7N8O9P0",
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      // Fallback fetch if role missing
      if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = token.id || dbUser.id;
          token.name = token.name || dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
    async redirect({ url, baseUrl, token }: any) {
      if (token?.role) {
        const dash = token.role === 'CANDIDATE' ? '/candidate/dashboard' : token.role === 'RECRUITER' ? '/recruiter/dashboard' : '/';
        // If user is coming from sign-in or root, send to dashboard
        if (url === baseUrl || url.startsWith(baseUrl + '/login')) return baseUrl + dash;
      }
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
  }
};

export default NextAuth(authOptions);
