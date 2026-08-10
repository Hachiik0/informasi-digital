import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function TVDisplay({ kembalikanKeMenu }) {
  const [mediaTayang, setMediaTayang] = useState(null);
  const mediaRef = useRef(null); 

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'tampilan', 'layar_utama'), (dokumen) => {
      if (dokumen.exists()) {
        setMediaTayang(dokumen.data());
      }
    });

    return () => unsubscribe();
  }, []);

  // Fungsi: Cukup klik di mana saja untuk masuk ke mode layar penuh
  const tanganiLayarPenuhOtomatis = () => {
    if (mediaRef.current && !document.fullscreenElement) {
      mediaRef.current.requestFullscreen().catch((err) => {
        console.error(`Gagal masuk mode layar penuh: ${err.message}`);
      });
    }
  };

  const tanganiKembali = (e) => {
    e.stopPropagation(); // Mencegah klik tombol "Kembali" memicu layar penuh
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
    kembalikanKeMenu();
  };

  return (
    <div 
      onClick={tanganiLayarPenuhOtomatis} /* Seluruh layar kini berfungsi sebagai tombol fullscreen */
      style={{ 
        backgroundColor: '#000', 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer' // Kursor berubah jadi tanda klik agar operator tahu
      }}
    >
      
      {/* Tombol Navigasi */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
        <button 
          onClick={tanganiKembali} 
          style={{ padding: '8px 15px', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Kembali
        </button>
      </div>

      {/* Teks Petunjuk Bantuan (hanya muncul jika belum fullscreen) */}
      {!document.fullscreenElement && mediaTayang && (
        <div style={{ position: 'absolute', top: '25px', right: '30px', color: 'rgba(255,255,255,0.4)', zIndex: 5, fontSize: '14px', fontWeight: 'bold' }}>
          🖱️ Ketuk layar di mana saja untuk Fullscreen
        </div>
      )}

      {!mediaTayang ? (
        <h2 style={{ color: '#444' }}>Mencari sinyal tayangan...</h2>
      ) : mediaTayang.tipeMedia === 'video' ? (
        <video 
          ref={mediaRef} 
          src={mediaTayang.urlMedia} 
          autoPlay 
          loop 
          muted /* Ini kuncinya: Video menjadi bisu sehingga otomatis berputar tanpa diblokir browser */
          playsInline /* Best practice agar lancar di browser TV/Mobile */
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', pointerEvents: 'none' }}
        />
      ) : (
        <img 
          ref={mediaRef} 
          src={mediaTayang.urlMedia} 
          alt="Tayangan TV"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', pointerEvents: 'none' }}
        />
      )}

    </div>
  );
}