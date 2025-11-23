'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from '@/i18n/routing';
import { MessageCircle, Search } from 'lucide-react';
import Pusher from 'pusher-js';

interface Conversation {
    _id: string;
    participants: Array<{ _id: string; name: string }>;
    ad: { _id: string; title: string };
    lastMessage: string;
    lastMessageAt: string;
    unreadCount?: number;
}

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (session) {
            fetchConversations();

            const handleReceiveMessage = (message: any) => {
                const pathParts = pathname?.split('/') || [];
                const activeConversationId = pathParts[pathParts.length - 1];
                const isActiveConversation = activeConversationId === message.conversation;

                setConversations((prev) =>
                    prev.map((conv) => {
                        if (conv._id === message.conversation) {
                            const updatedConv = {
                                ...conv,
                                lastMessage: message.content || (message.type === 'image' ? '📷 Photo' : message.type === 'audio' ? '🎤 Audio' : '📎 Fichier'),
                                lastMessageAt: message.createdAt,
                            };

                            if (message.sender._id !== session.user.id && !isActiveConversation) {
                                updatedConv.unreadCount = (conv.unreadCount || 0) + 1;
                            }

                            return updatedConv;
                        }
                        return conv;
                    }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
                );
            };

            const handleMessagesRead = (data: { conversationId: string; messageIds: string[] }) => {
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv._id === data.conversationId
                            ? { ...conv, unreadCount: 0 }
                            : conv
                    )
                );
            };

            const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            });

            // Subscribe to all conversations
            conversations.forEach((conv) => {
                const channel = pusher.subscribe(conv._id);
                channel.bind('receive_message', handleReceiveMessage);
                channel.bind('messages_read', handleMessagesRead);
            });

            return () => {
                conversations.forEach((conv) => {
                    pusher.unsubscribe(conv._id);
                });
                pusher.disconnect();
            };
        }
    }, [session, pathname, conversations]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/conversations');
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getOtherParticipant = (conv: Conversation) => {
        return conv.participants.find((p) => p._id !== session?.user?.id);
    };

    const isActiveConversation = (convId: string) => {
        return pathname?.includes(convId);
    };

    const filteredConversations = conversations.filter(conv => {
        const otherUser = getOtherParticipant(conv);
        return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.ad.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="fixed inset-0 top-[64px] flex bg-gray-50">
            {/* Sidebar - Conversation List */}
            <div className={`w-full md:w-[380px] bg-white border-r border-gray-200 flex flex-col ${pathname?.includes('/messages/') && pathname.split('/').length > 3 ? 'hidden md:flex' : 'flex'}`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                        <div className="bg-primary/10 p-2 rounded-full">
                            <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une conversation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>Aucune conversation trouvée</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredConversations.map((conv) => {
                                const otherUser = getOtherParticipant(conv);
                                const isActive = isActiveConversation(conv._id);

                                return (
                                    <div
                                        key={conv._id}
                                        onClick={() => router.push(`/messages/${conv._id}`)}
                                        className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${isActive ? 'bg-blue-50/50 border-l-4 border-primary' : 'border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg border border-gray-100 shadow-sm">
                                                    {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                {/* Online indicator could go here */}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className={`font-semibold truncate ${isActive ? 'text-primary' : 'text-gray-900'}`}>
                                                        {otherUser?.name || 'Utilisateur'}
                                                    </h3>
                                                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                        {new Date(conv.lastMessageAt).toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate mb-1 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded-md">
                                                    {conv.ad.title}
                                                </p>
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-sm truncate ${conv.unreadCount && conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                                        {conv.lastMessage || 'Nouvelle conversation'}
                                                    </p>
                                                    {conv.unreadCount && conv.unreadCount > 0 ? (
                                                        <span className="bg-primary text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shadow-sm animate-pulse ml-2">
                                                            {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col bg-[#efeae2] relative overflow-hidden ${!pathname?.includes('/messages/') || pathname.split('/').length <= 3 ? 'hidden md:flex' : 'flex'}`}>
                {/* WhatsApp-style background pattern */}
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
                <div className="relative z-10 flex-1 flex flex-col h-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
