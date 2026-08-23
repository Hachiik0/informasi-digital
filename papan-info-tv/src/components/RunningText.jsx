import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function RunningText() {
  const [teksJalan, setTeksJalan] = useState("Memuat informasi terkini...");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'running_text'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data().pesan);
      if (data.length > 0) {
        setTeksJalan(data.join("   ||   "));
      } else {
        setTeksJalan("Selamat datang di SMAN 2 Playen. Tetap semangat belajar!");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center',
      overflow: 'hidden', 
      position: 'relative'
    }}>
      
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
        zIndex: 2
      }}>
        <span style={{ fontSize: '1rem' }}>DUPLAY</span>
        <span style={{ fontSize: '1rem' }}>TERKINI</span>
      </div>

      {/* Area Teks yang Berjalan */}
      <div style={{
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        marginLeft: '20px'
      }}>
        
        <div style={{
          display: 'inline-block',
          animation: 'berjalan 25s linear infinite',
          color: 'white',
          fontSize: '30px',
          fontWeight: '500',
          position: 'absolute',
          willChange: 'transform'
        }}>
          {teksJalan}
        </div>
        
        <style>
          {`
            @keyframes berjalan {
              0% { transform: translateX(100vw); }
              100% { transform: translateX(-100%); }
            }
          `}
        </style>
        
      </div>

    </div>
  );
}