'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Pengukuran } from '@/types';

interface GrowthChartProps {
  data: Pengukuran[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  // Data dari API biasanya descending (terbaru dulu), kita balik agar grafik dari kiri (lama) ke kanan (baru)
  // Kita buat salinan array dengan [...data] agar tidak memutasi state asli
  const chartData = [...data].reverse().map(item => {
    const date = new Date(item.tanggalPengukuran);
    return {
      tanggal: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' }),
      berat: item.beratBadanKg,
      tinggi: item.tinggiBadanCm,
      status: item.statusGizi
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500">Belum ada data untuk ditampilkan dalam grafik.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Grafik Berat Badan */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800">Grafik Berat Badan</h3>
          <p className="text-xs text-gray-500">Tren perkembangan berat badan (kg)</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="tanggal" 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                axisLine={false}
                tickLine={false}
                unit=" kg"
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey="berat" 
                name="Berat Badan (kg)"
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grafik Tinggi Badan */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800">Grafik Tinggi Badan</h3>
          <p className="text-xs text-gray-500">Tren perkembangan tinggi badan (cm)</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="tanggal" 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                axisLine={false}
                tickLine={false}
                unit=" cm"
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey="tinggi" 
                name="Tinggi Badan (cm)"
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}