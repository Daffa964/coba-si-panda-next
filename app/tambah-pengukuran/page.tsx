'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the validation schema using Zod
const pengukuranSchema = z.object({
  beratBadanKg: z.number()
    .min(0.1, 'Berat badan harus lebih dari 0')
    .max(100, 'Berat badan terlalu tinggi'),
  tinggiBadanCm: z.number()
    .min(1, 'Tinggi badan harus lebih dari 0')
    .max(200, 'Tinggi badan terlalu tinggi'),
});

type PengukuranFormData = z.infer<typeof pengukuranSchema>;

export default function TambahPengukuranPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const anakId = searchParams.get('anakId');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Initialize react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PengukuranFormData>({
    resolver: zodResolver(pengukuranSchema),
    defaultValues: {
      beratBadanKg: 0,
      tinggiBadanCm: 0,
    }
  });

  const onSubmit = async (data: PengukuranFormData) => {
    try {
      setError(null);
      setSuccess(false);
      
      if (!anakId) {
        setError('ID anak tidak valid');
        return;
      }
      
      const response = await fetch('/api/pengukuran', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anakId: parseInt(anakId),
          beratBadanKg: data.beratBadanKg,
          tinggiBadanCm: data.tinggiBadanCm,
          // The dicatatOleh (recorded by) will be set by the API based on the authenticated user
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect after a short delay or provide option to add another measurement
        setTimeout(() => {
          router.push(`/dashboard/anak/${anakId}`);
        }, 2000);
      } else {
        setError(result.message || 'Gagal mencatat pengukuran');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mencatat pengukuran');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Catat Pengukuran Anak</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">Pengukuran berhasil dicatat!</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="beratBadanKg" className="block text-sm font-medium text-gray-700">
                  Berat Badan (kg)
                </label>
                <input
                  id="beratBadanKg"
                  type="number"
                  step="0.1"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.beratBadanKg ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('beratBadanKg', { valueAsNumber: true })}
                />
                {errors.beratBadanKg && (
                  <p className="mt-1 text-sm text-red-600">{errors.beratBadanKg.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="tinggiBadanCm" className="block text-sm font-medium text-gray-700">
                  Tinggi Badan (cm)
                </label>
                <input
                  id="tinggiBadanCm"
                  type="number"
                  step="0.1"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.tinggiBadanCm ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('tinggiBadanCm', { valueAsNumber: true })}
                />
                {errors.tinggiBadanCm && (
                  <p className="mt-1 text-sm text-red-600">{errors.tinggiBadanCm.message}</p>
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
                {isSubmitting ? 'Menyimpan...' : 'Simpan Pengukuran'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}