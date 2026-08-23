import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import JadwalHarian from './JadwalHarian';
import AgendaKegiatan from './AgendaKegiatan';
import InfoSekolah from './InfoSekolah';
import MediaUtama from './MainMedia';
import RunningText from './RunningText';

export default function TVDisplay({ kembalikanKeMenu }) {
  // State untuk melacak apakah sedang dalam mode fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Deteksi perubahan status fullscreen (baik lewat klik atau tombol ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Fungsi untuk toggle Full Screen saat layar diklik di mana saja
  const handleContainerClick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Gagal masuk mode fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div style={styles.container} onClick={handleContainerClick}>
      
      {/* TOMBOL BACK: Hanya muncul jika TIDAK sedang fullscreen */}
      {!isFullscreen && (
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Mencegah agar klik tombol tidak memicu toggle fullscreen
            if (kembalikanKeMenu) kembalikanKeMenu();
          }}
          style={styles.backButton}
        >
          ← Kembali
        </button>
      )}

      {/* KOTAK 1: Kiri (Warna Biru Tua) */}
      <div style={styles.sidebar}>
        <Sidebar />
      </div>

      {/* KOTAK 2: Atas (Warna Putih) */}
      <div style={styles.header}>
        <Header />
      </div>      
       
      {/* KOTAK 3: Tengah (Warna Putih) */}
      <div style={styles.main}>
        <MediaUtama />
      </div>

      {/* KOTAK 4: Kanan Atas (Warna Putih) */}
      <div style={styles.rightTop}>
        <JadwalHarian />
      </div>

      {/* KOTAK 5: Bawah Tengah (Warna Putih) */}
      <div style={{ ...styles.bottomCenter, alignItems: 'flex-start' }}>
        <AgendaKegiatan />
      </div>

      {/* KOTAK 6: Kanan Bawah (Warna Biru Tua) */}
      <div style={{ ...styles.rightBottom, alignItems: 'flex-start', textAlign: 'left' }}>
        <InfoSekolah />
      </div>

      {/* KOTAK 7: Pita Bawah (Warna Biru Tua) */}
      <div style={{ ...styles.footer, padding: '0 20px' }}>
        <RunningText />
      </div>

    </div>
  );
}

// === PENGATURAN CSS ===
const styles = {
  container: {
    display: 'grid',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#f0f5fa',
    padding: '10px',
    boxSizing: 'border-box',
    gap: '10px',
    gridTemplateColumns: '25vw 1fr 25vw', 
    gridTemplateRows: '11vh 1fr 24vh 7vh', 
    gridTemplateAreas: `
      "sidebar header header"
      "sidebar main rightTop"
      "sidebar bottomCenter rightBottom"
      "footer footer footer"
    `,
    overflow: 'hidden',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
    position: 'fixed',
    top: 0,
    left: 0
  },
  
  // Gaya untuk Tombol Kembali
  backButton: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    zIndex: 9999,
    backgroundColor: '#0d3b66',
    color: 'white',
    border: '2px solid white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.3)',
    fontSize: '0.9rem'
  },

  sidebar: { gridArea: 'sidebar', borderRadius: '15px', display: 'flex', overflow: 'hidden' },
  header: { gridArea: 'header', backgroundColor: '#ffffff', borderRadius: '15px', padding: '15px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  main: { gridArea: 'main', backgroundColor: '#ffffff', borderRadius: '15px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 0, overflow: 'hidden' },
  rightTop: { gridArea: 'rightTop', backgroundColor: '#ffffff', borderRadius: '15px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  bottomCenter: { gridArea: 'bottomCenter', backgroundColor: '#ffffff', borderRadius: '15px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' },
  rightBottom: { gridArea: 'rightBottom', backgroundColor: '#0d3b66', borderRadius: '15px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  footer: { gridArea: 'footer', backgroundColor: '#0d3b66', borderRadius: '25px', padding: '5px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};