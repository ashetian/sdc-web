'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ReceiptViewerModalProps {
    imageUrl: string;
    onClose: () => void;
}

export default function ReceiptViewerModal({ imageUrl, onClose }: ReceiptViewerModalProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Ödeme Dekontu</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-end p-4 border-b border-gray-200 bg-gray-50">
                    <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                    >
                        Yeni Sekmede Aç
                    </a>
                </div>

                {/* Image Viewer */}
                <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center min-h-[400px]">
                    <div className="relative w-full h-full min-h-[500px]">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                            </div>
                        )}
                        <img
                            src={imageUrl}
                            alt="Ödeme Dekontu"
                            className="max-w-full max-h-[70vh] object-contain mx-auto"
                            onLoad={() => setIsLoading(false)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
