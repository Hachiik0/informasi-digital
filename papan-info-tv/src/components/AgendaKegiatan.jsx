import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function AgendaKegiatan() {
  const [agendaList, setAgendaList] = useState([]);

  useEffect(() => {
    // Membaca data realtime dari Firestore
    const unsubscribe = onSnapshot(collection(db, 'agenda'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgendaList(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#0d3b66', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        AGENDA KEGIATAN
      </h3>
      
      <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
        {agendaList.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '1.5rem' }}>Belum ada agenda bulan ini.</p>
        ) : (
          agendaList.map((item) => (
            <div key={item.id} style={{ 
              minWidth: '200px', 
              border: '1px solid #cbd5e1', 
              borderRadius: '10px', 
              padding: '12px',
              backgroundColor: '#fff'
            }}>
              <span style={{ backgroundColor: '#0d3b66', color: 'white', padding: '3px 8px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {item.tanggal}
              </span>
              <h4 style={{ margin: '10px 0 5px 0', color: '#333' }}>{item.judul}</h4>
              <p style={{ margin: 0, fontSize: '1.2rem', color: '#666' }}>📍 {item.lokasi}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#0d3b66' }}>{item.waktu}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}