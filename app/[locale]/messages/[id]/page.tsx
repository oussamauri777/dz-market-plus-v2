'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Send, Smile, FileText, Download, Trash2, ArrowLeft, MoreVertical, Phone } from 'lucide-react';
import Pusher from 'pusher-js';
import EmojiPicker from 'emoji-picker-react';
import VoiceRecorder from '@/components/chat/VoiceRecorder';
import AttachmentPicker from '@/components/chat/AttachmentPicker';
import Image from 'next/image';

interface Message {
    _id: string;
    sender: { _id: string; name: string };
    conversation: string;
    content: string;
    type?: 'text' | 'image' | 'audio' | 'file';
    fileUrl?: string;
    fileName?: string;
    read?: boolean;
    createdAt: string;
}

interface Conversation {
    _id: string;
    participants: Array<{ _id: string; name: string }>;
    ad: { _id: string; title: string; price: number; images: string[] };
}

export default function ChatPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const conversationId = params.id as string;

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [, forceUpdate] = useState(0);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated' && conversationId) {
            fetchConversation();
            fetchMessages();

            const handleReceiveMessage = async (message: Message) => {
                if (message.conversation === conversationId) {
                    setMessages((prev) => {
                        if (prev.some(m => m._id === message._id)) return prev;
                        return [...prev, message];
                    });
                    forceUpdate(n => n + 1);
                    setTimeout(() => scrollToBottom(), 100);

                    if (message.sender._id !== session.user.id) {
                        try {
                            const markReadRes = await fetch('/api/messages/mark-read', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ conversationId }),
                            });

                            if (markReadRes.ok) {
                                const { messageIds } = await markReadRes.json();
                                if (messageIds && messageIds.length > 0) {
                                    // Socket emit removed, handled by API trigger
                                }
                            }
                        } catch (error) {
                            console.error('Failed to mark message as read:', error);
                        }
                    }
                }
            };

            const handleMessageDeleted = (messageId: string) => {
                setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
            };

            const handleMessagesRead = (data: { conversationId: string; messageIds: string[] }) => {
                setMessages((prev) => {
                    return prev.map((msg) => {
                        if (data.messageIds.includes(msg._id)) {
                            return { ...msg, read: true };
                        }
                        return msg;
                    });
                });
                forceUpdate(n => n + 1);
            };

            const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            });

            const channel = pusher.subscribe(conversationId);

            channel.bind('receive_message', handleReceiveMessage);
            channel.bind('message_deleted', handleMessageDeleted);
            channel.bind('messages_read', handleMessagesRead);

            return () => {
                pusher.unsubscribe(conversationId);
            };
        }
    }, [status, conversationId]);

    const fetchConversation = async () => {
        try {
            const res = await fetch(`/api/conversations/${conversationId}`);
            if (res.ok) {
                const data = await res.json();
                setConversation(data);
            }
        } catch (error) {
            console.error('Failed to fetch conversation:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/messages?conversationId=${conversationId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                setTimeout(() => scrollToBottom(), 100);

                const markReadRes = await fetch('/api/messages/mark-read', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ conversationId }),
                });

                if (markReadRes.ok) {
                    const { messageIds } = await markReadRes.json();
                    if (messageIds && messageIds.length > 0) {
                        // Socket emit removed
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageContent = newMessage;
        setNewMessage(''); // Optimistic clear

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    content: messageContent,
                }),
            });

            if (res.ok) {
                const savedMessage = await res.json();
                setMessages((prev) => {
                    const exists = prev.some(m => m._id === savedMessage._id);
                    if (exists) return prev;
                    return [...prev, savedMessage];
                });
                forceUpdate(n => n + 1);
                setTimeout(() => scrollToBottom(), 100);
                // Socket emit removed
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const deleteMessage = async (messageId: string) => {
        try {
            const res = await fetch(`/api/messages?messageId=${messageId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Socket emit removed
                setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const handleUploadComplete = async (url: string, type: 'image' | 'audio' | 'file', fileName?: string) => {
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    content: '',
                    type,
                    fileUrl: url,
                    fileName,
                }),
            });

            if (res.ok) {
                const savedMessage = await res.json();
                setMessages((prev) => [...prev, savedMessage]);
                setTimeout(() => scrollToBottom(), 100);
                // Socket emit removed
            }
        } catch (error) {
            console.error('Failed to send attachment:', error);
        }
    };

    const onEmojiClick = (emojiObject: any) => {
        setNewMessage((prev) => prev + emojiObject.emoji);
    };

    const getOtherParticipant = () => {
        return conversation?.participants.find((p) => p._id !== session?.user?.id);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#efeae2]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const otherUser = getOtherParticipant();

    return (
        <div className="absolute inset-0 flex flex-col bg-[#efeae2]">
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-200 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/messages')}
                        className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 border border-gray-100">
                            {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    <div>
                        <h2 className="font-bold text-gray-900 text-sm">{otherUser?.name || 'Utilisateur'}</h2>
                        <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-xs">
                            {conversation?.ad.title}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push(`/ads/${conversation?.ad._id}`)}
                        className="hidden sm:flex items-center gap-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                        <Image
                            src={conversation?.ad.images?.[0] || '/placeholder.png'}
                            alt=""
                            width={20}
                            height={20}
                            className="rounded-sm object-cover"
                        />
                        Voir l'annonce
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
                <div className="space-y-4 max-w-3xl mx-auto">
                    {/* Date Separator (Mock) */}
                    <div className="flex justify-center my-4">
                        <span className="bg-white/80 backdrop-blur-sm text-gray-500 text-[10px] font-medium px-3 py-1 rounded-full shadow-sm border border-gray-100">
                            Aujourd'hui
                        </span>
                    </div>

                    {messages.map((message) => {
                        const isOwnMessage = message.sender._id === session?.user?.id;
                        return (
                            <div
                                key={message._id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`relative max-w-[85%] sm:max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div
                                        className={`px-4 py-2 shadow-sm relative ${isOwnMessage
                                            ? 'bg-blue-50 text-gray-900 rounded-2xl rounded-tr-sm border border-blue-100'
                                            : 'bg-white text-gray-900 rounded-2xl rounded-tl-sm'
                                            }`}
                                    >
                                        {message.type === 'image' ? (
                                            <div className="mb-1 -mx-2 -mt-2">
                                                <img
                                                    src={message.fileUrl}
                                                    alt="Image sent"
                                                    className={`max-w-full max-h-60 object-cover cursor-pointer ${isOwnMessage ? 'rounded-t-xl rounded-bl-xl' : 'rounded-t-xl rounded-br-xl'}`}
                                                    onClick={() => window.open(message.fileUrl, '_blank')}
                                                />
                                            </div>
                                        ) : message.type === 'audio' ? (
                                            <div className="flex items-center gap-2 min-w-[200px] py-1">
                                                <audio controls src={message.fileUrl} className="w-full h-8 accent-white" />
                                            </div>
                                        ) : message.type === 'file' ? (
                                            <a
                                                href={message.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-3 p-3 rounded-xl ${isOwnMessage
                                                    ? 'bg-blue-100 hover:bg-blue-200 text-gray-900'
                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                                    } transition-colors border border-transparent`}
                                            >
                                                <div className={`p-2 rounded-lg ${isOwnMessage ? 'bg-blue-200' : 'bg-gray-200'}`}>
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate max-w-[150px]">
                                                        {message.fileName || 'Document'}
                                                    </p>
                                                    <p className="text-[10px] opacity-70">Fichier</p>
                                                </div>
                                                <Download className="h-4 w-4 opacity-70" />
                                            </a>
                                        ) : (
                                            <p className="text-[15px] whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                                        )}

                                        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwnMessage ? 'text-gray-500' : 'text-gray-400'}`}>
                                            <span className="text-[10px]">
                                                {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                            {isOwnMessage && (
                                                message.read ? (
                                                    <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 16 15" fill="none">
                                                        <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 16 15" fill="none">
                                                        <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512z" fill="currentColor" />
                                                    </svg>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {isOwnMessage && (
                                        <button
                                            onClick={() => deleteMessage(message._id)}
                                            className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-600"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex-shrink-0 z-20">
                <div className="max-w-3xl mx-auto relative">
                    {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-4 z-50 shadow-xl rounded-2xl overflow-hidden" ref={emojiPickerRef}>
                            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                        </div>
                    )}
                    <form onSubmit={sendMessage} className="flex gap-2 items-end bg-white p-2 rounded-3xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-1 pb-1 pl-1">
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"
                            >
                                <Smile className="h-6 w-6" />
                            </button>
                            <AttachmentPicker onUploadComplete={(url, type, name) => handleUploadComplete(url, type, name)} />
                        </div>

                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage(e);
                                }
                            }}
                            placeholder="Écrivez un message..."
                            className="flex-1 max-h-32 py-3 px-2 bg-transparent border-none focus:outline-none resize-none text-gray-900 placeholder-gray-500 custom-scrollbar"
                            rows={1}
                            style={{ minHeight: '44px' }}
                        />

                        <div className="flex items-center gap-1 pb-1 pr-1">
                            {newMessage.trim() ? (
                                <button
                                    type="submit"
                                    className="bg-primary text-white p-2.5 rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    <Send className="h-5 w-5 pl-0.5" />
                                </button>
                            ) : (
                                <VoiceRecorder onRecordingComplete={(url) => handleUploadComplete(url, 'audio')} />
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
