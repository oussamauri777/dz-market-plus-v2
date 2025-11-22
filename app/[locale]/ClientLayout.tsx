'use client';

import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import AuthProvider from '@/components/providers/AuthProvider';

export default function ClientLayout({
    children,
    messages,
    locale,
    dir,
    geistSans,
    geistMono,
}: {
    children: React.ReactNode;
    messages: any;
    locale: string;
    dir: string;
    geistSans: string;
    geistMono: string;
}) {
    const pathname = usePathname();
    const isMessagesPage = pathname?.includes('/messages');

    return (
        <html lang={locale} dir={dir} suppressHydrationWarning>
            <body
                className={`${geistSans} ${geistMono} antialiased ${isMessagesPage ? 'h-screen overflow-hidden' : 'min-h-screen'
                    } flex flex-col bg-gray-50 dark:bg-gray-900`}
            >
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <AuthProvider>
                        <Navbar />
                        <main className={isMessagesPage ? 'flex-1 overflow-hidden' : 'flex-grow'}>
                            {children}
                        </main>
                        {!isMessagesPage && <Footer />}
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
