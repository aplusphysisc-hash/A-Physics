(function (global) {
  function getQuestionType(q) {
    const raw = String(q.loai || 'TRAC_NGHIEM').toUpperCase();
    if (raw.includes('DUNG_SAI') || Array.isArray(q.dsYCon) || Array.isArray(q.dapAnDungSai)) return 'DUNG_SAI';
    if (raw.includes('TU_LUAN')) return 'TU_LUAN';
    return 'TRAC_NGHIEM';
  }

  function resolveImgPath(p) {
    if (!p) return '';
    return p.startsWith('assets/') ? p : `assets/${p.replace(/^\/+/, '')}`;
  }

  function gradeExam(questions, answers, mode) {
    // mode: 'BAI_TAP_NHANH' or 'DE_THI'
    let correctCount = 0;
    let earnedPoints = 0;
    let maxPoints = 0;
    const details = [];

    questions.forEach((q, idx) => {
      const type = getQuestionType(q);
      const ans = answers[idx];

      if (type === 'TRAC_NGHIEM') {
        maxPoints += 0.25;
        const isCorrect = ans !== undefined && Number(ans) === Number(q.dapAnDung);
        if (isCorrect) {
          correctCount++;
          earnedPoints += 0.25;
        }
        details.push({ idx, type, isCorrect, pts: isCorrect ? 0.25 : 0, maxPts: 0.25 });
      } else if (type === 'DUNG_SAI') {
        maxPoints += 1.0;
        const truth = Array.isArray(q.dapAnDungSai) ? q.dapAnDungSai : [];
        const userArr = Array.isArray(ans) ? ans : [null, null, null, null];
        let matched = 0;
        for (let i = 0; i < 4; i++) {
          if (userArr[i] !== null && userArr[i] !== undefined && Boolean(userArr[i]) === Boolean(truth[i])) {
            matched++;
          }
        }
        const isAllCorrect = matched === 4;
        if (isAllCorrect) correctCount++;
        const ptsMap = [0, 0.1, 0.25, 0.5, 1.0];
        const pts = ptsMap[matched] || 0;
        earnedPoints += pts;
        details.push({ idx, type, isCorrect: isAllCorrect, matched, pts, maxPts: 1.0 });
      } else {
        // TU_LUAN: self-check, not counted in denominator for DE_THI
        details.push({ idx, type, isCorrect: true, pts: 0, maxPts: 0 });
      }
    });

    let score10 = 0;
    if (mode === 'DE_THI' && maxPoints > 0) {
      score10 = Math.round(((earnedPoints / maxPoints) * 10) * 100) / 100;
    }

    return {
      mode,
      totalQuestions: questions.length,
      correctCount,
      earnedPoints: Math.round(earnedPoints * 100) / 100,
      maxPoints: Math.round(maxPoints * 100) / 100,
      score10,
      details
    };
  }

  function startQuiz(container, opts) {
    // opts: { title, filePath, questions, mode, durationMin, taskId, state, onExit, openLightbox }
    const { title, filePath, questions, mode, durationMin, taskId, state, onExit, openLightbox } = opts;
    let currentIdx = 0;
    const answers = {};
    const flagged = new Set();
    let remainingSec = Math.max(1, (durationMin || (mode === 'DE_THI' ? 45 : 10)) * 60);
    let timerHandle = null;
    let submitted = false;

    function formatTimer(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function stopTimer() {
      if (timerHandle) {
        clearInterval(timerHandle);
        timerHandle = null;
      }
    }

    function submitQuiz() {
      if (submitted) return;
      submitted = true;
      stopTimer();
      const result = gradeExam(questions, answers, mode);
      if (taskId) {
        APStorage.markTaskCompleted(state, taskId);
      }
      if (mode === 'DE_THI') {
        APStorage.addScoreRecord(state, {
          title,
          filePath,
          score10: result.score10,
          correctCount: result.correctCount,
          totalQuestions: result.totalQuestions
        });
      }
      renderResult(result);
    }

    timerHandle = setInterval(() => {
      remainingSec--;
      const badge = document.getElementById('quiz-timer-badge');
      if (badge) {
        badge.textContent = `⏱ ${formatTimer(Math.max(0, remainingSec))}`;
        if (remainingSec <= 300) {
          badge.classList.add('text-rose-400', 'border-rose-500/50', 'animate-pulse');
        }
      }
      if (remainingSec <= 0) {
        submitQuiz();
      }
    }, 1000);

    function renderQuestion() {
      const q = questions[currentIdx];
      const type = getQuestionType(q);
      const isSaved = APStorage.isQuestionSaved(state, filePath, q);
      const isFlagged = flagged.has(currentIdx);

      container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-5">
          <!-- Top bar -->
          <div class="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center space-x-3">
              <button id="quiz-back-btn" class="px-3 py-1.5 rounded-lg bg-[#070D1F] border border-[#2A3C6E] text-xs font-semibold text-slate-300 hover:text-white">← Thoát</button>
              <div>
                <h2 class="text-sm font-bold text-white">${APKatex.escapeHtml(title)}</h2>
                <span class="text-[11px] text-slate-400">${mode === 'DE_THI' ? 'Đề thi tính điểm (Hệ 10)' : 'Bài tập nhanh củng cố'} • Câu ${currentIdx + 1}/${questions.length}</span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span id="quiz-timer-badge" class="px-3 py-1.5 rounded-lg bg-[#070D1F] border border-[#2A3C6E] text-xs font-mono font-bold text-[#4FD1C5]">⏱ ${formatTimer(remainingSec)}</span>
              <button id="quiz-submit-btn" class="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#4FD1C5] to-[#38BDF8] text-slate-950 text-xs font-bold hover:opacity-90">Nộp bài</button>
            </div>
          </div>

          <!-- Question Navigator Grid -->
          <div class="glass-card p-3 rounded-2xl flex flex-wrap gap-1.5">
            ${questions.map((_, i) => {
              const hasAns = answers[i] !== undefined && (Array.isArray(answers[i]) ? answers[i].some((v) => v !== null && v !== undefined) : true);
              let cls = 'bg-[#070D1F] border-[#2A3C6E] text-slate-400';
              if (i === currentIdx) cls = 'bg-[#4FD1C5] border-[#4FD1C5] text-slate-950 font-black';
              else if (flagged.has(i)) cls = 'bg-amber-500/20 border-amber-400 text-amber-300';
              else if (hasAns) cls = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
              return `<button data-qidx="${i}" class="qnav-btn w-8 h-8 rounded-lg border text-xs font-semibold transition ${cls}">${i + 1}</button>`;
            }).join('')}
          </div>

          <!-- Question Card -->
          <div class="glass-card p-6 rounded-2xl space-y-5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ${type === 'TRAC_NGHIEM' ? 'Trắc nghiệm 4 lựa chọn' : type === 'DUNG_SAI' ? 'Đúng / Sai (4 mệnh đề)' : 'Tự luận / Trả lời ngắn'}
              </span>
              <div class="flex items-center space-x-2">
                <button id="quiz-flag-btn" class="px-2.5 py-1 rounded-lg border text-xs font-semibold ${isFlagged ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-[#070D1F] border-[#2A3C6E] text-slate-400'}">🚩 ${isFlagged ? 'Đã gắn cờ' : 'Xem lại'}</button>
                <button id="quiz-save-btn" class="px-2.5 py-1 rounded-lg border text-xs font-semibold ${isSaved ? 'bg-[#4FD1C5]/20 border-[#4FD1C5] text-[#4FD1C5]' : 'bg-[#070D1F] border-[#2A3C6E] text-slate-400'}">🔖 ${isSaved ? 'Đã lưu' : 'Lưu câu'}</button>
              </div>
            </div>

            <div class="text-base text-slate-100 leading-relaxed">${APKatex.render(q.cauhoi || '')}</div>

            ${q.hinhAnh ? `
              <div class="flex justify-center">
                <img src="${resolveImgPath(q.hinhAnh)}" alt="Hình minh họa" class="quiz-zoom-img max-h-64 rounded-xl border border-[#2A3C6E] bg-white cursor-zoom-in">
              </div>
            ` : ''}

            <div id="quiz-options-area" class="space-y-3"></div>

            <div class="flex items-center justify-between pt-3 border-t border-[#2A3C6E]">
              <button id="quiz-prev-btn" class="px-4 py-2 rounded-xl bg-[#070D1F] border border-[#2A3C6E] text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40" ${currentIdx === 0 ? 'disabled' : ''}>← Câu trước</button>
              <button id="quiz-next-btn" class="px-4 py-2 rounded-xl bg-[#162347] border border-[#4FD1C5]/40 text-xs font-bold text-[#4FD1C5] hover:bg-[#4FD1C5]/10">
                ${currentIdx === questions.length - 1 ? 'Hoàn thành & Nộp bài ✓' : 'Câu tiếp theo →'}
              </button>
            </div>
          </div>
        </div>
      `;

      const optArea = container.querySelector('#quiz-options-area');
      if (type === 'TRAC_NGHIEM') {
        const optsList = q.caccauChon || [];
        const letters = ['A', 'B', 'C', 'D'];
        optArea.innerHTML = optsList.map((optText, oi) => {
          const selected = answers[currentIdx] === oi;
          return `
            <button data-opt="${oi}" class="tn-opt-btn w-full text-left p-4 rounded-xl border transition flex items-start space-x-3 ${selected ? 'bg-[#4FD1C5]/15 border-[#4FD1C5] text-white' : 'bg-[#070D1F] border-[#2A3C6E] text-slate-300 hover:border-slate-500'}">
              <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${selected ? 'bg-[#4FD1C5] text-slate-950' : 'bg-[#162347] text-slate-300'}">${letters[oi] || oi + 1}</span>
              <span class="text-sm leading-relaxed">${APKatex.render(optText)}</span>
            </button>
          `;
        }).join('');
        optArea.querySelectorAll('.tn-opt-btn').forEach((b) => {
          b.addEventListener('click', () => {
            APAudio.playClick(state);
            answers[currentIdx] = Number(b.dataset.opt);
            renderQuestion();
          });
        });
      } else if (type === 'DUNG_SAI') {
        const stmts = q.dsYCon || [];
        const userArr = Array.isArray(answers[currentIdx]) ? answers[currentIdx] : [null, null, null, null];
        const letters = ['a', 'b', 'c', 'd'];
        optArea.innerHTML = stmts.map((st, si) => `
          <div class="p-4 rounded-xl bg-[#070D1F] border border-[#2A3C6E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="text-sm text-slate-200"><strong class="text-[#4FD1C5] mr-1">${letters[si]})</strong> ${APKatex.render(st)}</div>
            <div class="flex space-x-2 shrink-0">
              <button data-si="${si}" data-val="true" class="ds-btn px-3.5 py-1.5 rounded-lg text-xs font-bold border ${userArr[si] === true ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-[#162347] text-slate-300 border-[#2A3C6E]'}">Đúng</button>
              <button data-si="${si}" data-val="false" class="ds-btn px-3.5 py-1.5 rounded-lg text-xs font-bold border ${userArr[si] === false ? 'bg-rose-500 text-white border-rose-400' : 'bg-[#162347] text-slate-300 border-[#2A3C6E]'}">Sai</button>
            </div>
          </div>
        `).join('');
        optArea.querySelectorAll('.ds-btn').forEach((b) => {
          b.addEventListener('click', () => {
            APAudio.playClick(state);
            const arr = Array.isArray(answers[currentIdx]) ? [...answers[currentIdx]] : [null, null, null, null];
            arr[Number(b.dataset.si)] = b.dataset.val === 'true';
            answers[currentIdx] = arr;
            renderQuestion();
          });
        });
      } else {
        const val = answers[currentIdx] || '';
        optArea.innerHTML = `
          <div class="space-y-2">
            <label class="block text-xs text-slate-400">Nhập câu trả lời / ghi chú tự luận (tự đối chiếu đáp án khi nộp bài):</label>
            <textarea id="tu-luan-input" rows="3" class="w-full bg-[#070D1F] border border-[#2A3C6E] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#4FD1C5]" placeholder="Nhập đáp số hoặc hướng giải...">${APKatex.escapeHtml(val)}</textarea>
          </div>
        `;
        optArea.querySelector('#tu-luan-input').addEventListener('input', (e) => {
          answers[currentIdx] = e.target.value;
        });
      }

      // Bindings
      container.querySelector('#quiz-back-btn').addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn thoát bài làm hiện tại?')) {
          stopTimer();
          onExit();
        }
      });
      container.querySelector('#quiz-submit-btn').addEventListener('click', () => {
        if (confirm('Nộp bài ngay và xem kết quả?')) submitQuiz();
      });
      container.querySelectorAll('.qnav-btn').forEach((b) => {
        b.addEventListener('click', () => {
          currentIdx = Number(b.dataset.qidx);
          renderQuestion();
        });
      });
      container.querySelector('#quiz-prev-btn').addEventListener('click', () => {
        if (currentIdx > 0) { currentIdx--; renderQuestion(); }
      });
      container.querySelector('#quiz-next-btn').addEventListener('click', () => {
        if (currentIdx < questions.length - 1) { currentIdx++; renderQuestion(); }
        else if (confirm('Bạn đã đến câu cuối cùng. Nộp bài ngay?')) submitQuiz();
      });
      container.querySelector('#quiz-flag-btn').addEventListener('click', () => {
        if (flagged.has(currentIdx)) flagged.delete(currentIdx);
        else flagged.add(currentIdx);
        renderQuestion();
      });
      container.querySelector('#quiz-save-btn').addEventListener('click', () => {
        APStorage.toggleSavedQuestion(state, filePath, q);
        renderQuestion();
      });
      const zoomImg = container.querySelector('.quiz-zoom-img');
      if (zoomImg && openLightbox) {
        zoomImg.addEventListener('click', () => openLightbox(zoomImg.src, q.cauhoi || ''));
      }
    }

    function renderResult(result) {
      const wrongIndices = result.details
        .filter((d) => !d.isCorrect && d.type !== 'TU_LUAN')
        .map((d) => d.idx);

      container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
          <div class="glass-card p-7 rounded-3xl text-center space-y-4">
            <div class="text-xs font-bold uppercase tracking-widest text-[#4FD1C5]">
              ${result.mode === 'DE_THI' ? 'Kết Quả Đề Thi (Hệ 10.0)' : 'Hoàn Thành Bài Tập Nhanh'}
            </div>
            <h2 class="text-2xl font-extrabold text-white">${APKatex.escapeHtml(title)}</h2>
            <div class="flex flex-wrap justify-center gap-6 py-3">
              ${result.mode === 'DE_THI' ? `
                <div class="px-6 py-4 rounded-2xl bg-[#070D1F] border border-[#4FD1C5]/40">
                  <div class="text-4xl font-black ${result.score10 >= 5 ? 'text-emerald-400' : 'text-rose-400'}">${result.score10.toFixed(2)}</div>
                  <div class="text-xs text-slate-400 mt-1">Điểm hệ 10</div>
                </div>
              ` : ''}
              <div class="px-6 py-4 rounded-2xl bg-[#070D1F] border border-[#2A3C6E]">
                <div class="text-4xl font-black text-[#38BDF8]">${result.correctCount}/${result.totalQuestions}</div>
                <div class="text-xs text-slate-400 mt-1">Số câu đúng hoàn toàn</div>
              </div>
            </div>
            <div class="flex flex-wrap justify-center gap-3 pt-2">
              <button id="res-exit-btn" class="px-5 py-2.5 rounded-xl bg-[#070D1F] border border-[#2A3C6E] text-xs font-bold text-slate-200 hover:border-[#4FD1C5]">← Quay lại</button>
              <button id="res-retry-btn" class="px-5 py-2.5 rounded-xl bg-[#162347] border border-[#38BDF8]/40 text-xs font-bold text-[#38BDF8]">↻ Làm lại toàn bộ</button>
              ${wrongIndices.length > 0 ? `
                <button id="res-retry-wrong-btn" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4FD1C5] to-[#38BDF8] text-slate-950 text-xs font-bold">🎯 Luyện lại ${wrongIndices.length} câu sai</button>
              ` : ''}
            </div>
          </div>

          <!-- Detailed Review -->
          <div class="space-y-4">
            <h3 class="text-base font-bold text-white">Xem lại chi tiết &amp; Lời giải</h3>
            ${questions.map((q, i) => {
              const d = result.details[i];
              const borderCls = d.type === 'TU_LUAN'
                ? 'border-indigo-500/40'
                : d.isCorrect ? 'border-emerald-500/50' : 'border-rose-500/50';
              const statusBadge = d.type === 'TU_LUAN'
                ? '<span class="text-xs font-bold text-indigo-300">Tự luận (Tự đối chiếu)</span>'
                : d.isCorrect
                  ? '<span class="text-xs font-bold text-emerald-400">✓ Chính xác</span>'
                  : '<span class="text-xs font-bold text-rose-400">✕ Chưa đúng</span>';

              let ansSummary = '';
              if (d.type === 'TRAC_NGHIEM') {
                const letters = ['A', 'B', 'C', 'D'];
                const userPick = answers[i] !== undefined ? `${letters[answers[i]]}. ${(q.caccauChon || [])[answers[i]] || ''}` : 'Chưa chọn';
                const rightPick = `${letters[q.dapAnDung]}. ${(q.caccauChon || [])[q.dapAnDung] || ''}`;
                ansSummary = `
                  <div class="text-xs space-y-1 bg-[#070D1F] p-3 rounded-xl">
                    <div class="text-slate-400">Bạn chọn: <span class="${d.isCorrect ? 'text-emerald-400' : 'text-rose-400'}">${APKatex.render(userPick)}</span></div>
                    <div class="text-slate-300">Đáp án đúng: <span class="text-emerald-400 font-semibold">${APKatex.render(rightPick)}</span></div>
                  </div>
                `;
              } else if (d.type === 'DUNG_SAI') {
                const truth = q.dapAnDungSai || [];
                const userArr = Array.isArray(answers[i]) ? answers[i] : [];
                const letters = ['a', 'b', 'c', 'd'];
                ansSummary = `
                  <div class="text-xs space-y-1 bg-[#070D1F] p-3 rounded-xl">
                    ${(q.dsYCon || []).map((st, si) => `
                      <div class="flex items-center justify-between gap-2 py-0.5">
                        <span class="text-slate-300">${letters[si]}) ${APKatex.render(st)}</span>
                        <span class="shrink-0 font-bold ${userArr[si] === truth[si] ? 'text-emerald-400' : 'text-rose-400'}">Đáp án: ${truth[si] ? 'Đúng' : 'Sai'}</span>
                      </div>
                    `).join('')}
                  </div>
                `;
              } else {
                ansSummary = `
                  <div class="text-xs bg-[#070D1F] p-3 rounded-xl text-slate-300">
                    <div>Bài làm của bạn: ${APKatex.escapeHtml(answers[i] || '(Trống)')}</div>
                    ${q.dapAnDung ? `<div class="mt-1 text-emerald-400">Gợi ý đáp án: ${APKatex.render(String(q.dapAnDung))}</div>` : ''}
                  </div>
                `;
              }

              return `
                <div class="glass-card p-5 rounded-2xl border ${borderCls} space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-white">Câu ${i + 1}</span>
                    ${statusBadge}
                  </div>
                  <div class="text-sm text-slate-200">${APKatex.render(q.cauhoi || '')}</div>
                  ${ansSummary}
                  ${q.giaithich ? `
                    <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-200">
                      <strong class="text-emerald-300">Lời giải:</strong> ${APKatex.render(q.giaithich)}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      container.querySelector('#res-exit-btn').addEventListener('click', onExit);
      container.querySelector('#res-retry-btn').addEventListener('click', () => {
        startQuiz(container, opts);
      });
      const retryWrongBtn = container.querySelector('#res-retry-wrong-btn');
      if (retryWrongBtn) {
        retryWrongBtn.addEventListener('click', () => {
          const wrongQs = wrongIndices.map((i) => questions[i]);
          startQuiz(container, {
            ...opts,
            title: `${title} (Luyện lại câu sai)`,
            questions: wrongQs,
            mode: 'BAI_TAP_NHANH',
            durationMin: Math.max(5, wrongQs.length * 2),
            taskId: null
          });
        });
      }
    }

    renderQuestion();
    return stopTimer;
  }

  function startPhanXa(container, topicMeta, questions, state, onExit) {
    let idx = 0;
    let correct = 0;
    const startTime = performance.now();
    let timerInt = null;

    function computeRank(acc, avgSec) {
      if (acc >= 95 && avgSec <= 5.0) return 'A+';
      if (acc >= 85 && avgSec <= 7.0) return 'A';
      if (acc >= 75) return 'B';
      if (acc >= 60) return 'C';
      if (acc >= 40) return 'D';
      return 'F';
    }

    function renderStep() {
      if (idx >= questions.length) {
        if (timerInt) clearInterval(timerInt);
        const totalSec = (performance.now() - startTime) / 1000;
        const acc = Math.round((correct / questions.length) * 100);
        const avgSec = totalSec / questions.length;
        const rank = computeRank(acc, avgSec);
        state.phanXaRanks[topicMeta.id] = { rank, acc, avgSec: Number(avgSec.toFixed(2)) };
        APStorage.recordDailyStreak(state);
        APStorage.saveState(state);

        container.innerHTML = `
          <div class="max-w-xl mx-auto glass-card p-8 rounded-3xl text-center space-y-5">
            <div class="text-xs font-bold uppercase tracking-widest text-[#4FD1C5]">Kết Quả Phản Xạ Lý Thuyết</div>
            <h2 class="text-xl font-extrabold text-white">${APKatex.escapeHtml(topicMeta.tenChuDe)}</h2>
            <div class="text-6xl font-black text-gradient py-2">Hạng ${rank}</div>
            <div class="grid grid-cols-3 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-[#070D1F] border border-[#2A3C6E]">
                <div class="text-lg font-black text-emerald-400">${correct}/${questions.length}</div>
                <div class="text-slate-400">Chính xác (${acc}%)</div>
              </div>
              <div class="p-3 rounded-xl bg-[#070D1F] border border-[#2A3C6E]">
                <div class="text-lg font-black text-[#38BDF8]">${totalSec.toFixed(1)}s</div>
                <div class="text-slate-400">Tổng thời gian</div>
              </div>
              <div class="p-3 rounded-xl bg-[#070D1F] border border-[#2A3C6E]">
                <div class="text-lg font-black text-amber-300">${avgSec.toFixed(1)}s</div>
                <div class="text-slate-400">TB / câu</div>
              </div>
            </div>
            <button id="px-done-btn" class="px-6 py-2.5 rounded-xl bg-[#4FD1C5] text-slate-950 font-bold text-sm">Quay lại</button>
          </div>
        `;
        container.querySelector('#px-done-btn').addEventListener('click', onExit);
        return;
      }

      const q = questions[idx];
      const letters = ['A', 'B', 'C', 'D'];
      container.innerHTML = `
        <div class="max-w-3xl mx-auto space-y-5">
          <div class="glass-card p-4 rounded-2xl flex items-center justify-between">
            <button id="px-exit" class="px-3 py-1.5 rounded-lg bg-[#070D1F] border border-[#2A3C6E] text-xs font-semibold text-slate-300">← Thoát</button>
            <span class="text-xs font-bold text-white">⚡ Phản xạ • Câu ${idx + 1}/${questions.length}</span>
            <span id="px-clock" class="text-xs font-mono font-bold text-[#4FD1C5]">0.0s</span>
          </div>
          <div class="glass-card p-6 rounded-2xl space-y-4">
            <div class="text-base text-white leading-relaxed">${APKatex.render(q.cauhoi || '')}</div>
            <div class="space-y-2.5">
              ${(q.caccauChon || []).map((opt, oi) => `
                <button data-oi="${oi}" class="px-opt w-full text-left p-4 rounded-xl bg-[#070D1F] border border-[#2A3C6E] hover:border-[#4FD1C5] text-sm text-slate-200 flex items-start space-x-3 transition">
                  <span class="w-7 h-7 rounded-lg bg-[#162347] flex items-center justify-center text-xs font-bold shrink-0">${letters[oi]}</span>
                  <span>${APKatex.render(opt)}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      container.querySelector('#px-exit').addEventListener('click', () => {
        if (timerInt) clearInterval(timerInt);
        onExit();
      });

      container.querySelectorAll('.px-opt').forEach((b) => {
        b.addEventListener('click', () => {
          APAudio.playClick(state);
          const picked = Number(b.dataset.oi);
          if (picked === Number(q.dapAnDung)) {
            correct++;
            b.classList.add('border-emerald-400', 'bg-emerald-500/20');
          } else {
            b.classList.add('border-rose-400', 'bg-rose-500/20');
          }
          setTimeout(() => {
            idx++;
            renderStep();
          }, 220);
        });
      });
    }

    timerInt = setInterval(() => {
      const cl = document.getElementById('px-clock');
      if (cl) cl.textContent = `${((performance.now() - startTime) / 1000).toFixed(1)}s`;
    }, 100);

    renderStep();
  }

  global.APQuiz = {
    startQuiz,
    startPhanXa,
    getQuestionType
  };
})(window);
