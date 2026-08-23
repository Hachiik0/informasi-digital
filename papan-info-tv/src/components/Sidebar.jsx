import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Sidebar() {
  const [daftarQuotes, setDaftarQuotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ambil data quotes secara realtime dari koleksi 'quotes'
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'quotes'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) {
        setDaftarQuotes(data);
      } else {
        // Fallback jika database quotes masih kosong
        setDaftarQuotes([{ teks: "Silakan tambahkan quotes melalui panel admin.", tokoh: "Admin" }]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Timer untuk berganti quotes setiap 15 detik
  useEffect(() => {
    if (daftarQuotes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % daftarQuotes.length);
    }, 10000); // 15 detik
    return () => clearInterval(interval);
  }, [daftarQuotes.length]);

  const quotesAktif = daftarQuotes[currentIndex] || { teks: "Memuat quotes...", tokoh: "..." };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start', 
      gap: '15px',                  
      backgroundImage: 'linear-gradient(rgba(13, 59, 102, 0.85), rgba(13, 59, 102, 0.95)), url("/latarsekolah.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '15px',
      boxSizing: 'border-box'
    }}>
      
      {/* --- KOTAK LOGO SEKOLAH --- */}
      <div style={{
        backgroundColor: 'white',
        margin: 0, 
        borderRadius: '15px', 
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0px 4px 10px rgba(0,0,0,0.15)'
      }}>
        <img src="/logo_sma.jpg" alt="Logo SMAN 2 Playen" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
        <div>
          <h2 style={{ color: '#0d3b66', margin: 0, fontSize: '1.5rem', fontWeight: '800', lineHeight: '1.3' }}>
            SMA NEGERI 2
          </h2>
          <span style={{ color: '#0d3b66', fontSize: '1.3rem', fontWeight: '800', letterSpacing: '1px' }}>
            PLAYEN
          </span>
        </div>
      </div>

      {/* --- BAGIAN QUOTES --- */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '0 20px',
        marginTop: '10px' 
      }}>
        
        {/* Label Judul */}
        <h3 style={{ color: '#ffd700', fontSize: '1.5rem', marginBottom: '10px', letterSpacing: '1px', marginLeft: '30px' }}>
          Kata kata hari ini
        </h3>

        {/* Tanda Petik Besar & Isi Quotes */}
        <div style={{ position: 'relative' }}>
          <span style={{ 
            fontSize: '6rem', 
            color: '#ffd700', 
            position: 'absolute', 
            top: '-55px',    
            left: '-15px',    
            opacity: 0.6 
          }}>
            “
          </span>
          <p style={{ 
            color: 'white', 
            fontSize: '1.4rem', 
            fontStyle: 'italic', 
            lineHeight: '1.5', 
            fontWeight: '600',
            margin: '0 0 20px 45px' 
          }}>
            {quotesAktif.teks}
          </p>
        </div>

        {/* Nama Pemilik Quotes (Posisi Kanan) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end', 
          gap: '10px', 
          marginTop: '15px' 
        }}>
          <div style={{ width: '40px', height: '2px', backgroundColor: '#ffd700' }}></div>
          <p style={{ 
            color: '#ffd700', 
            fontSize: '1.1rem', 
            fontWeight: 'bold', 
            margin: 0,
            textAlign: 'right' 
          }}>
            {quotesAktif.tokoh}
          </p>
        </div>

      </div>

    </div>
  );
}