/**
 * Email Spam Score Checker
 * Analyzes email content for potential spam triggers
 * Returns a score from 0 (excellent) to 100 (very spammy)
 */

// Spam trigger words (Turkish and English)
const SPAM_WORDS = [
    // Turkish
    'bedava', 'ücretsiz', 'hemen', 'acil', 'kazan', 'fırsat', 'tıkla', 'şimdi',
    'indirim', 'kampanya', 'son şans', 'sınırlı', 'özel teklif',
    // English
    'free', 'urgent', 'win', 'click', 'limited', 'offer', 'deal', 'discount',
    'act now', 'don\'t miss', 'exclusive', 'guaranteed', 'winner',
    // Common spam patterns (escaped for regex)
    '\\!\\!\\!', '\\?\\?\\?', '\\$\\$\\$', '€€€', '₺₺₺'
];

// High risk words (higher penalty)
const HIGH_RISK_WORDS = [
    'kazandınız', 'won', 'lottery', 'piyango', 'jackpot',
    'şifre', 'password', 'verify', 'doğrula', 'hesabınız',
    'bank', 'banka', 'kredi', 'credit', 'para', 'money'
];

export interface SpamCheckResult {
    score: number;  // 0-100 (lower is better)
    rating: 'excellent' | 'good' | 'warning' | 'danger';
    issues: SpamIssue[];
    suggestions: string[];
}

export interface SpamIssue {
    type: 'word' | 'caps' | 'links' | 'images' | 'length' | 'exclamation';
    message: string;
    severity: 'low' | 'medium' | 'high';
    penalty: number;
}

/**
 * Analyze email content for spam triggers
 */
export function analyzeSpamScore(subject: string, htmlContent: string): SpamCheckResult {
    const issues: SpamIssue[] = [];
    let totalPenalty = 0;

    // Clean HTML for text analysis
    const textContent = htmlContent
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const fullText = `${subject} ${textContent}`.toLowerCase();

    // 1. Check for spam words
    let spamWordCount = 0;
    for (const word of SPAM_WORDS) {
        const regex = new RegExp(word.toLowerCase(), 'gi');
        const matches = fullText.match(regex);
        if (matches) {
            spamWordCount += matches.length;
        }
    }
    if (spamWordCount > 0) {
        const penalty = Math.min(spamWordCount * 5, 25);
        totalPenalty += penalty;
        issues.push({
            type: 'word',
            message: `${spamWordCount} spam tetikleyici kelime bulundu`,
            severity: spamWordCount > 3 ? 'high' : 'medium',
            penalty
        });
    }

    // 2. Check for high risk words
    let highRiskCount = 0;
    for (const word of HIGH_RISK_WORDS) {
        if (fullText.includes(word.toLowerCase())) {
            highRiskCount++;
        }
    }
    if (highRiskCount > 0) {
        const penalty = highRiskCount * 10;
        totalPenalty += penalty;
        issues.push({
            type: 'word',
            message: `${highRiskCount} yüksek riskli kelime bulundu`,
            severity: 'high',
            penalty
        });
    }

    // 3. Check CAPS ratio in subject
    const subjectCapsRatio = (subject.match(/[A-ZÜĞİŞÇÖ]/g) || []).length / Math.max(subject.length, 1);
    if (subjectCapsRatio > 0.5 && subject.length > 5) {
        const penalty = 15;
        totalPenalty += penalty;
        issues.push({
            type: 'caps',
            message: 'Konu başlığında çok fazla büyük harf kullanılmış',
            severity: 'medium',
            penalty
        });
    }

    // 4. Check exclamation marks
    const exclamationCount = (fullText.match(/!/g) || []).length;
    if (exclamationCount > 3) {
        const penalty = Math.min((exclamationCount - 3) * 3, 15);
        totalPenalty += penalty;
        issues.push({
            type: 'exclamation',
            message: `${exclamationCount} ünlem işareti bulundu`,
            severity: exclamationCount > 5 ? 'high' : 'medium',
            penalty
        });
    }

    // 5. Check link count
    const linkCount = (htmlContent.match(/<a\s/gi) || []).length;
    if (linkCount > 5) {
        const penalty = Math.min((linkCount - 5) * 3, 15);
        totalPenalty += penalty;
        issues.push({
            type: 'links',
            message: `${linkCount} bağlantı bulundu (5'ten fazla)`,
            severity: 'medium',
            penalty
        });
    }

    // 6. Check image to text ratio
    const imageCount = (htmlContent.match(/<img\s/gi) || []).length;
    const textLength = textContent.length;
    if (imageCount > 0 && textLength < 100) {
        const penalty = 10;
        totalPenalty += penalty;
        issues.push({
            type: 'images',
            message: 'Görsel ağırlıklı içerik, metin yetersiz',
            severity: 'medium',
            penalty
        });
    }

    // 7. Check content length
    if (textLength < 50) {
        const penalty = 5;
        totalPenalty += penalty;
        issues.push({
            type: 'length',
            message: 'İçerik çok kısa',
            severity: 'low',
            penalty
        });
    }

    // Calculate final score (cap at 100)
    const score = Math.min(Math.round(totalPenalty), 100);

    // Determine rating
    let rating: SpamCheckResult['rating'];
    if (score <= 10) rating = 'excellent';
    else if (score <= 30) rating = 'good';
    else if (score <= 60) rating = 'warning';
    else rating = 'danger';

    // Generate suggestions
    const suggestions: string[] = [];
    if (issues.some(i => i.type === 'word')) {
        suggestions.push('Spam tetikleyici kelimeleri daha nötr ifadelerle değiştirin');
    }
    if (issues.some(i => i.type === 'caps')) {
        suggestions.push('Konu başlığını normal büyük/küçük harf ile yazın');
    }
    if (issues.some(i => i.type === 'exclamation')) {
        suggestions.push('Ünlem işareti sayısını azaltın');
    }
    if (issues.some(i => i.type === 'images')) {
        suggestions.push('Daha fazla metin içeriği ekleyin');
    }
    if (score === 0) {
        suggestions.push('İçerik spam filtresi açısından güvenli görünüyor');
    }

    return { score, rating, issues, suggestions };
}

/**
 * Get color for spam score display
 */
export function getSpamScoreColor(score: number): string {
    if (score <= 10) return '#22c55e'; // green
    if (score <= 30) return '#84cc16'; // lime
    if (score <= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
}

/**
 * Get label for spam rating
 */
export function getSpamRatingLabel(rating: SpamCheckResult['rating']): string {
    const labels = {
        excellent: 'Mükemmel',
        good: 'İyi',
        warning: 'Dikkat',
        danger: 'Riskli'
    };
    return labels[rating];
}
