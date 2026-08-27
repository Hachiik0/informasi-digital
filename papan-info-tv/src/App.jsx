import { useState } from 'react';
import TVDisplay from './components/TVDisplay';
import TVMediaFull from './components/TVMediafull'; // <--- 1. Import komponen baru
import AdminDashboard from './components/AdminPanel'; 

function App() {
  // Misal state Anda untuk memilih halaman adalah ini
  // Pilihan: 'menu', 'tv_lengkap', 'tv_media', 'admin'
  const [halamanAktif, setHalamanAktif] = useState('menu'); 

  if (halamanAktif === 'tv_lengkap') {
    return <TVDisplay kembalikanKeMenu={() => setHalamanAktif('menu')} />;
  }
  
  // 2. Tambahkan rute untuk TV Media Saja
  if (halamanAktif === 'tv_media') {
    return <TVMediaFull kembalikanKeMenu={() => setHalamanAktif('menu')} />;
  }

  if (halamanAktif === 'admin') {
    return <AdminDashboard kembaliKeTV={() => setHalamanAktif('menu')} />;
  }

  // TAMPILAN MENU UTAMA
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
      <h1>Pilih Tampilan Layar</h1>
      
      {/* Tombol 1: TV Info Lengkap */}
      <button onClick={() => setHalamanAktif('tv_lengkap')} style={btnStyle}>
        Buka TV (Papan Info Lengkap)
      </button>

      {/* Tombol 2: TV Media Saja (Baru) */}
      <button onClick={() => setHalamanAktif('tv_media')} style={{ ...btnStyle, backgroundColor: '#17a2b8' }}>
        Buka TV (Papan info Hanya Media)
      </button>

      {/* Tombol 3: Admin */}
      <button onClick={() => setHalamanAktif('admin')} style={{ ...btnStyle, backgroundColor: '#28a745' }}>
      Panel Admin
      </button>
    </div>
  );
}

const btnStyle = {
  padding: '15px 30px', backgroundColor: '#0d3b66', color: 'white', border: 'none', 
  borderRadius: '10px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold'
};

export default App;