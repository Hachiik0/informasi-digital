import { useState, useEffect } from 'react';
import { signInAnonymously } from 'firebase/auth';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc as firestoreDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function AdminDashboard({ kembaliKeTV }) {
  // State untuk Keamanan Password Admin
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState("");

  // Tab aktif di admin (langsung default ke header)
  const [activeTab, setActiveTab] = useState('header');

  // State untuk List Data
  const [quotesList, setQuotesList] = useState([]);
  const [runningTextList, setRunningTextList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
  const [mediaList, setMediaList] = useState([]);

  // Form input sementara untuk Header
  const [namaTargetHeader, setNamaTargetHeader] = useState("");
  const [subjudulHeader, setSubjudulHeader] = useState("");

  // Form input sementara untuk Quotes
  const [quotesTeks, setQuotesTeks] = useState("");
  const [quotesTokoh, setQuotesTokoh] = useState("");

  // Form input sementara untuk Running Text
  const [pesanRunningText, setPesanRunningText] = useState("");

  // Form input sementara untuk Jadwal
  const [mapelBaru, setMapelBaru] = useState("");
  const [kelasBaru, setKelasBaru] = useState("");
  const [hariBaru, setHariBaru] = useState("Senin");
  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");

  // Form input sementara untuk Agenda
  const [judulAgenda, setJudulAgenda] = useState("");
  const [tanggalAgenda, setTanggalAgenda] = useState("");
  const [lokasiAgenda, setLokasiAgenda] = useState("");
  const [waktuAgenda, setWaktuAgenda] = useState("");

  // Form input sementara untuk Media & Cloudinary 
  const [urlMedia, setUrlMedia] = useState("");
  const [tipeMedia, setTipeMedia] = useState("image");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 

  const [statusSimpan, setStatusSimpan] = useState("");

  // Fungsi Login Admin
  
const handleLogin = async (e) => {
  e.preventDefault();

  if (inputPassword !== "wasd99") {
    setErrorLogin("❌ Password salah! Silakan coba lagi.");
    return;
  }

  try {
    await signInAnonymously(auth);
    setIsLoggedIn(true);
    setErrorLogin("");
  } catch (error) {
    console.error("Autentikasi Firebase gagal:", error);
    setErrorLogin("❌ Gagal terhubung ke Firebase.");
  }
};

  // Ambil semua data saat sudah berhasil login
  useEffect(() => {
    if (isLoggedIn) {
      ambilQuotes();
      ambilRunningText();
      ambilJadwal();
      ambilAgenda();
      ambilMedia();
    }
  }, [isLoggedIn]);

  const ambilQuotes = async () => {
    const snapshot = await getDocs(collection(db, 'quotes'));
    setQuotesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const ambilRunningText = async () => {
    const snapshot = await getDocs(collection(db, 'running_text'));
    setRunningTextList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const ambilJadwal = async () => {
    const snapshot = await getDocs(collection(db, 'jadwal_harian'));
    setJadwalList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const ambilAgenda = async () => {
    const snapshot = await getDocs(collection(db, 'agenda'));
    setAgendaList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const ambilMedia = async () => {
    try {
      const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setMediaList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      const snapshot = await getDocs(collection(db, 'media'));
      setMediaList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  };

  // --- KELOLA HEADER ---
  const handleSimpanHeader = async (e) => {
    e.preventDefault();
    try {
      await setDoc(firestoreDoc(db, 'pengaturan', 'header'), {
        nama_target: namaTargetHeader,
        subjudul: subjudulHeader
      });
      setNamaTargetHeader("");
      setSubjudulHeader("");
      setStatusSimpan("Teks Header berhasil diperbarui!");
      setTimeout(() => setStatusSimpan(""), 3000);
    } catch (error) { console.error(error); }
  };

  // --- TAMBAH & HAPUS QUOTES ---
  const handleTambahQuotes = async (e) => {
    e.preventDefault();
    if (!quotesTeks || !quotesTokoh) return;
    try {
      await addDoc(collection(db, 'quotes'), { teks: quotesTeks, tokoh: quotesTokoh });
      setQuotesTeks(""); setQuotesTokoh("");
      ambilQuotes();
      setStatusSimpan("Quotes berhasil ditambahkan! 💬");
      setTimeout(() => setStatusSimpan(""), 3000);
    } catch (error) { console.error(error); }
  };

  const handleHapusQuotes = async (id) => {
    try {
      await deleteDoc(firestoreDoc(db, 'quotes', id));
      ambilQuotes();
    } catch (error) { console.error(error); }
  };

  // --- TAMBAH & HAPUS RUNNING TEXT ---
  const handleTambahRunningText = async (e) => {
    e.preventDefault();
    if (!pesanRunningText) return;
    try {
      await addDoc(collection(db, 'running_text'), { pesan: pesanRunningText });
      setPesanRunningText("");
      ambilRunningText();
      setStatusSimpan("Running text berhasil ditambahkan! 🏃‍♂️");
      setTimeout(() => setStatusSimpan(""), 3000);
    } catch (error) { console.error(error); }
  };

  const handleHapusRunningText = async (id) => {
    try {
      await deleteDoc(firestoreDoc(db, 'running_text', id));
      ambilRunningText();
    } catch (error) { console.error(error); }
  };

  // --- TAMBAH & HAPUS JADWAL ---
  const handleTambahJadwal = async (e) => {
    e.preventDefault();
    if (!mapelBaru || !kelasBaru || !hariBaru || !jamMulai || !jamSelesai) {
      setStatusSimpan("⚠️ Semua kolom harus diisi!");
      return;
    }
    const regexJam = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regexJam.test(jamMulai) || !regexJam.test(jamSelesai)) {
      setStatusSimpan("❌ Format jam salah! Gunakan format HH:MM (Contoh: 07:30)");
      setTimeout(() => setStatusSimpan(""), 4000);
      return;
    }
    try {
      await addDoc(collection(db, 'jadwal_harian'), { 
        mata_pelajaran: mapelBaru, kelas: kelasBaru, hari: hariBaru, jam_mulai: jamMulai, jam_selesai: jamSelesai 
      });
      setMapelBaru(""); setKelasBaru(""); setJamMulai(""); setJamSelesai("");
      ambilJadwal();
      setStatusSimpan("Jadwal berhasil ditambahkan!");
      setTimeout(() => setStatusSimpan(""), 3000);
    } catch (error) { console.error(error); }
  };

  const handleHapusJadwal = async (id) => {
    try {
      await deleteDoc(firestoreDoc(db, 'jadwal_harian', id));
      ambilJadwal();
    } catch (error) { console.error(error); }
  };

  // --- TAMBAH & HAPUS AGENDA ---
  const handleTambahAgenda = async (e) => {
    e.preventDefault();
    if (!judulAgenda || !tanggalAgenda) return;
    try {
      await addDoc(collection(db, 'agenda'), { judul: judulAgenda, tanggal: tanggalAgenda, lokasi: lokasiAgenda, waktu: waktuAgenda });
      setJudulAgenda(""); setTanggalAgenda(""); setLokasiAgenda(""); setWaktuAgenda("");
      ambilAgenda();
      setStatusSimpan("Agenda berhasil ditambahkan!");
      setTimeout(() => setStatusSimpan(""), 3000);
    } catch (error) { console.error(error); }
  };

  const handleHapusAgenda = async (id) => {
    try {
      await deleteDoc(firestoreDoc(db, 'agenda', id));
      ambilAgenda();
    } catch (error) { console.error(error); }
  };

  // --- FUNGSI UPLOAD CLOUDINARY DENGAN PROGRESS BAR PERSENTASE ---
  const handleUploadCloudinary = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    setStatusSimpan("⏳ Sedang mengunggah file...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "papan_info_preset"); 

    const resourceType = file.type.startsWith('video') ? 'video' : 'image';
    const cloudName = "m0mmtyoh"; 

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.secure_url) {
          setUrlMedia(data.secure_url);
          setTipeMedia(resourceType === 'video' ? 'video' : 'image');
          setStatusSimpan("Berhasil diunggah! Klik 'Simpan Media' di bawah.");
          setTimeout(() => setStatusSimpan(""), 4000);
        }
      } else {
        setStatusSimpan("❌ Gagal mengunggah ke Cloudinary.");
        setTimeout(() => setStatusSimpan(""), 4000);
      }
    };
    xhr.onerror = () => {
      setIsUploading(false);
      setStatusSimpan("❌ Terjadi kesalahan jaringan saat upload.");
      setTimeout(() => setStatusSimpan(""), 4000);
    };
    xhr.send(formData);
  };

  const handleTambahMedia = async (e) => {
    e.preventDefault();
    if (!urlMedia) return;
    try {
      await addDoc(collection(db, 'media'), { 
        url: urlMedia, tipe: tipeMedia, createdAt: serverTimestamp() 
      });
      setUrlMedia("");
      ambilMedia();
      setStatusSimpan("Media berhasil disimpan ke TV!");
      setTimeout(() => setStatusSimpan(""), 3000);
    } catch (error) { console.error(error); }
  };

  const handleHapusMedia = async (id) => {
    try {
      await deleteDoc(firestoreDoc(db, 'media', id));
      ambilMedia();
    } catch (error) { console.error(error); }
  };

  // JIKA BELUM LOGIN
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0d3b66', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', width: '100%', maxWidth: '400px', boxShadow: '0px 8px 24px rgba(0,0,0,0.2)', textAlign: 'center' }}>
          <h2 style={{ color: '#0d3b66', marginBottom: '10px' }}>🔐 Admin Login</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '25px' }}>Masukkan password untuk mengakses panel admin.</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="password" placeholder="Masukkan Password..." value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' }} autoFocus />
            <button type="submit" style={{ backgroundColor: '#0d3b66', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Masuk</button>
          </form>
          {errorLogin && ( <p style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '15px', fontWeight: 'bold' }}>{errorLogin}</p> )}
          <button onClick={kembaliKeTV} style={{ backgroundColor: 'transparent', color: '#666', border: 'none', marginTop: '20px', cursor: 'pointer', textDecoration: 'underline' }}>← Kembali ke Tampilan TV</button>
        </div>
      </div>
    );
  }

  // JIKA SUDAH LOGIN
  return (
    <div style={{ padding: '30px', maxWidth: '950px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>

      {/* Header Admin */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '15px' }}>
        <h2 style={{ color: '#0d3b66', margin: 0 }}>⚙️ Dashboard Admin TV Sekolah</h2>
        <button onClick={kembaliKeTV} style={{ backgroundColor: '#0d3b66', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Kembali ke TV →
        </button>
      </div>

      {statusSimpan && (
        <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: statusSimpan.includes('❌') || statusSimpan.includes('⚠️') ? '#f8d7da' : '#d4edda', color: statusSimpan.includes('❌') || statusSimpan.includes('⚠️') ? '#721c24' : '#155724', borderRadius: '8px', fontWeight: 'bold' }}>
          {statusSimpan}
        </div>
      )}

      {/* Navigasi Tab (Kelola Header pindah ke urutan 1) */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('header')} style={tabStyle(activeTab === 'header')}>Kelola Header</button>
        <button onClick={() => setActiveTab('quotes')} style={tabStyle(activeTab === 'quotes')}>Kelola Quotes</button>
        <button onClick={() => setActiveTab('runningText')} style={tabStyle(activeTab === 'runningText')}>Kelola Running Text</button>
        <button onClick={() => setActiveTab('jadwal')} style={tabStyle(activeTab === 'jadwal')}>Kelola Jadwal</button>
        <button onClick={() => setActiveTab('agenda')} style={tabStyle(activeTab === 'agenda')}>Kelola Agenda</button>
        <button onClick={() => setActiveTab('media')} style={tabStyle(activeTab === 'media')}>Kelola Media</button>
      </div>

      {/* TAB 1: KELOLA HEADER */}
      {activeTab === 'header' && (
        <div style={boxStyle}>
          <h3>📝 Kelola Teks Header Layar TV</h3>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Kata "Selamat Pagi/Siang/Malam" akan otomatis menyesuaikan jam.</p>
          <form onSubmit={handleSimpanHeader} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Nama Sapaan (Contoh: Warga SMA N 2 Playen) :</label>
              <input type="text" placeholder="Masukkan nama sapaan..." value={namaTargetHeader} onChange={(e) => setNamaTargetHeader(e.target.value)} style={{ ...inputStyle, width: '100%', marginTop: '5px' }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Teks Subjudul (Kata-kata penyemangat) :</label>
              <input type="text" placeholder="Semangat belajar hari ini..." value={subjudulHeader} onChange={(e) => setSubjudulHeader(e.target.value)} style={{ ...inputStyle, width: '100%', marginTop: '5px' }} />
            </div>
            <button type="submit" style={btnPrimaryStyle}>Simpan Header</button>
          </form>
        </div>
      )}

      {/* TAB 2: KELOLA QUOTES */}
      {activeTab === 'quotes' && (
        <div style={boxStyle}>
          <h3>💬 Kelola Daftar Quotes (Berganti Otomatis)</h3>
          <form onSubmit={handleTambahQuotes} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
            <textarea rows="2" placeholder="Isi kalimat quotes..." value={quotesTeks} onChange={(e) => setQuotesTeks(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Nama Tokoh / Sumber (Contoh: Albert Einstein)" value={quotesTokoh} onChange={(e) => setQuotesTokoh(e.target.value)} style={inputStyle} />
            <button type="submit" style={btnPrimaryStyle}>Tambah Quotes</button>
          </form>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {quotesList.map((item) => (
              <li key={item.id} style={liStyle}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontStyle: 'italic' }}>"{item.teks}"</p>
                  <small style={{ fontWeight: 'bold', color: '#555' }}>— {item.tokoh}</small>
                </div>
                <button onClick={() => handleHapusQuotes(item.id)} style={btnDangerStyle}>Hapus</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TAB 3: KELOLA RUNNING TEXT */}
      {activeTab === 'runningText' && (
        <div style={boxStyle}>
          <h3>🏃‍♂️ Kelola Daftar Running Text</h3>
          <form onSubmit={handleTambahRunningText} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <input type="text" placeholder="Masukkan teks pengumuman baru..." value={pesanRunningText} onChange={(e) => setPesanRunningText(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <button type="submit" style={btnPrimaryStyle}>Tambah Teks</button>
          </form>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {runningTextList.map((item) => (
              <li key={item.id} style={liStyle}>
                <span>{item.pesan}</span>
                <button onClick={() => handleHapusRunningText(item.id)} style={btnDangerStyle}>Hapus</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TAB 4: KELOLA JADWAL */}
      {activeTab === 'jadwal' && (
        <div style={boxStyle}>
          <h3>📚 Kelola Jadwal Harian</h3>
          <form onSubmit={handleTambahJadwal} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Nama Mapel" value={mapelBaru} onChange={(e) => setMapelBaru(e.target.value)} style={{ flex: 2, ...inputStyle }} />
            <input type="text" placeholder="Kelas (Contoh: X-A)" value={kelasBaru} onChange={(e) => setKelasBaru(e.target.value)} style={{ flex: 1, ...inputStyle }} />
            <select value={hariBaru} onChange={(e) => setHariBaru(e.target.value)} style={{ flex: 1, ...inputStyle }}>
              <option value="Senin">Senin</option><option value="Selasa">Selasa</option><option value="Rabu">Rabu</option><option value="Kamis">Kamis</option><option value="Jumat">Jumat</option><option value="Sabtu">Sabtu</option><option value="Minggu">Minggu</option>
            </select>
            <input type="text" placeholder="Mulai (07:30)" value={jamMulai} onChange={(e) => setJamMulai(e.target.value)} style={{ flex: 1, ...inputStyle }} maxLength={5} />
            <input type="text" placeholder="Selesai (08:15)" value={jamSelesai} onChange={(e) => setJamSelesai(e.target.value)} style={{ flex: 1, ...inputStyle }} maxLength={5} />
            <button type="submit" style={btnPrimaryStyle}>Tambah</button>
          </form>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {jadwalList.map((item) => (
              <li key={item.id} style={liStyle}>
                <span><b>{item.mata_pelajaran}</b> (Kelas: {item.kelas || '-'}) | Hari: <b>{item.hari || 'Senin'}</b> | {item.jam_mulai} - {item.jam_selesai}</span>
                <button onClick={() => handleHapusJadwal(item.id)} style={btnDangerStyle}>Hapus</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TAB 5: KELOLA AGENDA */}
      {activeTab === 'agenda' && (
        <div style={boxStyle}>
          <h3>🗓️ Kelola Agenda Kegiatan</h3>
          <form onSubmit={handleTambahAgenda} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <input type="text" placeholder="Judul Agenda (Contoh: Rapat OSIS)" value={judulAgenda} onChange={(e) => setJudulAgenda(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Tanggal (Contoh: 18 MEI)" value={tanggalAgenda} onChange={(e) => setTanggalAgenda(e.target.value)} style={{ flex: 1, ...inputStyle }} />
              <input type="text" placeholder="Waktu (Contoh: 13:00 WIB)" value={waktuAgenda} onChange={(e) => setWaktuAgenda(e.target.value)} style={{ flex: 1, ...inputStyle }} />
            </div>
            <input type="text" placeholder="Lokasi (Contoh: Ruang Rapat)" value={lokasiAgenda} onChange={(e) => setLokasiAgenda(e.target.value)} style={inputStyle} />
            <button type="submit" style={btnPrimaryStyle}>Tambah Agenda</button>
          </form>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {agendaList.map((item) => (
              <li key={item.id} style={liStyle}>
                <div>
                  <b>{item.judul}</b> ({item.tanggal} - {item.waktu})<br/>
                  <small style={{ color: '#666' }}>📍 {item.lokasi}</small>
                </div>
                <button onClick={() => handleHapusAgenda(item.id)} style={btnDangerStyle}>Hapus</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TAB 6: KELOLA MEDIA */}
      {activeTab === 'media' && (
        <div style={boxStyle}>
          <h3>Kelola Media Slideshow</h3>
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#eef2f5', borderRadius: '8px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#0d3b66' }}>📤 Upload File dari Perangkat:</label>
            <input type="file" accept="image/*,video/*" onChange={handleUploadCloudinary} style={{ fontSize: '0.9rem', marginBottom: '10px' }} />
            
            {isUploading && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 'bold', color: '#0d3b66' }}>
                  <span>Mengunggah file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#cbd5e1', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, backgroundColor: '#28a745', height: '100%', transition: 'width 0.2s ease' }} />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleTambahMedia} style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Masukkan URL atau hasil upload otomatis..." value={urlMedia} onChange={(e) => setUrlMedia(e.target.value)} style={{ flex: 2, ...inputStyle }} />
            <select value={tipeMedia} onChange={(e) => setTipeMedia(e.target.value)} style={{ flex: 1, ...inputStyle }}>
              <option value="image">Gambar (Image)</option>
              <option value="video">Video</option>
            </select>
            <button type="submit" style={btnPrimaryStyle}>Simpan Media</button>
          </form>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {mediaList.map((item) => (
              <li key={item.id} style={liStyle}>
                <div>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginRight: '10px' }}>{item.tipe}</span>
                  <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#0d3b66', wordBreak: 'break-all' }}>{item.url}</a>
                </div>
                <button onClick={() => handleHapusMedia(item.id)} style={btnDangerStyle}>Hapus</button>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

const tabStyle = (isActive) => ({
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold',
  backgroundColor: isActive ? '#0d3b66' : '#ddd',
  color: isActive ? '#fff' : '#333'
});

const boxStyle = {
  backgroundColor: '#fff',
  padding: '25px',
  borderRadius: '15px',
  boxShadow: '0px 4px 12px rgba(0,0,0,0.05)'
};

const inputStyle = {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  boxSizing: 'border-box'
};

const btnPrimaryStyle = {
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const btnDangerStyle = {
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  padding: '5px 10px',
  borderRadius: '4px',
  cursor: 'pointer'
};

const liStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '12px',
  borderBottom: '1px solid #eee',
  alignItems: 'center',
  gap: '10px'
};