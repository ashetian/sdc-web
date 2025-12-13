// Password Strength Validation Utility

// Common weak passwords blacklist
const COMMON_PASSWORDS = [
    '123456', '123456789', '12345678', '1234567', '12345',
    'password', 'password1', 'password123',
    'qwerty', 'qwerty123', 'qwertyuiop',
    'abc123', 'abcdef', 'abcd1234',
    '111111', '000000', '123123', '654321',
    'iloveyou', 'sunshine', 'princess', 'admin',
    'welcome', 'monkey', 'dragon', 'master',
    'letmein', 'login', 'passw0rd', 'hello',
    'sifre', 'sifre123', 'parola', 'parola123',
    'turkiye', 'galatasaray', 'fenerbahce', 'besiktas',
];

// Patterns to reject
const SEQUENTIAL_PATTERNS = [
    /(.)\1{5,}/, // Same character 6+ times (aaaaaa, 111111)
    /^(012345|123456|234567|345678|456789|567890)/, // Sequential numbers
    /^(abcdef|bcdefg|cdefgh|defghi|efghij)/, // Sequential letters
    /^(qwerty|asdfgh|zxcvbn)/, // Keyboard patterns
];

export interface PasswordValidation {
    isValid: boolean;
    score: 0 | 1 | 2 | 3; // 0=invalid, 1=weak, 2=medium, 3=strong
    errors: string[];
    strengthLabel: 'invalid' | 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string, lang: 'tr' | 'en' = 'tr'): PasswordValidation {
    const errors: string[] = [];
    let score = 0;

    const messages = {
        tr: {
            minLength: 'Şifre en az 8 karakter olmalı',
            uppercase: 'En az 1 büyük harf içermeli',
            lowercase: 'En az 1 küçük harf içermeli',
            number: 'En az 1 rakam içermeli',
            commonPassword: 'Bu şifre çok yaygın ve güvenli değil',
            sequential: 'Tekrarlayan veya ardışık karakterler kullanılamaz',
        },
        en: {
            minLength: 'Password must be at least 8 characters',
            uppercase: 'Must contain at least 1 uppercase letter',
            lowercase: 'Must contain at least 1 lowercase letter',
            number: 'Must contain at least 1 number',
            commonPassword: 'This password is too common and not secure',
            sequential: 'Sequential or repeating characters are not allowed',
        }
    };

    const m = messages[lang];

    // Minimum length
    if (password.length < 8) {
        errors.push(m.minLength);
    } else {
        score++;
    }

    // Uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push(m.uppercase);
    } else {
        score++;
    }

    // Lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push(m.lowercase);
    } else {
        score++;
    }

    // Number
    if (!/[0-9]/.test(password)) {
        errors.push(m.number);
    } else {
        score++;
    }

    // Common password check
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
        errors.push(m.commonPassword);
        score = 0;
    }

    // Sequential/repeating pattern check
    const lowerPassword = password.toLowerCase();
    for (const pattern of SEQUENTIAL_PATTERNS) {
        if (pattern.test(lowerPassword)) {
            errors.push(m.sequential);
            score = Math.max(0, score - 2);
            break;
        }
    }

    // Special characters bonus
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score++;
    }

    // Length bonus
    if (password.length >= 12) {
        score++;
    }

    // Calculate final score (0-3)
    let finalScore: 0 | 1 | 2 | 3;
    if (errors.length > 0) {
        finalScore = 0;
    } else if (score <= 4) {
        finalScore = 1;
    } else if (score <= 5) {
        finalScore = 2;
    } else {
        finalScore = 3;
    }

    const strengthLabels: Record<number, 'invalid' | 'weak' | 'medium' | 'strong'> = {
        0: 'invalid',
        1: 'weak',
        2: 'medium',
        3: 'strong',
    };

    return {
        isValid: errors.length === 0,
        score: finalScore,
        errors,
        strengthLabel: strengthLabels[finalScore],
    };
}

// Simple strength check for real-time feedback (no errors, just score)
export function getPasswordStrength(password: string): {
    score: 0 | 1 | 2 | 3;
    label: 'none' | 'weak' | 'medium' | 'strong';
    color: string;
    percentage: number;
} {
    if (!password) {
        return { score: 0, label: 'none', color: '#e5e7eb', percentage: 0 };
    }

    let score = 0;

    // Length checks
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    // Penalties
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) score = 0;

    // Normalize to 0-3
    let finalScore: 0 | 1 | 2 | 3;
    if (score <= 2) finalScore = 1;
    else if (score <= 4) finalScore = 2;
    else finalScore = 3;

    if (password.length < 8) finalScore = 0;

    const labels: Record<number, 'none' | 'weak' | 'medium' | 'strong'> = {
        0: 'none',
        1: 'weak',
        2: 'medium',
        3: 'strong',
    };

    const colors: Record<number, string> = {
        0: '#e5e7eb',
        1: '#ef4444',
        2: '#f59e0b',
        3: '#22c55e',
    };

    return {
        score: finalScore,
        label: labels[finalScore],
        color: colors[finalScore],
        percentage: (finalScore / 3) * 100,
    };
}
