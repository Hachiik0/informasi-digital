import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function MediaTV() {
  const [daftarMedia, setDaftarMedia] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('16 / 9');

  // Ambil data media secara realtime dari Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'media'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDaftarMedia(data);
      setCurrentIndex(0);
    });
    return () => unsubscribe();
  }, []);

  const mediaAktif = daftarMedia[currentIndex];

  // Logika Timer: Foto 10 detik, Video sampai selesai
  useEffect(() => {
    if (daftarMedia.length <= 1) return;
    
    if (mediaAktif && mediaAktif.tipe === 'image') {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % daftarMedia.length);
      }, 10000); // 10 detik untuk foto
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, daftarMedia]);

  const handleVideoEnded = () => {
    if (daftarMedia.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % daftarMedia.length);
    }
  };

  const handleMediaLoad = (width, height) => {
    if (width && height) {
      setAspectRatio(`${width} / ${height}`);
    }
  };

  if (!mediaAktif) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d3b66', color: '#fff', borderRadius: '15px' }}>
        <p>Belum ada media ditampilkan</p>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#0d3b66', // Warna dasar biru tema sekolah
      borderRadius: '15px', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* 1. LATAR BELAKANG BLUR DENGAN FILTER WARNA BIRU */}
      {mediaAktif.tipe === 'video' ? (
        <video 
          key={mediaAktif.url + '-blur'} 
          src={mediaAktif.url} 
          autoPlay 
          muted 
          loop
          style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            // Memberikan efek blur kuat sekaligus overlay warna biru
            filter: 'blur(25px) brightness(0.5) hue-rotate(180deg)', 
            transform: 'scale(1.2)',
            zIndex: 1 
          }} 
        />
      ) : (
        <img 
          src={mediaAktif.url} 
          alt="Background Blur" 
          style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            // Memberikan efek blur kuat sekaligus penyesuaian nuansa biru
            filter: 'blur(25px) brightness(0.5) hue-rotate(180deg)', 
            transform: 'scale(1.2)',
            zIndex: 1 
          }} 
        />
      )}

      {/* Lapisan transparan warna biru agar efek blur-nya menyatu dengan tema sekolah */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(13, 59, 102, 0.4)', // Overlay biru transparan (#0d3b66)
        zIndex: 2
      }} />

      {/* 2. KOTAK MEDIA UTAMA DI TENGAH */}
      <div style={{ 
        position: 'relative',
        maxWidth: '100%',
        maxHeight: '100%',
        aspectRatio: aspectRatio, 
        transition: 'aspect-ratio 0.5s ease-in-out', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        zIndex: 3 // Berada di atas latar belakang blur & overlay biru
      }}>
        {mediaAktif.tipe === 'video' ? (
          <video 
            key={mediaAktif.url + '-main'} 
            src={mediaAktif.url} 
            autoPlay 
            muted 
            onEnded={handleVideoEnded} 
            onLoadedMetadata={(e) => handleMediaLoad(e.target.videoWidth, e.target.videoHeight)}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain', 
              display: 'block' 
            }} 
          />
        ) : (
          <img 
            src={mediaAktif.url} 
            alt="Media Sekolah" 
            onLoad={(e) => handleMediaLoad(e.target.naturalWidth, e.target.naturalHeight)}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain', 
              display: 'block' 
            }} 
          />
        )}
      </div>

    </div>
  );
}