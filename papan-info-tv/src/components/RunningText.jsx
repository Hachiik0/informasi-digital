import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function RunningText() {
  const [pesanList, setPesanList] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'running_text'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data().pesan);
      setPesanList(data);
    });
    return () => unsubscribe();
  }, []);

  // Jika data masih kosong atau loading, tampilkan teks default
  const teksGabungan = pesanList.length > 0 
    ? pesanList.join('    ||    ') 
    : 'Selamat Datang di Sistem Informasi Sekolah';
  
  // Rumus durasi: 0.15 detik per huruf
  const durasiAnimasi = teksGabungan.length * 0.15;

  return (
    <div style={styles.container}>
      
      {/* Label Kiri yang Statis */}
      <div style={{
        backgroundColor: 'white',
        color: '#0d3b66',
        padding: '6px 15px',
        borderRadius: '8px',
        fontWeight: '800',
        display: 'flex',
        flexDirection: 'column', 
        alignItems: 'flex-start',
        lineHeight: '1.1',
        flexShrink: 0,
        zIndex: 2,
        marginRight: '15px' // Jarak agar teks berjalan tidak menabrak label
      }}>
        <span style={{ fontSize: '1rem' }}>DUPLAY</span>
        <span style={{ fontSize: '1rem' }}>TERKINI</span>
      </div>

      {/* Pembungkus Teks Berjalan */}
      <div style={styles.marqueeWrapper}>
        <div 
          className="marquee-content" 
          style={{ 
            animationDuration: `${durasiAnimasi > 10 ? durasiAnimasi : 10}s` 
          }}
        >
          {teksGabungan}
        </div>
      </div>
      
      {/* CSS Keyframes */}
      <style>{keyframes}</style>
    </div>
  );
}

// === PENGATURAN CSS & ANIMASI ===
const keyframes = `
  @keyframes marquee-scroll {
    0% { 
      transform: translateX(0); 
    }
    100% { 
      transform: translateX(-100%); 
    }
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    padding-left: 100%; /* Memulai teks dari ujung kanan pembungkusnya */
    animation-name: marquee-scroll;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    will-change: transform;
  }
`;

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  marqueeWrapper: {
    flex: 1, // Mengambil seluruh sisa ruang di sebelah kanan label
    overflow: 'hidden',
    boxSizing: 'border-box',
    position: 'relative'
  }
};