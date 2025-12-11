'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDateToIndonesian } from '@/utils';

// Schema Validasi (Sama dengan create, tapi sesuaikan kebutuhan)
const anakSchema = z.object({
  namaAnak: z.string().min(1, 'Nama anak wajib diisi'),
  jenisKelamin: z.enum(['LAKI-LAKI', 'PEREMPUAN']),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  namaWali: z.string().min(1, 'Nama wali wajib diisi'),
  teleponWali: z.string().optional(),
  posyanduId: z.string().min(1, 'Posyandu wajib dipilih'),
});

type AnakFormData = z.infer<typeof anakSchema>;

export default function EditAnakPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AnakFormData>({
    resolver: zodResolver(anakSchema),
  });

  // 1. Ambil data anak saat ini
  useEffect(() => {
    const fetchAnak = async () => {
      try {
        const response = await fetch(`/api/anak/${params.id}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Gagal mengambil data');

        const anak = data.anak;
        
        // Isi form dengan data yang ada
        setValue('namaAnak', anak.namaAnak);
        setValue('jenisKelamin', anak.jenisKelamin);
        // Format tanggal untuk input type="date" (YYYY-MM-DD)
        setValue('tanggalLahir', new Date(anak.tanggalLahir).toISOString().split('T')[0]);
        setValue('namaWali', anak.namaWali);
        setValue('teleponWali', anak.teleponWali || '');
        setValue('posyanduId', String(anak.posyanduId));
        
      } catch (err) {
        setError('Gagal memuat data anak.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchAnak();
  }, [params.id, setValue]);

  // 2. Handle Update
  const onSubmit = async (data: AnakFormData) => {
    try {
      const response = await fetch(`/api/anak/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect kembali ke halaman detail
        router.push(`/dashboard/anak/${params.id}`);
        router.refresh();
      } else {
        setError(result.error || 'Gagal mengupdate data');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan perubahan');
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Data Anak</h1>
            <button
                type="button"
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700"
              >
                Batal
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Fields - Sama seperti Tambah Anak */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Anak</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  {...register('namaAnak')}
                />
                {errors.namaAnak && <p className="text-red-500 text-xs mt-1">{errors.namaAnak.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  {...register('jenisKelamin')}
                >
                  <option value="LAKI-LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                <input
                  type="date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  {...register('tanggalLahir')}
                />
                {errors.tanggalLahir && <p className="text-red-500 text-xs mt-1">{errors.tanggalLahir.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Posyandu</label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  {...register('posyanduId')}
                >
                  <option value="1">Posyandu RW 01</option>
                  <option value="2">Posyandu RW 02</option>
                  <option value="3">Posyandu RW 03</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Wali</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  {...register('namaWali')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Telepon Wali</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  {...register('teleponWali')}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}