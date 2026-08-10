import { useState } from 'react';
import TVDisplay from './components/TVDisplay';
import AdminPanel from './components/AdminPanel';

function App() {
  // State ini bertugas sebagai 'saklar'. 
  // Nilai awalnya adalah 'menu', bisa berubah menjadi 'tv' atau 'admin'
  const [modeLayar, setModeLayar] = useState('menu'); 

  // Jika saklar berada di posisi 'tv', tampilkan komponen TV
  if (modeLayar === 'tv') {
    return <TVDisplay kembalikanKeMenu={() => setModeLayar('menu')} />;
  }

  // Jika saklar berada di posisi 'admin', tampilkan komponen Admin
  if (modeLayar === 'admin') {
    return <AdminPanel kembalikanKeMenu={() => setModeLayar('menu')} />;
  }

  // Tampilan Default (Menu Utama)
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>Sistem Papan Info Digital</h1>
      <p>Silakan pilih mode untuk perangkat ini:</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
        <button 
          onClick={() => setModeLayar('tv')}
          style={{ 
            padding: '20px 40px', fontSize: '18px', cursor: 'pointer', 
            backgroundColor: '#00d9ff', color: 'white', border: 'none', borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          📺 Buka Mode TV
        </button>
        
        <button 
          onClick={() => setModeLayar('admin')}
          style={{ 
            padding: '20px 40px', fontSize: '18px', cursor: 'pointer', 
            backgroundColor: '#8d7777', color: 'white', border: 'none', borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          ⚙️ Buka Panel Admin
        </button>
      </div>
    </div>
  );
}

export default App;