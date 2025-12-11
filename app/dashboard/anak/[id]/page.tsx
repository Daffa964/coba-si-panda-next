'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Gunakan useParams
import Link from 'next/link'; 
import { Anak, Pengukuran } from '@/types';
import { formatDateToIndonesian, calculateAgeInMonths } from '@/utils';

// Helper untuk menentukan warna badge berdasarkan status gizi
const getStatusColor = (status: string) => {
  // Normal / Gizi Baik -> Hijau
  if (status.includes('Normal') || status.includes('Baik')) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  // Kondisi Bahaya (Sangat Pendek, Gizi Buruk, Sangat Kurang) -> Merah
  if (status.includes('Sangat') || status.includes('Buruk')) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  // Kondisi Peringatan (Pendek, Kurang, Wasted) -> Kuning
  if (status.includes('Pendek') || status.includes('Kurang') || status.includes('Wasted')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  // Kondisi Lebih/Tinggi/Risiko -> Biru
  if (status.includes('Lebih') || status.includes('Tinggi') || status.includes('Risiko') || status.includes('Obese')) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  // Default -> Abu-abu
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function ChildProfilePage() {
  const params = useParams(); 
  const router = useRouter();
  
  const [anak, setAnak] = useState<Anak | null>(null);
  const [pengukuranList, setPengukuranList] = useState<Pengukuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        setLoading(true);
        
        // Cek ID
        if (!params.id) return;

        // 1. Fetch data anak
        const anakResponse = await fetch(`/api/anak/${params.id}`);
        if (!anakResponse.ok) {
          throw new Error('Gagal mengambil data anak');
        }
        const anakData = await anakResponse.json();
        setAnak(anakData.anak);
        
        // 2. Fetch riwayat pengukuran
        const pengukuranResponse = await fetch(`/api/pengukuran?anakId=${params.id}`);
        if (!pengukuranResponse.ok) {
          throw new Error('Gagal mengambil data pengukuran');
        }
        const pengukuranData = await pengukuranResponse.json();
        setPengukuranList(pengukuranData.pengukuranList || []);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
        fetchChildData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !anak) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{error || 'Data anak tidak ditemukan'}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const ageInMonths = calculateAgeInMonths(anak.tanggalLahir);
  const latestPengukuran = pengukuranList.length > 0 ? pengukuranList[0] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigasi */}
        <div className="mb-6 flex items-center justify-between">
            <button 
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700 flex items-center font-medium transition-colors"
            >
                <span className="mr-2">←</span> Kembali ke Dashboard
            </button>
            <div>
                 <Link 
                    href={`/tambah-pengukuran?anakId=${anak.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm transition-colors font-medium flex items-center"
                  >
                    <span className="mr-2 text-lg">+</span> Catat Pengukuran Baru
                  </Link>
            </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          {/* Header Profil */}
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{anak.namaAnak}</h1>
                    <div className="mt-2 flex items-center text-sm text-gray-600 space-x-4">
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            {formatDateToIndonesian(anak.tanggalLahir)}
                        </span>
                        <span className="flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                            {ageInMonths} Bulan
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-block bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">QR Token</p>
                        <code className="font-mono text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {anak.qrToken?.substring(0, 8)}...
                        </code>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Grid Informasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Kartu Data Diri */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                    Informasi Anak
                </h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Jenis Kelamin</dt>
                    <dd className="font-medium text-gray-900 flex items-center">
                        {anak.jenisKelamin === 'LAKI-LAKI' ? '👦 Laki-laki' : '👧 Perempuan'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Nama Wali</dt>
                    <dd className="font-medium text-gray-900">{anak.namaWali}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Telepon Wali</dt>
                    <dd className="font-medium text-gray-900">{anak.teleponWali || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Posyandu</dt>
                    {/* Placeholder RW karena belum ada data relasi posyandu lengkap di frontend */}
                    <dd className="font-medium text-gray-900">ID {anak.posyanduId}</dd>
                  </div>
                </dl>
              </div>

              {/* Kartu Pengukuran Terakhir */}
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">
                    Pengukuran Terakhir
                </h3>
                {latestPengukuran ? (
                    <>
                        <div className="grid grid-cols-2 gap-6 mb-4">
                            <div className="bg-white p-3 rounded-lg border border-blue-100 text-center">
                                <span className="text-xs text-blue-500 block mb-1">Berat Badan</span>
                                <span className="text-2xl font-bold text-gray-900">{latestPengukuran.beratBadanKg}</span>
                                <span className="text-sm text-gray-500 ml-1">kg</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-blue-100 text-center">
                                <span className="text-xs text-blue-500 block mb-1">Tinggi Badan</span>
                                <span className="text-2xl font-bold text-gray-900">{latestPengukuran.tinggiBadanCm}</span>
                                <span className="text-sm text-gray-500 ml-1">cm</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-blue-600 block mb-2 font-medium">Status Gizi Utama:</span>
                            <div className={`text-center py-2 px-3 rounded-lg border font-bold text-sm ${getStatusColor(latestPengukuran.statusGizi)}`}>
                                {latestPengukuran.statusGizi}
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-500 text-right italic">
                            Dicatat pada: {formatDateToIndonesian(latestPengukuran.tanggalPengukuran)}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                        <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        <p>Belum ada data pengukuran.</p>
                    </div>
                )}
              </div>
            </div>
            
            {/* Tabel Riwayat */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Riwayat Pertumbuhan
              </h3>
              <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">BB (kg)</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">TB (cm)</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status Gizi</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Z-Score (TB/U)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pengukuranList.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                Tidak ada riwayat pengukuran.
                            </td>
                        </tr>
                    ) : (
                        pengukuranList.map((pengukuran) => (
                        <tr key={pengukuran.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                            {formatDateToIndonesian(pengukuran.tanggalPengukuran)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {pengukuran.beratBadanKg}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {pengukuran.tinggiBadanCm}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(pengukuran.statusGizi)}`}>
                                {pengukuran.statusGizi}
                            </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell font-mono">
                            {pengukuran.zscoreTbU?.toFixed(2) || '-'}
                            </td>
                        </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}