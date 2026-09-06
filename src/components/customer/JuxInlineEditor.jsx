import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';

// ============================================================================
// CANVA-STYLE INLINE STOREFRONT EDITOR
// Inside the merchant Visual Customizer only (?julex_edit=1):
//  • Double-click any text → erase & type over it directly
//  • Floating toolbar: font family, Bold, size +/-, FONT COLOR, BACKGROUND color
//  • Move mode: drag the text box anywhere on the page
//  • Click any section image → "Add Photos" overlay (upload or URL)
//  • Add Text / Add Image buttons → new draggable floating boxes
// Everything is written straight into the store's published theme config,
// so the live store updates with the same content and styles.
// ============================================================================

const FONTS = ['Playfair Display', 'Cinzel', 'Plus Jakarta Sans', 'Archivo Black', 'Fraunces', 'Work Sans', 'Poppins', 'Great Vibes', 'Alex Brush', 'Pinyon Script'];

const TEXT_FIELDS_BY_TYPE = {
  announcement: ['text', 'linkText', 'linkUrl'],
  header: ['logoText', 'tagline', 'navLink1', 'navLink2', 'navLink3'],
  hero: ['badgeText', 'headline', 'subtext', 'ctaText', 'secondaryBtnText'],
  product_grid: ['title', 'subtitle'],
  products: ['title', 'subtitle'],
  promo_banner: ['title', 'subtitle', 'ctaText'],
  video_reels: ['title', 'subtitle'],
  testimonials: ['title'],
  story: ['title', 'text'],
  featured_ribbon: ['badge', 'title', 'subtitle'],
  footer: ['copyright'],
};

const cfgKeys = (storeId, subdomain) => [
  `gojulex_store_theme_${storeId}`,
  `gojulex_store_theme_${subdomain}`,
  `gojulex_store_theme_store_${subdomain}`,
];

