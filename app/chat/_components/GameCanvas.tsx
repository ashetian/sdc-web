'use client';

import { useEffect, useRef, useCallback } from 'react';

interface User {
    id: string;
    fullName: string;
    nickname?: string;
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

interface ChatMessage {
    _id: string;
    memberId: string;
    memberName: string;
    memberColor: string;
    message: string;
    position: { x: number; y: number };
    createdAt: string;
}

interface GameCanvasProps {
    user: User;
    positions: UserPosition[];
    messages: ChatMessage[];
    myPosition: { x: number; y: number };
    onMove: (x: number, y: number) => void;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;
const AVATAR_SIZE = 12;
const MOVE_SPEED = 4;
const BUBBLE_DURATION_MS = 5000;

export default function GameCanvas({ user, positions, messages, myPosition, onMove }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const keysPressed = useRef<Set<string>>(new Set());
    const animationRef = useRef<number>();
    const touchTarget = useRef<{ x: number; y: number } | null>(null);

    // Get recent messages for bubbles (last 5 seconds)
    const getRecentBubbles = useCallback(() => {
        const now = Date.now();
        return messages.filter(msg => {
            const msgTime = new Date(msg.createdAt).getTime();
            return (now - msgTime) < BUBBLE_DURATION_MS;
        });
    }, [messages]);

    // Draw pixel circle
    const drawPixelCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isCurrentUser: boolean) => {
        const size = AVATAR_SIZE;
        ctx.fillStyle = color;

        // Simple pixel circle pattern
        const pattern = [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
        ];

        const pixelSize = size / 8;
        const startX = x - size / 2;
        const startY = y - size / 2;

        pattern.forEach((row, rowIdx) => {
            row.forEach((pixel, colIdx) => {
                if (pixel) {
                    ctx.fillRect(
                        startX + colIdx * pixelSize,
                        startY + rowIdx * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            });
        });

        // Border for current user
        if (isCurrentUser) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX - 2, startY - 2, size + 4, size + 4);
        }
    };

    // Draw speech bubble with collision prevention
    const drawBubble = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, bubbleIndex: number) => {
        const maxWidth = 180;
        const padding = 8;
        const lineHeight = 14;

        ctx.font = '12px "Press Start 2P", monospace, Arial';

        // Word wrap
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth - padding * 2) {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) lines.push(currentLine);

        // Bubble dimensions
        const bubbleWidth = Math.min(maxWidth, Math.max(...lines.map(l => ctx.measureText(l).width)) + padding * 2);
        const bubbleHeight = lines.length * lineHeight + padding * 2;

        // Position with collision offset (stack upward for multiple bubbles)
        const bubbleX = x - bubbleWidth / 2;
        const bubbleY = y - AVATAR_SIZE - 20 - bubbleHeight - (bubbleIndex * (bubbleHeight + 5));

