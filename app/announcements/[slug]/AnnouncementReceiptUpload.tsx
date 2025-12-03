'use client';

import { useState } from 'react';

interface Event {
  _id: string;
  price?: number;
  iban?: string;
}

interface Props {
  event: Event;
}

export default function AnnouncementReceiptUpload({ event }: Props) {
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
    <div className="mt-8 p-6 bg-neo-purple border-4 border-black shadow-neo">
      <h3 className="text-2xl font-black text-white uppercase mb-4 border-b-4 border-black pb-2">
        Ödeme Bilgileri
      </h3>

      {/* Ödeme Detayları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border-2 border-black p-4 shadow-neo-sm">
          <span className="text-black font-bold block text-sm uppercase mb-1">Etkinlik Ücreti:</span>
          <span className="text-black font-black text-3xl">{event.price} TL</span>
        </div>
        <div className="bg-white border-2 border-black p-4 shadow-neo-sm">
          <span className="text-black font-bold block text-sm uppercase mb-1">IBAN:</span>
          <span className="text-black font-mono font-bold text-sm break-all select-all">
            {event.iban}
          </span>
        </div>
      </div>

      <div className="bg-white border-2 border-black p-4 mb-4">
        <p className="text-sm text-black font-bold">
          ℹ️ Yukarıdaki IBAN'a ödemenizi yaptıktan sonra dekontunuzu PDF olarak yükleyiniz.
          Ödemeniz admin tarafından onaylandıktan sonra etkinliğe katılabileceksiniz.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-lg font-black text-white uppercase">
          Ödeme Dekontu (PDF)
        </label>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-black font-bold file:mr-4 file:py-3 file:px-4 file:border-2 file:border-black file:text-sm file:font-black file:bg-white file:text-black hover:file:bg-black hover:file:text-white transition-all cursor-pointer bg-white border-2 border-black p-1"
        />

        {uploading && (
          <div className="text-black font-bold bg-neo-yellow inline-block px-4 py-2 border-2 border-black shadow-neo-sm">
            Yükleniyor...
          </div>
        )}

        {uploadedPath && (
          <div className="bg-neo-green p-4 border-2 border-black shadow-neo-sm">
            <p className="font-black text-black mb-2 text-lg">✅ Dekont Başarıyla Yüklendi!</p>
            <p className="text-sm font-bold text-black mb-2">
              Ödemeniz admin tarafından incelenecektir. Onay durumunu kayıt sayfasından takip edebilirsiniz.
            </p>
            <p className="text-xs mt-2 text-gray-800 border-t border-black pt-2">
              Dosya sunucuda güvenle saklanmaktadır: <span className="font-mono text-xs break-all">{uploadedPath}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
