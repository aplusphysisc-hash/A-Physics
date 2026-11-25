(function (global) {
  const UNIT_GROUPS = [
    {
      id: 'si_prefix', name: 'Tiền tố SI', icon: '⚡', defaultUnit: 'don_vi',
      units: [
        { id: 'femto', label: 'femto (f) [10⁻¹⁵]', factor: 1e-15 },
        { id: 'pico', label: 'pico (p) [10⁻¹²]', factor: 1e-12 },
        { id: 'nano', label: 'nano (n) [10⁻⁹]', factor: 1e-9 },
        { id: 'micro', label: 'micro (µ) [10⁻⁶]', factor: 1e-6 },
        { id: 'mili', label: 'mili (m) [10⁻³]', factor: 1e-3 },
        { id: 'centi', label: 'centi (c) [10⁻²]', factor: 1e-2 },
        { id: 'deci', label: 'deci (d) [10⁻¹]', factor: 1e-1 },
        { id: 'don_vi', label: 'Đơn vị gốc (10⁰ = 1)', factor: 1.0 },
        { id: 'kilo', label: 'kilo (k) [10³]', factor: 1e3 },
        { id: 'mega', label: 'Mega (M) [10⁶]', factor: 1e6 },
        { id: 'giga', label: 'Giga (G) [10⁹]', factor: 1e9 },
        { id: 'tera', label: 'Tera (T) [10¹²]', factor: 1e12 }
      ]
    },
    {
      id: 'length', name: 'Độ dài & Bước sóng', icon: '📏', defaultUnit: 'm',
      units: [
        { id: 'angstrom', label: 'Angstrom (Å)', factor: 1e-10 },
        { id: 'nm', label: 'Nanomét (nm)', factor: 1e-9 },
        { id: 'um', label: 'Micromét (µm)', factor: 1e-6 },
        { id: 'mm', label: 'Milimét (mm)', factor: 1e-3 },
        { id: 'cm', label: 'Centimét (cm)', factor: 1e-2 },
        { id: 'dm', label: 'Decimét (dm)', factor: 1e-1 },
        { id: 'm', label: 'Mét (m) [Chuẩn]', factor: 1.0 },
        { id: 'km', label: 'Kilômét (km)', factor: 1000.0 },
        { id: 'inch', label: 'Inch (in)', factor: 0.0254 },
        { id: 'ft', label: 'Foot (ft)', factor: 0.3048 },
        { id: 'nmi', label: 'Hải lý (nmi)', factor: 1852.0 },
        { id: 'au', label: 'Đơn vị thiên văn (AU)', factor: 1.495978707e11 },
        { id: 'ly', label: 'Năm ánh sáng (ly)', factor: 9.460730472e15 }
      ]
    },
    {
      id: 'area_volume', name: 'Diện tích & Thể tích', icon: '🧊', defaultUnit: 'm3',
      units: [
        { id: 'mm2', label: 'Milimét vuông (mm²)', factor: 1e-6 },
        { id: 'cm2', label: 'Centimét vuông (cm²)', factor: 1e-4 },
        { id: 'dm2', label: 'Decimét vuông (dm²)', factor: 1e-2 },
        { id: 'm2', label: 'Mét vuông (m²)', factor: 1.0 },
        { id: 'ha', label: 'Hecta (ha)', factor: 1e4 },
        { id: 'km2', label: 'Kilômét vuông (km²)', factor: 1e6 },
        { id: 'mm3', label: 'Milimét khối (mm³)', factor: 1e-9 },
        { id: 'cm3', label: 'Centimét khối (cm³ / ml)', factor: 1e-6 },
        { id: 'dm3', label: 'Lít / Decimét khối (L / dm³)', factor: 1e-3 },
        { id: 'm3', label: 'Mét khối (m³)', factor: 1.0 }
      ]
    },
    {
      id: 'mass', name: 'Khối lượng & Hạt nhân', icon: '⚖️', defaultUnit: 'kg',
      units: [
        { id: 'mg', label: 'Miligam (mg)', factor: 1e-6 },
        { id: 'g', label: 'Gam (g)', factor: 1e-3 },
        { id: 'kg', label: 'Kilôgam (kg) [Chuẩn]', factor: 1.0 },
        { id: 'yen', label: 'Yến (10 kg)', factor: 10.0 },
        { id: 'ta', label: 'Tạ (100 kg)', factor: 100.0 },
        { id: 'tan', label: 'Tấn (1000 kg)', factor: 1000.0 },
        { id: 'amu', label: 'amu / đvC (u)', factor: 1.6605390666e-27 },
        { id: 'mev_c2', label: 'MeV/c² (Hạt nhân)', factor: 1.78266192e-30 }
      ]
    },
    {
      id: 'time', name: 'Thời gian', icon: '⏱️', defaultUnit: 's',
      units: [
        { id: 'ns', label: 'Nano giây (ns)', factor: 1e-9 },
        { id: 'us', label: 'Micro giây (µs)', factor: 1e-6 },
        { id: 'ms', label: 'Mili giây (ms)', factor: 1e-3 },
        { id: 's', label: 'Giây (s) [Chuẩn]', factor: 1.0 },
        { id: 'phut', label: 'Phút (min)', factor: 60.0 },
        { id: 'gio', label: 'Giờ (h)', factor: 3600.0 },
        { id: 'ngay', label: 'Ngày (day)', factor: 86400.0 },
        { id: 'nam', label: 'Năm (year)', factor: 31557600.0 }
      ]
    },
    {
      id: 'frequency', name: 'Tần số & Tốc độ góc', icon: '📻', defaultUnit: 'hz',
      units: [
        { id: 'hz', label: 'Héc (Hz) [Chuẩn]', factor: 1.0 },
        { id: 'khz', label: 'Kilôhéc (kHz)', factor: 1e3 },
        { id: 'mhz', label: 'Mêgahéc (MHz)', factor: 1e6 },
        { id: 'ghz', label: 'Gigahéc (GHz)', factor: 1e9 },
        { id: 'rad_s', label: 'Radian/giây (rad/s) [ω]', factor: 1.0 / (2 * Math.PI) },
        { id: 'rpm', label: 'Vòng/phút (rpm)', factor: 1.0 / 60.0 },
        { id: 'rps', label: 'Vòng/giây (rps)', factor: 1.0 }
      ]
    },
    {
      id: 'velocity', name: 'Vận tốc', icon: '🏎️', defaultUnit: 'm_s',
      units: [
        { id: 'mm_s', label: 'Milimét/giây (mm/s)', factor: 0.001 },
        { id: 'cm_s', label: 'Centimét/giây (cm/s)', factor: 0.01 },
        { id: 'm_s', label: 'Mét/giây (m/s) [Chuẩn]', factor: 1.0 },
        { id: 'km_h', label: 'Kilômét/giờ (km/h)', factor: 1.0 / 3.6 },
        { id: 'km_s', label: 'Kilômét/giây (km/s)', factor: 1000.0 },
        { id: 'mach', label: 'Mach (Âm thanh)', factor: 340.3 }
      ]
    },
    {
      id: 'acceleration', name: 'Gia tốc', icon: '🚀', defaultUnit: 'm_s2',
      units: [
        { id: 'cm_s2', label: 'cm/s²', factor: 0.01 },
        { id: 'm_s2', label: 'm/s² [Chuẩn]', factor: 1.0 },
        { id: 'g0', label: 'Gia tốc trọng trường g₀', factor: 9.80665 }
      ]
    },
    {
      id: 'force', name: 'Lực', icon: '💪', defaultUnit: 'n',
      units: [
        { id: 'dyn', label: 'Đin (dyn)', factor: 1e-5 },
        { id: 'mn', label: 'Miliniutơn (mN)', factor: 1e-3 },
        { id: 'n', label: 'Niutơn (N) [Chuẩn]', factor: 1.0 },
        { id: 'kn', label: 'Kilôniutơn (kN)', factor: 1000.0 },
        { id: 'mn_force', label: 'Mêganiutơn (MN)', factor: 1e6 },
        { id: 'kgf', label: 'Kilôgam lực (kgf)', factor: 9.80665 }
      ]
    },
    {
      id: 'density', name: 'Khối lượng riêng', icon: '🧱', defaultUnit: 'kg_m3',
      units: [
        { id: 'kg_m3', label: 'kg/m³ [Chuẩn]', factor: 1.0 },
        { id: 'g_cm3', label: 'g/cm³', factor: 1000.0 },
        { id: 'kg_l', label: 'kg/L', factor: 1000.0 }
      ]
    },
    {
      id: 'pressure', name: 'Áp suất', icon: '🌪️', defaultUnit: 'pa',
      units: [
        { id: 'pa', label: 'Pascan (Pa) [Chuẩn]', factor: 1.0 },
        { id: 'hpa', label: 'hPa', factor: 100.0 },
        { id: 'kpa', label: 'kPa', factor: 1000.0 },
        { id: 'mpa', label: 'MPa', factor: 1e6 },
        { id: 'bar', label: 'Bar', factor: 100000.0 },
        { id: 'mbar', label: 'Milibar', factor: 100.0 },
        { id: 'atm', label: 'Atmosphere (atm)', factor: 101325.0 },
        { id: 'at', label: 'at (kgf/cm²)', factor: 98066.5 },
        { id: 'mmhg', label: 'mmHg / Torr', factor: 133.322387415 },
        { id: 'cmh2o', label: 'cmH₂O', factor: 98.0665 },
        { id: 'psi', label: 'psi', factor: 6894.757 }
      ]
    },
    {
      id: 'energy', name: 'Năng lượng & Công', icon: '🔋', defaultUnit: 'j',
      units: [
        { id: 'erg', label: 'Erg', factor: 1e-7 },
        { id: 'j', label: 'Jun (J) [Chuẩn]', factor: 1.0 },
        { id: 'kj', label: 'Kilôjun (kJ)', factor: 1000.0 },
        { id: 'mj', label: 'Mêgajun (MJ)', factor: 1e6 },
        { id: 'cal', label: 'Calo (cal)', factor: 4.184 },
        { id: 'kcal', label: 'Kilôcalo (kcal)', factor: 4184.0 },
        { id: 'wh', label: 'Oat giờ (Wh)', factor: 3600.0 },
        { id: 'kwh', label: 'Kilôoat giờ (kWh)', factor: 3.6e6 },
        { id: 'ev', label: 'Electron-vôn (eV)', factor: 1.602176634e-19 },
        { id: 'kev', label: 'keV', factor: 1.602176634e-16 },
        { id: 'mev', label: 'MeV', factor: 1.602176634e-13 },
        { id: 'gev', label: 'GeV', factor: 1.602176634e-10 },
        { id: 'l_atm', label: 'Lít-atm (L·atm)', factor: 101.325 }
      ]
    },
    {
      id: 'power', name: 'Công suất', icon: '💡', defaultUnit: 'w',
      units: [
        { id: 'mw', label: 'Milioat (mW)', factor: 1e-3 },
        { id: 'w', label: 'Oat (W) [Chuẩn]', factor: 1.0 },
        { id: 'kw', label: 'Kilôoat (kW)', factor: 1000.0 },
        { id: 'mw_power', label: 'Mêgaoat (MW)', factor: 1e6 },
        { id: 'hp', label: 'Mã lực Anh (HP)', factor: 745.699872 },
        { id: 'cv', label: 'Mã lực Pháp (CV)', factor: 735.49875 },
        { id: 'kcal_h', label: 'kcal/h', factor: 1.163 }
      ]
    },
    {
      id: 'temperature', name: 'Nhiệt độ (Lớp 12)', icon: '🌡️', defaultUnit: 'deg_c',
      units: [
        { id: 'deg_c', label: 'Độ C (°C)', factor: 1.0, isTemp: true },
        { id: 'kelvin', label: 'Kelvin (K) [Chuẩn]', factor: 1.0, isTemp: true },
        { id: 'deg_f', label: 'Độ F (°F)', factor: 1.0, isTemp: true }
      ]
    },
    {
      id: 'angle', name: 'Góc lượng giác', icon: '📐', defaultUnit: 'rad',
      units: [
        { id: 'arcsec', label: "Giây góc ('')", factor: Math.PI / (180.0 * 3600.0) },
        { id: 'arcmin', label: "Phút góc (')", factor: Math.PI / (180.0 * 60.0) },
        { id: 'deg', label: 'Độ (°)', factor: Math.PI / 180.0 },
        { id: 'rad', label: 'Radian (rad) [Chuẩn]', factor: 1.0 },
        { id: 'vong', label: 'Vòng (2π rad)', factor: 2 * Math.PI }
      ]
    },
    {
      id: 'em_nuclear', name: 'Điện - Từ & Hạt nhân', icon: '⚛️', defaultUnit: 'c',
      units: [
        { id: 'pc', label: 'Picoculông (pC)', factor: 1e-12 },
        { id: 'nc', label: 'Nanoculông (nC)', factor: 1e-9 },
        { id: 'uc', label: 'Microculông (µC)', factor: 1e-6 },
        { id: 'mc', label: 'Miliculông (mC)', factor: 1e-3 },
        { id: 'c', label: 'Culông (C)', factor: 1.0 },
        { id: 'mah', label: 'mAh', factor: 3.6 },
        { id: 'ah', label: 'Ah', factor: 3600.0 },
        { id: 'e_charge', label: 'Điện tích e', factor: 1.602176634e-19 },
        { id: 'pf', label: 'pF', factor: 1e-12 },
        { id: 'nf', label: 'nF', factor: 1e-9 },
        { id: 'uf', label: 'µF', factor: 1e-6 },
        { id: 'f', label: 'Fara (F)', factor: 1.0 },
        { id: 'uh', label: 'µH', factor: 1e-6 },
        { id: 'mh', label: 'mH', factor: 1e-3 },
        { id: 'h', label: 'Henri (H)', factor: 1.0 },
        { id: 'gauss', label: 'Gauss (G)', factor: 1e-4 },
        { id: 'ut', label: 'µT', factor: 1e-6 },
        { id: 'mt', label: 'mT', factor: 1e-3 },
        { id: 't', label: 'Tesla (T)', factor: 1.0 },
        { id: 'bq', label: 'Bq', factor: 1.0 },
        { id: 'kbq', label: 'kBq', factor: 1e3 },
        { id: 'mbq', label: 'MBq', factor: 1e6 },
        { id: 'uci', label: 'µCi', factor: 3.7e4 },
        { id: 'mci', label: 'mCi', factor: 3.7e7 },
        { id: 'ci', label: 'Curi (Ci)', factor: 3.7e10 }
      ]
    }
  ];

  function convertUnit(val, fromUnit, toUnit) {
    if (fromUnit.id === toUnit.id) return val;
    if (fromUnit.isTemp && toUnit.isTemp) {
      let c = val;
      if (fromUnit.id === 'kelvin') c = val - 273.15;
      else if (fromUnit.id === 'deg_f') c = (val - 32.0) / 1.8;
      if (toUnit.id === 'kelvin') return c + 273.15;
      if (toUnit.id === 'deg_f') return c * 1.8 + 32.0;
      return c;
    }
    return (val * fromUnit.factor) / toUnit.factor;
  }

  function toSup(num) {
    const map = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺' };
    return String(num).split('').map((c) => map[c] || c).join('');
  }

  function formatSci(val) {
    if (val === 0) return '0';
    if (!Number.isFinite(val)) return 'NaN';
    const abs = Math.abs(val);
    if (abs >= 0.001 && abs < 100000) {
      return Number(val.toPrecision(7)).toString();
    }
    const exp = Math.floor(Math.log10(abs));
    const mant = val / Math.pow(10, exp);
    return `${Number(mant.toPrecision(5))} × 10${toSup(exp)}`;
  }

  function parseNumberList(raw) {
    return raw
      .split(/[;\s]+/)
      .map((s) => s.trim().replace(',', '.'))
      .filter((s) => s.length > 0)
      .map(Number)
      .filter((n) => Number.isFinite(n));
  }

  function computeMeasurementError(values, deltaDc) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const diffs = values.map((v) => Math.abs(mean - v));
    const meanDiff = n === 1 ? 0 : diffs.reduce((a, b) => a + b, 0) / n;
    const absErr = meanDiff + Math.abs(deltaDc);
    const relErr = mean !== 0 ? (absErr / Math.abs(mean)) * 100 : 0;
    return { values, n, mean, diffs, meanDiff, deltaDc: Math.abs(deltaDc), absErr, relErr };
  }

  function renderToolsPage(container, manifest, state, open3dModal) {
    let activeSub = 'lab3d';
    let selectedTopicFilter = 'ALL';
    let selectedGroupId = 'velocity';

    function draw() {
      container.innerHTML = `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold text-white">Phòng Lab 3D &amp; Bộ Công Cụ Vật Lý</h1>
              <p class="text-xs text-slate-400 mt-1">19 mô hình 3D tương tác (.glb), 16 nhóm đổi đơn vị &amp; máy tính sai số 6 bước.</p>
            </div>
            <div class="flex bg-[#0F1A36] p-1 rounded-xl border border-[#2A3C6E] self-start">
              <button data-sub="lab3d" class="sub-tab px-3.5 py-2 rounded-lg text-xs font-bold ${activeSub === 'lab3d' ? 'bg-[#4FD1C5] text-slate-950' : 'text-slate-300 hover:text-white'}">🧊 Lab 3D (19)</button>
              <button data-sub="converter" class="sub-tab px-3.5 py-2 rounded-lg text-xs font-bold ${activeSub === 'converter' ? 'bg-[#4FD1C5] text-slate-950' : 'text-slate-300 hover:text-white'}">⚖️ Đổi Đơn Vị (16)</button>
              <button data-sub="error" class="sub-tab px-3.5 py-2 rounded-lg text-xs font-bold ${activeSub === 'error' ? 'bg-[#4FD1C5] text-slate-950' : 'text-slate-300 hover:text-white'}">📐 Tính Sai Số</button>
            </div>
          </div>
          <div id="tools-sub-body"></div>
        </div>
      `;

      container.querySelectorAll('.sub-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeSub = btn.dataset.sub;
          draw();
        });
      });

      const body = container.querySelector('#tools-sub-body');
      if (activeSub === 'lab3d') renderLab3D(body);
      else if (activeSub === 'converter') renderConverter(body);
      else renderErrorCalc(body);
    }

    function renderLab3D(body) {
      const models = (manifest.models3D || []).slice(0, 2);
      const lowEnd = !!state.settings.lowEndMode;

      body.innerHTML = `
        <div class="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-100">
          <span>🧪 <strong>Chế độ Dùng thử:</strong> Hiển thị 2 mô hình 3D mẫu. Tải ứng dụng Android để mở khóa trọn bộ <strong>19 mô hình 3D</strong> theo từng bài học.</span>
          <a href="../index.html#tai-ve" class="text-[#4FD1C5] font-bold hover:underline shrink-0">Tải App Android →</a>
        </div>
        ${lowEnd ? `<div class="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">⚡ Đang bật <strong>Chế độ tối ưu máy yếu</strong>: Mô hình 3D chỉ tải khi bạn bấm "Xem 3D".</div>` : ''}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${models.map((m) => {
            const mSrc = m.path.startsWith('../') ? m.path : `../${m.path}`;
            return `
            <div class="glass-card p-4 rounded-2xl flex flex-col">
              <div class="flex items-center justify-between gap-2 mb-2.5">
                <h3 class="text-sm font-bold text-white truncate" title="${APKatex.escapeHtml(m.title)}">${APKatex.escapeHtml(m.title)}</h3>
                <span class="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 shrink-0">${m.topic} (Mẫu)</span>
              </div>
              <div class="mv-slot rounded-xl overflow-hidden bg-[#0B142C] border border-[#2A3C6E]/60 flex items-center justify-center min-h-[240px]" data-path="${mSrc}" data-title="${APKatex.escapeHtml(m.title)}">
                ${lowEnd
                  ? `<button class="load-3d-btn px-4 py-2 rounded-xl bg-[#4FD1C5] text-slate-950 text-xs font-bold hover:opacity-90">▶ Bấm để tải mô hình 3D</button>`
                  : `<model-viewer src="${mSrc}" alt="${APKatex.escapeHtml(m.title)}" camera-controls style="height:240px"></model-viewer>`
                }
              </div>
              <div class="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                <span class="truncate">${m.file}</span>
                <button class="open-fs-3d text-[#4FD1C5] font-semibold hover:underline shrink-0 ml-2" data-path="${mSrc}" data-title="${APKatex.escapeHtml(m.title)}">Toàn màn hình ↗</button>
              </div>
            </div>
          `; }).join('')}
        </div>
      `;

      body.querySelectorAll('.load-3d-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const slot = btn.closest('.mv-slot');
          slot.innerHTML = `<model-viewer src="${slot.dataset.path}" alt="${slot.dataset.title}" camera-controls style="height:240px"></model-viewer>`;
        });
      });

      body.querySelectorAll('.open-fs-3d').forEach((btn) => {
        btn.addEventListener('click', () => open3dModal(btn.dataset.path, btn.dataset.title));
      });
      if (global.APHover3D) global.APHover3D(body);
    }

    function renderConverter(body) {
      const grp = UNIT_GROUPS.find((g) => g.id === selectedGroupId) || UNIT_GROUPS[0];
      body.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-4 glass-card p-4 rounded-2xl space-y-2 max-h-[540px] overflow-y-auto">
            <div class="text-xs font-bold text-[#4FD1C5] uppercase tracking-wider mb-2">16 Nhóm Đơn Vị Vật Lý</div>
            ${UNIT_GROUPS.map((g) => `
              <button data-gid="${g.id}" class="grp-btn w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition ${g.id === selectedGroupId ? 'bg-[#4FD1C5] text-slate-950' : 'bg-[#070D1F] text-slate-300 hover:bg-[#162347]'}">
                <span>${g.icon}</span><span>${g.name}</span>
              </button>
            `).join('')}
          </div>
          <div class="lg:col-span-8 glass-card p-6 rounded-2xl space-y-5">
            <div class="flex items-center space-x-2">
              <span class="text-2xl">${grp.icon}</span>
              <h2 class="text-lg font-extrabold text-white">${grp.name}</h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs text-slate-400 mb-1">Giá trị</label>
                <input id="conv-val" type="number" step="any" value="1" class="w-full bg-[#070D1F] border border-[#2A3C6E] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#4FD1C5]">
              </div>
              <div>
                <label class="block text-xs text-slate-400 mb-1">Từ đơn vị</label>
                <select id="conv-from" class="w-full bg-[#070D1F] border border-[#2A3C6E] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#4FD1C5]">
                  ${grp.units.map((u) => `<option value="${u.id}" ${u.id === grp.defaultUnit ? 'selected' : ''}>${u.label}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs text-slate-400 mb-1">Sang đơn vị</label>
                <select id="conv-to" class="w-full bg-[#070D1F] border border-[#2A3C6E] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#4FD1C5]">
                  ${grp.units.map((u, i) => `<option value="${u.id}" ${i === 0 ? 'selected' : ''}>${u.label}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="p-4 rounded-xl bg-[#070D1F] border border-[#4FD1C5]/40">
              <div class="text-xs text-slate-400">Kết quả quy đổi</div>
              <div id="conv-result" class="text-2xl font-black text-[#4FD1C5] mt-1">1</div>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-300 mb-2">Bảng so sánh tất cả đơn vị trong nhóm</div>
              <div id="conv-table" class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[240px] overflow-y-auto"></div>
            </div>
          </div>
        </div>
      `;

      body.querySelectorAll('.grp-btn').forEach((b) => {
        b.addEventListener('click', () => {
          selectedGroupId = b.dataset.gid;
          renderConverter(body);
        });
      });

      const valIn = body.querySelector('#conv-val');
      const fromSel = body.querySelector('#conv-from');
      const toSel = body.querySelector('#conv-to');
      const resEl = body.querySelector('#conv-result');
      const tblEl = body.querySelector('#conv-table');

      function updateConv() {
        const v = parseFloat(valIn.value);
        const fUnit = grp.units.find((u) => u.id === fromSel.value);
        const tUnit = grp.units.find((u) => u.id === toSel.value);
        if (!Number.isFinite(v) || !fUnit || !tUnit) {
          resEl.textContent = '—';
          return;
        }
        const out = convertUnit(v, fUnit, tUnit);
        resEl.textContent = `${formatSci(out)} (${tUnit.label})`;
        tblEl.innerHTML = grp.units.map((u) => `
          <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-[#070D1F] border border-[#2A3C6E]/60 text-xs">
            <span class="text-slate-400 truncate mr-2">${u.label}</span>
            <span class="font-bold text-white shrink-0">${formatSci(convertUnit(v, fUnit, u))}</span>
          </div>
        `).join('');
      }

      valIn.addEventListener('input', updateConv);
      fromSel.addEventListener('change', updateConv);
      toSel.addEventListener('change', updateConv);
      updateConv();
    }

    function renderErrorCalc(body) {
      body.innerHTML = `
        <div class="glass-card p-6 rounded-2xl max-w-4xl space-y-5">
          <div>
            <h2 class="text-lg font-extrabold text-white">Máy Tính Sai Số Phép Đo (6 Bước Chuẩn GDPT 2018)</h2>
            <p class="text-xs text-slate-400 mt-1">Nhập dãy các lần đo cách nhau bởi khoảng trắng hoặc dấu chấm phẩy (VD: <code>1.24; 1.26; 1.25; 1.27</code>).</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs text-slate-400 mb-1">Dãy giá trị đo ($A_1, A_2, ..., A_n$)</label>
              <input id="err-values" type="text" value="2.01; 2.03; 1.99; 2.02; 2.00" class="w-full bg-[#070D1F] border border-[#2A3C6E] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#4FD1C5]">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">Sai số dụng cụ ($\Delta A_{dc}$)</label>
              <input id="err-dc" type="number" step="any" value="0.01" class="w-full bg-[#070D1F] border border-[#2A3C6E] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#4FD1C5]">
            </div>
          </div>
          <button id="err-calc-btn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4FD1C5] to-[#38BDF8] text-slate-950 font-bold text-sm hover:opacity-95">Tính 6 Bước Sai Số</button>
          <div id="err-output" class="space-y-3"></div>
        </div>
      `;

      const outEl = body.querySelector('#err-output');
      function runCalc() {
        const vals = parseNumberList(body.querySelector('#err-values').value);
        const dc = parseFloat(body.querySelector('#err-dc').value) || 0;
        if (vals.length === 0) {
          outEl.innerHTML = `<div class="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">Vui lòng nhập ít nhất 1 giá trị số hợp lệ.</div>`;
          return;
        }
        const r = computeMeasurementError(vals, dc);
        const fmt = (x) => Number(x.toFixed(6)).toString();
        const latexSteps = [
          `**Bước 1 — Giá trị trung bình:** $$\\bar{A} = \\frac{${r.values.join(' + ')}}{${r.n}} = ${fmt(r.mean)}$$`,
          `**Bước 2 — Sai số tuyệt đối từng lần đo:** $$\\Delta A_i = |\\bar{A} - A_i| \\Rightarrow \\{${r.diffs.map(fmt).join(';\\; ')}\\}$$`,
          `**Bước 3 — Sai số ngẫu nhiên trung bình:** $$\\overline{\\Delta A} = ${r.n === 1 ? '0\\; (n=1)' : `\\frac{${r.diffs.map(fmt).join(' + ')}}{${r.n}} = ${fmt(r.meanDiff)}`}$$`,
          `**Bước 4 — Sai số tuyệt đối của phép đo:** $$\\Delta A = \\overline{\\Delta A} + \\Delta A_{dc} = ${fmt(r.meanDiff)} + ${fmt(r.deltaDc)} = ${fmt(r.absErr)}$$`,
          `**Bước 5 — Sai số tỉ đối:** $$\\delta A = \\frac{\\Delta A}{\\bar{A}} \\cdot 100\\% = \\frac{${fmt(r.absErr)}}{${fmt(Math.abs(r.mean))}} \\cdot 100\\% = ${r.relErr.toFixed(2)}\\%$$`,
          `**Bước 6 — Viết kết quả phép đo:** $$A = \\bar{A} \\pm \\Delta A = ${fmt(r.mean)} \\pm ${fmt(r.absErr)}$$`
        ];
        outEl.innerHTML = latexSteps.map((s) => `
          <div class="p-4 rounded-xl bg-[#070D1F] border border-[#2A3C6E] text-sm text-slate-200">${APKatex.render(s)}</div>
        `).join('');
      }

      body.querySelector('#err-calc-btn').addEventListener('click', runCalc);
      runCalc();
    }

    draw();
  }

  global.APTools = {
    renderToolsPage
  };
})(window);
