import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Header() {
  const [waktu, setWaktu] = useState(new Date());
  // Kita ubah variabel ini untuk menyimpan bagian akhir sapaan saja (misal: "Siswa Hebat!")
  const [sapaanTambahan, setSapaanTambahan] = useState("Siswa Hebat!"); 

  // 1. Logika Jam Digital (Berdetak setiap 1 detik)
  useEffect(() => {
    const timer = setInterval(() => {
      setWaktu(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Logika Mengambil Data Tambahan dari Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'pengaturan', 'umum'), (dokumen) => {
      if (dokumen.exists()) {
        // Misalnya di Firebase nanti Anda mau ganti "Siswa Hebat!" jadi "Keluarga SMAN 1"
        const data = dokumen.data();
        if (data.teks_sapaan) {
             setSapaanTambahan(data.teks_sapaan);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Logika Penentu Waktu (Pagi/Siang/Sore/Malam)
  const dapatkanSapaanWaktu = () => {
    const jamSekarang = waktu.getHours();
    
    if (jamSekarang >= 6 && jamSekarang < 10) {
      return "Selamat Pagi, ";
    } else if (jamSekarang >= 10 && jamSekarang < 15) {
      return "Selamat Siang, ";
    } else if (jamSekarang >= 15 && jamSekarang < 18) {
      return "Selamat Sore, ";
    } else {
      return "Selamat Malam, ";
    }
  };

  // Format Jam & Tanggal
  const jam = waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  const tanggal = waktu.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '100%', boxSizing: 'border-box' }}>
      
      {/* Bagian Kiri: Ikon Cuaca & Teks Sapaan */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, minWidth: 0 }}>
        <img 
<<<<<<< HEAD
          src="/Matahari.png" 
=======
          src="/public/Matahari.png" 
>>>>>>> 22c18d10228775b59c6e04293ee04da75b02be83
          alt="Ikon Cuaca" 
          style={{ width: '55px', height: '55px', objectFit: 'contain', flexShrink: 0 }} 
        />
        <div style={{ minWidth: 0 }}>
          {/* UBAH UKURAN FONT DI SINI: Dari 2.5rem menjadi 1.6rem agar tidak terlalu besar */}
          <h1 style={{ color: '#0d3b66', margin: 0, fontSize: '1.6rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {dapatkanSapaanWaktu()} {sapaanTambahan}
          </h1>
          <p style={{ color: '#555', margin: '2px 0 0 0', fontSize: '1.4rem' }}>Semangat belajar hari ini, wujudkan masa depan yang gemilang.</p>
        </div>
      </div>

      {/* Bagian Kanan: Jam Digital & Tanggal */}
      {/* UBAH PADDING DAN UKURAN FONT JAM DI SINI: Agar pas di dalam kotak rightTop */}
      <div style={{ backgroundColor: '#0d3b66', color: 'white', padding: '8px 20px', borderRadius: '12px', textAlign: 'center', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 'bold' }}>⏱️ {jam}</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', marginTop: '2px' }}>{tanggal}</p>
      </div>

    </div>
    );
}
