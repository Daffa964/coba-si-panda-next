'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Anak, Pengukuran } from '@/types';
import { formatDateToIndonesian, calculateAgeInMonths } from '@/utils';

// Helper warna badge status (Sama seperti di dashboard)
const getStatusColor = (status: string) => {
  if (status.includes('Normal') || status.includes('Baik')) return 'bg-green-100 text-green-800 border-green-200';
  if (status.includes('Sangat') || status.includes('Buruk')) return 'bg-red-100 text-red-800 border-red-200';
  if (status.includes('Pendek') || status.includes('Kurang') || status.includes('Wasted')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-blue-100 text-blue-800 border-blue-200';
};

export default function QrReportPage() {
  const params = useParams();
  // Di Next.js 15, params bisa jadi promise atau object, tapi useParams hook menanganinya.
  // Cast ke string aman jika kita yakin strukturnya.
  const qrToken = params?.token as string;
  
  const [anak, setAnak] = useState<Anak | null>(null);
  const [pengukuranList, setPengukuranList] = useState<Pengukuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const fetchChildDataByToken = async () => {
      if (!qrToken) return;

      try {
        setLoading(true);
        // Panggil API Publik
        const response = await fetch(`/api/public/anak/${qrToken}`);
        
        if (!response.ok) {
          throw new Error('Data tidak ditemukan atau Token Kadaluarsa');
        }

        const data = await response.json();
        setAnak(data.anak);
        setPengukuranList(data.pengukuran);
        
        // Generate QR code URL untuk tampilan (menggunakan API eksternal sementara)
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.href}`);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchChildDataByToken();
  }, [qrToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !anak) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500">{error || 'Data tidak ditemukan.'}</p>
        </div>
      </div>
    );
  }

  const ageInMonths = calculateAgeInMonths(anak.tanggalLahir);
  const latestPengukuran = pengukuranList.length > 0 ? pengukuranList[0] : null;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header Biru */}
        <div className="bg-blue-600 px-6 py-8 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold">Laporan Gizi Anak</h1>
            <p className="text-blue-100 text-sm mt-1">Desa Kramat</p>
          </div>
          {/* Hiasan background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,85.8,-8.3C81.5,3.8,70.2,13.7,60.8,22.6C51.4,31.5,43.9,39.4,35.2,46.5C26.5,53.6,16.6,59.9,5.7,62.8C-5.2,65.7,-17.1,65.2,-28.7,60.8C-40.3,56.4,-51.6,48.1,-61.2,37.6C-70.8,27.1,-78.7,14.4,-78.3,1.9C-77.9,-10.6,-69.2,-22.9,-58.9,-32.7C-48.6,-42.5,-36.7,-49.8,-24.5,-58.3C-12.3,-66.8,-0.9,-76.5,13.2,-79.8C27.3,-83.1,44.1,-80,56.3,-72.2L44.7,-76.4Z" transform="translate(100 100)" />
             </svg>
          </div>
        </div>

        {/* Info Anak */}
        <div className="px-6 py-6 -mt-6">
          <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-1">{anak.namaAnak}</h2>
            <div className="flex justify-center items-center gap-2 text-sm text-gray-500 mb-4">
               <span>{formatDateToIndonesian(anak.tanggalLahir)}</span>
               <span>•</span>
               <span className="font-semibold text-blue-600">{ageInMonths} Bulan</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
               <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase">Nama Wali</p>
                  <p className="font-medium text-gray-700">{anak.namaWali}</p>
               </div>
               <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase">Jenis Kelamin</p>
                  <p className="font-medium text-gray-700">{anak.jenisKelamin === 'LAKI-LAKI' ? 'Laki-laki' : 'Perempuan'}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Pengukuran Terakhir */}
        {latestPengukuran && (
          <div className="px-6 pb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Kondisi Terkini</h3>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-3xl font-bold text-gray-800">{latestPengukuran.beratBadanKg}<span className="text-sm text-gray-500 font-normal ml-1">kg</span></p>
                        <p className="text-xs text-blue-500">Berat Badan</p>
                    </div>
                    <div className="h-10 w-px bg-blue-200"></div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-gray-800">{latestPengukuran.tinggiBadanCm}<span className="text-sm text-gray-500 font-normal ml-1">cm</span></p>
                        <p className="text-xs text-blue-500">Tinggi Badan</p>
                    </div>
                </div>
                
                <div className={`text-center py-2 px-4 rounded-lg font-bold text-sm border ${getStatusColor(latestPengukuran.statusGizi)}`}>
                    {latestPengukuran.statusGizi}
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">
                    Diukur tanggal: {formatDateToIndonesian(latestPengukuran.tanggalPengukuran)}
                </p>
            </div>
          </div>
        )}

        {/* Riwayat List */}
        <div className="px-6 pb-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Riwayat 3 Bulan Terakhir</h3>
            <div className="space-y-3">
                {pengukuranList.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <div>
                            <p className="text-sm font-bold text-gray-700">{formatDateToIndonesian(item.tanggalPengukuran)}</p>
                            <p className="text-xs text-gray-400">{item.statusGizi}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800">{item.beratBadanKg} kg</p>
                            <p className="text-xs text-gray-500">{item.tinggiBadanCm} cm</p>
                        </div>
                    </div>
                ))}
                {pengukuranList.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">Belum ada data riwayat.</p>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
            {qrCodeUrl && (
                <div className="mb-4 flex justify-center">
                    <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 opacity-80" />
                </div>
            )}
            <p className="text-xs text-gray-400">
                SI-PANDA © {new Date().getFullYear()} <br/>
                Sistem Pemantau Gizi Anak Desa Kramat
            </p>
        </div>

      </div>
    </div>
  );
}