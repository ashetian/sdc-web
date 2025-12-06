'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/_context/LanguageContext';
import { Bold, Italic, Link as LinkIcon, Image as ImageIcon, Send, Eye, X, Check } from 'lucide-react';
import Image from 'next/image';
import { wrapEmailHtml } from '@/app/lib/email-template';

// Types from Article Editor (simplified)
// Types from Article Editor (simplified)
type ContentBlock =
    | { type: 'text'; content: string; styles: ('bold' | 'italic')[] }
    | { type: 'image'; src: string; caption?: string }
    | { type: 'header'; content: string }
    | { type: 'list'; items: string[] }
    | { type: 'banner'; content: string; style: string }; // style = bg color hex

interface MemberSummary {
    _id: string;
    fullName: string;
    email: string;
    studentNo: string;
}

export default function AdminEmailPage() {
    const { language } = useLanguage();
    const [subject, setSubject] = useState('');
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [target, setTarget] = useState('all'); // all, email_consent_only, specific
    const [showPreview, setShowPreview] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');

    const [allMembers, setAllMembers] = useState<MemberSummary[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (target === 'specific' && allMembers.length === 0) {
            fetchMembers();
        }
    }, [target]);

    const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
            const res = await fetch('/api/admin/members/list');
            if (res.ok) {
                const data = await res.json();
                setAllMembers(data.members);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMembers(false);
        }
    };

    const [uploadingBlockId, setUploadingBlockId] = useState<number | null>(null);

    const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingBlockId(index);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                updateBlock(index, { src: data.path });
            } else {
                alert('Yükleme hatası: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Bir hata oluştu.');
        } finally {
            setUploadingBlockId(null);
        }
    };

    const PALETTE = [
        { name: 'Siyah', hex: '#000000' },
        { name: 'Beyaz', hex: '#ffffff' },
        { name: 'Yeşil', hex: '#22c55e' }, // neo-green approx
        { name: 'Sarı', hex: '#fbbf24' }, // neo-yellow approx
        { name: 'Mavi', hex: '#3b82f6' }, // neo-blue approx
        { name: 'Pembe', hex: '#ec4899' }, // neo-pink approx
        { name: 'Turuncu', hex: '#f97316' }, // neo-orange
        { name: 'Mor', hex: '#a855f7' }, // neo-purple
    ];

    const addBlock = (type: ContentBlock['type']) => {
        if (type === 'text') setBlocks([...blocks, { type: 'text', content: '', styles: [] }]);
        if (type === 'image') setBlocks([...blocks, { type: 'image', src: '' }]);
        if (type === 'header') setBlocks([...blocks, { type: 'header', content: '' }]);
        if (type === 'list') setBlocks([...blocks, { type: 'list', items: [''] }]);
        if (type === 'banner') setBlocks([...blocks, { type: 'banner', content: 'Duyuru Başlığı', style: '#000000' }]);
    };

    const updateBlock = (index: number, content: any) => {
        const newBlocks = [...blocks];
        newBlocks[index] = { ...newBlocks[index], ...content };
        setBlocks(newBlocks);
    };

    const removeBlock = (index: number) => {
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    const toggleMemberSelection = (id: string) => {
        if (selectedMembers.includes(id)) {
            setSelectedMembers(selectedMembers.filter(mId => mId !== id));
        } else {
            setSelectedMembers([...selectedMembers, id]);
        }
    };

    const selectAllFiltered = () => {
        const filteredIds = filteredMembers.map(m => m._id);
        const newSelection = Array.from(new Set([...selectedMembers, ...filteredIds]));
        setSelectedMembers(newSelection);
    };

    const deselectAllFiltered = () => {
        const filteredIds = filteredMembers.map(m => m._id);
        setSelectedMembers(selectedMembers.filter(id => !filteredIds.includes(id)));
    };

    const generateContentHtml = () => {
        let html = '';
        blocks.forEach(block => {
            if (block.type === 'header') {
                html += `<h2 style="color: #000; font-size: 24px; font-weight: bold; margin-bottom: 10px;">${block.content}</h2>`;
            } else if (block.type === 'text') {
                let text = block.content.replace(/\n/g, '<br>');
                if (block.styles.includes('bold')) text = `<strong>${text}</strong>`;
                if (block.styles.includes('italic')) text = `<em>${text}</em>`;
                html += `<p style="margin-bottom: 15px;">${text}</p>`;
            } else if (block.type === 'image') {
                html += `<div style="text-align: center; margin: 20px 0;"><img src="${block.src}" style="max-width: 100%; border-radius: 8px;" />${block.caption ? `<p style="font-size: 12px; color: #666; margin-top: 5px;">${block.caption}</p>` : ''}</div>`;
            } else if (block.type === 'list') {
                html += `<ul style="margin-bottom: 15px;">${block.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
            } else if (block.type === 'banner') {
                const textColor = block.style === '#ffffff' ? '#000000' : '#ffffff';
                html += `<div style="background: ${block.style}; color: ${textColor}; padding: 10px 20px; text-align: center; font-weight: bold; font-size: 20px; border-bottom: 2px solid #000; margin-bottom: 20px;">${block.content}</div>`;
            }
        });
        return html;
    };

    const handleSend = async () => {
        if (target === 'specific' && selectedMembers.length === 0) {
            alert('Lütfen en az bir üye seçin.');
            return;
        }

        const confirmMsg = target === 'specific'
            ? `${selectedMembers.length} kişiye e-posta göndermek istediğinize emin misiniz?`
            : 'Bu e-postayı seçili gruba göndermek istediğinize emin misiniz?';

        if (!confirm(confirmMsg)) return;

        setSending(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    html: generateContentHtml(), // Only content, backend wraps it? No wait, backend wraps it. But preview needs wrapping.
                    target,
                    recipientIds: target === 'specific' ? selectedMembers : undefined,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(`Başarılı: ${data.count} kişiye gönderildi.`);

                setSubject('');
                setBlocks([]);
                setSelectedMembers([]);
                setTarget('all');
            } else {
                alert('Hata: ' + data.error);
            }
        } catch (error) {
            alert('Bir hata oluştu.');
        } finally {
            setSending(false);
        }
    };

    const filteredMembers = allMembers.filter(m =>
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.studentNo.includes(searchTerm) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8 pt-32">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-black mb-8">E-posta Yönetimi</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Editor */}
                    <div className="space-y-6">
                        <div className="bg-white border-4 border-black shadow-neo p-6">
                            <div className="mb-4">
                                <label className="block font-bold mb-2">Konu Başlığı</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full p-2 border-2 border-black mb-2"
                                    placeholder="E-posta konusu (Metadata)..."
                                />
                                <p className="text-xs text-gray-500">Not: Bu konu başlığı e-posta istemcisinde (Gmail vb.) görünecek olan konudur.</p>
                            </div>

                            <div className="mb-4">
                                <label className="block font-bold mb-2">Hedef Kitle</label>
                                <select
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    className="w-full p-2 border-2 border-black mb-4"
                                >
                                    <option value="all">Tüm Üyeler</option>
                                    <option value="email_consent_only">Sadece İzin Verenler</option>
                                    <option value="specific">Belirli Üyeler</option>
                                </select>

                                {/* Specific Member Selection UI */}
                                {target === 'specific' && (
                                    <div className="border-2 border-black p-4 bg-gray-50 max-h-96 overflow-y-auto">
                                        <div className="mb-2 flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Ara..."
                                                className="flex-1 p-1 border border-black text-sm"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                            <button onClick={selectAllFiltered} className="text-xs underline font-bold">Tümünü Seç</button>
                                            <button onClick={deselectAllFiltered} className="text-xs underline text-red-600 font-bold">Hiçbiri</button>
                                        </div>
                                        {loadingMembers ? (
                                            <p className="text-sm text-gray-500">Yükleniyor...</p>
                                        ) : (
                                            <div className="space-y-1">
                                                {filteredMembers.map(member => (
                                                    <label key={member._id} className="flex items-center gap-2 p-2 hover:bg-white cursor-pointer border border-transparent hover:border-gray-200">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMembers.includes(member._id)}
                                                            onChange={() => toggleMemberSelection(member._id)}
                                                            className="w-4 h-4"
                                                        />
                                                        <div className="text-sm">
                                                            <div className="font-bold">{member.fullName}</div>
                                                            <div className="text-xs text-gray-500">{member.studentNo} - {member.email}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                                {filteredMembers.length === 0 && <p className="text-sm text-gray-500 text-center py-2">Üye bulunamadı.</p>}
                                            </div>
                                        )}
                                        <p className="text-xs text-right mt-2 font-bold text-blue-600">
                                            {selectedMembers.length} kişi seçildi
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mb-6">
                                {blocks.map((block, index) => (
                                    <div key={index} className="border-2 border-gray-200 p-4 relative group hover:border-black transition-colors">
                                        <button
                                            onClick={() => removeBlock(index)}
                                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 font-bold"
                                        >
                                            SİL
                                        </button>

                                        {block.type === 'header' && (
                                            <input
                                                type="text"
                                                value={block.content}
                                                onChange={(e) => updateBlock(index, { content: e.target.value })}
                                                className="w-full text-xl font-bold border-none focus:ring-0 p-0"
                                                placeholder="İçerik Başlığı..."
                                            />
                                        )}

                                        {block.type === 'banner' && (
                                            <div>
                                                <input
                                                    type="text"
                                                    value={block.content}
                                                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                                                    className="w-full text-xl font-bold border-none focus:ring-0 p-0 text-center mb-2"
                                                    style={{ backgroundColor: block.style, color: block.style === '#ffffff' ? '#000000' : '#ffffff', padding: '10px' }}
                                                    placeholder="Banner Başlığı..."
                                                />
                                                <div className="flex gap-2 items-center justify-center">
                                                    {PALETTE.map(color => (
                                                        <button
                                                            key={color.hex}
                                                            onClick={() => updateBlock(index, { style: color.hex })}
                                                            className={`w-6 h-6 rounded-full border-2 ${block.style === color.hex ? 'border-blue-500 scale-125 ring-2 ring-blue-300' : 'border-gray-300 hover:scale-110'} transition-all`}
                                                            style={{ backgroundColor: color.hex }}
                                                            title={color.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'text' && (
                                            <textarea
                                                value={block.content}
                                                onChange={(e) => updateBlock(index, { content: e.target.value })}
                                                className="w-full border-none focus:ring-0 p-0 resize-none"
                                                placeholder="Metin içeriği..."
                                                rows={3}
                                            />
                                        )}

                                        {block.type === 'image' && (
                                            <div>
                                                <div className="mb-2">
                                                    <label className="block text-xs font-bold mb-1">Görsel Yükle:</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(index, e)}
                                                            className="text-sm w-full"
                                                            disabled={uploadingBlockId === index}
                                                        />
                                                        {uploadingBlockId === index && <span className="text-xs font-bold text-blue-500 animate-pulse">Yükleniyor...</span>}
                                                    </div>
                                                </div>
                                                <div className="mb-2 text-xs font-bold text-center text-gray-400">- VEYA -</div>
                                                <input
                                                    type="text"
                                                    value={block.src}
                                                    onChange={(e) => updateBlock(index, { src: e.target.value })}
                                                    className="w-full border-b border-gray-300 mb-2"
                                                    placeholder="Görsel URL (Manuel)..."
                                                />
                                                {block.src && (
                                                    <div className="relative h-40 w-full">
                                                        <Image src={block.src} alt="Preview" fill className="object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 mb-8">
                                <button onClick={() => addBlock('banner')} className="px-3 py-1 border-2 border-black hover:bg-gray-100 font-bold text-sm bg-blue-50 hover:bg-blue-100">+ Renkli Başlık (Banner)</button>
                                <button onClick={() => addBlock('header')} className="px-3 py-1 border-2 border-black hover:bg-gray-100 font-bold text-sm">+ Alt Başlık</button>
                                <button onClick={() => addBlock('text')} className="px-3 py-1 border-2 border-black hover:bg-gray-100 font-bold text-sm">+ Metin</button>
                                <button onClick={() => addBlock('image')} className="px-3 py-1 border-2 border-black hover:bg-gray-100 font-bold text-sm">+ Görsel</button>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-bold border-2 border-black hover:bg-gray-100"
                                >
                                    <Eye size={20} /> Önizleme
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={sending || !subject}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 text-black font-black border-2 border-black hover:bg-yellow-500 disabled:opacity-50"
                                >
                                    <Send size={20} /> {sending ? 'Gönderiliyor...' : 'Gönder'}
                                </button>
                            </div>
                            {message && <p className="mt-4 font-bold text-green-600 border-2 border-green-600 bg-green-50 p-2 text-center">{message}</p>}
                        </div>
                    </div>

                    {/* Preview */}
                    {showPreview && (
                        <div className="sticky top-32 h-fit">
                            <div className="bg-white border-4 border-black shadow-neo p-8 overflow-hidden">
                                <div className="border-b-2 border-gray-200 pb-4 mb-4">
                                    <h3 className="font-black text-xl mb-2">Önizleme</h3>
                                    <p className="text-sm text-gray-500">Bu e-posta gönderildiğinde aşağıdaki gibi görünecektir:</p>
                                </div>
                                <div className="border border-gray-300 p-2 bg-gray-100 rounded">
                                    <div className="bg-white shadow-sm">
                                        {/* Render the full HTML template */}
                                        <iframe
                                            srcDoc={wrapEmailHtml(generateContentHtml(), subject)}
                                            className="w-full h-[600px] border-0"
                                            title="Email Preview"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
