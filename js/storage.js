(function (global) {
  const STORAGE_KEY = 'aphysics_web_state_v1';

  function getTodayStr(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function defaultState() {
    return {
      appSignature: 'APHYSICS_WEB_BACKUP_V1',
      profile: {
        nickname: 'Học sinh Vật Lý',
        avatar: '🧑‍🎓',
        grade: 10,
        targetScore: 9.0
      },
      settings: {
        lowEndMode: false,
        soundEnabled: true
      },
      streak: {
        count: 0,
        lastDate: '',
        historyDates: []
      },
      completedTasks: [],
      scoreHistory: [],
      savedQuestions: [],
      phanXaRanks: {},
      lastLesson: null
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return {
        ...base,
        ...parsed,
        profile: { ...base.profile, ...(parsed.profile || {}) },
        settings: { ...base.settings, ...(parsed.settings || {}) },
        streak: { ...base.streak, ...(parsed.streak || {}) },
        completedTasks: Array.isArray(parsed.completedTasks) ? parsed.completedTasks : [],
        scoreHistory: Array.isArray(parsed.scoreHistory) ? parsed.scoreHistory : [],
        savedQuestions: Array.isArray(parsed.savedQuestions) ? parsed.savedQuestions : [],
        phanXaRanks: parsed.phanXaRanks || {}
      };
    } catch {
      return defaultState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function checkNewDayStreak(state) {
    const today = getTodayStr(0);
    const yesterday = getTodayStr(-1);
    if (state.streak.lastDate && state.streak.lastDate !== today && state.streak.lastDate !== yesterday) {
      state.streak.count = 0;
      saveState(state);
    }
    return state;
  }

  function recordDailyStreak(state) {
    const today = getTodayStr(0);
    const yesterday = getTodayStr(-1);
    if (state.streak.lastDate === today) return state;
    if (state.streak.lastDate === yesterday) {
      state.streak.count = (state.streak.count || 0) + 1;
    } else {
      state.streak.count = 1;
    }
    state.streak.lastDate = today;
    if (!state.streak.historyDates.includes(today)) {
      state.streak.historyDates.push(today);
      if (state.streak.historyDates.length > 180) {
        state.streak.historyDates = state.streak.historyDates.slice(-180);
      }
    }
    saveState(state);
    return state;
  }

  function markTaskCompleted(state, taskId) {
    if (taskId && !state.completedTasks.includes(taskId)) {
      state.completedTasks.push(taskId);
    }
    recordDailyStreak(state);
    saveState(state);
  }

  function addScoreRecord(state, record) {
    state.scoreHistory.unshift({
      ...record,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleString('vi-VN')
    });
    if (state.scoreHistory.length > 100) {
      state.scoreHistory = state.scoreHistory.slice(0, 100);
    }
    recordDailyStreak(state);
    saveState(state);
  }

  function toggleSavedQuestion(state, filePath, question) {
    const key = `${filePath}::${question.id ?? question.cauhoi?.slice(0, 40)}`;
    const idx = state.savedQuestions.findIndex((x) => x.key === key);
    let saved = false;
    if (idx >= 0) {
      state.savedQuestions.splice(idx, 1);
      saved = false;
    } else {
      state.savedQuestions.unshift({ key, filePath, question, savedAt: Date.now() });
      saved = true;
    }
    saveState(state);
    return saved;
  }

  function isQuestionSaved(state, filePath, question) {
    const key = `${filePath}::${question.id ?? question.cauhoi?.slice(0, 40)}`;
    return state.savedQuestions.some((x) => x.key === key);
  }

  function exportBackupJson(state) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const filename = `APhysics_Backup_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.json`;
    const payload = {
      ...state,
      appSignature: 'APHYSICS_WEB_BACKUP_V1',
      exportedAt: now.toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return filename;
  }

  function importBackupJson(rawText) {
    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('File JSON không hợp lệ.');
    }
    if (parsed.appSignature === 'APHYSICS_WEB_BACKUP_V1') {
      const base = defaultState();
      const merged = {
        ...base,
        ...parsed,
        profile: { ...base.profile, ...(parsed.profile || {}) },
        settings: { ...base.settings, ...(parsed.settings || {}) },
        streak: { ...base.streak, ...(parsed.streak || {}) }
      };
      saveState(merged);
      return merged;
    }
    if (parsed.appSignature === 'APHYSICS_BACKUP_V1' && parsed.preferences) {
      // Support importing Android backup preferences into Web state
      const state = loadState();
      const sys = parsed.preferences['APhysics_System_Pref'] || {};
      const theory = parsed.preferences['APhysics_Theory_Pref'] || {};
      if (sys.user_nickname) state.profile.nickname = String(sys.user_nickname);
      if (sys.user_avatar) state.profile.avatar = String(sys.user_avatar);
      if (typeof sys.streak_days === 'number') state.streak.count = sys.streak_days;
      if (Array.isArray(theory.completed_tasks)) {
        state.completedTasks = Array.from(new Set([...state.completedTasks, ...theory.completed_tasks]));
      }
      saveState(state);
      return state;
    }
    throw new Error('Không nhận diện được định dạng sao lưu A+ Physics.');
  }

  function resetAllData() {
    localStorage.removeItem(STORAGE_KEY);
    return defaultState();
  }

  global.APStorage = {
    loadState,
    saveState,
    checkNewDayStreak,
    recordDailyStreak,
    markTaskCompleted,
    addScoreRecord,
    toggleSavedQuestion,
    isQuestionSaved,
    exportBackupJson,
    importBackupJson,
    resetAllData,
    getTodayStr
  };
})(window);
