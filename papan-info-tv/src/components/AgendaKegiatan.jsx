import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function AgendaKegiatan() {
  const [agenda, setAgenda] = useState([]);

  // Mengambil data dari koleksi 'agenda_kegiatan'
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'agenda_kegiatan'), (snapshot) => {
      const dataAgenda = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAgenda(dataAgenda);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      
      {/* Bagian Judul (Ikon Kalender & Teks) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={{ fontSize: '24px', color: '#0d3b66' }}>📅</div>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0d3b66', fontWeight: 'bold' }}>AGENDA KEGIATAN</h3>
      </div>

      {/* Bagian Isi: Deretan Kotak Agenda */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '10px', flex: 1 }}>
        
        {agenda.length > 0 ? (
          agenda.map((item) => (
            // Kotak Individual Agenda
            <div key={item.id} style={{ 
              flex: '1', // Membuat kotak membagi ruang sama rata
              minWidth: '200px', // Lebar minimal agar teks tidak tergencet
              border: '2px solid #e0e0e0', 
              borderRadius: '10px', 
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              Height: '100%',
              boxSizing: 'border-box',
              justifyContent: 'space-between'
            }}>
              
              {/* Ikon Tanggal Kotak Biru */}
              <div style={{ 
                backgroundColor: '#0d3b66', 
                color: 'white', 
                borderRadius: '5px', 
                padding: '5px 10px',
                display: 'inline-block',
                width: 'fit-content',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}>
                {item.tanggal_teks}
              </div>

              {/* Judul Kegiatan */}
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>{item.nama_kegiatan}</h4>
              
              {/* Tempat */}
              <p style={{ margin: 0, color: '#777', fontSize: '0.9rem' }}>{item.tempat}</p>
              
              {/* Jam */}
              <p style={{ margin: 0, color: '#333', fontSize: '0.95rem', fontWeight: 'bold', marginTop: 'auto' }}>
                {item.jam}
              </p>
              
            </div>
          ))
        ) : (
          <p style={{ color: '#999', fontStyle: 'italic', width: '100%', textAlign: 'center' }}>Tidak ada agenda terdekat...</p>
        )}

      </div>

    </div>
  );
}