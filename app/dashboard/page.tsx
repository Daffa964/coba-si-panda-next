'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock data for demonstration
const mockChildren = [
  { id: 1, namaAnak: 'Ahmad Rizki', statusGizi: 'Normal', posyandu: 'Posyandu RW 01' },
  { id: 2, namaAnak: 'Siti Aisyah', statusGizi: 'Stunting', posyandu: 'Posyandu RW 01' },
  { id: 3, namaAnak: 'Budi Santoso', statusGizi: 'Underweight', posyandu: 'Posyandu RW 02' },
  { id: 4, namaAnak: 'Dewi Anggraini', statusGizi: 'Normal', posyandu: 'Posyandu RW 02' },
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated (this would normally be done via middleware)
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
        } else {
          const userData = await response.json();
          setUser(userData.user);
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard SI-PANDA</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Halo, {user?.nama || 'Pengguna'}</span>
            <button 
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                  .then(() => router.push('/login'));
              }}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Jumlah Anak Terdaftar</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">125</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Normal</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">98</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Risiko Stunting</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">18</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Stunting</h3>
            <p className="mt-2 text-3xl font-semibold text-red-600">9</p>
          </div>
        </div>

        {/* Children Monitoring Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Daftar Anak</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Informasi gizi anak-anak di wilayah Posyandu</p>
          </div>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Anak
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Gizi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posyandu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockChildren.map((child) => (
                  <tr 
                    key={child.id} 
                    className={
                      child.statusGizi === 'Stunting' 
                        ? 'bg-red-50' 
                        : child.statusGizi === 'Underweight' 
                          ? 'bg-yellow-50' 
                          : ''
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{child.namaAnak}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        child.statusGizi === 'Normal' 
                          ? 'bg-green-100 text-green-800' 
                          : child.statusGizi === 'Stunting' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {child.statusGizi}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {child.posyandu}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">Detail</button>
                      <button className="text-indigo-600 hover:text-indigo-900">WA Ortu</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}