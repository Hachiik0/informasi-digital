import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

export default function AdminPanel({ kembalikanKeMenu }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // State baru untuk menyimpan angka persentase
  const [mediaList, setMediaList] = useState([]);

  // Menggunakan konfigurasi yang sudah Anda temukan sebelumnya
  const CLOUDINARY_CLOUD_NAME = 'm0mmtyoh'; 
  const CLOUDINARY_UPLOAD_PRESET = 'papan_info_preset'; // Pastikan nama ini sesuai dengan preset Unsigned yang Anda buat

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
      setProgress(0); // Reset angka saat memilih file baru
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

      // Kita bungkus XMLHttpRequest dalam Promise agar rapi
      const uploadDenganProgress = () => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`);

          // Ini adalah fungsi radar pelacak persentasenya
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

      // Proses pengiriman berjalan di sini dan ditunggu sampai 100%
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
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>⚙️ Panel Admin</h1>
        <button onClick={kembalikanKeMenu} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '4px' }}>
          Kembali
        </button>
      </div>

      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9', marginBottom: '30px' }}>
        <h3>Unggah Media Baru</h3>
        <input type="file" id="input-file" accept="image/*, video/*" onChange={tanganiPilihFile} style={{ display: 'block', marginBottom: '15px' }} />
        
        <button onClick={tanganiUpload} disabled={loading} style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: loading ? '#ccc' : '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          {loading ? 'Mengunggah...' : 'Mulai Upload'}
        </button>
        
        {/* Tampilan Progress Bar */}
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
          <p style={{ marginTop: '15px', fontWeight: 'bold', color: status.includes('Gagal') ? 'red' : '#4CAF50' }}>{status}</p>
        )}
      </div>

      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
        <h3>Daftar Media (Playlist)</h3>
        {mediaList.length === 0 ? (
          <p style={{ color: '#777' }}>Belum ada media yang diunggah.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {mediaList.map((media) => (
              <li key={media.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px', fontWeight: 'bold' }} title={media.nama_file}>
                  {media.nama_file}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => tanganiTampilkan(media)} style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ▶ Tampilkan di TV
                  </button>
                  <button onClick={() => tanganiHapus(media.id, media.nama_file)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
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