/**
 * SWR Fetcher - Merkezi fetch fonksiyonu
 */

export class ApiError extends Error {
    status: number;
    info: unknown;

    constructor(message: string, status: number, info?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.info = info;
    }
}

/**
 * SWR için standart fetcher
 */
export async function fetcher<T>(url: string): Promise<T> {
    const res = await fetch(url);

    if (!res.ok) {
        const info = await res.json().catch(() => ({}));
        throw new ApiError(
            info.error || 'Bir hata oluştu',
            res.status,
            info
        );
    }

    return res.json();
}

/**
 * POST/PUT/DELETE için mutator
 */
export async function mutator<T>(
    url: string,
    options: {
        method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        body?: unknown;
    }
): Promise<T> {
    const res = await fetch(url, {
        method: options.method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
        const info = await res.json().catch(() => ({}));
        throw new ApiError(
            info.error || 'İşlem başarısız',
            res.status,
            info
        );
    }

    // DELETE için boş response olabilir
    if (res.status === 204) {
        return {} as T;
    }

    return res.json();
}
