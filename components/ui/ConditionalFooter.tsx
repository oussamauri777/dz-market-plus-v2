'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
    const pathname = usePathname();

    // Hide footer on messages pages
    const isMessagesPage = pathname?.includes('/messages');

    if (isMessagesPage) {
        return null;
    }

    return <Footer />;
}
