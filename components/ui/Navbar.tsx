'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { MessageCircle, Plus, User, LogOut, Menu, X, Bell, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
    const t = useTranslations('Navigation');
    const { data: session } = useSession();
    console.log('[Navbar Debug] User:', session?.user, 'Role:', session?.user?.role);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (session) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 10000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch('/api/messages/unread-count');
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    return (
        <nav
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white border-b border-gray-100'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center text-gray-900 font-bold text-xl shadow-lg shadow-yellow-400/30 group-hover:scale-105 transition-transform">
                                D
                            </div>
                            <span className="text-2xl font-bold text-gray-900 tracking-tight">
                                DZ<span className="text-primary">Market+</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-primary font-medium transition-colors text-sm hover:bg-gray-50 px-3 py-2 rounded-full"
                        >
                            {t('home')}
                        </Link>
                        <Link
                            href="/search"
                            className="text-gray-600 hover:text-primary font-medium transition-colors text-sm hover:bg-gray-50 px-3 py-2 rounded-full"
                        >
                            {t('search')}
                        </Link>
                        <Link
                            href="/favorites"
                            className="text-gray-600 hover:text-primary font-medium transition-colors text-sm flex items-center gap-1.5 hover:bg-gray-50 px-3 py-2 rounded-full"
                        >
                            <Heart className="h-4 w-4" />
                            Favoris
                        </Link>
                        {session && (
                            <Link
                                href="/messages"
                                className="text-gray-600 hover:text-primary font-medium transition-colors text-sm flex items-center gap-1.5 relative group hover:bg-gray-50 px-3 py-2 rounded-full"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Messages
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <LanguageSwitcher />

                        {session ? (
                            <Link
                                href="/ads/create"
                                className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-full shadow-lg shadow-yellow-400/20 text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all hover:scale-105 gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                {t('postAd')}
                            </Link>
                        ) : (
                            <Link
                                href="/login?redirect=/ads/create&message=Vous devez être connecté avant de publier une annonce."
                                className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-full shadow-lg shadow-yellow-400/20 text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all hover:scale-105 gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                {t('postAd')}
                            </Link>
                        )}

                        {session ? (
                            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 ml-3">
                                <div className="relative group ml-3">
                                    <button className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors focus:outline-none">
                                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 group-hover:border-primary transition-colors overflow-hidden relative">
                                            {session.user?.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={session.user.image} alt={session.user.name || ''} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="h-4 w-4 text-gray-500 group-hover:text-primary" />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium max-w-[100px] truncate hidden lg:block group-hover:text-primary">
                                            {session.user?.name}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                        <div className="px-4 py-3 border-b border-gray-100 mb-2">
                                            <p className="text-sm font-bold text-gray-900 truncate">{session.user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                                        </div>

                                        {session.user?.role === 'admin' && (
                                            <Link
                                                href="/admin"
                                                className="flex items-center px-4 py-2 text-sm text-primary font-medium hover:bg-primary/5 transition-colors"
                                            >
                                                <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Admin Dashboard
                                            </Link>
                                        )}

                                        <Link
                                            href="/profile"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <User className="h-4 w-4 mr-3 text-gray-400" />
                                            Mon Profil
                                        </Link>

                                        <Link
                                            href="/messages"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors md:hidden"
                                        >
                                            <MessageCircle className="h-4 w-4 mr-3 text-gray-400" />
                                            Messages
                                        </Link>

                                        <div className="border-t border-gray-100 mt-2 pt-2">
                                            <button
                                                onClick={() => signOut()}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4 mr-3" />
                                                {t('logout')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-2">
                                <Link
                                    href="/login"
                                    className="text-gray-600 hover:text-primary px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-gray-50"
                                >
                                    {t('login')}
                                </Link>
                                <Link
                                    href="/register"
                                    className="text-primary hover:text-white border border-primary hover:bg-primary px-4 py-2 rounded-full text-sm font-medium transition-all"
                                >
                                    {t('register')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        <LanguageSwitcher />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" />
                            ) : (
                                <Menu className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl animate-in slide-in-from-top-5 duration-200">
                    <div className="pt-2 pb-3 space-y-1 px-4">
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                        >
                            {t('home')}
                        </Link>
                        <Link
                            href="/search"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                        >
                            {t('search')}
                        </Link>
                        <Link
                            href="/favorites"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <Heart className="h-5 w-5" />
                            Favoris
                        </Link>
                        {session && (
                            <Link
                                href="/messages"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 flex items-center justify-between transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5" />
                                    Messages
                                </div>
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        <Link
                            href="/ads/create"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block w-full text-center mt-4 px-4 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-primary hover:bg-primary/90 shadow-md transition-all"
                        >
                            {t('postAd')}
                        </Link>
                    </div>
                    {session ? (
                        <div className="pt-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex items-center px-6">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden relative">
                                        {session.user?.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={session.user.image} alt={session.user.name || ''} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-6 w-6 text-gray-500" />
                                        )}
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-bold text-gray-900">{session.user?.name}</div>
                                    <div className="text-sm font-medium text-gray-500">{session.user?.email}</div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-1 px-4">
                                {session.user?.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-4 py-3 rounded-xl text-base font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-all"
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm transition-all"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                                >
                                    {t('logout')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 pb-6 border-t border-gray-100 px-4 space-y-3 bg-gray-50/50">
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full text-center px-4 py-3 border border-gray-200 rounded-xl text-base font-bold text-gray-700 hover:bg-white shadow-sm transition-all"
                            >
                                {t('login')}
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full text-center px-4 py-3 border border-transparent rounded-xl text-base font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-all"
                            >
                                {t('register')}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
