// AI Translation utility for automatic content translation
// Uses DeepL API for translating dynamic content

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

interface TranslationResult {
    tr: string;
    en: string;
}

export async function translateContent(text: string, sourceLanguage: 'tr' | 'en' = 'tr'): Promise<TranslationResult> {
    if (!DEEPL_API_KEY) {
        console.warn('DEEPL_API_KEY not set, returning original text');
        return { tr: text, en: text };
    }

    try {
        // Determine API URL based on key type (Free vs Pro)
        const isFreeApi = DEEPL_API_KEY.endsWith(':fx');
        const apiUrl = isFreeApi
            ? 'https://api-free.deepl.com/v2/translate'
            : 'https://api.deepl.com/v2/translate';

        const targetLanguage = sourceLanguage === 'tr' ? 'EN-US' : 'TR';

        const params = new URLSearchParams();
        params.append('auth_key', DEEPL_API_KEY);
        params.append('text', text);
        params.append('target_lang', targetLanguage);
        if (sourceLanguage) {
            params.append('source_lang', sourceLanguage.toUpperCase());
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DeepL API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        let translatedText = data.translations[0]?.text || text;

        // Sanitize Turkish characters that shouldn't appear in English
        if (sourceLanguage === 'tr') {
            translatedText = translatedText
                .replace(/İ/g, 'I')
                .replace(/ı/g, 'i');
        }

        return sourceLanguage === 'tr'
            ? { tr: text, en: translatedText }
            : { tr: translatedText, en: text };
    } catch (error) {
        console.error('Translation error:', error);
        return { tr: text, en: text };
    }
}

// Batch translate multiple fields
export async function translateFields(
    fields: Record<string, string>,
    sourceLanguage: 'tr' | 'en' = 'tr'
): Promise<Record<string, TranslationResult>> {
    const results: Record<string, TranslationResult> = {};

    // DeepL supports batch translation but for simplicity and error handling per field, 
    // we'll keep it iterative or use Promise.all. 
    // To optimize, we could send all texts in one request if they share the same source/target lang.
    // For now, let's use Promise.all for parallel execution.

    const entries = Object.entries(fields);
    const promises = entries.map(async ([key, value]) => {
        if (value && value.trim()) {
            return [key, await translateContent(value, sourceLanguage)];
        } else {
            return [key, { tr: '', en: '' }];
        }
    });

    const resolved = await Promise.all(promises);

    for (const [key, result] of resolved) {
        results[key as string] = result as TranslationResult;
    }

    return results;
}

// Helper to add translations to a document
export function createBilingualDocument<T extends Record<string, unknown>>(
    doc: T,
    translations: Record<string, TranslationResult>,
    fieldsToTranslate: string[]
): T & { translations?: Record<string, { en: string }> } {
    const translationsObj: Record<string, { en: string }> = {};

    for (const field of fieldsToTranslate) {
        if (translations[field]) {
            translationsObj[field] = { en: translations[field].en };
        }
    }

    return {
        ...doc,
        translations: translationsObj,
    };
}

// Translate Turkish date to English (no API needed)
export function translateDate(turkishDate: string): string {
    const turkishMonths: { [key: string]: string } = {
        'ocak': 'January',
        'şubat': 'February',
        'mart': 'March',
        'nisan': 'April',
        'mayıs': 'May',
        'haziran': 'June',
        'temmuz': 'July',
        'ağustos': 'August',
        'eylül': 'September',
        'ekim': 'October',
        'kasım': 'November',
        'aralık': 'December'
    };

    let result = turkishDate;
    for (const [tr, en] of Object.entries(turkishMonths)) {
        // Case insensitive replace
        const regex = new RegExp(tr, 'gi');
        result = result.replace(regex, en);
    }
    return result;
}

// Content block interface
interface ContentBlock {
    id: string;
    type: 'text' | 'image' | 'image-grid' | 'link-button';
    content?: string;
    contentEn?: string;
    image?: string;
    images?: string[];
    url?: string;
    buttonText?: string;
    buttonTextEn?: string;
}

// Translate content blocks (text content and button text)
export async function translateContentBlocks(
    blocks: ContentBlock[],
    sourceLanguage: 'tr' | 'en' = 'tr'
): Promise<ContentBlock[]> {
    console.log('[translateContentBlocks] Called with', blocks?.length || 0, 'blocks');

    if (!blocks || blocks.length === 0) {
        console.log('[translateContentBlocks] No blocks to translate');
        return blocks;
    }

    if (!DEEPL_API_KEY) {
        console.warn('[translateContentBlocks] DEEPL_API_KEY not set, returning original blocks');
        return blocks;
    }

    try {
        const translatedBlocks = await Promise.all(
            blocks.map(async (block) => {
                const translatedBlock = { ...block };
                console.log('[translateContentBlocks] Processing block:', block.type, 'content:', block.content?.substring(0, 50));

                // Translate text content if present
                if (block.type === 'text' && block.content && block.content.trim()) {
                    console.log('[translateContentBlocks] Translating text block content...');
                    const contentResult = await translateContent(block.content, sourceLanguage);
                    translatedBlock.contentEn = contentResult.en;
                    console.log('[translateContentBlocks] Text translated, contentEn set to:', contentResult.en?.substring(0, 50));
                }

                // Translate button text if present (for link-button type)
                if (block.type === 'link-button' && block.buttonText && block.buttonText.trim()) {
                    console.log('[translateContentBlocks] Translating link-button text...');
                    const buttonResult = await translateContent(block.buttonText, sourceLanguage);
                    translatedBlock.buttonTextEn = buttonResult.en;
                    console.log('[translateContentBlocks] Button text translated, buttonTextEn set to:', buttonResult.en);
                }

                return translatedBlock;
            })
        );

        console.log('[translateContentBlocks] Translation complete, returning', translatedBlocks.length, 'blocks');
        return translatedBlocks;
    } catch (error) {
        console.error('[translateContentBlocks] Translation error:', error);
        return blocks; // Return original on error
    }
}
