import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function TVDisplay({ kembalikanKeMenu }) {
  const [mediaTayang, setMediaTayang] = useState(null);
  // Tambahan: useRef untuk menargetkan elemen media secara spesifik
  const mediaRef = useRef(null); 

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'tampilan', 'layar_utama'), (dokumen) => {
      if (dokumen.exists()) {
        setMediaTayang(dokumen.data());
      }
    });

    return () => unsubscribe();
  }, []);

  // Fungsi layar penuh yang HANYA menargetkan mediaRef
  const tanganiLayarPenuh = () => {
    if (mediaRef.current) {
      if (!document.fullscreenElement) {
        mediaRef.current.requestFullscreen().catch((err) => {
          console.error(`Gagal masuk mode layar penuh: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  // Fungsi khusus untuk kembali ke menu dan memastikan fullscreen mati
  const tanganiKembali = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
    kembalikanKeMenu();
  };

  return (
    <div style={{ 
      backgroundColor: '#000', 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Wadah Navigasi */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', gap: '10px' }}>
        <button 
          onClick={tanganiKembali} 
          style={{ padding: '8px 15px', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Kembali
        </button>
        
        <button 
          onClick={tanganiLayarPenuh} 
          style={{ padding: '8px 15px', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ⛶ Fullscreen Media
        </button>
      </div>

      {!mediaTayang ? (
        <h2 style={{ color: '#444' }}>Mencari sinyal tayangan...</h2>
      ) : mediaTayang.tipeMedia === 'video' ? (
        <video 
          ref={mediaRef} /* Menyisipkan ref ke video */
          src={mediaTayang.urlMedia} 
          autoPlay 
          loop 
          controls
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      ) : (
        <img 
          ref={mediaRef} /* Menyisipkan ref ke gambar */
          src={mediaTayang.urlMedia} 
          alt="Tayangan TV"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      )}

    </div>
  );
}