const readCfg = (keys) => {
  try {
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
};

const writeCfg = (keys, cfg, subdomain) => {
  try { keys.forEach((k) => localStorage.setItem(k, JSON.stringify(cfg))); } catch (e) {}
  api.themes.saveConfig(cfg, subdomain).catch(() => {});
};

const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

const applyOneStyle = (el, st) => {
  if (!el) return;
  if (st.font) el.style.fontFamily = `'${st.font}', sans-serif`;
  if (st.bold !== undefined) el.style.fontWeight = st.bold ? '800' : '400';
  if (st.size) el.style.fontSize = st.size;
  if (st.color) el.style.color = st.color;
  if (st.bg) el.style.backgroundColor = st.bg;
  if (st.dx !== undefined || st.dy !== undefined) {
    el.style.position = 'relative';
    el.style.transform = `translate(${st.dx || 0}px, ${st.dy || 0}px)`;
    el.style.zIndex = '5';
  }
};

// Renders the merchant's custom floating text/image boxes on the page.
// Runs on the LIVE store too (visitors see the same boxes).
const renderFloating = (cfg) => {
  document.querySelectorAll('[data-jx-float]').forEach((n) => n.remove());
  (cfg.floating || []).forEach((f) => {
    const div = document.createElement('div');
    div.setAttribute('data-jx-float', f.id);
    div.style.cssText = `position:absolute;left:${f.x}%;top:${f.y}px;z-index:60;max-width:340px;padding:6px 10px;border-radius:10px;`;
    if (f.kind === 'image') {
      const img = document.createElement('img');
      img.src = f.src;
      img.style.cssText = `width:${f.w || 220}px;height:auto;border-radius:10px;display:block;box-shadow:0 8px 24px rgba(0,0,0,.18);`;
      div.appendChild(img);
    } else {
      const span = document.createElement('span');
      span.textContent = f.text || 'New text';
      applyOneStyle(span, f);
      span.style.display = 'inline-block';
      span.style.cursor = 'default';
      if (f.bg) div.style.backgroundColor = f.bg;
      div.appendChild(span);
    }
    document.body.appendChild(div);
  });
};

// Applies inline styles + floating boxes from an explicit config object
// (used for EVERY visitor — the config fetched from the backend).
export const applyJuxConfig = (cfg) => {
  if (!cfg) return;
  requestAnimationFrame(() => {
    (cfg.inlineStyles || []).forEach((st) => {
      const wrap = document.querySelector(`.jx-live-root [data-sid="${st.sid}"], [data-sid="${st.sid}"]`);
      if (!wrap) return;
      const sec = (cfg.sections || []).find((s) => s.id === st.sid);
      const val = sec?.data?.[st.field];
      if (val == null) return;
      const el = [...wrap.querySelectorAll('h1,h2,h3,h4,p,span,a,button,strong')].find(
        (e) => e.children.length === 0 && norm(e.textContent) === norm(val)
      );
      if (el) applyOneStyle(el, st);
    });
    renderFloating(cfg);
  });
};

// Re-applies saved per-field styling + floating boxes from browser storage
// (merchant's own browser).
export const applyJuxInlineStyles = (storeId, subdomain) => {
  const cfg = readCfg(cfgKeys(storeId, subdomain));
  if (cfg) applyJuxConfig(cfg);
};

export const JuxInlineEditor = ({ storeId, subdomain, getSections, getStyles }) => {
  const keys = cfgKeys(storeId, subdomain);
  const [sel, setSel] = useState(null); // { el, sid, type, field, font, bold, size, color, bg, move }
  const [imgPick, setImgPick] = useState(null); // { el, sid, rect }
  const selRef = useRef(null);
  selRef.current = sel;

  const ensureCfg = () => {
    let cfg = readCfg(keys);
    if (!cfg) {
      cfg = {
        presetId: 'preset_soft_peach',
        styles: getStyles ? getStyles() : {},
        sections: getSections ? getSections() : [],
        inlineStyles: [],
        floating: [],
        updatedAt: new Date().toISOString(),
      };
    }
    if (!Array.isArray(cfg.inlineStyles)) cfg.inlineStyles = [];
    if (!Array.isArray(cfg.floating)) cfg.floating = [];
    return cfg;
  };

  const saveField = (sid, field, value) => {
    const cfg = ensureCfg();
    cfg.sections = (cfg.sections || []).map((s) =>
      s.id === sid ? { ...s, data: { ...s.data, [field]: value } } : s
    );
    cfg.updatedAt = new Date().toISOString();
    writeCfg(keys, cfg, subdomain);
  };

  const saveStyle = (sid, field, stylePatch) => {
    const cfg = ensureCfg();
    const i = (cfg.inlineStyles || []).findIndex((x) => x.sid === sid && x.field === field);
    const next = { ...(i >= 0 ? cfg.inlineStyles[i] : { sid, field }), ...stylePatch };
    if (i >= 0) cfg.inlineStyles[i] = next; else cfg.inlineStyles.push(next);
    writeCfg(keys, cfg, subdomain);
  };

  const saveFloating = (id, patch) => {
    const cfg = ensureCfg();
    const i = (cfg.floating || []).findIndex((x) => x.id === id);
    if (i < 0) return;
    cfg.floating[i] = { ...cfg.floating[i], ...patch };
    writeCfg(keys, cfg, subdomain);
    renderFloating(cfg);
  };

  const addFloating = (kind, extra = {}) => {
    const cfg = ensureCfg();
    const item = {
      id: 'jxf_' + Date.now().toString(36),
      kind,
      x: 8 + Math.round(Math.random() * 20),
      y: Math.round(window.scrollY + window.innerHeight * 0.35),
      font: 'Playfair Display',
      bold: false,
      size: kind === 'text' ? '26px' : undefined,
      color: '#1F1F1F',
      ...(kind === 'text' ? { text: 'Double-click to edit me' } : { src: '', w: 220 }),
      ...extra,
    };
    cfg.floating.push(item);
    writeCfg(keys, cfg, subdomain);
    renderFloating(cfg);
    // scroll the new box into view so the merchant sees it appear
    requestAnimationFrame(() => {
      const node = document.querySelector(`[data-jx-float="${item.id}"]`);
      if (node) node.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  };

  const resolveTextField = (el, sec) => {
    if (!sec) return null;
    const fields = TEXT_FIELDS_BY_TYPE[sec.type] || [];
    for (const f of fields) {
      if (sec.data && norm(sec.data[f]) === norm(el.textContent) && norm(el.textContent)) return f;
    }
    const tag = el.tagName;
    if (/^H[1-3]$/.test(tag)) return fields.includes('headline') ? 'headline' : (fields.includes('title') ? 'title' : fields[0]);
    if (tag === 'P' || tag === 'SPAN') return fields.includes('subtext') ? 'subtext' : (fields.includes('subtitle') ? 'subtitle' : (fields.includes('text') ? 'text' : fields[0]));
    if (tag === 'A' || tag === 'BUTTON') return fields.includes('ctaText') ? 'ctaText' : (fields.includes('linkText') ? 'linkText' : fields[0]);
    return fields[0] || null;
  };

  const resolveImageField = (sec) => {
    if (!sec || !sec.data) return 'imageUrl';
    for (const f of ['imageUrl', 'image', 'heroImage', 'url']) {
      if (sec.data[f]) return f;
    }
    return 'imageUrl';
  };

  // ---- DRAG HELPERS (both section text and floating boxes) ----
  const dragStateRef = useRef(null);

  const startDrag = (e, mode, payload) => {
    if (mode === 'section' && !selRef.current?.move) return;
    e.preventDefault();
    e.stopPropagation();
    const box = payload.node.getBoundingClientRect();
    dragStateRef.current = {
      mode,
      payload,
      startX: e.clientX,
      startY: e.clientY,
      origDx: payload.dx || 0,
      origDy: payload.dy || 0,
      origLeft: box.left,
      origTop: box.top + window.scrollY,
    };
  };

  useEffect(() => {
    const onMove = (e) => {
      const d = dragStateRef.current;
      if (!d) return;
      const dx = d.origDx + (e.clientX - d.startX);
      const dy = d.origDy + (e.clientY - d.startY);
      if (d.mode === 'section') {
        if (selRef.current?.el) {
          selRef.current.el.style.position = 'relative';
          selRef.current.el.style.transform = `translate(${dx}px, ${dy}px)`;
          selRef.current.el.style.zIndex = '5';
        }
      } else if (d.mode === 'float') {
        const node = document.querySelector(`[data-jx-float="${d.payload.id}"]`);
        if (node) {
          node.style.left = `${d.origLeft + (e.clientX - d.startX)}px`;
          node.style.top = `${d.origTop + (e.clientY - d.startY)}px`;
        }
      }
    };
    const onUp = () => {
      const d = dragStateRef.current;
      dragStateRef.current = null;
      if (!d) return;
      if (d.mode === 'section') {
        const el = selRef.current?.el;
        if (el) {
          const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(el.style.transform || '');
          saveStyle(d.payload.sid, d.payload.field, { dx: m ? Number(m[1]) : 0, dy: m ? Number(m[2]) : 0 });
        }
      } else if (d.mode === 'float') {
        const node = document.querySelector(`[data-jx-float="${d.payload.id}"]`);
        if (node) {
          const left = parseFloat(node.style.left) || 0;
          const vw = window.innerWidth || 1;
          saveFloating(d.payload.id, { x: Math.max(0, Math.min(92, (left / vw) * 100)), y: Math.max(0, parseFloat(node.style.top) || 0) });
        }
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Show floating boxes inside the customizer too
    const cfg = readCfg(keys);
    if (cfg) renderFloating(cfg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDblClick = (e) => {
      if (e.target.closest('.jux-toolbar') || e.target.closest('.jux-imgpicker') || e.target.closest('.jx-edit-badge')) return;
      // FLOATING TEXT BOXES
      const floatNode = e.target.closest?.('[data-jx-float]');
      if (floatNode && floatNode.querySelector) {
        const id = floatNode.getAttribute('data-jx-float');
        const cfg = readCfg(keys) || ensureCfg();
        const f = (cfg.floating || []).find((x) => x.id === id);
        if (f && f.kind === 'text') {
          e.preventDefault();
          finishEdit();
          const span = floatNode.querySelector('span');
          if (span) {
            span.setAttribute('contenteditable', 'true');
            span.classList.add('jx-editing');
            span.focus();
            const range = document.createRange();
            range.selectNodeContents(span);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            const r = span.getBoundingClientRect();
            const cs = getComputedStyle(span);
            setSel({
              el: span, sid: id, type: 'float_text', field: 'text',
              font: f.font || (cs.fontFamily || '').split(',')[0].replace(/['"]/g, '').trim(),
              bold: !!f.bold,
              size: f.size || cs.fontSize,
              color: f.color || cs.color,
              bg: f.bg || '',
              x: Math.max(8, Math.min(window.innerWidth - 360, r.left)),
              y: Math.max(8, r.top - 52),
              floatId: id,
            });
          }
        }
        return;
      }
      const wrap = e.target.closest?.('.jx-edit-wrap');
      if (!wrap) return;
      const sid = wrap.dataset.sid;
      const cfg = readCfg(keys) || ensureCfg();
      const sec = (cfg.sections || []).find((s) => s.id === sid) || (getSections ? getSections().find((s) => s.id === sid) : null);
      if (!sec) return;
      e.preventDefault();
      e.stopPropagation();

      let el = e.target;
      while (el && el.children.length > 0) {
        const withText = [...el.children].find((c) => norm(c.textContent).length > 0 && !c.querySelector('img'));
        if (withText && norm(withText.textContent) === norm(el.textContent)) el = withText; else break;
      }
      if (!el || !norm(el.textContent)) return;

      finishEdit();
      const field = resolveTextField(el, sec);
      if (!field) return;

      el.setAttribute('contenteditable', 'true');
      el.classList.add('jx-editing');
      el.focus();
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (err) {}

      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const saved = (readCfg(keys)?.inlineStyles || []).find((x) => x.sid === sid && x.field === field) || {};
      setSel({
        el, sid, type: sec.type, field,
        font: saved.font || (cs.fontFamily || '').split(',')[0].replace(/['"]/g, '').trim(),
        bold: saved.bold !== undefined ? saved.bold : (parseInt(cs.fontWeight, 10) >= 600),
        size: saved.size || cs.fontSize,
        color: saved.color || rgbToHex(cs.color),
        bg: saved.bg || '',
        x: Math.max(8, Math.min(window.innerWidth - 360, r.left)),
        y: Math.max(8, r.top - 52),
      });
    };

    const finishEdit = () => {
      const cur = selRef.current;
      if (cur && cur.el) {
        const text = norm(cur.el.textContent);
        if (text) {
          if (cur.floatId) saveFloating(cur.floatId, { text });
          else saveField(cur.sid, cur.field, text);
        }
        cur.el.removeAttribute('contenteditable');
        cur.el.classList.remove('jx-editing');
      }
      setSel(null);
    };
    window.__juxFinishEdit = finishEdit;

    const onClick = (e) => {
      if (e.target.closest('.jux-toolbar') || e.target.closest('.jux-imgpicker') || e.target.closest('.jx-edit-badge')) return;
      // dragging floating boxes: mousedown handled separately; click through otherwise
      const wrap = e.target.closest?.('.jx-edit-wrap');
      if (!wrap) { finishEdit(); setImgPick(null); return; }
      const sid = wrap.dataset.sid;
      const cfg = readCfg(keys) || ensureCfg();
      const sec = (cfg.sections || []).find((s) => s.id === sid) || (getSections ? getSections().find((s) => s.id === sid) : null);
      if (!sec) return;
      const img = e.target.closest('img');
      if (img) {
        e.preventDefault();
        e.stopPropagation();
        finishEdit();
        const r = img.getBoundingClientRect();
        setImgPick({ el: img, sid, sec, x: Math.max(8, Math.min(window.innerWidth - 240, r.left + r.width / 2 - 110)), y: Math.max(8, r.top + 8) });
      }
    };

    // mousedown: start drag when Move mode is on (section text), or always for floating boxes
    const onMouseDown = (e) => {
      if (e.target.closest('.jux-toolbar') || e.target.closest('.jux-imgpicker') || e.target.closest('.jx-edit-badge')) return;
      const floatNode = e.target.closest?.('[data-jx-float]');
      if (floatNode) {
        const cfg = readCfg(keys) || ensureCfg();
        const id = floatNode.getAttribute('data-jx-float');
        const f = (cfg.floating || []).find((x) => x.id === id);
        if (f) startDrag(e, 'float', { id });
        return;
      }
      if (selRef.current?.move && selRef.current.el && selRef.current.el.contains(e.target)) {
        startDrag(e, 'section', { sid: selRef.current.sid, field: selRef.current.field, node: selRef.current.el, dx: (readCfg(keys)?.inlineStyles || []).find((x) => x.sid === selRef.current.sid && x.field === selRef.current.field)?.dx || 0, dy: (readCfg(keys)?.inlineStyles || []).find((x) => x.sid === selRef.current.sid && x.field === selRef.current.field)?.dy || 0 });
      }
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('dblclick', onDblClick, true);
    document.addEventListener('mousedown', onMouseDown, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('dblclick', onDblClick, true);
      document.removeEventListener('mousedown', onMouseDown, true);
      delete window.__juxFinishEdit;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyStyle = (patch) => {
    if (!sel || !sel.el) return;
    if (sel.floatId) {
      const full = { ...sel, ...patch };
      applyOneStyle(sel.el, patch);
      saveFloating(sel.floatId, patch);
      setSel({ ...sel, ...patch });
      return;
    }
    applyOneStyle(sel.el, patch);
    saveStyle(sel.sid, sel.field, patch);
    setSel({ ...sel, ...patch });
  };

  const setImage = (src) => {
    if (imgPick && imgPick.el) {
      imgPick.el.src = src;
      saveField(imgPick.sid, resolveImageField(imgPick.sec), src);
    }
    setImgPick(null);
  };

  const deleteFloat = (id) => {
    const cfg = ensureCfg();
    cfg.floating = (cfg.floating || []).filter((x) => x.id !== id);
    writeCfg(keys, cfg, subdomain);
    renderFloating(cfg);
    finishSel();
  };

  const finishSel = () => {
    const cur = selRef.current;
    if (cur && cur.el) {
      const text = norm(cur.el.textContent);
      if (text) {
        if (cur.floatId) saveFloating(cur.floatId, { text });
        else saveField(cur.sid, cur.field, text);
      }
      cur.el.removeAttribute('contenteditable');
      cur.el.classList.remove('jx-editing');
    }
    setSel(null);
  };

  return (
    <>
      <div className="jx-edit-badge">
        ✏️ Double-click text to edit · click an image to replace · drag boxes with ✥ Move
        <span className="jx-badge-actions">
          <button onClick={() => addFloating('text')} className="jux-tool-btn" title="Add a new text box">＋ Add Text</button>
          <button onClick={() => addFloating('image', { src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80' })} className="jux-tool-btn" title="Add a new image box">＋ Add Image</button>
        </span>
      </div>

      {sel && (
        <div
          className="jux-toolbar"
          style={{ left: sel.x, top: sel.y }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <select
            value={FONTS.includes(sel.font) ? sel.font : FONTS[0]}
            onChange={(e) => applyStyle({ font: e.target.value })}
            className="jux-tool-select"
            title="Font"
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button
            onClick={() => applyStyle({ bold: !sel.bold })}
            className={'jux-tool-btn ' + (sel.bold ? 'jux-tool-active' : '')}
            title="Bold"
            style={{ fontWeight: 900 }}
          >
            B
          </button>
          <button onClick={() => applyStyle({ size: `${Math.max(10, parseInt(sel.size, 10) - 2)}px` })} className="jux-tool-btn" title="Smaller text">A−</button>
          <button onClick={() => applyStyle({ size: `${Math.min(96, parseInt(sel.size, 10) + 2)}px` })} className="jux-tool-btn" title="Bigger text">A+</button>
          <label className="jux-tool-color" title="Font colour">
            <span className="jux-tool-color-icon">A</span>
            <input type="color" value={sel.color || '#000000'} onChange={(e) => applyStyle({ color: e.target.value })} />
          </label>
          <label className="jux-tool-color" title="Background colour">
            <span className="jux-tool-color-icon" style={{ background: sel.bg || 'transparent', border: '1px solid #ccc', borderRadius: 4 }}>▣</span>
            <input type="color" value={sel.bg || '#FFFFFF'} onChange={(e) => applyStyle({ bg: e.target.value })} />
          </label>
          {!sel.floatId && (
            <button
              onClick={() => setSel({ ...sel, move: !sel.move })}
              className={'jux-tool-btn ' + (sel.move ? 'jux-tool-active' : '')}
              title="Move mode — then drag the text box anywhere"
            >
              ✥ Move
            </button>
          )}
          {sel.floatId && (
            <button onClick={() => deleteFloat(sel.floatId)} className="jux-tool-btn" title="Delete this box">🗑</button>
          )}
          <button
            onClick={() => { window.__juxFinishEdit && window.__juxFinishEdit(); }}
            className="jux-tool-done"
          >
            Done
          </button>
        </div>
      )}

      {imgPick && (
        <div className="jux-imgpicker" style={{ left: imgPick.x, top: imgPick.y }}>
          <p className="jux-imgpicker-title">🖼️ Add Photos</p>
          <label className="jux-imgpicker-btn">
            Upload from device
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const rd = new FileReader();
                rd.onload = () => setImage(rd.result);
                rd.readAsDataURL(f);
              }}
            />
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = e.target.elements.url.value.trim();
              if (v) setImage(v);
            }}
          >
            <input name="url" placeholder="or paste image URL" className="jux-imgpicker-url" />
          </form>
          <button onClick={() => setImgPick(null)} className="jux-imgpicker-cancel">Cancel</button>
        </div>
      )}
    </>
  );
};

const rgbToHex = (rgb) => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb || '');
  if (!m) return '#000000';
  return '#' + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, '0')).join('');
};
