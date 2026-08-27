import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function TVMediaFull({ kembalikanKeMenu }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [daftarMedia, setDaftarMedia] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Deteksi mode fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fungsi Toggle Fullscreen
  const handleContainerClick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  // Ambil data media
  useEffect(() => {
    let unsubscribe;
    try {
      const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        setDaftarMedia(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setCurrentIndex(0);
      });
    } catch (error) {
      unsubscribe = onSnapshot(collection(db, 'media'), (snapshot) => {
        setDaftarMedia(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setCurrentIndex(0);
      });
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const mediaAktif = daftarMedia[currentIndex];

  // LOGIKA DURASI
  useEffect(() => {
    if (daftarMedia.length <= 1) return; 

    if (mediaAktif && mediaAktif.tipe === 'image') {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % daftarMedia.length);
      }, 10000); 
      return () => clearTimeout(timer);
    }
  }, [currentIndex, daftarMedia, mediaAktif]);

  const handleVideoEnded = () => {
    if (daftarMedia.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % daftarMedia.length);
    }
  };

  if (!mediaAktif) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', color: '#fff' }}>
        <h2>Memuat Media...</h2>
        {!isFullscreen && (
          <button onClick={kembalikanKeMenu} style={styles.backBtn}>← Kembali</button>
        )}
      </div>
    );
  }

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: '#0d3b66', 
        overflow: 'hidden', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }} 
      onClick={handleContainerClick}
    >
      
      {!isFullscreen && (
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            if (kembalikanKeMenu) kembalikanKeMenu(); 
          }}
          style={styles.backBtn}
        >
          ← Kembali
        </button>
      )}

      {/* --- LAPISAN 1: WADAH BLUR (Key dipindah ke sini agar selalu dirender ulang oleh browser!) --- */}
      <div key={mediaAktif.url + '-blur-container'} style={styles.blurContainer}>
        {mediaAktif.tipe === 'video' ? (
          <video 
            src={mediaAktif.url} 
            autoPlay 
            muted 
            loop
            style={styles.blurMedia} 
          />
        ) : (
          <img 
            src={mediaAktif.url} 
            alt="Blur Background" 
            style={styles.blurMedia} 
          />
        )}
      </div>

      {/* --- LAPISAN 2: OVERLAY GELAP --- */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        zIndex: 2
      }} />

      {/* --- LAPISAN 3: MEDIA UTAMA --- */}
      {mediaAktif.tipe === 'video' ? (
        <video 
          key={mediaAktif.url + '-main'} 
          src={mediaAktif.url} 
          autoPlay 
          muted 
          onEnded={handleVideoEnded} 
          style={styles.mainMedia} 
        />
      ) : (
        <img 
          key={mediaAktif.url + '-main'}
          src={mediaAktif.url} 
          alt="Media Slideshow" 
          style={styles.mainMedia} 
        />
      )}

    </div>
  );
}

const styles = {
  backBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 9999,
    backgroundColor: 'rgba(13, 59, 102, 0.8)',
    color: 'white',
    border: '2px solid white',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.5)',
    fontSize: '1rem'
  },
  blurContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    filter: 'blur(30px) brightness(0.7)',
    WebkitFilter: 'blur(30px) brightness(0.7)', // Dukungan untuk engine browser Safari/lama
    transform: 'scale(1.15) translateZ(0)', // translateZ(0) memaksa hardware acceleration aktif!
    zIndex: 1,
    overflow: 'hidden',
    backgroundColor: '#111' 
  },
  blurMedia: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  mainMedia: {
    position: 'relative',
    width: '100%',
    height: '100%',
    objectFit: 'contain', 
    zIndex: 3, 
    boxShadow: '0px 0px 30px rgba(0,0,0,0.6)'
  }
};