        // Draw bubble background
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        // Rounded rect
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(bubbleX + radius, bubbleY);
        ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
        ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius);
        ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
        ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight);
        ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight);
        ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - radius);
        ctx.lineTo(bubbleX, bubbleY + radius);
        ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw pointer
        ctx.beginPath();
        ctx.moveTo(x - 5, bubbleY + bubbleHeight);
        ctx.lineTo(x, bubbleY + bubbleHeight + 8);
        ctx.lineTo(x + 5, bubbleY + bubbleHeight);
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial, sans-serif';
        lines.forEach((line, idx) => {
            ctx.fillText(line, bubbleX + padding, bubbleY + padding + lineHeight * (idx + 0.8));
        });
    };

    // Draw name tag
    const drawNameTag = (ctx: CanvasRenderingContext2D, x: number, y: number, name: string) => {
        ctx.font = 'bold 10px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.fillText(name, x, y + AVATAR_SIZE + 12);
        ctx.textAlign = 'start';
    };

    // Main render loop
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#FAFAFA';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw grid pattern
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        for (let x = 0; x < CANVAS_WIDTH; x += 24) {
            for (let y = 0; y < CANVAS_HEIGHT; y += 24) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const recentBubbles = getRecentBubbles();

        // Draw other users
        positions.forEach(pos => {
            if (pos.memberId === user.id) return;

            drawPixelCircle(ctx, pos.x, pos.y, '#000000', false);
            drawNameTag(ctx, pos.x, pos.y, pos.nickname || pos.memberName.split(' ')[0]);

            // Draw bubbles for this user (with collision offset)
            const userBubbles = recentBubbles.filter(m => m.memberId === pos.memberId).reverse();
            userBubbles.forEach((msg, idx) => {
                drawBubble(ctx, pos.x, pos.y, msg.message, msg.memberColor, idx);
            });
        });

        // Draw current user (on top)
        const myPos = positions.find(p => p.memberId === user.id);
        const myColor = myPos?.color || '#3B82F6';

        drawPixelCircle(ctx, myPosition.x, myPosition.y, myColor, true);
        drawNameTag(ctx, myPosition.x, myPosition.y, user.nickname || user.fullName.split(' ')[0]);

        // Draw current user's bubbles
        const myBubbles = recentBubbles.filter(m => m.memberId === user.id).reverse();
        myBubbles.forEach((msg, idx) => {
            drawBubble(ctx, myPosition.x, myPosition.y, msg.message, msg.memberColor, idx);
        });
    }, [positions, messages, myPosition, user, getRecentBubbles]);

    // Handle keyboard input - only when not typing in an input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't capture WASD when typing in input/textarea
            const activeEl = document.activeElement;
            if (activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA') {
                return;
            }

            if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
                e.preventDefault();
                keysPressed.current.add(e.key.toLowerCase());
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current.delete(e.key.toLowerCase());
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Game loop for movement
    useEffect(() => {
        let lastUpdate = Date.now();

        const gameLoop = () => {
            const now = Date.now();

            // Update position based on keys (throttle to 60fps)
            if (now - lastUpdate > 16) {
                let newX = myPosition.x;
                let newY = myPosition.y;

                // Keyboard movement
                if (keysPressed.current.has('w')) newY -= MOVE_SPEED;
                if (keysPressed.current.has('s')) newY += MOVE_SPEED;
                if (keysPressed.current.has('a')) newX -= MOVE_SPEED;
                if (keysPressed.current.has('d')) newX += MOVE_SPEED;

                // Touch target movement (smooth walking)
                if (touchTarget.current) {
                    const dx = touchTarget.current.x - myPosition.x;
                    const dy = touchTarget.current.y - myPosition.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > MOVE_SPEED) {
                        // Move towards target
                        newX = myPosition.x + (dx / distance) * MOVE_SPEED;
                        newY = myPosition.y + (dy / distance) * MOVE_SPEED;
                    } else if (distance > 1) {
                        // Arrived at target
                        newX = touchTarget.current.x;
                        newY = touchTarget.current.y;
                        touchTarget.current = null;
                    } else {
                        touchTarget.current = null;
                    }
                }

                // Clamp to canvas bounds
                newX = Math.max(AVATAR_SIZE, Math.min(CANVAS_WIDTH - AVATAR_SIZE, newX));
                newY = Math.max(AVATAR_SIZE, Math.min(CANVAS_HEIGHT - AVATAR_SIZE, newY));

                if (newX !== myPosition.x || newY !== myPosition.y) {
                    onMove(newX, newY);
                }

                lastUpdate = now;
            }

            render();
            animationRef.current = requestAnimationFrame(gameLoop);
        };

        animationRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [myPosition, onMove, render]);

    // Touch controls for mobile - set target point
    const handleTouch = (e: React.TouchEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;

        let targetX = (touch.clientX - rect.left) * scaleX;
        let targetY = (touch.clientY - rect.top) * scaleY;

        // Clamp to canvas bounds
        targetX = Math.max(AVATAR_SIZE, Math.min(CANVAS_WIDTH - AVATAR_SIZE, targetX));
        targetY = Math.max(AVATAR_SIZE, Math.min(CANVAS_HEIGHT - AVATAR_SIZE, targetY));

        // Set target for smooth movement
        touchTarget.current = { x: targetX, y: targetY };
    };

    return (
        <div className="bg-white border-4 border-black shadow-neo p-1 lg:p-2 w-full max-w-full overflow-hidden">
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border-2 border-black w-full h-auto touch-none"
                style={{ maxWidth: '100%' }}
                tabIndex={0}
                onTouchMove={handleTouch}
                onTouchStart={handleTouch}
            />
            <div className="mt-2 text-center text-xs lg:text-sm font-bold text-gray-600">
                <span className="hidden lg:inline">
                    <kbd className="px-2 py-1 bg-gray-100 border border-black mr-1">W</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 border border-black mr-1">A</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 border border-black mr-1">S</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 border border-black">D</kbd>
                    <span className="ml-2">ile hareket et</span>
                </span>
                <span className="lg:hidden">👆 Dokunarak hareket et</span>
            </div>
        </div>
    );
}
