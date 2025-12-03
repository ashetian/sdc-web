'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker using unpkg for better availability
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerModalProps {
    pdfUrl: string;
    onClose: () => void;
}

export default function PDFViewerModal({ pdfUrl, onClose }: PDFViewerModalProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [error, setError] = useState<string | null>(null);
    const [useGoogleDocs, setUseGoogleDocs] = useState(false);

    // Reset state when url changes
    useEffect(() => {
        setNumPages(0);
        setPageNumber(1);
        setScale(1.0);
        setError(null);
        setUseGoogleDocs(false);
    }, [pdfUrl]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setError(null);
    }

    function onDocumentLoadError(error: Error) {
        console.error('PDF yükleme hatası:', error);
        setError('PDF görüntülenemedi.');
        // Automatically switch to Google Docs viewer on error
        setUseGoogleDocs(true);
    }

    const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));
    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col h-[80vh]"
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

                {/* Controls (only show if not using Google Docs fallback) */}
                {!useGoogleDocs && !error && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPrevPage}
                                disabled={pageNumber <= 1}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                ← Önceki
                            </button>
                            <span className="text-sm text-gray-700">
                                Sayfa {pageNumber} / {numPages || '?'}
                            </span>
                            <button
                                onClick={goToNextPage}
                                disabled={pageNumber >= numPages}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                Sonraki →
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={zoomOut}
                                disabled={scale <= 0.5}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                −
                            </button>
                            <span className="text-sm text-gray-700 w-12 text-center">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={zoomIn}
                                disabled={scale >= 2.0}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                +
                            </button>
                        </div>

                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                        >
                            Yeni Sekmede Aç
                        </a>
                    </div>
                )}

                {/* Viewer Content */}
                <div className="flex-1 overflow-hidden bg-gray-100 relative">
                    {useGoogleDocs ? (
                        <iframe
                            src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
                            className="w-full h-full border-0"
                            title="PDF Viewer"
                        />
                    ) : (
                        <div className="h-full overflow-auto flex justify-center p-4">
                            <Document
                                file={pdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                loading={
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">PDF yükleniyor...</p>
                                    </div>
                                }
                                error={
                                    <div className="text-center py-8">
                                        <p className="text-red-600 mb-4">PDF yüklenemedi.</p>
                                        <button
                                            onClick={() => setUseGoogleDocs(true)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Alternatif Görüntüleyiciyi Dene
                                        </button>
                                    </div>
                                }
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={false}
                                    loading={<div className="text-center py-4 text-gray-600">Sayfa yükleniyor...</div>}
                                />
                            </Document>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                        ⚠ Güvenlik nedeniyle PDF sandbox modunda görüntüleniyor.
                    </p>
                    {useGoogleDocs && (
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Orijinal Dosyayı İndir
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
