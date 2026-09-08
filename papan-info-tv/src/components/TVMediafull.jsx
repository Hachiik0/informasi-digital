import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const isYouTube = (url) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function TVMediaFull({ kembalikanKeMenu }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [daftarMedia, setDaftarMedia] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isWidescreen, setIsWidescreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // State untuk auto-hide kontrol tombol setelah 10 detik tanpa pergerakan
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef(null);

  const ytPlayerRef = useRef(null);
  const ytContainerRef = useRef(null);
  const videoElementRef = useRef(null);

  // -------------------------------------------------------------
  // FITUR WAKE LOCK: Mencegah TV Sleep / Layar Mati Otomatis
  // -------------------------------------------------------------
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.warn(`Wake Lock tidak dapat diaktifkan: ${err.message}`);
      }
    };

    requestWakeLock();

    // Pastikan layar tetap tertahan saat tab kembali fokus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock !== null) {
        wakeLock.release().catch(() => {});
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Deteksi mode fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Logika Auto-Hide Kontrol (10 Detik Tidak Ada Aktivitas)
  useEffect(() => {
    const resetTimer = () => {
      setShowControls(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 10000);
    };

    resetTimer();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('keydown', resetTimer);

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  const handleContainerClick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  // Muat script YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Ambil data media dari Firebase
  useEffect(() => {
    let unsubscribe;
    try {
      const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        setDaftarMedia(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setCurrentIndex(0);
      });
    } catch (error) {
      unsubscribe = onSnapshot(collection(db, 'media'), (snapshot) => {
        setDaftarMedia(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setCurrentIndex(0);
      });
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const nextMedia = () => {
    setDaftarMedia((currentList) => {
      if (currentList.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % currentList.length);
      }
      return currentList;
    });
  };

  const mediaAktif = daftarMedia[currentIndex];

  // Inisialisasi YouTube Player
  useEffect(() => {
    const ytID = mediaAktif && mediaAktif.tipe === 'video' && isYouTube(mediaAktif.url)
      ? getYouTubeID(mediaAktif.url)
      : null;

    if (!ytID) {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch (e) {}
        ytPlayerRef.current = null;
      }
      return;
    }

    const initPlayer = () => {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch (e) {}
      }

      if (window.YT && window.YT.Player && ytContainerRef.current) {
        ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
          videoId: ytID,
          playerVars: {
            autoplay: 1,
            mute: isMuted ? 1 : 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1
          },
          events: {
            onReady: (event) => {
              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
              }
              event.target.playVideo();
            },
            onStateChange: (event) => {
              if (event.data === 0) {
                nextMedia();
              }
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch (e) {}
        ytPlayerRef.current = null;
      }
    };
  }, [currentIndex, mediaAktif]);

  // Fungsi toggle suara
  const toggleMute = (e) => {
    e.stopPropagation();
    const nextMuteState = !isMuted;
    setIsMuted(nextMuteState);

    if (videoElementRef.current) {
      videoElementRef.current.muted = nextMuteState;
    }

    if (ytPlayerRef.current && typeof ytPlayerRef.current.unMute === 'function') {
      if (nextMuteState) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();
      }
    }
  };

  useEffect(() => {
    if (mediaAktif && mediaAktif.tipe === 'video' && isYouTube(mediaAktif.url)) {
      setIsWidescreen(true);
    } else {
      setIsWidescreen(false);
    }
  }, [currentIndex, mediaAktif]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      setIsWidescreen(ratio >= 1.70 && ratio <= 1.85);
    }
  };

  const handleVideoMetadata = (e) => {
    const { videoWidth, videoHeight } = e.target;
    if (videoWidth && videoHeight) {
      const ratio = videoWidth / videoHeight;
      setIsWidescreen(ratio >= 1.70 && ratio <= 1.85);
    }
  };

  // Timer gambar 10 detik
  useEffect(() => {
    if (daftarMedia.length <= 1) return;

    if (mediaAktif && mediaAktif.tipe === 'image') {
      const timer = setTimeout(() => {
        nextMedia();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, daftarMedia.length, mediaAktif]);

  if (!mediaAktif) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', color: '#fff' }}>
        <h2>Memuat Media...</h2>
        {!isFullscreen && (
          <button onClick={kembalikanKeMenu} style={styles.backBtn}>← Kembali</button>
        )}
      </div>
    );
  }

  const ytID = mediaAktif.tipe === 'video' && isYouTube(mediaAktif.url) ? getYouTubeID(mediaAktif.url) : null;

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: '#000', 
        overflow: 'hidden', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        cursor: showControls ? 'pointer' : 'none',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }} 
      onClick={handleContainerClick}
    >
      {!isFullscreen && (
        <button 
          onClick={(e) => { e.stopPropagation(); if (kembalikanKeMenu) kembalikanKeMenu(); }} 
          style={{
            ...styles.backBtn,
            opacity: showControls ? 1 : 0,
            pointerEvents: showControls ? 'auto' : 'none',
            transition: 'opacity 0.5s ease'
          }}
        >
          ← Kembali
        </button>
      )}

      <button 
        onClick={toggleMute} 
        style={{
          ...styles.audioBtn,
          backgroundColor: isMuted ? 'rgba(220, 53, 69, 0.85)' : 'rgba(40, 167, 69, 0.85)',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          transition: 'opacity 0.5s ease, background-color 0.3s ease'
        }}
        title="Klik untuk menyalakan/mematikan suara"
      >
        {isMuted ? '🔇 Bisu (Klik untuk Suara)' : '🔊 Suara Aktif'}
      </button>

      {!isWidescreen && (
        <>
          <div key={mediaAktif.url + '-blur-container'} className="fade-anim" style={styles.blurContainer}>
            {mediaAktif.tipe === 'video' ? (
              ytID ? (
                <img src={`https://img.youtube.com/vi/${ytID}/hqdefault.jpg`} alt="YT Background" style={styles.bgMedia} crossOrigin="anonymous" />
              ) : (
                <video src={mediaAktif.url} autoPlay muted loop crossOrigin="anonymous" style={styles.bgMedia} />
              )
            ) : (
              <img src={mediaAktif.url} alt="Background" crossOrigin="anonymous" style={styles.bgMedia} />
            )}
          </div>

          <div style={styles.glassOverlay} />
        </>
      )}

      {mediaAktif.tipe === 'video' ? (
        ytID ? (
          <div 
            key={mediaAktif.url + '-yt-wrapper'}
            className="fade-anim"
            style={{ 
              width: '100vw', 
              height: '56.25vw', 
              maxHeight: '100vh', 
              maxWidth: '177.78vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 3
            }}
          >
            <div 
              ref={ytContainerRef} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
            />
          </div>
        ) : (
          <video 
            ref={videoElementRef}
            key={mediaAktif.url + '-main'} 
            className="fade-anim"
            src={mediaAktif.url} 
            autoPlay 
            muted={isMuted} 
            playsInline
            onEnded={nextMedia}
            onTimeUpdate={(e) => {
              const { currentTime, duration } = e.target;
              if (duration > 0 && currentTime >= duration - 0.25) {
                nextMedia();
              }
            }}
            onLoadedMetadata={handleVideoMetadata}
            crossOrigin="anonymous"
            style={styles.mainMedia} 
          />
        )
      ) : (
        <img 
          key={mediaAktif.url + '-main'} 
          className="fade-anim" 
          src={mediaAktif.url} 
          alt="Media" 
          onLoad={handleImageLoad}
          crossOrigin="anonymous" 
          style={styles.mainMedia} 
        />
      )}

      <style>
        {`
          @keyframes smoothFade {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .fade-anim {
            animation: smoothFade 1.2s ease-in-out;
            will-change: opacity;
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  backBtn: {
    position: 'absolute', 
    top: '20px', 
    left: '20px', 
    zIndex: 9999, 
    backgroundColor: 'rgba(13, 59, 102, 0.8)',
    color: 'white', 
    border: '2px solid white', 
    padding: '10px 20px', 
    borderRadius: '8px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    boxShadow: '0px 4px 10px rgba(0,0,0,0.5)', 
    fontSize: '1rem'
  },
  audioBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    color: 'white',
    border: '2px solid white',
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0px 4px 12px rgba(0,0,0,0.4)',
    fontSize: '0.95rem'
  },
  blurContainer: {
    position: 'absolute', 
    width: '100%', 
    height: '100%', 
    transform: 'scale(1.1)', 
    zIndex: 1, 
    overflow: 'hidden'
  },
  bgMedia: {
    width: '100%', 
    height: '100%', 
    objectFit: 'cover', 
    filter: 'blur(20px)', 
    WebkitFilter: 'blur(20px)'
  },
  glassOverlay: {
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    backgroundColor: 'rgba(0, 0, 0, 0.55)', 
    backdropFilter: 'blur(25px)', 
    WebkitBackdropFilter: 'blur(25px)', 
    zIndex: 2
  },
  mainMedia: {
    position: 'relative', 
    width: '100%', 
    height: '100%', 
    objectFit: 'contain', 
    zIndex: 3, 
    border: 'none'
  }
};