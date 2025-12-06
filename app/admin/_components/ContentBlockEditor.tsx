"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ArrowUp, ArrowDown } from "lucide-react";

export interface ContentBlock {
    id: string;
    type: "text" | "image" | "image-grid";
    content?: string;
    image?: string;
    images?: string[];
}

interface ContentBlockEditorProps {
    blocks: ContentBlock[];
    onChange: (blocks: ContentBlock[]) => void;
}

export default function ContentBlockEditor({ blocks, onChange }: ContentBlockEditorProps) {
    const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

    const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const addTextBlock = () => {
        const newBlock: ContentBlock = {
            id: generateId(),
            type: "text",
            content: "",
        };
        onChange([...blocks, newBlock]);
    };

    const addImageBlock = () => {
        const newBlock: ContentBlock = {
            id: generateId(),
            type: "image",
            image: "",
        };
        onChange([...blocks, newBlock]);
    };

    const addImageGridBlock = () => {
        const newBlock: ContentBlock = {
            id: generateId(),
            type: "image-grid",
            images: [],
        };
        onChange([...blocks, newBlock]);
    };

    const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
        onChange(blocks.map(block =>
            block.id === id ? { ...block, ...updates } : block
        ));
    };

    const deleteBlock = (id: string) => {
        onChange(blocks.filter(block => block.id !== id));
    };

    const moveBlock = (id: string, direction: "up" | "down") => {
        const index = blocks.findIndex(block => block.id === id);
        if (index === -1) return;

        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= blocks.length) return;

        const newBlocks = [...blocks];
        [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
        onChange(newBlocks);
    };

    const handleImageUpload = async (blockId: string, file: File, gridIndex?: number) => {
        const formData = new FormData();
        formData.append("file", file);

        setUploadingBlockId(blockId);
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Yükleme başarısız");

            const data = await res.json();
            const block = blocks.find(b => b.id === blockId);

            if (block?.type === "image") {
                updateBlock(blockId, { image: data.path });
            } else if (block?.type === "image-grid" && gridIndex !== undefined) {
                const newImages = [...(block.images || [])];
                newImages[gridIndex] = data.path;
                updateBlock(blockId, { images: newImages });
            }
        } catch (error) {
            console.error("Görsel yükleme hatası:", error);
            alert("Görsel yüklenirken bir hata oluştu.");
        } finally {
            setUploadingBlockId(null);
        }
    };

    const addImageToGrid = (blockId: string) => {
        const block = blocks.find(b => b.id === blockId);
        if (block?.type === "image-grid") {
            const currentImages = block.images || [];
            if (currentImages.length < 4) {
                updateBlock(blockId, { images: [...currentImages, ""] });
            }
        }
    };

    const removeImageFromGrid = (blockId: string, index: number) => {
        const block = blocks.find(b => b.id === blockId);
        if (block?.type === "image-grid") {
            const newImages = [...(block.images || [])];
            newImages.splice(index, 1);
            updateBlock(blockId, { images: newImages });
        }
    };

    const renderTextBlock = (block: ContentBlock, index: number) => (
        <div key={block.id} className="border-2 border-black p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black text-gray-600 uppercase">Metin Bloğu #{index + 1}</span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => moveBlock(block.id, "up")}
                        disabled={index === 0}
                        className="p-1 border-2 border-black bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Yukarı Taşı"
                    >
                        <ArrowUp size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => moveBlock(block.id, "down")}
                        disabled={index === blocks.length - 1}
                        className="p-1 border-2 border-black bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Aşağı Taşı"
                    >
                        <ArrowDown size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => deleteBlock(block.id)}
                        className="p-1 border-2 border-black bg-red-500 text-white hover:bg-red-600"
                        title="Sil"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
            <textarea
                value={block.content || ""}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                rows={5}
                className="w-full border-2 border-black p-3 text-gray-900 bg-white focus:ring-2 focus:ring-neo-blue resize-y"
                placeholder="Metin içeriğinizi buraya yazın..."
            />
        </div>
    );

    const renderImageBlock = (block: ContentBlock, index: number) => (
        <div key={block.id} className="border-2 border-black p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black text-gray-600 uppercase">Görsel Bloğu #{index + 1}</span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => moveBlock(block.id, "up")}
                        disabled={index === 0}
                        className="p-1 border-2 border-black bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Yukarı Taşı"
                    >
                        <ArrowUp size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => moveBlock(block.id, "down")}
                        disabled={index === blocks.length - 1}
                        className="p-1 border-2 border-black bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Aşağı Taşı"
                    >
                        <ArrowDown size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => deleteBlock(block.id)}
                        className="p-1 border-2 border-black bg-red-500 text-white hover:bg-red-600"
                        title="Sil"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {block.image ? (
                <div className="relative">
                    <Image
                        src={block.image}
                        alt="Yüklenen görsel"
                        width={400}
                        height={300}
                        className="w-full max-w-md h-auto object-cover border-2 border-black"
                        unoptimized
                    />
                    <button
                        type="button"
                        onClick={() => updateBlock(block.id, { image: "" })}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 font-bold"
                    >
                        Görseli Kaldır
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                handleImageUpload(block.id, e.target.files[0]);
                            }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-bold file:bg-neo-yellow file:text-black hover:file:bg-yellow-300"
                    />
                    {uploadingBlockId === block.id && (
                        <span className="text-sm text-blue-500 font-bold">Yükleniyor...</span>
                    )}
                </div>
            )}
        </div>
    );

    const renderImageGridBlock = (block: ContentBlock, index: number) => (
        <div key={block.id} className="border-2 border-black p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black text-gray-600 uppercase">Yan Yana Görseller #{index + 1}</span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => moveBlock(block.id, "up")}
                        disabled={index === 0}
                        className="p-1 border-2 border-black bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Yukarı Taşı"
                    >
                        <ArrowUp size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => moveBlock(block.id, "down")}
                        disabled={index === blocks.length - 1}
                        className="p-1 border-2 border-black bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Aşağı Taşı"
                    >
                        <ArrowDown size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => deleteBlock(block.id)}
                        className="p-1 border-2 border-black bg-red-500 text-white hover:bg-red-600"
                        title="Sil"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                {(block.images || []).map((img, imgIndex) => (
                    <div key={imgIndex} className="relative">
                        {img ? (
                            <div>
                                <Image
                                    src={img}
                                    alt={`Görsel ${imgIndex + 1}`}
                                    width={200}
                                    height={150}
                                    className="w-full h-32 object-cover border-2 border-black"
                                    unoptimized
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImageFromGrid(block.id, imgIndex)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white border-2 border-black text-xs font-bold"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <div className="h-32 border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-50">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleImageUpload(block.id, e.target.files[0], imgIndex);
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <span className="text-gray-400 text-sm font-bold">+ Görsel Ekle</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {(block.images?.length || 0) < 4 && (
                <button
                    type="button"
                    onClick={() => addImageToGrid(block.id)}
                    className="text-sm font-bold text-neo-purple hover:underline"
                >
                    + Görsel Alanı Ekle (Maks 4)
                </button>
            )}
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Block List */}
            <div className="space-y-4">
                {blocks.map((block, index) => {
                    switch (block.type) {
                        case "text":
                            return renderTextBlock(block, index);
                        case "image":
                            return renderImageBlock(block, index);
                        case "image-grid":
                            return renderImageGridBlock(block, index);
                        default:
                            return null;
                    }
                })}
            </div>

            {/* Add Block Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-gray-200">
                <button
                    type="button"
                    onClick={addTextBlock}
                    className="px-4 py-2 border-2 border-black bg-neo-blue text-black font-bold hover:bg-blue-300 transition-all"
                >
                    + Metin Ekle
                </button>
                <button
                    type="button"
                    onClick={addImageBlock}
                    className="px-4 py-2 border-2 border-black bg-neo-green text-black font-bold hover:bg-green-300 transition-all"
                >
                    + Görsel Ekle
                </button>
                <button
                    type="button"
                    onClick={addImageGridBlock}
                    className="px-4 py-2 border-2 border-black bg-neo-purple text-white font-bold hover:bg-purple-400 transition-all"
                >
                    + Yan Yana Görsel
                </button>
            </div>

            {blocks.length === 0 && (
                <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium">
                        Henüz içerik bloğu eklenmedi. Yukarıdaki butonları kullanarak metin veya görsel ekleyebilirsiniz.
                    </p>
                </div>
            )}
        </div>
    );
}
