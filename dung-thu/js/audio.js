(function (global) {
  let bgAudio = null;
  let clickAudio = null;
  let isPlaying = false;

  function initAudio(state) {
    bgAudio = new Audio();
    bgAudio.loop = true;
    bgAudio.volume = 0.5;
    bgAudio.src = '../assets/audio/song_nao_alpha.aac';

    clickAudio = new Audio('../assets/audio/click.wav');
    clickAudio.volume = 0.28;

    const bar = document.getElementById('focus-music-bar');
    const toggleBtn = document.getElementById('btn-toggle-music-bar');
    const closeBtn = document.getElementById('music-close-btn');
    const playBtn = document.getElementById('music-play-btn');
    const trackSelect = document.getElementById('music-track-select');
    const volumeSlider = document.getElementById('music-volume');
    const dot = document.getElementById('music-status-dot');

    function updateUi() {
      if (playBtn) playBtn.textContent = isPlaying ? '⏸ Tạm dừng' : '▶ Phát';
      if (dot) {
        dot.className = isPlaying
          ? 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse'
          : 'w-2 h-2 rounded-full bg-slate-500';
      }
    }

    if (toggleBtn && bar) {
      toggleBtn.addEventListener('click', () => {
        bar.classList.toggle('hidden');
      });
    }
    if (closeBtn && bar) {
      closeBtn.addEventListener('click', () => {
        bar.classList.add('hidden');
      });
    }
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (isPlaying) {
          bgAudio.pause();
          isPlaying = false;
        } else {
          bgAudio.play().then(() => {
            isPlaying = true;
            updateUi();
          }).catch(() => {});
        }
        updateUi();
      });
    }
    if (trackSelect) {
      trackSelect.addEventListener('change', () => {
        const wasPlaying = isPlaying;
        bgAudio.pause();
        bgAudio.src = trackSelect.value;
        if (wasPlaying) {
          bgAudio.play().then(() => {
            isPlaying = true;
            updateUi();
          }).catch(() => {});
        }
      });
    }
    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        bgAudio.volume = Number(volumeSlider.value);
      });
    }

    updateUi();
  }

  function playClick(state) {
    if (!state?.settings?.soundEnabled || !clickAudio) return;
    try {
      clickAudio.currentTime = 0;
      clickAudio.play().catch(() => {});
    } catch {}
  }

  global.APAudio = {
    initAudio,
    playClick
  };
})(window);
