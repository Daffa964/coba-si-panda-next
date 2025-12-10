import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">SI-PANDA</h1>
          <nav>
            <ul className="flex space-x-6">
              <li><Link href="/login" className="text-blue-600 hover:text-blue-900">Login</Link></li>
              <li><Link href="/dashboard" className="text-blue-600 hover:text-blue-900">Dashboard</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Sistem Pemantau Gizi Anak Desa Kramat</h2>
          <p className="text-xl text-gray-600 mb-8">
            Solusi digital untuk pemantauan gizi anak dan pencegahan stunting
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Pemantauan Gizi</h3>
              <p>Monitor pertumbuhan anak secara digital dengan perhitungan Z-score otomatis</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Laporan Tumbuh Kembang</h3>
              <p>Hasilkan laporan pertumbuhan anak dalam bentuk QR code yang dapat diakses orang tua</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Peringatan Dini</h3>
              <p>Sistem peringatan dini untuk mendeteksi risiko stunting dan gangguan gizi lainnya</p>
            </div>
          </div>
          
          <div className="mt-12">
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300"
            >
              Masuk ke Sistem
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© {new Date().getFullYear()} SI-PANDA - Sistem Pemantau Gizi Anak Desa Kramat</p>
        </div>
      </footer>
    </div>
  );
}