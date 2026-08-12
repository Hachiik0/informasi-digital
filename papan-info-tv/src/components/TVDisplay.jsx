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

  // Fungsi layar penuh yang diperbarui dengan dukungan lintas perangkat (Cross-Browser)
  const tanganiLayarPenuhOtomatis = () => {
    const elemen = mediaRef.current;
    
    if (elemen && !document.fullscreenElement && !document.webkitFullscreenElement) {
      // 1. Standar Modern (Desktop & Android TV)
      if (elemen.requestFullscreen) {
        elemen.requestFullscreen().catch((err) => console.error(err));
      } 
      // 2. Safari & Chrome versi lama (Banyak HP Android)
      else if (elemen.webkitRequestFullscreen) { 
        elemen.webkitRequestFullscreen();
      } 
      // 3. Khusus Video di HP iPhone / iOS
      else if (elemen.webkitEnterFullscreen) {
        elemen.webkitEnterFullscreen();
      }
      // 4. Microsoft Edge lama
      else if (elemen.msRequestFullscreen) {
        elemen.msRequestFullscreen();
      }
    }
  };

  const tanganiKembali = (e) => {
    e.stopPropagation(); 
    
    // Perintah keluar fullscreen juga diperbarui untuk lintas perangkat
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    
    kembalikanKeMenu();
  };

  return (
    <div 
      onClick={tanganiLayarPenuhOtomatis} 
      style={{ 
        backgroundColor: '#000', 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer' 
      }}
    >
      
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
        <button 
          onClick={tanganiKembali} 
          style={{ padding: '8px 15px', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Kembali
        </button>
      </div>

      {!document.fullscreenElement && !document.webkitFullscreenElement && mediaTayang && (
        <div style={{ position: 'absolute', top: '25px', right: '30px', color: 'rgba(255,255,255,0.4)', zIndex: 5, fontSize: '14px', fontWeight: 'bold' }}>
          🖱️ Ketuk layar untuk Fullscreen
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
          muted 
          playsInline 
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