'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number; // Percentage change
    subtitle?: string;
    color?: string;
}

export default function StatsCard({ title, value, icon: Icon, trend, subtitle, color = 'blue' }: StatsCardProps) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        pink: 'from-pink-500 to-pink-600',
        indigo: 'from-indigo-500 to-indigo-600',
        red: 'from-red-500 to-red-600',
        teal: 'from-teal-500 to-teal-600',
    };

    const iconBgClasses = {
        blue: 'bg-blue-100',
        green: 'bg-green-100',
        purple: 'bg-purple-100',
        orange: 'bg-orange-100',
        pink: 'bg-pink-100',
        indigo: 'bg-indigo-100',
        red: 'bg-red-100',
        teal: 'bg-teal-100',
    };

    const iconColorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        purple: 'text-purple-600',
        orange: 'text-orange-600',
        pink: 'text-pink-600',
        indigo: 'text-indigo-600',
        red: 'text-red-600',
        teal: 'text-teal-600',
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${iconBgClasses[color as keyof typeof iconBgClasses]}`}>
                        <Icon className={`w-6 h-6 ${iconColorClasses[color as keyof typeof iconColorClasses]}`} />
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {Math.abs(trend).toFixed(1)}%
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
}
