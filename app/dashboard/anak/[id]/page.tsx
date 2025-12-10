'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Anak, Pengukuran } from '@/types';
import { formatDateToIndonesian, calculateAgeInMonths } from '@/utils';

interface ChildProfileProps {
  params: {
    id: string;
  };
}

export default function ChildProfilePage({ params }: ChildProfileProps) {
  const router = useRouter();
  const [anak, setAnak] = useState<Anak | null>(null);
  const [pengukuranList, setPengukuranList] = useState<Pengukuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        setLoading(true);
        
        // Fetch child data
        const anakResponse = await fetch(`/api/anak/${params.id}`);
        if (!anakResponse.ok) {
          throw new Error('Gagal mengambil data anak');
        }
        const anakData = await anakResponse.json();
        setAnak(anakData.anak);
        
        // Fetch measurement history
        const pengukuranResponse = await fetch(`/api/pengukuran?anakId=${params.id}`);
        if (!pengukuranResponse.ok) {
          throw new Error('Gagal mengambil data pengukuran');
        }
        const pengukuranData = await pengukuranResponse.json();
        setPengukuranList(pengukuranData.pengukuranList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!anak) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Anak tidak ditemukan</h2>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Profil Anak</h1>
              <button 
                onClick={() => router.push('/dashboard')}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Kembali
              </button>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Data Dasar</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nama Anak</p>
                    <p className="text-lg font-semibold">{anak.namaAnak}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Jenis Kelamin</p>
                    <p className="text-lg">{anak.jenisKelamin}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tanggal Lahir</p>
                    <p className="text-lg">{formatDateToIndonesian(anak.tanggalLahir)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Umur</p>
                    <p className="text-lg">{ageInMonths} bulan</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Data Wali</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nama Wali</p>
                    <p className="text-lg font-semibold">{anak.namaWali}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telepon Wali</p>
                    <p className="text-lg">{anak.teleponWali || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Posyandu</p>
                    <p className="text-lg">-</p> {/* Would get from posyandu data */}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Latest Measurement Section */}
            {latestPengukuran && (
              <div className="bg-blue-50 p-4 rounded-lg mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pengukuran Terakhir</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tanggal</p>
                    <p className="text-lg">{formatDateToIndonesian(latestPengukuran.tanggalPengukuran)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Berat (kg)</p>
                    <p className="text-lg font-semibold">{latestPengukuran.beratBadanKg} kg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tinggi (cm)</p>
                    <p className="text-lg font-semibold">{latestPengukuran.tinggiBadanCm} cm</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status Gizi</p>
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                      latestPengukuran.statusGizi === 'Normal' 
                        ? 'bg-green-100 text-green-800' 
                        : latestPengukuran.statusGizi.includes('Stunting') 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {latestPengukuran.statusGizi}
                    </span>
                  </div>
                </div>
                
                {/* Z-score information */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Z-score BB/U</p>
                    <p className="text-lg">{latestPengukuran.zscoreBbU !== null ? latestPengukuran.zscoreBbU.toFixed(2) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Z-score TB/U</p>
                    <p className="text-lg">{latestPengukuran.zscoreTbU !== null ? latestPengukuran.zscoreTbU.toFixed(2) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Z-score BB/TB</p>
                    <p className="text-lg">{latestPengukuran.zscoreBbTb !== null ? latestPengukuran.zscoreBbTb.toFixed(2) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex space-x-4 mb-8">
              <button 
                onClick={() => router.push(`/tambah-pengukuran?anakId=${anak.id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              >
                Tambah Pengukuran
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md">
                Generate QR Code
              </button>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md">
                WhatsApp Ortu
              </button>
            </div>
            
            {/* Measurement History */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Riwayat Pengukuran</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        BB (kg)
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TB (cm)
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Gizi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Z-score TB/U
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pengukuranList.map((pengukuran) => (
                      <tr key={pengukuran.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateToIndonesian(pengukuran.tanggalPengukuran)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pengukuran.beratBadanKg} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pengukuran.tinggiBadanCm} cm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pengukuran.statusGizi === 'Normal' 
                              ? 'bg-green-100 text-green-800' 
                              : pengukuran.statusGizi.includes('Stunting') 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pengukuran.statusGizi}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pengukuran.zscoreTbU !== null ? pengukuran.zscoreTbU.toFixed(2) : 'N/A'}
                        </td>
                      </tr>
                    ))}
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