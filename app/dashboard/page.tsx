'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interface data lokal untuk tampilan dashboard
interface AnakDashboard {
  id: number;
  namaAnak: string;
  statusGizi: string;
  posyanduId: number;
  lastMeasurementDate?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<AnakDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Statistik
  const [stats, setStats] = useState({
    total: 0,
    normal: 0,
    stunting: 0, // Pendek / Sangat Pendek
    wasting: 0,  // Kurus / Sangat Kurus
    underweight: 0, // Kurang / Sangat Kurang
    belumDiukur: 0
  });
  
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Cek sesi user (Auth)
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          throw new Error('Unauthorized');
        }
        const userData = await authRes.json();
        setUser(userData.user);

        // 2. Ambil daftar semua anak
        const anakRes = await fetch('/api/anak');
        if (anakRes.ok) {
          const anakData = await anakRes.json();
          const rawAnakList = anakData.anakList || [];
          
          // 3. Ambil status gizi terakhir untuk setiap anak
          // (Note: Idealnya ini dilakukan di sisi server/API join, tapi ini solusi cepat via client)
          const processedChildren = await Promise.all(rawAnakList.map(async (child: any) => {
            try {
              const ukurRes = await fetch(`/api/pengukuran?anakId=${child.id}`);
              let status = 'Belum Diukur';
              let date = '';

              if (ukurRes.ok) {
                const ukurData = await ukurRes.json();
                // Ambil pengukuran pertama (paling baru karena sudah di-descending di API)
                if (ukurData.pengukuranList && ukurData.pengukuranList.length > 0) {
                  status = ukurData.pengukuranList[0].statusGizi;
                  date = ukurData.pengukuranList[0].tanggalPengukuran;
                }
              }
              return { 
                ...child, 
                statusGizi: status,
                lastMeasurementDate: date
              };
            } catch (e) {
              return { ...child, statusGizi: 'Error', lastMeasurementDate: '' };
            }
          }));

          setChildren(processedChildren);

          // 4. Hitung Statistik Real-time
          // Kita gunakan .includes() karena status bisa panjang (misal: "Sangat Pendek (Severely Stunted)")
          const newStats = {
            total: processedChildren.length,
            
            normal: processedChildren.filter((c: any) => 
              c.statusGizi.includes('Normal') || c.statusGizi.includes('Baik')
            ).length,
            
            stunting: processedChildren.filter((c: any) => 
              c.statusGizi.includes('Pendek') || c.statusGizi.includes('Stunted')
            ).length,
            
            wasting: processedChildren.filter((c: any) => 
              c.statusGizi.includes('Kurus') || c.statusGizi.includes('Wasted') || c.statusGizi.includes('Buruk')
            ).length,
            
            underweight: processedChildren.filter((c: any) => 
              c.statusGizi.includes('Kurang') && !c.statusGizi.includes('Kurus') // Bedakan kurang BB vs kurus
            ).length,

            belumDiukur: processedChildren.filter((c: any) => 
              c.statusGizi === 'Belum Diukur'
            ).length
          };
          
          setStats(newStats);
        }

      } catch (error) {
        console.error("Dashboard error:", error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Fungsi helper warna badge status
  const getStatusBadgeColor = (status: string) => {
    if (status.includes('Normal') || status.includes('Baik')) return 'bg-green-100 text-green-800 border-green-200';
    if (status.includes('Sangat') || status.includes('Buruk')) return 'bg-red-100 text-red-800 border-red-200';
    if (status.includes('Pendek') || status.includes('Kurang') || status.includes('Wasted')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'Belum Diukur') return 'bg-gray-100 text-gray-600 border-gray-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard SI-PANDA</h1>
              <p className="text-xs text-gray-500">Desa Kramat</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.nama}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            <button 
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                  .then(() => router.push('/login'));
              }}
              className="bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tombol Aksi Cepat */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Ringkasan Gizi</h2>
            <p className="text-gray-500">Pantau perkembangan status gizi anak secara real-time</p>
          </div>
          <Link 
            href="/tambah-anak" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-blue-600/20 flex items-center transition-all transform hover:-translate-y-0.5"
          >
            <span className="mr-2 text-xl leading-none">+</span> Tambah Data Anak
          </Link>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card Total */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Anak</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">{stats.belumDiukur} anak belum diukur</p>
          </div>
          
          {/* Card Normal */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1 bg-green-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Gizi Baik</p>
                <h3 className="text-3xl font-bold text-green-600">{stats.normal}</h3>
              </div>
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${stats.total ? (stats.normal / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          {/* Card Stunting */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Stunting (Pendek)</p>
                <h3 className="text-3xl font-bold text-red-600">{stats.stunting}</h3>
              </div>
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-red-500 mt-4 font-medium">Perlu perhatian khusus</p>
          </div>
          
          {/* Card Wasting/Underweight */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1 bg-yellow-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Gizi Kurang</p>
                <h3 className="text-3xl font-bold text-yellow-600">{stats.wasting + stats.underweight}</h3>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Kurus: {stats.wasting}</span>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">BB-: {stats.underweight}</span>
            </div>
          </div>
        </div>

        {/* Tabel Data Anak */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Daftar Anak & Status Gizi</h3>
                <p className="text-sm text-gray-500">Data terbaru berdasarkan pengukuran terakhir</p>
            </div>
            {/* Search bar placeholder */}
            <div className="relative hidden sm:block">
                <input 
                    type="text" 
                    placeholder="Cari nama anak..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Anak</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status Terakhir</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Tgl. Ukur</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {children.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        <p className="text-base font-medium">Belum ada data anak.</p>
                        <p className="text-sm mt-1">Silakan tambah data anak untuk memulai pemantauan.</p>
                        <Link href="/tambah-anak" className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
                            + Tambah Anak Sekarang
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  children.map((child) => (
                    <tr key={child.id} className="hover:bg-blue-50/50 transition duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                                {child.namaAnak.charAt(0)}
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-bold text-gray-900">{child.namaAnak}</div>
                                <div className="text-xs text-gray-500">ID: {child.id}</div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusBadgeColor(child.statusGizi)}`}>
                          {child.statusGizi}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {child.lastMeasurementDate 
                            ? new Date(child.lastMeasurementDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) 
                            : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/dashboard/anak/${child.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors">
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}