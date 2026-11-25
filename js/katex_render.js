(function (global) {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderMathSnippet(tex, displayMode) {
    if (typeof global.katex !== 'undefined') {
      try {
        return global.katex.renderToString(tex.trim(), {
          displayMode: !!displayMode,
          throwOnError: false,
          strict: false
        });
      } catch {
        return `<code>${escapeHtml(tex)}</code>`;
      }
    }
    return `<code>${escapeHtml(tex)}</code>`;
  }

  function renderRichPhysicsText(raw) {
    if (raw == null) return '';
    const text = String(raw);
    const tokens = [];

    // 1. Extract $$...$$ display math
    let work = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      const idx = tokens.length;
      tokens.push(renderMathSnippet(math, true));
      return `@@MATH_${idx}@@`;
    });

    // 2. Extract \[...\] display math
    work = work.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => {
      const idx = tokens.length;
      tokens.push(renderMathSnippet(math, true));
      return `@@MATH_${idx}@@`;
    });

    // 3. Extract \(...\) inline math
    work = work.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => {
      const idx = tokens.length;
      tokens.push(renderMathSnippet(math, false));
      return `@@MATH_${idx}@@`;
    });

    // 4. Extract $...$ inline math
    work = work.replace(/\$([^\n$]+?)\$/g, (_, math) => {
      const idx = tokens.length;
      tokens.push(renderMathSnippet(math, false));
      return `@@MATH_${idx}@@`;
    });

    // 5. Escape remaining HTML
    work = escapeHtml(work);

    // 6. Rich tags from A+ Physics JSON
    work = work.replace(/\{badge:([^}]+)\}/g, '<span class="ap-badge">$1</span>');
    work = work.replace(/\{highlight\|([^}]+)\}/g, '<span class="ap-highlight">$1</span>');

    const colorMap = {
      primary: 'text-[#4FD1C5]',
      accent: 'text-[#38BDF8]',
      warning: 'text-amber-300',
      success: 'text-emerald-400',
      error: 'text-rose-400',
      info: 'text-indigo-300'
    };
    work = work.replace(/\{color:([a-zA-Z0-9_]+)\|([^}]+)\}/g, (_, cname, inner) => {
      const cls = colorMap[cname] || 'text-[#4FD1C5]';
      return `<span class="${cls} font-semibold">${inner}</span>`;
    });

    // 7. Bold **text** and line breaks
    work = work.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    work = work.replace(/\n/g, '<br>');

    // 8. Restore rendered KaTeX tokens
    work = work.replace(/@@MATH_(\d+)@@/g, (_, idx) => tokens[Number(idx)] || '');

    return work;
  }

  global.APKatex = {
    render: renderRichPhysicsText,
    renderMath: renderMathSnippet,
    escapeHtml
  };
})(window);
