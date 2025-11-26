import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await dbConnect();
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const user = await User.findOne({ email: credentials.email });
                if (!user) {
                    return null;
                }
                // If user has no password (e.g. created via Google), return null for credentials login
                if (!user.password) {
                    return null;
                }
                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordCorrect) {
                    return null;
                }
                return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, image: user.image };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                console.log('[AUTH_JWT] Sign in detected:', { provider: account?.provider, email: user.email, id: user.id, role: user.role });
                if (account?.provider === 'google') {
                    await dbConnect();
                    let dbUser = await User.findOne({ email: user.email });
                    if (!dbUser) {
                        dbUser = await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            role: 'buyer',
                            badges: { emailVerified: true }
                        });
                    }
                    token.id = dbUser._id.toString();
                    token.role = dbUser.role || 'buyer';
                    token.image = dbUser.image || user.image;
                } else {
                    // For credentials login, user data comes from authorize()
                    token.id = user.id;
                    token.role = user.role;
                    token.image = user.image;
                }
            }
            // If token exists but user is undefined (subsequent requests), ensure role is preserved
            // We might need to fetch fresh role from DB if it can change
            if (token.email && !user) {
                await dbConnect();
                const dbUser = await User.findOne({ email: token.email });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser._id.toString();
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                session.user.image = token.image as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
