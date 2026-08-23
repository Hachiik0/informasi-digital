import React from 'react';

export default function InfoSekolah() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ backgroundColor: 'white', color: '#0d3b66', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '12px' }}>
          i
        </div>
        <h3 style={{ margin: 0, color: 'white', fontSize: '1rem', letterSpacing: '1px' }}>INFO SEKOLAH</h3>
      </div>

      {/* Konten Utama (Bagi Dua Kolom) */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1, marginTop: '10px' }}>
        
        {/* Kolom Kiri: Memuat Gambar QR Code JPG */}
        <div style={{ 
          width: '150px', 
          height: '150px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '5px',
          flexShrink: 0,
          boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }}>
          <img 
            src="/QRSOSMED.png" 
            alt="QR Code Info Sekolah" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>

        {/* Kolom Kanan: Teks Ajakan & Ikon Medsos */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ color: 'white', margin: 0, fontSize: '1,5rem', lineHeight: '1.4', fontWeight: '500' }}>
            Ikuti informasi terbaru sekolah melalui website dan media sosial resmi kami.
          </p>
          
         {/* Ikon Medsos dengan Gambar Sendiri */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
             
             {/* Ikon Website */}
             <img 
               src="/web.png" 
               alt="Website" 
               style={{ width: '40px', height: '25px', objectFit: 'contain' }} 
             />
             
             {/* Ikon Instagram */}
             <img 
               src="/instagram.png" 
               alt="Instagram" 
               style={{ width: '40px', height: '25px', objectFit: 'contain' }} 
             />
             
             {/* Ikon YouTube */}
             <img 
               src="/Youtube.png" 
               alt="YouTube" 
               style={{ width: '40px', height: '25px', objectFit: 'contain' }} 
             />
             
          </div>
        </div>

      </div>

    </div>
  );
}