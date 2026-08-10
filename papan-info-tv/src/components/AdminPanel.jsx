import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

export default function AdminPanel({ kembalikanKeMenu }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [mediaList, setMediaList] = useState([]);

  // Kredensial Cloudinary
  const CLOUDINARY_CLOUD_NAME = 'm0mmtyoh'; 
  const CLOUDINARY_UPLOAD_PRESET = 'papan_info_preset'; 

  useEffect(() => {
    const q = query(collection(db, 'playlist_media'), orderBy('waktu_upload', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((dokumen) => {
        list.push({ id: dokumen.id, ...dokumen.data() });
      });
      setMediaList(list);
    });
    return () => unsubscribe();
  }, []);

  const tanganiPilihFile = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(''); 
      setProgress(0); 
    }
  };

  const tanganiUpload = async () => {
    if (!file) {
      setStatus('⚠️ Silakan pilih file terlebih dahulu!');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus('⏳ Sedang mengunggah file ke Cloudinary...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const uploadDenganProgress = () => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const persentase = Math.round((event.loaded / event.total) * 100);
              setProgress(persentase);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(JSON.parse(xhr.responseText).error.message || 'Gagal upload'));
            }
          };

          xhr.onerror = () => reject(new Error('Terjadi kesalahan jaringan'));
          xhr.send(formData);
        });
      };

      const dataCloudinary = await uploadDenganProgress();
      const urlFile = dataCloudinary.secure_url;
      const tipeFile = dataCloudinary.resource_type;

      await addDoc(collection(db, 'playlist_media'), {
        nama_file: file.name,
        tipe_file: tipeFile,
        url_file: urlFile,
        waktu_upload: serverTimestamp(),
      });

      setStatus('✅ Berhasil diunggah ke Cloud!');
      setFile(null);
      setProgress(0);
      document.getElementById('input-file').value = '';

    } catch (error) {
      console.error('Error saat upload:', error);
      setStatus(`❌ Gagal mengunggah: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tanganiTampilkan = async (media) => {
    try {
      await setDoc(doc(db, 'tampilan', 'layar_utama'), {
        urlMedia: media.url_file,
        tipeMedia: media.tipe_file,
        terakhirDiperbarui: serverTimestamp()
      });
      alert(`Media "${media.nama_file}" berhasil dikirim ke layar TV!`);
    } catch (error) {
      console.error("Error menampilkan media:", error);
      alert('Gagal mengirim ke layar TV.');
    }
  };

  const tanganiHapus = async (id_dokumen, nama_file) => {
    if (!window.confirm(`Yakin ingin menghapus catatan "${nama_file}"?`)) return;
    try {
      await deleteDoc(doc(db, 'playlist_media', id_dokumen));
    } catch (error) {
      alert('Gagal menghapus media.');
    }
  };

  return (
    // Tambahkan properti color: '#333' pada wadah utama agar semua teks secara default berwarna gelap
    <div style={{ padding: '20px 5%', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto', boxSizing: 'border-box', color: '#333' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        {/* Kunci warna heading agar selalu gelap */}
        <h1 style={{ margin: 0, fontSize: '24px', color: '#222' }}>⚙️ Panel Admin</h1>
        <button onClick={kembalikanKeMenu} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '4px' }}>
          Kembali
        </button>
      </div>

      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9', marginBottom: '30px', boxSizing: 'border-box' }}>
        <h3 style={{ color: '#222' }}>Unggah Media Baru</h3>
        {/* Kunci warna input file agar tetap bisa dibaca */}
        <input type="file" id="input-file" accept="image/*, video/*" onChange={tanganiPilihFile} style={{ display: 'block', marginBottom: '15px', maxWidth: '100%', color: '#333' }} />
        
        <button onClick={tanganiUpload} disabled={loading} style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: loading ? '#ccc' : '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' }}>
          {loading ? 'Mengunggah...' : 'Mulai Upload'}
        </button>
        
        {loading && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '15px', backgroundColor: '#4CAF50', transition: 'width 0.2s' }}></div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '8px', fontWeight: 'bold', color: '#555' }}>
              {progress}%
            </p>
          </div>
        )}

        {status && !loading && (
          <p style={{ marginTop: '15px', fontWeight: 'bold', color: status.includes('Gagal') ? 'red' : '#4CAF50', wordBreak: 'break-word' }}>{status}</p>
        )}
      </div>

      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', boxSizing: 'border-box' }}>
        <h3 style={{ color: '#222' }}>Daftar Media (Playlist)</h3>
        {mediaList.length === 0 ? (
          <p style={{ color: '#777' }}>Belum ada media yang diunggah.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {mediaList.map((media) => (
              <li key={media.id} style={{ 
                display: 'flex', 
                flexDirection: 'column', // Mengubah susunan menjadi atas-bawah
                gap: '12px', 
                padding: '16px', 
                border: '1px solid #eee', // Menambahkan bingkai kartu
                borderRadius: '8px',      // Membuat sudut kartu membulat
                marginBottom: '15px',     // Jarak antar kartu
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)' // Sedikit bayangan agar terlihat elegan
              }}>
                
                {/* Bagian Judul File (Di Atas) */}
                <span style={{ 
                  width: '100%', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap', 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#333' 
                }} title={media.nama_file}>
                  📄 {media.nama_file}
                </span>
                
                {/* Bagian Tombol (Di Bawah, terbagi 2 sama rata) */}
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button onClick={() => tanganiTampilkan(media)} style={{ flex: 1, backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ▶ Tampilkan
                  </button>
                  <button onClick={() => tanganiHapus(media.id, media.nama_file)} style={{ flex: 1, backgroundColor: '#f44336', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Hapus
                  </button>
                </div>

              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}