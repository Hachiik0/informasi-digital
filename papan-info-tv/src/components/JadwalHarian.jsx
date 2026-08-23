import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function JadwalHarian() {
  const [jadwal, setJadwal] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Mendapatkan nama hari ini dalam Bahasa Indonesia
  const getHariIni = () => {
    const hariArr = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const indexHari = new Date().getDay();
    // Jika hari Minggu, defaultkan ke Senin atau tampilkan kosong (di sini kita defaultkan Senin jika Minggu)
    return indexHari === 0 ? 'Senin' : hariArr[indexHari];
  };

  const hariAktif = getHariIni();

  // Mengambil data dari koleksi 'jadwal_harian' di Firebase secara realtime
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'jadwal_harian'), (snapshot) => {
      let dataJadwal = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 1. Filter hanya jadwal yang sesuai dengan hari ini
      dataJadwal = dataJadwal.filter(item => (item.hari || 'Senin') === hariAktif);

      // 2. Urutkan (Sorting) berdasarkan jam mulai dari yang paling awal ke paling akhir
      dataJadwal.sort((a, b) => {
        const jamA = a.jam_mulai || "00:00";
        const jamB = b.jam_mulai || "00:00";
        return jamA.localeCompare(jamB);
      });

      setJadwal(dataJadwal);
      setCurrentPage(0); // Reset ke halaman pertama saat data berubah
    });
    
    return () => unsubscribe();
  }, [hariAktif]);

  // Membagi jadwal menjadi maksimal 9 mapel per halaman
  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(jadwal.length / ITEMS_PER_PAGE);

  // Timer untuk berganti halaman secara otomatis setiap 15 detik jika lebih dari 1 halaman
  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
    }, 15000); // 15 detik
    return () => clearInterval(interval);
  }, [totalPages]);

  // Ambil hanya 9 jadwal untuk halaman yang sedang aktif
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentJadwal = jadwal.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Bagian Judul (Desain Asli Tetap Dipertahankan + Keterangan Hari) */}
      <div style={{ 
        backgroundColor: '#0d3b66', 
        color: 'white', 
        padding: '15px 20px', 
        borderRadius: '15px 15px 0 0', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ border: '2px solid white', borderRadius: '50%', width: '25px', height: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>
            ⏱️
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '1px' }}>
            JADWAL {hariAktif.toUpperCase()}
          </h3>
        </div>

        {/* Indikator Halaman jika lebih dari 1 halaman */}
        {totalPages > 1 && (
          <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px' }}>
            Hal {currentPage + 1} / {totalPages}
          </span>
        )}
      </div>

      {/* Bagian Isi Daftar Jadwal */}
      <div style={{ 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px', 
        overflowY: 'hidden' 
      }}>
        {currentJadwal.length > 0 ? (
          currentJadwal.map((item, index) => {
            const nomorUrut = startIndex + index + 1;
            
            return (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#0d3b66', fontSize: '1.05rem', fontWeight: 'bold' }}>
                    {nomorUrut}. {item.mata_pelajaran}
                  </span>
                  {item.kelas && (
                    <span style={{ fontSize: '0.8rem', color: '#555', marginLeft: '8px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                      Kelas: {item.kelas}
                    </span>
                  )}
                </div>
                <span style={{ color: '#0d3b66', fontSize: '1rem', fontWeight: '600' }}>
                  {item.jam_mulai} - {item.jam_selesai}
                </span>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic', marginTop: '20px' }}>
            Tidak ada jadwal untuk hari {hariAktif}.
          </p>
        )}
      </div>

    </div>
  );
}