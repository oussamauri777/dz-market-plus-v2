'use client';


import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/login');
            return;
        }

        if (session.user.role !== 'admin') {
            router.push('/');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session || session.user.role !== 'admin') {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
