'use client';

import { MessageCircle } from 'lucide-react';

export default function MessagesPage() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
                <MessageCircle className="h-24 w-24 mx-auto mb-4 text-gray-300" />
                <h2 className="text-2xl font-semibold mb-2">Sélectionnez une conversation</h2>
                <p className="text-sm">Choisissez une conversation dans la liste pour commencer</p>
            </div>
        </div>
    );
}
