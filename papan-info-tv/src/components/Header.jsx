import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Header() {
  const [waktu, setWaktu] = useState(new Date());
  const [headerData, setHeaderData] = useState({
    nama_target: "Ambatukam",
    subjudul: "Semangat belajar hari ini, wujudkan masa depan yang gemilang."
  });

  // Jam real-time berjalan
  useEffect(() => {
    const timer = setInterval(() => setWaktu(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ambil data header dari Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'pengaturan', 'header'), (docSnap) => {
      if (docSnap.exists()) {
        setHeaderData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const jam = waktu.getHours();
  let sapaan = "Selamat Pagi";
  if (jam >= 11 && jam < 15) sapaan = "Selamat Siang";
  else if (jam >= 15 && jam < 18) sapaan = "Selamat Sore";
  else if (jam >= 18 || jam < 3) sapaan = "Selamat Malam";

  // Format jam 00:00
  const jamFormat = waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const hariFormat = waktu.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      
      {/* Kiri: Ikon & Teks Sapaan */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Menggunakan path absolut, pastikan file ada di folder /public */}
        <img src="/Matahari.png" alt="Cuaca" style={{ width: '45px', height: '45px' }} />
        <div>
          <h2 style={{ margin: 0, color: '#0d3b66', fontSize: '1.7rem' }}>
            {sapaan}, {headerData.nama_target}
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '1.4rem' }}>
            {headerData.subjudul}
          </p>
        </div>
      </div>

      {/* Kanan: Jam Digital */}
      <div style={{ backgroundColor: '#0d3b66', color: 'white', padding: '10px 20px', borderRadius: '12px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', letterSpacing: '2px' }}>{jamFormat}</h1>
        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>{hariFormat}</p>
      </div>

    </div>
  );
}