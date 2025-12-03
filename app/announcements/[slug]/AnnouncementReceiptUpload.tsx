'use client';

import { useState } from 'react';

export default function AnnouncementReceiptUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    if (file.type !== 'application/pdf') {
      alert('Lütfen sadece PDF dosyası yükleyiniz.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Yükleme başarısız');

      const data = await res.json();
      setUploadedPath(data.path);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      alert('Dosya yüklenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white border-4 border-black shadow-neo">
      <h3 className="text-xl font-black text-black uppercase mb-4">Dekont Yükle</h3>
      <p className="text-sm text-gray-700 font-bold mb-4">
        Lütfen ödeme dekontunuzu PDF formatında yükleyiniz.
      </p>
      
      <div className="space-y-4">
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-black font-bold file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-black file:bg-white file:text-black hover:file:bg-black hover:file:text-white transition-all cursor-pointer bg-white border-2 border-black p-1"
        />
        
        {uploading && (
          <div className="text-black font-bold bg-neo-yellow inline-block px-2 py-1 border-2 border-black">
            Yükleniyor...
          </div>
        )}

        {uploadedPath && (
          <div className="bg-neo-green p-4 border-2 border-black shadow-neo-sm">
            <p className="font-black text-black mb-2">✅ Dekont Başarıyla Yüklendi!</p>
            <p className="text-sm font-bold break-all">Dosya Yolu: {uploadedPath}</p>
            <p className="text-xs mt-2 text-gray-800">Bu dosya sunucuda güvenle saklanmaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
}
