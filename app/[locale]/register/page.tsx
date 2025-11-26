'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Loader2, Check, Lock, User, Mail, MapPin } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const t = useTranslations('Navigation');
    const locale = useLocale();
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Details, 2: Email Verification
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        wilaya: '',
        verificationCode: '',
    });

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (data.password !== data.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (!data.email) {
            setError('Email requis');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email }),
            });

            if (res.ok) {
                setStep(2);
            } else {
                const result = await res.json();
                setError(result.error || 'Erreur lors de l\'envoi du code');
            }
        } catch (err) {
            setError('Erreur lors de l\'envoi du code');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // First verify the code
            const verifyRes = await fetch('/api/auth/email/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, code: data.verificationCode }),
            });

            if (!verifyRes.ok) {
                setError('Code de vérification invalide');
                setLoading(false);
                return;
            }

            // Then register
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    wilaya: data.wilaya,
                }),
            });

            if (res.ok) {
                router.push('/login');
            } else {
                const result = await res.json();
                setError(result.error || 'Une erreur est survenue');
            }
        } catch (err) {
            setError('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Créer un compte
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Rejoignez DZ Market Plus aujourd'hui
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {step === 1 ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all"
                                    placeholder="Nom complet"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all"
                                    placeholder="Email"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                />
                            </div>

                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    name="wilaya"
                                    type="text"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all"
                                    placeholder="Wilaya"
                                    value={data.wilaya}
                                    onChange={(e) => setData({ ...data, wilaya: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all"
                                    placeholder="Mot de passe"
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all"
                                    placeholder="Confirmer le mot de passe"
                                    value={data.confirmPassword}
                                    onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg hover:shadow-xl"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Suivant'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                        <div className="text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <Mail className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Vérification de l'email</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Un code a été envoyé à {data.email}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <input
                                name="code"
                                type="text"
                                required
                                maxLength={6}
                                className="appearance-none block w-full px-3 py-4 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 text-center text-2xl tracking-widest focus:outline-none focus:ring-primary focus:border-primary transition-all"
                                placeholder="000000"
                                value={data.verificationCode}
                                onChange={(e) => setData({ ...data, verificationCode: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 px-4 border border-gray-300 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                            >
                                Retour
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg hover:shadow-xl"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Vérifier & Inscrire'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => signIn('google', { callbackUrl: `/${locale}/profile` })}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-md hover:border-gray-300 transition-all transform hover:-translate-y-0.5"
                        >
                            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-red-600 to-yellow-600">
                                Continuer avec Google
                            </span>
                        </button>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <Link href="/login" className="text-primary font-medium hover:underline">
                        Déjà un compte ? Connectez-vous
                    </Link>
                </div>
            </div>
        </div>
    );
}
