'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GameCanvas from './_components/GameCanvas';
import ChatPanel from './_components/ChatPanel';
import { SkeletonList, SkeletonAvatar } from '@/app/_components/Skeleton';

interface User {
    id: string;
    fullName: string;
    nickname?: string;
}

interface ChatMessage {
    _id: string;
    memberId: string;
    memberName: string;
    memberColor: string;
    message: string;
    position: { x: number; y: number };
    createdAt: string;
}

interface UserPosition {
    _id: string;
    memberId: string;
    memberName: string;
    nickname?: string;
    color: string;
    x: number;
    y: number;
}

export default function ChatRoomPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [positions, setPositions] = useState<UserPosition[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [myPosition, setMyPosition] = useState({ x: 400, y: 300 });
    const [canSend, setCanSend] = useState(true);

    // Check auth
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Not logged in');
            })
            .then(data => {
                setUser(data.user);
                setLoading(false);
            })
            .catch(() => {
                router.push('/auth/login?redirect=/chat');
            });
    }, [router]);

    // Fetch positions and messages (polling)
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [posRes, msgRes] = await Promise.all([
                    fetch('/api/chat/positions'),
                    fetch('/api/chat/messages'),
                ]);

                if (posRes.ok) {
                    const posData = await posRes.json();
                    setPositions(posData);
                }

                if (msgRes.ok) {
                    const msgData = await msgRes.json();
                    setMessages(msgData);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, [user]);

    // Update own position
    const updatePosition = async (x: number, y: number) => {
        setMyPosition({ x, y });
        try {
            await fetch('/api/chat/positions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ x, y }),
            });
        } catch (error) {
            console.error('Position update error:', error);
        }
    };

    // Send message
    const sendMessage = async (message: string) => {
        if (!canSend) return;

        setCanSend(false);
        try {
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Mesaj gönderilemedi');
            }
        } catch (error) {
            console.error('Send message error:', error);
        }

        // Re-enable after 3 seconds
        setTimeout(() => setCanSend(true), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <SkeletonList items={5} />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-white relative overflow-hidden">
            {/* Dotted background pattern (same as Home) */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row p-4 gap-4 pb-8" style={{ marginTop: '120px', height: 'calc(100vh - 140px)' }}>
                {/* Game Area */}
                <div className="flex-1 flex items-center justify-center">
                    <GameCanvas
                        user={user!}
                        positions={positions}
                        messages={messages}
                        myPosition={myPosition}
                        onMove={updatePosition}
                    />
                </div>

                {/* Chat Panel */}
                <div className="w-full lg:w-72 flex-shrink-0 h-full overflow-hidden">
                    <ChatPanel
                        messages={messages}
                        onSend={sendMessage}
                        canSend={canSend}
                        currentUserId={user?.id || ''}
                    />
                </div>
            </div>
        </div>
    );
}
