'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Chargement...</div>
            </div>
        );
    }

    if (!session || session.user.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-gray-800 min-h-screen text-white">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                    </div>
                    <nav className="mt-6">
                        <Link
                            href="/admin"
                            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            <LayoutDashboard className="h-5 w-5 mr-3" />
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/users"
                            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            <Users className="h-5 w-5 mr-3" />
                            Users
                        </Link>
                        <Link
                            href="/admin/ads"
                            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            <FileText className="h-5 w-5 mr-3" />
                            Ads
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Logout
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    );
}
