'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the validation schema using Zod
const anakSchema = z.object({
  namaAnak: z.string().min(1, 'Nama anak wajib diisi'),
  jenisKelamin: z.enum(['LAKI-LAKI', 'PEREMPUAN'], {
    errorMap: () => ({ message: 'Jenis kelamin wajib dipilih' })
  }),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  namaWali: z.string().min(1, 'Nama wali wajib diisi'),
  teleponWali: z.string().optional(),
  posyanduId: z.string().min(1, 'Posyandu wajib dipilih'),
});

type AnakFormData = z.infer<typeof anakSchema>;

export default function TambahAnakPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  // Initialize react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AnakFormData>({
    resolver: zodResolver(anakSchema),
  });

  const onSubmit = async (data: AnakFormData) => {
    try {
      setError(null);
      
      const response = await fetch('/api/anak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          tanggalLahir: new Date(data.tanggalLahir),
          posyanduId: parseInt(data.posyanduId),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to dashboard or anak list after successful creation
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.message || 'Gagal menambahkan anak');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menambahkan anak');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Data Anak Baru</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="namaAnak" className="block text-sm font-medium text-gray-700">
                  Nama Anak
                </label>
                <input
                  id="namaAnak"
                  type="text"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.namaAnak ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('namaAnak')}
                />
                {errors.namaAnak && (
                  <p className="mt-1 text-sm text-red-600">{errors.namaAnak.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">
                  Jenis Kelamin
                </label>
                <select
                  id="jenisKelamin"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.jenisKelamin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('jenisKelamin')}
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="LAKI-LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
                {errors.jenisKelamin && (
                  <p className="mt-1 text-sm text-red-600">{errors.jenisKelamin.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700">
                  Tanggal Lahir
                </label>
                <input
                  id="tanggalLahir"
                  type="date"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.tanggalLahir ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('tanggalLahir')}
                />
                {errors.tanggalLahir && (
                  <p className="mt-1 text-sm text-red-600">{errors.tanggalLahir.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="posyanduId" className="block text-sm font-medium text-gray-700">
                  Posyandu
                </label>
                <select
                  id="posyanduId"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.posyanduId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('posyanduId')}
                >
                  <option value="">Pilih posyandu</option>
                  <option value="1">Posyandu RW 01</option>
                  <option value="2">Posyandu RW 02</option>
                  <option value="3">Posyandu RW 03</option>
                </select>
                {errors.posyanduId && (
                  <p className="mt-1 text-sm text-red-600">{errors.posyanduId.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="namaWali" className="block text-sm font-medium text-gray-700">
                  Nama Wali
                </label>
                <input
                  id="namaWali"
                  type="text"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.namaWali ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('namaWali')}
                />
                {errors.namaWali && (
                  <p className="mt-1 text-sm text-red-600">{errors.namaWali.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="teleponWali" className="block text-sm font-medium text-gray-700">
                  Telepon Wali (Opsional)
                </label>
                <input
                  id="teleponWali"
                  type="tel"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.teleponWali ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('teleponWali')}
                />
                {errors.teleponWali && (
                  <p className="mt-1 text-sm text-red-600">{errors.teleponWali.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}