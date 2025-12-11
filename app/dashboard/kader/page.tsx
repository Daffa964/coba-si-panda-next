'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManajemenKaderPage() {
  const router = useRouter();
  const [kaderList, setKaderList] = useState<any[]>([]);
  const [posyanduList, setPosyanduList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    posyanduId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Data Awal
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [kaderRes, posyanduRes] = await Promise.all([
          fetch('/api/kader'),
          fetch('/api/posyandu')
        ]);

        if (kaderRes.ok) {
          const data = await kaderRes.json();
          setKaderList(data.data);
        }
        
        if (posyanduRes.ok) {
          const data = await posyanduRes.json();
          setPosyanduList(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/kader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Kader berhasil ditambahkan!');
        // Reset Form & Refresh List
        setFormData({ nama: '', email: '', password: '', posyanduId: '' });
        const newListRes = await fetch('/api/kader');
        const newList = await newListRes.json();
        setKaderList(newList.data);
      } else {
        alert(data.error || 'Gagal menambah kader');
      }
    } catch (err) {
      alert('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Kader</h1>
            <p className="text-gray-500">Kelola akun kader untuk setiap Posyandu</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Kembali ke Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: FORM TAMBAH */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Tambah Kader Baru</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.nama}
                    onChange={e => setFormData({...formData, nama: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Penempatan Posyandu</label>
                  <select
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.posyanduId}
                    onChange={e => setFormData({...formData, posyanduId: e.target.value})}
                  >
                    <option value="">-- Pilih Posyandu --</option>
                    {posyanduList.map((p) => (
                      <option key={p.id} value={p.id}>{p.namaPosyandu}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kader'}
                </button>
              </form>
            </div>
          </div>

          {/* KOLOM KANAN: DAFTAR KADER */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Daftar Kader Aktif</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Posyandu</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Terdaftar</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {kaderList.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Belum ada data kader.</td></tr>
                    ) : (
                      kaderList.map((kader) => (
                        <tr key={kader.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{kader.nama}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kader.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                              {kader.posyandu || 'Tidak Ada'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(kader.createdAt).toLocaleDateString('id-ID')}
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