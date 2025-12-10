'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Anak, Pengukuran } from '@/types';
import { formatDateToIndonesian, calculateAgeInMonths } from '@/utils';

export default function QrReportPage() {
  const params = useParams();
  const qrToken = params.token as string;
  const [anak, setAnak] = useState<Anak | null>(null);
  const [pengukuranList, setPengukuranList] = useState<Pengukuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const fetchChildDataByToken = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would verify the token and fetch child data
        // For now, we'll use mock data
        console.log(`Fetching data for QR token: ${qrToken}`);
        
        // Mock data
        const mockAnak: Anak = {
          id: 1,
          namaAnak: 'Ahmad Rizki',
          jenisKelamin: 'LAKI-LAKI',
          tanggalLahir: new Date('2023-01-15'),
          namaWali: 'Bapak Rizki',
          teleponWali: '081234567890',
          posyanduId: 1,
          qrToken: qrToken,
          createdAt: new Date(),
        };
        
        setAnak(mockAnak);
        
        // Mock measurement data
        const mockPengukuran: Pengukuran[] = [
          {
            id: 1,
            anakId: mockAnak.id,
            tanggalPengukuran: new Date('2024-12-01'),
            beratBadanKg: 10.5,
            tinggiBadanCm: 75.2,
            zscoreBbU: -0.5,
            zscoreTbU: -1.2,
            zscoreBbTb: -0.1,
            statusGizi: 'Normal',
            dicatatOleh: 1,
            createdAt: new Date('2024-12-01'),
          },
          {
            id: 2,
            anakId: mockAnak.id,
            tanggalPengukuran: new Date('2024-11-01'),
            beratBadanKg: 10.2,
            tinggiBadanCm: 74.5,
            zscoreBbU: -0.6,
            zscoreTbU: -1.3,
            zscoreBbTb: -0.2,
            statusGizi: 'Normal',
            dicatatOleh: 1,
            createdAt: new Date('2024-11-01'),
          },
        ];
        
        setPengukuranList(mockPengukuran);
        
        // Generate QR code (in real app, this would be the URL for this report page)
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.href}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (qrToken) {
      fetchChildDataByToken();
    }
  }, [qrToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !anak) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600">QR Code Tidak Valid</h2>
            <p className="mt-2 text-gray-600">
              {error || 'Data anak tidak ditemukan atau QR code tidak valid.'}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Silakan hubungi petugas posyandu untuk informasi lebih lanjut.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const ageInMonths = calculateAgeInMonths(anak.tanggalLahir);
  const latestPengukuran = pengukuranList.length > 0 ? pengukuranList[0] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Header */}
          <div className="bg-blue-600 px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-white p-2 rounded">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-white">Laporan Pertumbuhan Anak</h1>
                <p className="text-blue-100">SI-PANDA - Sistem Pemantau Gizi Anak Desa Kramat</p>
              </div>
            </div>
          </div>
          
          {/* Child Info */}
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">{anak.namaAnak}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Anak dari {anak.namaWali} • Umur {ageInMonths} bulan
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tanggal Cetak: {formatDateToIndonesian(new Date())}</p>
                <div className="mt-2">
                  <img 
                    src={qrCodeUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%23999'%3EQR Code%3C/text%3E%3C/svg%3E"} 
                    alt="QR Code" 
                    className="w-24 h-24"
                  />
                  <p className="text-xs text-gray-500 mt-1">Scan untuk akses laporan</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Latest Measurement */}
          {latestPengukuran && (
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pengukuran Terakhir</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Tanggal</p>
                  <p className="text-lg font-semibold">{formatDateToIndonesian(latestPengukuran.tanggalPengukuran)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Berat Badan</p>
                  <p className="text-lg font-semibold">{latestPengukuran.beratBadanKg} kg</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Tinggi Badan</p>
                  <p className="text-lg font-semibold">{latestPengukuran.tinggiBadanCm} cm</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Status Gizi</p>
                  <p className="text-lg font-semibold">{latestPengukuran.statusGizi}</p>
                </div>
              </div>
              
              {/* Growth Chart Placeholder */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Perkembangan Berat Badan</h3>
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Grafik pertumbuhan akan ditampilkan di sini</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Measurement History */}
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Nutrition Recommendations */}
          {latestPengukuran && (
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rekomendasi Gizi</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Berdasarkan status gizi "{latestPengukuran.statusGizi}", berikut beberapa rekomendasi untuk 
                  mendukung pertumbuhan optimal anak:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-700">
                  <li>Berikan makanan bergizi seimbang dengan porsi yang sesuai usia</li>
                  <li>Pastikan asupan protein, vitamin, dan mineral yang cukup</li>
                  <li>Jaga kebersihan makanan dan peralatan makan</li>
                  <li>Lanjutkan pemeriksaan rutin ke posyandu terdekat</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 text-center">
            <p className="text-sm text-gray-500">
              Laporan ini dihasilkan oleh SI-PANDA - Sistem Pemantau Gizi Anak Desa Kramat
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Untuk informasi lebih lanjut, hubungi petugas kesehatan setempat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}