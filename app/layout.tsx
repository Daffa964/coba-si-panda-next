import './globals.css';

export const metadata = {
  title: 'SI-PANDA - Sistem Pemantau Gizi Anak Desa Kramat',
  description: 'Aplikasi pemantau gizi anak untuk mencegah stunting',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}