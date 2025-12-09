import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';

/**
 * Resend Webhook Handler
 * Handles email events: bounced, complained, delivered
 * 
 * Setup in Resend Dashboard:
 * 1. Go to Settings > Webhooks
 * 2. Add endpoint: https://yourdomain.com/api/webhooks/resend
 * 3. Select events: email.bounced, email.complained
 * 4. Copy signing secret to RESEND_WEBHOOK_SECRET env var
 */

// Resend webhook event types
interface ResendWebhookEvent {
    type: 'email.sent' | 'email.delivered' | 'email.bounced' | 'email.complained' | 'email.opened' | 'email.clicked';
    created_at: string;
    data: {
        email_id: string;
        from: string;
        to: string[];
        subject: string;
        // Bounce specific
        bounce?: {
            type: 'hard' | 'soft';
            message: string;
        };
    };
}

// Verify webhook signature (optional but recommended)
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    if (!secret) return true; // Skip if no secret configured

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.text();
        const signature = request.headers.get('resend-signature') || '';
        const secret = process.env.RESEND_WEBHOOK_SECRET || '';

        // Verify signature if secret is configured
        if (secret && !verifyWebhookSignature(payload, signature, secret)) {
            console.error('Webhook signature verification failed');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event: ResendWebhookEvent = JSON.parse(payload);
        console.log(`Resend webhook received: ${event.type}`);

        await connectDB();

        // Handle bounce events
        if (event.type === 'email.bounced') {
            const recipientEmail = event.data.to[0];
            const bounceType = event.data.bounce?.type || 'soft';

            const member = await Member.findOne({ email: recipientEmail.toLowerCase() });

            if (member) {
                const newBounceCount = (member.emailBounceCount || 0) + 1;

                // Hard bounce or 3+ soft bounces = mark as bounced
                const shouldMarkBounced = bounceType === 'hard' || newBounceCount >= 3;

                await Member.updateOne(
                    { _id: member._id },
                    {
                        $set: {
                            emailBounced: shouldMarkBounced,
                            lastBounceAt: new Date(),
                        },
                        $inc: { emailBounceCount: 1 }
                    }
                );

                console.log(`Email bounce recorded for ${recipientEmail}: ${bounceType} (count: ${newBounceCount})`);
            }
        }

        // Handle complaint events (user marked as spam)
        if (event.type === 'email.complained') {
            const recipientEmail = event.data.to[0];

            await Member.updateOne(
                { email: recipientEmail.toLowerCase() },
                {
                    $set: {
                        emailBounced: true,
                        emailConsent: false, // Also revoke consent
                        lastBounceAt: new Date(),
                    }
                }
            );

            console.log(`Email complaint recorded for ${recipientEmail}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
