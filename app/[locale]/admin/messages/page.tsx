'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, User } from 'lucide-react';
import ImageWithFallback from '@/components/common/ImageWithFallback';

interface Conversation {
    _id: string;
    participants: Array<{ _id: string; name: string; email: string; image?: string }>;
    ad: { _id: string; title: string; images: string[] };
    lastMessageAt: string;
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchConversations();
    }, [page]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/messages?page=${page}&limit=10`);
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Messages Overview</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {conversations.map((conv) => (
                        <div key={conv._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {conv.participants.map((p) => (
                                        <div key={p._id} className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden" title={p.name}>
                                            {p.image ? (
                                                <ImageWithFallback src={p.image} alt={p.name} width={40} height={40} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                                    <User className="h-5 w-5 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">
                                        {conv.ad?.title || 'Deleted Ad'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {conv.participants.map(p => p.name).join(' & ')}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">
                                    Last active: {new Date(conv.lastMessageAt).toLocaleDateString()}
                                </p>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-1">
                                    <MessageCircle className="h-3 w-3" />
                                    View Chat
                                </span>
                            </div>
                        </div>
                    ))}

                    {conversations.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                            No conversations found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
