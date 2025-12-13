/**
 * Merkezi Error Handling
 */

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        code?: string,
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;

        Object.setPrototypeOf(this, AppError.prototype);
    }
}

// Yaygın hatalar için factory fonksiyonlar
export const Errors = {
    notFound: (resource: string = 'Kaynak') =>
        new AppError(`${resource} bulunamadı`, 404, 'NOT_FOUND'),

    unauthorized: (message: string = 'Giriş yapmalısınız') =>
        new AppError(message, 401, 'UNAUTHORIZED'),

    forbidden: (message: string = 'Bu işlem için yetkiniz yok') =>
        new AppError(message, 403, 'FORBIDDEN'),

    badRequest: (message: string = 'Geçersiz istek') =>
        new AppError(message, 400, 'BAD_REQUEST'),

    validation: (message: string = 'Doğrulama hatası') =>
        new AppError(message, 422, 'VALIDATION_ERROR'),

    conflict: (message: string = 'Bu kayıt zaten mevcut') =>
        new AppError(message, 409, 'CONFLICT'),

    internal: (message: string = 'Sunucu hatası') =>
        new AppError(message, 500, 'INTERNAL_ERROR', false),

    rateLimit: (message: string = 'Çok fazla istek gönderdiniz') =>
        new AppError(message, 429, 'RATE_LIMIT'),
};

/**
 * Hata mesajını kullanıcı dostu formata çevirir
 */
export function formatErrorMessage(error: unknown): string {
    if (error instanceof AppError) {
        return error.message;
    }

    if (error instanceof Error) {
        // MongoDB duplicate key hatası
        if (error.message.includes('duplicate key')) {
            return 'Bu kayıt zaten mevcut';
        }

        // Validation hatası
        if (error.message.includes('validation')) {
            return 'Lütfen tüm alanları doğru doldurun';
        }

        return error.message;
    }

    return 'Beklenmeyen bir hata oluştu';
}

/**
 * API route'larında kullanılacak error handler
 */
export function handleApiError(error: unknown): {
    error: string;
    code?: string;
    statusCode: number
} {
    console.error('[API Error]:', error);

    if (error instanceof AppError) {
        return {
            error: error.message,
            code: error.code,
            statusCode: error.statusCode,
        };
    }

    return {
        error: formatErrorMessage(error),
        statusCode: 500,
    };
}

/**
 * Toast mesajları için error formatter
 */
export function getToastMessage(error: unknown): {
    message: string;
    type: 'error' | 'warning'
} {
    const message = formatErrorMessage(error);

    if (error instanceof AppError && error.statusCode < 500) {
        return { message, type: 'warning' };
    }

    return { message, type: 'error' };
}
