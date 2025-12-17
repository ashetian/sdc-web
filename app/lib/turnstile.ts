/**
 * Cloudflare Turnstile server-side verification
 */

interface TurnstileVerifyResponse {
    success: boolean;
    'error-codes'?: string[];
    challenge_ts?: string;
    hostname?: string;
}

/**
 * Verify a Turnstile token with Cloudflare's API
 * @param token - The token received from the client-side widget
 * @param ip - Optional client IP address for additional security
 * @returns true if verification succeeded, false otherwise
 */
export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    // Skip verification in development if no secret key is configured
    if (!secretKey) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('Turnstile secret key not configured, skipping verification in development');
            return true;
        }
        console.error('Turnstile secret key is not configured');
        return false;
    }

    if (!token) {
        return false;
    }

    try {
        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', token);
        if (ip) {
            formData.append('remoteip', ip);
        }

        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        const data: TurnstileVerifyResponse = await response.json();

        if (!data.success) {
            console.warn('Turnstile verification failed:', data['error-codes']);
        }

        return data.success;
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return false;
    }
}
