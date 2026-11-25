(function (global) {
  let state = APStorage.checkNewDayStreak(APStorage.loadState());
  let manifest = null;
  let phanXaTopics = [];
  let currentTab = 'home';
  let activeCleanup = null;

  const mainEl = document.getElementById('app-main');

  function applyLowEndMode() {
    document.body.classList.toggle('low-end-mode', !!state.settings.lowEndMode);
  }

  function updateHeader() {
    const streakEl = document.getElementById('header-streak-count');
    if (streakEl) streakEl.textContent = String(state.streak.count || 0);
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      const active = btn.dataset.nav === currentTab;
      btn.classList.toggle('bg-[#4FD1C5]', active);
      btn.classList.toggle('text-slate-950', active);
      btn.classList.toggle('text-slate-300', !active);
    });
  }

  async function fetchJson(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Không tải được ${path}`);
    const text = (await res.text()).replace(/^\uFEFF/, '');
    return JSON.parse(text);
  }

  function openLightbox(src, caption) {
    const m = document.getElementById('modal-lightbox');
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox-caption').textContent = caption ? caption.replace(/<[^>]+>/g, '') : '';
    m.classList.remove('hidden');
  }

  function openYoutube(videoId, title) {
    const m = document.getElementById('modal-youtube');
    document.getElementById('yt-modal-title').textContent = title || 'Video Bài Giảng';
    document.getElementById('yt-external-link').href = `https://www.youtube.com/watch?v=${videoId}`;
    document.getElementById('yt-iframe').src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    m.classList.remove('hidden');
  }

  function open3dModal(path, title) {
    const m = document.getElementById('modal-3d');
    document.getElementById('mv-modal-title').textContent = title || 'Mô phỏng 3D';
    document.getElementById('mv-modal-body').innerHTML = `
      <model-viewer src="${path}" alt="${APKatex.escapeHtml(title || '')}" camera-controls ${state.settings.lowEndMode ? '' : 'auto-rotate'} class="mv-fullscreen"></model-viewer>
    `;
    m.classList.remove('hidden');
  }

  function initModals() {
    document.getElementById('lightbox-close').addEventListener('click', () => {
      document.getElementById('modal-lightbox').classList.add('hidden');
    });
    document.getElementById('yt-modal-close').addEventListener('click', () => {
      document.getElementById('yt-iframe').src = '';
      document.getElementById('modal-youtube').classList.add('hidden');
    });
    document.getElementById('mv-modal-close').addEventListener('click', () => {
      document.getElementById('mv-modal-body').innerHTML = '';
      document.getElementById('modal-3d').classList.add('hidden');
    });
  }

  function navigate(tab) {
    if (activeCleanup) {
      activeCleanup();
      activeCleanup = null;
    }
    currentTab = tab;
    updateHeader();
    window.scrollTo({ top: 0, behavior: state.settings.lowEndMode ? 'auto' : 'smooth' });

    if (tab === 'home') renderHome();
    else if (tab === 'roadmap') renderRoadmap();
    else if (tab === 'tools') APTools.renderToolsPage(mainEl, manifest, state, open3dModal);
    else if (tab === 'saved') renderSaved();
    else if (tab === 'settings') renderSettings();
  }

  function renderHome() {
    const totalTasks = manifest.topics.reduce((acc, t) => acc + t.tasks.length, 0);
    const doneTasks = state.completedTasks.length;
    const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const recentScores = state.scoreHistory.slice(0, 4);

    mainEl.innerHTML = `
      <div class="space-y-6">
        <!-- Demo Mode Notice -->
        <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-100">
          <span>🧪 <strong>Chế độ Dùng thử (Web Demo):</strong> Trải nghiệm nhanh nội dung và mô hình 3D trên trình duyệt. Phiên bản đầy đủ với hiệu năng tối ưu và đồng bộ Google Drive có trên ứng dụng Android.</span>
          <a href="../index.html#tai-ve" class="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold shrink-0 self-start sm:self-auto hover:opacity-90">Tải App Android →</a>
        </div>
        <!-- Welcome Banner -->
        <div class="glass-card p-6 sm:p-8 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center space-x-3">
              <span class="text-3xl">${state.profile.avatar}</span>
              <div>
                <h1 class="text-xl sm:text-2xl font-extrabold text-white">Chào ${APKatex.escapeHtml(state.profile.nickname)}!</h1>
                <p class="text-xs text-slate-400">Lớp ${state.profile.grade} • Mục tiêu ${state.profile.targetScore} điểm • Chuỗi học ${state.streak.count} ngày 🔥</p>
              </div>
            </div>
            <div class="pt-2 max-w-md">
              <div class="flex justify-between text-xs text-slate-300 mb-1">
                <span>Tiến độ lộ trình 3 tầng</span>
                <span class="font-bold text-[#4FD1C5]">${doneTasks}/${totalTasks} (${pct}%)</span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-[#070D1F] overflow-hidden border border-[#2A3C6E]">
                <div class="h-full bg-gradient-to-r from-[#4FD1C5] to-[#38BDF8]" style="width:${pct}%"></div>
              </div>
            </div>
          </div>

          <!-- Grade Selector -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div class="flex bg-[#070D1F] p-1 rounded-xl border border-[#2A3C6E]">
              <button data-grade="10" class="grade-btn px-3.5 py-2 rounded-lg text-xs font-bold ${state.profile.grade === 10 ? 'bg-[#4FD1C5] text-slate-950' : 'text-slate-400'}">Lớp 10</button>
              <button data-grade="11" class="grade-btn px-3.5 py-2 rounded-lg text-xs font-bold text-slate-500">🔒 Lớp 11</button>
              <button data-grade="12" class="grade-btn px-3.5 py-2 rounded-lg text-xs font-bold text-slate-500">🔒 Lớp 12</button>
            </div>
            ${state.lastLesson ? `
              <button id="home-continue-btn" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4FD1C5] to-[#38BDF8] text-slate-950 font-bold text-xs shadow-lg">▶ Tiếp tục: ${APKatex.escapeHtml(state.lastLesson.title)}</button>
            ` : `
              <button id="home-start-btn" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4FD1C5] to-[#38BDF8] text-slate-950 font-bold text-xs shadow-lg">🚀 Bắt đầu học ngay</button>
            `}
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button id="qa-roadmap" class="glass-card glass-card-hover p-5 rounded-2xl text-left space-y-2 transition">
            <div class="text-2xl">📚</div>
            <div class="font-bold text-white text-sm">Lộ Trình 7 Chủ Đề</div>
            <div class="text-xs text-slate-400">28 bài lý thuyết &amp; 1.594+ câu hỏi</div>
          </button>
          <button id="qa-phanxa" class="glass-card glass-card-hover p-5 rounded-2xl text-left space-y-2 transition">
            <div class="text-2xl">⚡</div>
            <div class="font-bold text-white text-sm">Phản Xạ Lý Thuyết</div>
            <div class="text-xs text-slate-400">Luyện tốc độ &amp; xếp hạng A+ đến F</div>
          </button>
          <button id="qa-3d" class="glass-card glass-card-hover p-5 rounded-2xl text-left space-y-2 transition">
            <div class="text-2xl">🧊</div>
            <div class="font-bold text-white text-sm">Phòng Lab 3D (19)</div>
            <div class="text-xs text-slate-400">Xoay 360° trực quan mọi hiện tượng</div>
          </button>
          <button id="qa-tools" class="glass-card glass-card-hover p-5 rounded-2xl text-left space-y-2 transition">
            <div class="text-2xl">📐</div>
            <div class="font-bold text-white text-sm">Đổi Đơn Vị &amp; Sai Số</div>
            <div class="text-xs text-slate-400">16 nhóm đơn vị &amp; tính sai số 6 bước</div>
          </button>
        </div>

        <!-- Phan Xa Section + Recent Scores -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-7 glass-card p-6 rounded-2xl space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-extrabold text-white">⚡ Thử Thách Phản Xạ Nhanh</h2>
              <span class="text-xs text-[#4FD1C5]">Chuẩn tốc độ A+ (&le;5s/câu)</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${phanXaTopics.map((px) => {
                const savedRank = state.phanXaRanks[px.id];
                return `
                  <button data-pxid="${px.id}" class="px-start-btn p-3.5 rounded-xl bg-[#070D1F] border border-[#2A3C6E] hover:border-[#4FD1C5] text-left transition">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-xs font-bold text-white truncate">${APKatex.escapeHtml(px.tenChuDe)}</span>
                      <span class="text-[11px] font-black px-2 py-0.5 rounded bg-[#162347] text-[#4FD1C5]">${savedRank ? `Hạng ${savedRank.rank}` : `${px.soCau} câu`}</span>
                    </div>
                    <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">${APKatex.escapeHtml(px.moTa)}</p>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="lg:col-span-5 glass-card p-6 rounded-2xl space-y-4">
            <h2 class="text-base font-extrabold text-white">📊 Lịch Sử Điểm Thi Gần Đây</h2>
            ${recentScores.length === 0 ? `
              <div class="p-6 rounded-xl bg-[#070D1F] border border-[#2A3C6E] text-center text-xs text-slate-400">
                Chưa có bài thi nào. Hãy chọn một đề thi trong mục <strong>Lộ trình</strong> để thử sức!
              </div>
            ` : `
              <div class="space-y-2.5">
                ${recentScores.map((s) => `
                  <div class="p-3 rounded-xl bg-[#070D1F] border border-[#2A3C6E] flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-white truncate">${APKatex.escapeHtml(s.title)}</div>
                      <div class="text-[10px] text-slate-400">${s.dateStr} • Đúng ${s.correctCount}/${s.totalQuestions}</div>
                    </div>
                    <span class="text-base font-black ${s.score10 >= 5 ? 'text-emerald-400' : 'text-rose-400'} shrink-0">${Number(s.score10).toFixed(2)}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    mainEl.querySelectorAll('.grade-btn').forEach((b) => {
      b.addEventListener('click', () => {
        const g = Number(b.dataset.grade);
        if (g !== 10) {
          alert(`Chương trình Vật lý Lớp ${g} đang được đội ngũ biên soạn và sẽ cập nhật trong phiên bản tiếp theo!`);
        }
      });
    });

    const contBtn = mainEl.querySelector('#home-continue-btn');
    if (contBtn && state.lastLesson) {
      contBtn.addEventListener('click', () => openTheory(state.lastLesson.filePath, state.lastLesson.taskId));
    }
    const startBtn = mainEl.querySelector('#home-start-btn');
    if (startBtn) startBtn.addEventListener('click', () => navigate('roadmap'));

    mainEl.querySelector('#qa-roadmap').addEventListener('click', () => navigate('roadmap'));
    mainEl.querySelector('#qa-3d').addEventListener('click', () => navigate('tools'));
    mainEl.querySelector('#qa-tools').addEventListener('click', () => navigate('tools'));
    mainEl.querySelector('#qa-phanxa').addEventListener('click', () => {
      if (phanXaTopics[0]) launchPhanXa(phanXaTopics[0]);
    });

    mainEl.querySelectorAll('.px-start-btn').forEach((b) => {
      b.addEventListener('click', () => {
        const meta = phanXaTopics.find((x) => String(x.id) === String(b.dataset.pxid));
        if (meta) launchPhanXa(meta);
      });
    });
  }

  async function launchPhanXa(meta) {
    try {
      const qs = await fetchJson(`../assets/${meta.fileJson}`);
      APQuiz.startPhanXa(mainEl, meta, qs, state, () => navigate('home'));
    } catch (e) {
      alert('Không thể tải dữ liệu Phản xạ: ' + e.message);
    }
  }

  function renderRoadmap() {
    mainEl.innerHTML = `
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-white">Lộ Trình Học Tập 3 Tầng (7 Chủ Đề)</h1>
          <p class="text-xs text-slate-400 mt-1">Tầng 1: Học cuốn chiếu từng bài • Tầng 2: Tổng hợp công thức • Tầng 3: Đề tổng kết chương.</p>
        </div>
        <div class="space-y-5">
          ${manifest.topics.map((t) => {
            const doneInTopic = t.tasks.filter((tk) => state.completedTasks.includes(tk.id)).length;
            const tier1 = t.tasks.filter((tk) => tk.tier === 1);
            const tier2 = t.tasks.filter((tk) => tk.tier === 2);
            const tier3 = t.tasks.filter((tk) => tk.tier === 3);

            const renderTaskRow = (tk) => {
              const isDone = state.completedTasks.includes(tk.id);
              const iconMap = {
                LyThuyetBai: '📖',
                BaiTapNhanhBai: '⚡',
                DeLuyenTapBai: '📝',
                LyThuyetCongThuc: '📐',
                DeTongChuong: '🏆'
              };
              return `
                <button data-kind="${tk.kind}" data-path="${tk.filePath}" data-id="${tk.id}" data-title="${APKatex.escapeHtml(tk.title)}" data-dur="${tk.durationMin}" class="task-open-btn w-full text-left p-3.5 rounded-xl bg-[#070D1F] border ${isDone ? 'border-emerald-500/40' : 'border-[#2A3C6E]'} hover:border-[#4FD1C5] flex items-center justify-between gap-3 transition">
                  <div class="flex items-center space-x-3 min-w-0">
                    <span class="text-lg shrink-0">${iconMap[tk.kind] || '📄'}</span>
                    <div class="min-w-0">
                      <div class="text-xs sm:text-sm font-bold text-white truncate">${APKatex.escapeHtml(tk.title)}</div>
                      <div class="text-[11px] text-slate-400">
                        ${tk.kind.startsWith('LyThuyet') ? `${tk.count} mục kiến thức` : `${tk.count} câu hỏi • ${tk.durationMin} phút`}
                      </div>
                    </div>
                  </div>
                  <span class="text-xs font-bold shrink-0 ${isDone ? 'text-emerald-400' : 'text-[#4FD1C5]'}">${isDone ? '✓ Đã xong' : 'Mở →'}</span>
                </button>
              `;
            };

            return `
              <details class="glass-card rounded-2xl overflow-hidden" ${t.num === 0 || t.num === 2 ? 'open' : ''}>
                <summary class="p-5 cursor-pointer flex items-center justify-between gap-4 hover:bg-[#162347]/40 transition list-none">
                  <div>
                    <div class="text-xs font-bold uppercase tracking-wider" style="color:${t.color}">Chủ đề ${t.num === 0 ? 'Mở đầu' : t.num}</div>
                    <h2 class="text-base sm:text-lg font-extrabold text-white mt-0.5">${APKatex.escapeHtml(t.ten)}</h2>
                    <p class="text-xs text-slate-400 mt-0.5">${APKatex.escapeHtml(t.moTa)}</p>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="px-3 py-1 rounded-full bg-[#070D1F] border border-[#2A3C6E] text-xs font-bold text-[#4FD1C5]">${doneInTopic}/${t.tasks.length}</span>
                  </div>
                </summary>
                <div class="p-5 pt-0 space-y-4 border-t border-[#2A3C6E]/60 mt-2">
                  ${tier1.length ? `<div><div class="text-[11px] font-bold text-slate-400 uppercase mb-2 mt-3">Tầng 1 — Học cuốn chiếu từng bài</div><div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">${tier1.map(renderTaskRow).join('')}</div></div>` : ''}
                  ${tier2.length ? `<div><div class="text-[11px] font-bold text-amber-300 uppercase mb-2">Tầng 2 — Tổng hợp công thức chương</div><div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">${tier2.map(renderTaskRow).join('')}</div></div>` : ''}
                  ${tier3.length ? `<div><div class="text-[11px] font-bold text-emerald-300 uppercase mb-2">Tầng 3 — Đề tổng kết chương</div><div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">${tier3.map(renderTaskRow).join('')}</div></div>` : ''}
                </div>
              </details>
            `;
          }).join('')}
        </div>
      </div>
    `;

    mainEl.querySelectorAll('.task-open-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        APAudio.playClick(state);
        const kind = btn.dataset.kind;
        const fpath = btn.dataset.path;
        const tid = btn.dataset.id;
        const title = btn.dataset.title;
        const dur = Number(btn.dataset.dur);

        if (kind === 'LyThuyetBai' || kind === 'LyThuyetCongThuc') {
          openTheory(fpath, tid);
        } else {
          const mode = kind === 'BaiTapNhanhBai' ? 'BAI_TAP_NHANH' : 'DE_THI';
          openQuizFile(fpath, title, mode, dur, tid);
        }
      });
    });
  }

  async function openQuizFile(filePath, title, mode, durationMin, taskId) {
    try {
      const qs = await fetchJson(`../assets/${filePath}`);
      activeCleanup = APQuiz.startQuiz(mainEl, {
        title,
        filePath,
        questions: Array.isArray(qs) ? qs : [qs],
        mode,
        durationMin,
        taskId,
        state,
        onExit: () => navigate('roadmap'),
        openLightbox
      });
    } catch (e) {
      alert('Không tải được đề: ' + e.message);
    }
  }

  async function openTheory(filePath, taskId) {
    try {
      const raw = await fetchJson(`../assets/${filePath}`);
      const lesson = Array.isArray(raw) ? raw[0] : raw;
      state.lastLesson = { filePath, taskId, title: lesson.tieude || 'Bài học' };
      if (taskId) APStorage.markTaskCompleted(state, taskId);
      updateHeader();

      const sections = lesson.sections || [];
      const seenModels = new Set();

      const renderBlock = (b) => {
        const loai = b.loai || 'doan_van';
        if (loai === 'mo_hinh_3d') {
          const mPath = b.duongDanGlb ? (b.duongDanGlb.startsWith('assets/') ? `../${b.duongDanGlb}` : `../assets/${b.duongDanGlb}`) : '';
          if (!mPath || seenModels.has(mPath)) return '';
          seenModels.add(mPath);
          return `
            <div class="p-4 rounded-2xl bg-[#070D1F] border border-[#4FD1C5]/40 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-[#4FD1C5]">🧊 ${APKatex.escapeHtml(b.tenMoHinh3d || 'Mô phỏng 3D')}</span>
                <button class="theory-3d-fs text-xs text-[#38BDF8] hover:underline" data-path="${mPath}" data-title="${APKatex.escapeHtml(b.tenMoHinh3d || '')}">Toàn màn hình ↗</button>
              </div>
              <div class="mv-slot rounded-xl overflow-hidden bg-[#0B142C] flex items-center justify-center min-h-[240px]" data-path="${mPath}" data-title="${APKatex.escapeHtml(b.tenMoHinh3d || '')}">
                ${state.settings.lowEndMode
                  ? `<button class="load-3d-btn px-4 py-2 rounded-xl bg-[#4FD1C5] text-slate-950 text-xs font-bold">▶ Bấm để khởi chạy 3D</button>`
                  : `<model-viewer src="${mPath}" alt="${APKatex.escapeHtml(b.tenMoHinh3d || '')}" auto-rotate camera-controls style="height:260px"></model-viewer>`
                }
              </div>
              ${b.moTaMoHinh3d ? `<p class="text-xs text-slate-400">${APKatex.render(b.moTaMoHinh3d)}</p>` : ''}
            </div>
          `;
        }
        if (loai === 'hinh_anh') {
          const imgPath = b.duongDanAnh ? (b.duongDanAnh.startsWith('assets/') ? `../${b.duongDanAnh}` : `../assets/${b.duongDanAnh}`) : '';
          return `
            <div class="p-4 rounded-2xl bg-[#070D1F] border border-[#2A3C6E] text-center space-y-2">
              <img src="${imgPath}" alt="${APKatex.escapeHtml(b.chuThichAnh || '')}" class="theory-zoom-img max-h-72 mx-auto rounded-xl bg-white cursor-zoom-in">
              ${b.chuThichAnh ? `<p class="text-xs text-slate-400 italic">${APKatex.render(b.chuThichAnh)}</p>` : ''}
            </div>
          `;
        }
        if (loai === 'cong_thuc_trong_tam' || loai === 'cong_thuc_buoc') {
          return `
            <div class="p-5 rounded-2xl bg-gradient-to-br from-[#162347] to-[#0B142C] border border-[#4FD1C5]/40 space-y-2">
              <div class="text-xs font-extrabold uppercase tracking-wider text-[#4FD1C5]">${APKatex.escapeHtml(b.tenBuoc || 'Công thức trọng tâm')}</div>
              <div class="text-base text-white">${APKatex.render(b.congThuc || '')}</div>
              ${b.mucDich ? `<div class="text-xs text-slate-300">${APKatex.render(b.mucDich)}</div>` : ''}
              ${b.chuThich ? `<div class="text-xs text-slate-400 pt-2 border-t border-[#2A3C6E]/60">${APKatex.render(b.chuThich)}</div>` : ''}
            </div>
          `;
        }
        if (loai === 'luu_y') {
          return `
            <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-sm text-amber-100 leading-relaxed">
              ⚠️ ${APKatex.render(b.noiDungLuuY || b.noiDung || '')}
            </div>
          `;
        }
        if (loai === 'nhom_bien_bao') {
          const items = b.danhSachBienBao || [];
          return `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${items.map((bb) => `
                <div class="p-3 rounded-xl bg-[#070D1F] border border-[#2A3C6E] flex items-center space-x-3">
                  ${bb.duongDanAnh ? `<img src="../assets/${bb.duongDanAnh}" class="w-12 h-12 rounded-lg object-contain bg-white shrink-0">` : ''}
                  <div class="text-xs">
                    <div class="font-bold text-white">${APKatex.escapeHtml(bb.tenBienBao || '')}</div>
                    <div class="text-slate-400">${APKatex.render(bb.yNghia || '')}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
        // khai_niem / doan_van
        const bullets = b.danhSachYCon || [];
        return `
          <div class="p-4 rounded-2xl bg-[#070D1F]/70 border border-[#2A3C6E] space-y-2">
            ${b.tieuDePhu ? `<h4 class="text-sm font-bold text-[#38BDF8]">${APKatex.render(b.tieuDePhu)}</h4>` : ''}
            ${b.noiDung ? `<div class="text-sm text-slate-200 leading-relaxed">${APKatex.render(b.noiDung)}</div>` : ''}
            ${bullets.length ? `<ul class="list-disc pl-5 space-y-1.5 text-sm text-slate-300">${bullets.map((li) => `<li>${APKatex.render(li)}</li>`).join('')}</ul>` : ''}
          </div>
        `;
      };

      mainEl.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
          <div class="glass-card p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center space-x-3">
              <button id="theory-back-btn" class="px-3 py-1.5 rounded-lg bg-[#070D1F] border border-[#2A3C6E] text-xs font-semibold text-slate-300 hover:text-white">← Lộ trình</button>
              <h1 class="text-lg sm:text-xl font-extrabold text-white">${APKatex.escapeHtml(lesson.tieude || 'Bài học')}</h1>
            </div>
            <div class="flex items-center space-x-2">
              ${lesson.videoYoutubeId ? `<button id="theory-yt-btn" class="px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300 hover:bg-rose-500/30">▶ Video Bài Giảng</button>` : ''}
              ${lesson.fileBaiTapNhanh ? `<button id="theory-quick-btn" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#4FD1C5] to-[#38BDF8] text-slate-950 text-xs font-bold">⚡ Làm Bài Tập Nhanh</button>` : ''}
            </div>
          </div>

          ${sections.length ? sections.map((sec) => `
            <div class="glass-card p-6 rounded-2xl space-y-4">
              <h2 class="text-base sm:text-lg font-extrabold text-[#4FD1C5] border-b border-[#2A3C6E] pb-2">${APKatex.render(sec.tieuDeMuc || '')}</h2>
              <div class="space-y-4">
                ${(sec.noiDungBlocks || []).map(renderBlock).join('')}
              </div>
            </div>
          `).join('') : `
            <div class="glass-card p-6 rounded-2xl text-sm text-slate-200">${APKatex.render(lesson.noidung || '')}</div>
          `}
        </div>
      `;

      mainEl.querySelector('#theory-back-btn').addEventListener('click', () => navigate('roadmap'));
      const ytBtn = mainEl.querySelector('#theory-yt-btn');
      if (ytBtn) ytBtn.addEventListener('click', () => openYoutube(lesson.videoYoutubeId, lesson.tieude));
      const qBtn = mainEl.querySelector('#theory-quick-btn');
      if (qBtn) qBtn.addEventListener('click', () => openQuizFile(lesson.fileBaiTapNhanh, `Bài tập nhanh - ${lesson.tieude}`, 'BAI_TAP_NHANH', 10, null));

      mainEl.querySelectorAll('.load-3d-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const slot = btn.closest('.mv-slot');
          slot.innerHTML = `<model-viewer src="${slot.dataset.path}" alt="${slot.dataset.title}" camera-controls style="height:260px"></model-viewer>`;
        });
      });
      mainEl.querySelectorAll('.theory-3d-fs').forEach((btn) => {
        btn.addEventListener('click', () => open3dModal(btn.dataset.path, btn.dataset.title));
      });
      mainEl.querySelectorAll('.theory-zoom-img').forEach((img) => {
        img.addEventListener('click', () => openLightbox(img.src, img.alt));
      });
    } catch (e) {
      alert('Không thể mở bài lý thuyết: ' + e.message);
    }
  }

  function renderSaved() {
    let filterType = 'ALL';
    let searchText = '';

    function draw() {
      const list = state.savedQuestions.filter((item) => {
        const type = APQuiz.getQuestionType(item.question);
        if (filterType !== 'ALL' && type !== filterType) return false;
        if (searchText && !(item.question.cauhoi || '').toLowerCase().includes(searchText.toLowerCase())) return false;
        return true;
      });

      mainEl.innerHTML = `
        <div class="space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold text-white">Kho Câu Hỏi Đã Lưu (${state.savedQuestions.length})</h1>
              <p class="text-xs text-slate-400 mt-1">Ôn tập lại các câu hỏi quan trọng hoặc hay nhầm lẫn.</p>
            </div>
            ${state.savedQuestions.length > 0 ? `<button id="saved-practice-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4FD1C5] to-[#38BDF8] text-slate-950 text-xs font-bold self-start">⚡ Luyện tập ${state.savedQuestions.length} câu đã lưu</button>` : ''}
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <input id="saved-search" type="text" value="${APKatex.escapeHtml(searchText)}" placeholder="Tìm kiếm nội dung câu hỏi..." class="flex-1 bg-[#0F1A36] border border-[#2A3C6E] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#4FD1C5]">
            <div class="flex gap-1.5 flex-wrap">
              ${[['ALL', 'Tất cả'], ['TRAC_NGHIEM', 'Trắc nghiệm'], ['DUNG_SAI', 'Đúng / Sai'], ['TU_LUAN', 'Tự luận']].map(([k, lbl]) => `
                <button data-ft="${k}" class="sv-ft px-3 py-2 rounded-xl text-xs font-semibold border ${filterType === k ? 'bg-[#4FD1C5] text-slate-950 border-[#4FD1C5]' : 'bg-[#0F1A36] text-slate-300 border-[#2A3C6E]'}">${lbl}</button>
              `).join('')}
            </div>
          </div>

          ${list.length === 0 ? `
            <div class="glass-card p-10 rounded-2xl text-center text-sm text-slate-400">
              Chưa có câu hỏi nào phù hợp. Khi làm bài tập hoặc đề thi, hãy bấm nút <strong>🔖 Lưu câu</strong> để đưa vào kho này.
            </div>
          ` : `
            <div class="space-y-3">
              ${list.map((item) => `
                <div class="glass-card p-5 rounded-2xl space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-[11px] text-[#4FD1C5] font-semibold">${APKatex.escapeHtml(item.filePath)}</span>
                    <button data-key="${APKatex.escapeHtml(item.key)}" class="sv-remove text-xs text-rose-400 hover:underline">✕ Bỏ lưu</button>
                  </div>
                  <div class="text-sm text-slate-200">${APKatex.render(item.question.cauhoi || '')}</div>
                  ${item.question.giaithich ? `<div class="text-xs text-slate-400 pt-2 border-t border-[#2A3C6E]/50"><strong>Giải thích:</strong> ${APKatex.render(item.question.giaithich)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;

      mainEl.querySelector('#saved-search').addEventListener('input', (e) => {
        searchText = e.target.value;
        draw();
      });
      mainEl.querySelectorAll('.sv-ft').forEach((b) => {
        b.addEventListener('click', () => {
          filterType = b.dataset.ft;
          draw();
        });
      });
      mainEl.querySelectorAll('.sv-remove').forEach((b) => {
        b.addEventListener('click', () => {
          state.savedQuestions = state.savedQuestions.filter((x) => x.key !== b.dataset.key);
          APStorage.saveState(state);
          draw();
        });
      });
      const pracBtn = mainEl.querySelector('#saved-practice-btn');
      if (pracBtn) {
        pracBtn.addEventListener('click', () => {
          activeCleanup = APQuiz.startQuiz(mainEl, {
            title: 'Luyện tập câu hỏi đã lưu',
            filePath: 'saved_questions',
            questions: state.savedQuestions.map((x) => x.question),
            mode: 'BAI_TAP_NHANH',
            durationMin: Math.max(5, state.savedQuestions.length * 2),
            taskId: null,
            state,
            onExit: () => navigate('saved'),
            openLightbox
          });
        });
      }
    }
    draw();
  }

  async function renderSettings() {
    let appInfo = null;
    try {
      appInfo = await fetchJson('../assets/app_info.json');
    } catch {}

    const avatars = ['🧑‍🎓', '👩‍🔬', '👨‍🔬', '🚀', '⚡', '🔭', '⚛️', '🏆'];

    mainEl.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <h1 class="text-2xl font-extrabold text-white">Cài Đặt, Hồ Sơ &amp; Sao Lưu</h1>

        <!-- Profile -->
        <div class="glass-card p-6 rounded-2xl space-y-4">
          <h2 class="text-base font-bold text-white">Hồ sơ học tập cá nhân</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-400 mb-1">Biệt danh hiển thị</label>
              <input id="set-nickname" type="text" value="${APKatex.escapeHtml(state.profile.nickname)}" class="w-full bg-[#070D1F] border border-[#2A3C6E] rounded-xl px-3 py-2 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">Mục tiêu điểm</label>
              <input id="set-target" type="number" step="0.5" min="5" max="10" value="${state.profile.targetScore}" class="w-full bg-[#070D1F] border border-[#2A3C6E] rounded-xl px-3 py-2 text-sm text-white">
            </div>
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1.5">Ảnh đại diện Emoji</label>
            <div class="flex flex-wrap gap-2">
              ${avatars.map((av) => `
                <button data-av="${av}" class="av-pick w-10 h-10 rounded-xl border text-xl ${state.profile.avatar === av ? 'bg-[#4FD1C5]/20 border-[#4FD1C5]' : 'bg-[#070D1F] border-[#2A3C6E]'}">${av}</button>
              `).join('')}
            </div>
          </div>
          <button id="set-save-profile" class="px-5 py-2 rounded-xl bg-[#4FD1C5] text-slate-950 font-bold text-xs">Lưu hồ sơ</button>
        </div>

        <!-- Performance & Audio -->
        <div class="glass-card p-6 rounded-2xl space-y-4">
          <h2 class="text-base font-bold text-white">Hiệu năng &amp; Âm thanh</h2>
          <label class="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div class="text-sm font-semibold text-white">⚡ Chế độ tối ưu máy yếu (Reduced Motion)</div>
              <div class="text-xs text-slate-400">Tắt hiệu ứng mờ/chuyển động, chỉ tải mô hình 3D khi bấm nút xem.</div>
            </div>
            <input id="set-lowend" type="checkbox" ${state.settings.lowEndMode ? 'checked' : ''} class="w-5 h-5 accent-[#4FD1C5]">
          </label>
          <label class="flex items-center justify-between gap-4 cursor-pointer pt-3 border-t border-[#2A3C6E]">
            <div>
              <div class="text-sm font-semibold text-white">🔊 Hiệu ứng âm thanh chạm nút</div>
              <div class="text-xs text-slate-400">Phát tiếng click nhẹ khi chọn đáp án hoặc mở bài học.</div>
            </div>
            <input id="set-sound" type="checkbox" ${state.settings.soundEnabled ? 'checked' : ''} class="w-5 h-5 accent-[#4FD1C5]">
          </label>
        </div>

        <!-- Backup & Restore -->
        <div class="glass-card p-6 rounded-2xl space-y-4">
          <h2 class="text-base font-bold text-white">Sao lưu &amp; Khôi phục Dữ liệu (JSON)</h2>
          <p class="text-xs text-slate-400">Xuất file sao lưu tiến độ, điểm thi, câu hỏi đã lưu để chuyển sang máy khác hoặc nhập lại khi cần.</p>
          <div class="flex flex-wrap gap-3">
            <button id="set-export-btn" class="px-4 py-2.5 rounded-xl bg-[#162347] border border-[#4FD1C5]/40 text-xs font-bold text-[#4FD1C5]">⬇ Xuất file sao lưu JSON</button>
            <label class="px-4 py-2.5 rounded-xl bg-[#070D1F] border border-[#2A3C6E] text-xs font-bold text-slate-200 cursor-pointer hover:border-[#4FD1C5]">
              ⬆ Nhập file sao lưu JSON
              <input id="set-import-file" type="file" accept=".json" class="hidden">
            </label>
            <button id="set-reset-btn" class="px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs font-bold text-rose-300">🗑 Đặt lại toàn bộ dữ liệu</button>
          </div>
        </div>

        <!-- App Info -->
        ${appInfo ? `
          <div class="glass-card p-6 rounded-2xl space-y-3">
            <h2 class="text-base font-bold text-white">Thông tin Ứng dụng</h2>
            <div class="divide-y divide-[#2A3C6E]/60 text-xs">
              ${(appInfo.danhSachThongTin || []).map((row) => `
                <div class="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span class="text-slate-400">${APKatex.escapeHtml(row.label)}</span>
                  <span class="font-semibold text-slate-200 sm:text-right">${APKatex.escapeHtml(row.value)}</span>
                </div>
              `).join('')}
            </div>
            <div class="pt-3 flex gap-4 text-xs">
              <a href="../privacy-policy.html" class="text-[#4FD1C5] hover:underline">Chính sách quyền riêng tư</a>
              <a href="../terms.html" class="text-[#4FD1C5] hover:underline">Điều khoản sử dụng</a>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    mainEl.querySelectorAll('.av-pick').forEach((b) => {
      b.addEventListener('click', () => {
        state.profile.avatar = b.dataset.av;
        APStorage.saveState(state);
        renderSettings();
      });
    });
    mainEl.querySelector('#set-save-profile').addEventListener('click', () => {
      state.profile.nickname = mainEl.querySelector('#set-nickname').value.trim() || 'Học sinh Vật Lý';
      state.profile.targetScore = Number(mainEl.querySelector('#set-target').value) || 9.0;
      APStorage.saveState(state);
      alert('Đã lưu hồ sơ học tập!');
    });
    mainEl.querySelector('#set-lowend').addEventListener('change', (e) => {
      state.settings.lowEndMode = e.target.checked;
      APStorage.saveState(state);
      applyLowEndMode();
    });
    mainEl.querySelector('#set-sound').addEventListener('change', (e) => {
      state.settings.soundEnabled = e.target.checked;
      APStorage.saveState(state);
    });
    mainEl.querySelector('#set-export-btn').addEventListener('click', () => {
      const fname = APStorage.exportBackupJson(state);
      alert(`Đã xuất file sao lưu: ${fname}`);
    });
    mainEl.querySelector('#set-import-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          state = APStorage.importBackupJson(reader.result);
          applyLowEndMode();
          updateHeader();
          alert('Khôi phục dữ liệu thành công!');
          renderSettings();
        } catch (err) {
          alert('Lỗi nhập sao lưu: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
    mainEl.querySelector('#set-reset-btn').addEventListener('click', () => {
      if (confirm('Xóa toàn bộ tiến độ, điểm thi và câu hỏi đã lưu trên trình duyệt này?')) {
        state = APStorage.resetAllData();
        applyLowEndMode();
        updateHeader();
        renderSettings();
      }
    });
  }

  async function bootstrap() {
    applyLowEndMode();
    initModals();
    APAudio.initAudio(state);

    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => navigate(btn.dataset.nav));
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    try {
      manifest = await fetchJson('../assets/roadmap_manifest.json');
      phanXaTopics = await fetchJson('../assets/PhanXa/danhSachChuDePhanXa.json');
      navigate('home');
    } catch (e) {
      mainEl.innerHTML = `
        <div class="glass-card p-8 rounded-2xl max-w-xl mx-auto text-center space-y-3">
          <div class="text-3xl">⚠️</div>
          <h2 class="text-lg font-bold text-white">Không thể tải dữ liệu học liệu</h2>
          <p class="text-xs text-slate-400">Nếu bạn đang mở file trực tiếp bằng <code>file://</code>, trình duyệt sẽ chặn <code>fetch()</code>. Hãy chạy qua Live Server, <code>npx serve</code> hoặc mở trên tên miền <strong>aplusphysics.io.vn</strong>.</p>
          <p class="text-[11px] text-rose-400">${APKatex.escapeHtml(e.message)}</p>
        </div>
      `;
    }
  }

  bootstrap();
})(window);
