'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link'; 
import { Anak, Pengukuran } from '@/types';
import { formatDateToIndonesian, calculateAgeInMonths } from '@/utils';
import GrowthChart from '@/components/GrowthChart';

// Helper warna badge status
const getStatusColor = (status: string) => {
  if (status.includes('Normal') || status.includes('Baik')) return 'bg-green-100 text-green-800 border-green-200';
  if (status.includes('Sangat') || status.includes('Buruk')) return 'bg-red-100 text-red-800 border-red-200';
  if (status.includes('Pendek') || status.includes('Kurang') || status.includes('Wasted')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-blue-100 text-blue-800 border-blue-200';
};

const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return '';
  // Hapus karakter non-digit
  let cleaned = phone.replace(/\D/g, '');
  // Ubah 08... menjadi 628...
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
};

export default function ChildProfilePage() {
  const params = useParams(); 
  const router = useRouter();
  
  const [anak, setAnak] = useState<Anak | null>(null);
  const [pengukuranList, setPengukuranList] = useState<Pengukuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi Fetch Data
  const fetchChildData = async () => {
    try {
      setLoading(true);
      if (!params.id) return;

      const anakRes = await fetch(`/api/anak/${params.id}`);
      if (!anakRes.ok) throw new Error('Gagal mengambil data anak');
      const anakData = await anakRes.json();
      setAnak(anakData.anak);
      
      const ukurRes = await fetch(`/api/pengukuran?anakId=${params.id}`);
      if (!ukurRes.ok) throw new Error('Gagal mengambil data pengukuran');
      const ukurData = await ukurRes.json();
      setPengukuranList(ukurData.pengukuranList || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildData();
  }, [params.id]);

  const handleDeleteAnak = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus data anak ini?')) return;
    try {
      const res = await fetch(`/api/anak/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Gagal menghapus data anak');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  };

  const handleDeletePengukuran = async (id: number) => {
    if (!confirm('Hapus riwayat pengukuran ini?')) return;
    try {
      const res = await fetch(`/api/pengukuran/${id}`, { method: 'DELETE' });
      if (res.ok) fetchChildData();
      else alert('Gagal menghapus pengukuran');
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  };

  // --- FUNGSI EXPORT CSV (BARU) ---
  const handleExportCSV = () => {
    if (!pengukuranList.length || !anak) return;

    // 1. Buat Header CSV
    const headers = ['Tanggal', 'Berat Badan (kg)', 'Tinggi Badan (cm)', 'Status Gizi', 'Z-Score TB/U'];
    
    // 2. Format Data Baris
    const rows = pengukuranList.map(item => [
      `"${new Date(item.tanggalPengukuran).toLocaleDateString('id-ID')}"`, // Tanda kutip untuk keamanan format
      item.beratBadanKg.toString(),
      item.tinggiBadanCm.toString(),
      `"${item.statusGizi}"`,
      item.zscoreTbU?.toFixed(2) || '-'
    ]);

    // 3. Gabungkan Header dan Baris
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // 4. Buat Blob dan Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_pertumbuhan_${anak.namaAnak.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsApp = () => {
    if (!anak?.teleponWali) {
      alert('Nomor telepon wali tidak tersedia');
      return;
    }
    const formattedPhone = formatPhoneNumber(anak.teleponWali);
    const message = `Halo Bapak/Ibu ${anak.namaWali}, ini dari Posyandu Desa Kramat. Kami ingin menginfokan perkembangan anak ${anak.namaAnak}...`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div></div>;
  }

  if (error || !anak) {
    return <div className="p-8 text-center text-red-600">{error || 'Data tidak ditemukan'}</div>;
  }

  const ageInMonths = calculateAgeInMonths(anak.tanggalLahir);
  const latestPengukuran = pengukuranList.length > 0 ? pengukuranList[0] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Navigasi */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-700 font-medium">
                ← Kembali ke Dashboard
            </button>
            <div className="flex gap-3">
                 <button 
                    onClick={handleWhatsApp}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors flex items-center"
                    title="Hubungi Wali via WhatsApp"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    WhatsApp
                  </button>
                 <button 
                    onClick={handleDeleteAnak}
                    className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md font-medium border border-red-200 transition-colors"
                  >
                    Hapus Data
                  </button>
                 <Link 
                    href={`/dashboard/anak/${anak.id}/edit`}
                    className="bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium border border-gray-300 transition-colors"
                  >
                    Edit Data
                  </Link>
                 <Link 
                    href={`/tambah-pengukuran?anakId=${anak.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
                  >
                    + Catat Pengukuran
                  </Link>
            </div>
        </div>

        {/* Profil Header */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{anak.namaAnak}</h1>
                    <div className="mt-2 flex items-center text-sm text-gray-600 space-x-4">
                        <span>{formatDateToIndonesian(anak.tanggalLahir)}</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                            {ageInMonths} Bulan
                        </span>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="bg-white p-2 rounded border text-xs text-center shadow-sm">
                        <span className="block font-mono font-bold text-gray-600">{anak.qrToken.substring(0,6)}...</span>
                        <span className="text-gray-400">QR Token</span>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Info Detail */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Informasi Wali</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-gray-600">Nama Wali</dt><dd className="font-medium">{anak.namaWali}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Telepon</dt><dd className="font-medium">{anak.teleponWali || '-'}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Posyandu ID</dt><dd className="font-medium">{anak.posyanduId}</dd></div>
                </dl>
              </div>

              {/* Status Terkini */}
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">Status Terkini</h3>
                {latestPengukuran ? (
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">BB: <strong>{latestPengukuran.beratBadanKg} kg</strong></span>
                            <span className="text-gray-600">TB: <strong>{latestPengukuran.tinggiBadanCm} cm</strong></span>
                        </div>
                        <div className={`text-center py-2 rounded-lg font-bold text-sm border ${getStatusColor(latestPengukuran.statusGizi)}`}>
                            {latestPengukuran.statusGizi}
                        </div>
                    </div>
                ) : <p className="text-gray-500 text-center py-4">Belum ada data</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Grafik Pertumbuhan */}
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                Grafik Pertumbuhan
            </h3>
            <GrowthChart data={pengukuranList} />
        </div>
            
        {/* Tabel Riwayat */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Riwayat Pertumbuhan
            </h3>
            
            {/* TOMBOL DOWNLOAD CSV */}
            {pengukuranList.length > 0 && (
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md border border-green-200 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download Laporan (CSV)
                </button>
            )}
          </div>

          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">BB (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">TB (cm)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pengukuranList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateToIndonesian(item.tanggalPengukuran)}</td>
                    <td className="px-6 py-4 text-sm font-bold">{item.beratBadanKg}</td>
                    <td className="px-6 py-4 text-sm font-bold">{item.tinggiBadanCm}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusColor(item.statusGizi)}`}>{item.statusGizi}</span></td>
                    <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => handleDeletePengukuran(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline"
                        >
                            Hapus
                        </button>
                    </td>
                  </tr>
                ))}
                {pengukuranList.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Tidak ada riwayat.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}