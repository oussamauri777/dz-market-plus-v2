'use client';

import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    BarChart3,
    FileBarChart,
    Settings,
    Star,
    MessageSquare,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: FileText, label: 'Ads', href: '/admin/ads' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: FileBarChart, label: 'Reports', href: '/admin/reports' },
    { icon: Star, label: 'Reviews', href: '/admin/reviews' },
    { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <div
            className={`${collapsed ? 'w-20' : 'w-64'
                } bg-gradient-to-b from-primary to-primary/90 text-white transition-all duration-300 flex flex-col h-screen sticky top-0`}
        >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/10">
                {!collapsed && <h2 className="text-xl font-bold">Admin Panel</h2>}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 overflow-y-auto">
                <ul className="space-y-2 px-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-white text-primary shadow-lg'
                                            : 'hover:bg-white/10 text-white/90'
                                        }`}
                                    title={collapsed ? item.label : ''}
                                >
                                    <Icon size={20} />
                                    {!collapsed && <span className="font-medium">{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
                {!collapsed && (
                    <div className="text-xs text-white/60">
                        <p>Admin v1.0</p>
                        <p>DZ Market Plus</p>
                    </div>
                )}
            </div>
        </div>
    );
}
