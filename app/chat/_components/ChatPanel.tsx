'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatMessage {
    _id: string;
    memberId: string;
    memberName: string;
    memberColor: string;
    message: string;
    createdAt: string;
}

interface ChatPanelProps {
    messages: ChatMessage[];
    onSend: (message: string) => void;
    canSend: boolean;
    currentUserId: string;
}

export default function ChatPanel({ messages, onSend, canSend, currentUserId }: ChatPanelProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const prevMessageCount = useRef(0);
    const isUserScrolling = useRef(false);

    // Auto-scroll to bottom when new messages arrive (if user is at bottom)
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // Check if user is near bottom (within 100px)
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

        // Scroll on initial load or when new messages and user is near bottom
        if (messages.length > prevMessageCount.current || prevMessageCount.current === 0) {
            if (isNearBottom || prevMessageCount.current === 0) {
                // Use scrollTop instead of scrollIntoView to only scroll the container
                container.scrollTop = container.scrollHeight;
            }
        }
        prevMessageCount.current = messages.length;
    }, [messages]);

    // Cooldown timer
    useEffect(() => {
        if (!canSend) {
            setCooldownSeconds(3);
            const interval = setInterval(() => {
                setCooldownSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [canSend]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !canSend) return;

        onSend(input.trim());
        setInput('');
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    // Sort messages by time (newest last)
    const sortedMessages = [...messages].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return (
        <div className="bg-white border-4 border-black shadow-neo flex flex-col max-h-full overflow-hidden">
            {/* Header */}
            <div className="bg-black text-white px-4 py-3 font-black uppercase text-center">
                💬 Chat Room
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                {sortedMessages.length === 0 ? (
                    <div className="text-center text-gray-400 font-bold py-8">
                        Henüz mesaj yok.<br />
                        İlk mesajı sen yaz!
                    </div>
                ) : (
                    sortedMessages.map(msg => {
                        const isMe = msg.memberId === currentUserId;
                        return (
                            <div
                                key={msg._id}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div
                                        className="w-3 h-3 border border-black"
                                        style={{ backgroundColor: msg.memberColor }}
                                    />
                                    <span className="text-xs font-bold text-gray-600">
                                        {msg.memberName}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {formatTime(msg.createdAt)}
                                    </span>
                                </div>
                                <div
                                    className={`px-3 py-2 border-2 border-black max-w-[85%] break-words ${isMe
                                        ? 'bg-neo-blue text-black'
                                        : 'bg-gray-100 text-black'
                                        }`}
                                >
                                    <p className="text-sm font-medium">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t-4 border-black flex-shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value.slice(0, 120))}
                        placeholder={canSend ? "Mesajını yaz..." : `${cooldownSeconds}s bekle...`}
                        disabled={!canSend}
                        className="flex-1 min-w-0 px-3 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-neo disabled:bg-gray-100 disabled:text-gray-400"
                        maxLength={120}
                    />
                    <button
                        type="submit"
                        disabled={!canSend || !input.trim()}
                        className="px-3 py-2 bg-neo-green border-2 border-black font-black uppercase hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">
                        {input.length}/120
                    </span>
                    {!canSend && (
                        <span className="text-xs text-orange-500 font-bold">
                            Spam koruması: {cooldownSeconds}s
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}
