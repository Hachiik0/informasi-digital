import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function TVDisplay({ kembalikanKeMenu }) {
  const [mediaTayang, setMediaTayang] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'tampilan', 'layar_utama'), (dokumen) => {
      if (dokumen.exists()) {
        setMediaTayang(dokumen.data());
      }
    });

    return () => unsubscribe();
  }, []);

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
      
      <button 
        onClick={kembalikanKeMenu} 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          padding: '8px 15px', 
          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 10,
          fontWeight: 'bold'
        }}
      >
        ← Kembali
      </button>

      {!mediaTayang ? (
        <h2 style={{ color: '#444' }}>Mencari sinyal tayangan...</h2>
      ) : mediaTayang.tipeMedia === 'video' ? (
        <video 
          src={mediaTayang.urlMedia} 
          autoPlay 
          loop 
          controls /* <--- Tambahan kata kunci 'controls' agar muncul tombol play/pause */
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      ) : (
        <img 
          src={mediaTayang.urlMedia} 
          alt="Tayangan TV"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      )}

    </div>
  );
}