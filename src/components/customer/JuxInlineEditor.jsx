import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';

// ============================================================================
// CANVA-STYLE INLINE STOREFRONT EDITOR — ONE COMMON TOP TOOLBAR
// Inside the merchant Visual Customizer only (?julex_edit=1):
//  • Single top toolbar for the WHOLE template (no bottom bar)
//  • Click any element → selects it (outline) and loads its CURRENT
//    properties into the toolbar (context-aware)
//  • Double-click text → edit content in place
//  • Toolbar: Move · Font family · A− · A+ · B · Font colour · +Add Text ·
//    +Add Image · Replace (images) · Delete (added boxes) · Done
//  • Drag selected element when Move is on; images resize from corner handle
// Everything is written straight into the store's published theme config,
// so the live store updates with the same content, styles and positions.
// ============================================================================

const FONTS = ['Playfair Display', 'Cinzel', 'Plus Jakarta Sans', 'Archivo Black', 'Fraunces', 'Work Sans', 'Poppins', 'Great Vibes', 'Alex Brush', 'Pinyon Script'];
const SWATCHES = ['#0F172A', '#FFFFFF', '#D4A017', '#B8860B', '#9C6644', '#8E4356', '#FAD4C0', '#2D6A4F', '#1D4ED8', '#E11D48'];

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
  // Inside the Visual Customizer, stream every edit back to the builder so
  // there is ONE theme state (left panel = preview = publish).
  try {
    if (window.parent !== window && new URLSearchParams(window.location.search).get('julex_draft') === '1') {
      window.parent.postMessage({ type: 'julex-inline-edit', cfg }, '*');
    }
  } catch (e) {}
};

const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

const floatNodeTop = (node) => parseFloat(node.style.top) || node.getBoundingClientRect().top + window.scrollY;

const rgbToHex = (rgb) => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb || '');
  if (!m) return '#000000';
  return '#' + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, '0')).join('');
};

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

const findStoredStyle = (keys, sid, field) => {
  const cfg = readCfg(keys);
  return ((cfg && cfg.inlineStyles) || []).find((x) => x.sid === sid && x.field === field) || null;
};

// Renders the merchant's custom floating text/image boxes on the page.
// Runs on the LIVE store too (visitors see the same boxes).
const renderFloating = (cfg) => {
  document.querySelectorAll('[data-jx-float]').forEach((n) => {
    if (n.__jxRo) n.__jxRo.disconnect();
    n.remove();
  });
  (cfg.floating || []).forEach((f) => {
    const div = document.createElement('div');
    div.setAttribute('data-jx-float', f.id);
    div.style.cssText = `position:absolute;left:${f.x}%;top:${f.y}px;z-index:60;max-width:360px;padding:4px 6px;`;
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
      if (f.bg) div.style.backgroundColor = f.bg;
      div.appendChild(span);
    }
    document.body.appendChild(div);
  });
};

// Re-applies image widths/positions saved for section images
const applyImageStyles = (cfg) => {
  (cfg.imgStyles || []).forEach((st) => {
    const wrap = document.querySelector(`[data-sid="${st.sid}"]`);
    if (!wrap) return;
    const sec = (cfg.sections || []).find((s) => s.id === st.sid);
    const src = sec?.data?.[st.field];
    if (!src) return;
    const img = [...wrap.querySelectorAll('img')].find((i) => i.src === src || i.getAttribute('src') === src);
    if (img && st.w) { img.style.width = `${st.w}px`; img.style.height = 'auto'; }
    if (img && (st.dx || st.dy)) {
      img.style.position = 'relative';
      img.style.transform = `translate(${st.dx || 0}px, ${st.dy || 0}px)`;
    }
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
    applyImageStyles(cfg);
    renderFloating(cfg);
  });
};

// Re-applies saved customisations from browser storage (merchant's browser).
export const applyJuxInlineStyles = (storeId, subdomain) => {
  const cfg = readCfg(cfgKeys(storeId, subdomain));
  if (cfg) applyJuxConfig(cfg);
};

export const JuxInlineEditor = ({ storeId, subdomain, getSections, getStyles }) => {
  const keys = cfgKeys(storeId, subdomain);
  // sel: null | { kind:'text'|'float_text', el, sid, field, floatId, font, bold, size, color, bg, move }
  //    | { kind:'image'|'float_image', el, sid, field, floatId, w, move }
  const [sel, setSel] = useState(null);
  const [imgPick, setImgPick] = useState(null);
  const selRef = useRef(null);
  selRef.current = sel;
  const dragRef = useRef(null);

  const ensureCfg = () => {
    let cfg = readCfg(keys);
    if (!cfg) {
      cfg = {
        presetId: 'preset_soft_peach',
        styles: getStyles ? getStyles() : {},
        sections: getSections ? getSections() : [],
        inlineStyles: [],
        floating: [],
        imgStyles: [],
        updatedAt: new Date().toISOString(),
      };
    }
    if (!Array.isArray(cfg.inlineStyles)) cfg.inlineStyles = [];
    if (!Array.isArray(cfg.floating)) cfg.floating = [];
    if (!Array.isArray(cfg.imgStyles)) cfg.imgStyles = [];
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

  const saveImgStyle = (sid, field, patch) => {
    const cfg = ensureCfg();
    const i = (cfg.imgStyles || []).findIndex((x) => x.sid === sid && x.field === field);
    const next = { ...(i >= 0 ? cfg.imgStyles[i] : { sid, field }), ...patch };
    if (i >= 0) cfg.imgStyles[i] = next; else cfg.imgStyles.push(next);
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

  const addFloating = (kind) => {
    const cfg = ensureCfg();
    const item = {
      id: 'jxf_' + Date.now().toString(36),
      kind,
      x: 10 + Math.round(Math.random() * 30),
      y: Math.round(window.scrollY + window.innerHeight * 0.35),
      font: 'Playfair Display',
      bold: false,
      size: kind === 'text' ? '26px' : undefined,
      color: '#0F172A',
      ...(kind === 'text' ? { text: 'Double-click to edit' } : { src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80', w: 220 }),
    };
    cfg.floating.push(item);
    writeCfg(keys, cfg, subdomain);
    renderFloating(cfg);
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

  const clearSelectionUi = () => {
    document.querySelectorAll('.jx-selected').forEach((n) => n.classList.remove('jx-selected'));
    document.querySelectorAll('.jx-resize-handle').forEach((n) => {
      if (n.__jxRo) n.__jxRo.disconnect();
      if (n.__jxScroll) window.removeEventListener('scroll', n.__jxScroll, true);
      n.remove();
    });
  };

  const markSelected = (el, isImage) => {
    clearSelectionUi();
    if (!el) return;
    el.classList.add('jx-selected');
    if (isImage) {
      const handle = document.createElement('div');
      handle.className = 'jx-resize-handle';
      handle.title = 'Drag to resize';
      const positionHandle = () => {
        const r = el.getBoundingClientRect();
        handle.style.left = `${r.right - 7}px`;
        handle.style.top = `${r.bottom - 7}px`;
      };
      positionHandle();
      handle.__jxTarget = el;
      handle.__jxRo = new ResizeObserver(positionHandle);
      handle.__jxRo.observe(el);
      handle.__jxScroll = positionHandle;
      window.addEventListener('scroll', positionHandle, true);
      document.body.appendChild(handle);
    }
  };

  const finishTextEdit = (save = true) => {
    const cur = selRef.current;
    if (cur && cur.el && cur.el.getAttribute && cur.el.getAttribute('contenteditable') === 'true') {
      if (save) {
        const text = norm(cur.el.textContent);
        if (text) {
          if (cur.floatId) saveFloating(cur.floatId, { text });
          else saveField(cur.sid, cur.field, text);
        }
      }
      cur.el.removeAttribute('contenteditable');
      cur.el.classList.remove('jx-editing');
    }
  };

  const selectTextEl = (el, sec, sid) => {
    const field = resolveTextField(el, sec);
    if (!field) return;
    const saved = findStoredStyle(keys, sid, field) || {};
    const cs = getComputedStyle(el);
    finishTextEdit(false);
    setSel({
      kind: 'text', el, sid, type: sec.type, field,
      font: saved.font || (cs.fontFamily || '').split(',')[0].replace(/['"]/g, '').trim(),
      bold: saved.bold !== undefined ? saved.bold : (parseInt(cs.fontWeight, 10) >= 600),
      size: saved.size || cs.fontSize,
      color: saved.color || rgbToHex(cs.color),
      bg: saved.bg || '',
      move: false,
    });
    markSelected(el, false);
  };

  const selectFloatText = (spanNode, f) => {
    const cs = getComputedStyle(spanNode);
    finishTextEdit(false);
    setSel({
      kind: 'float_text', el: spanNode, sid: f.id, field: 'text', floatId: f.id,
      font: f.font || (cs.fontFamily || '').split(',')[0].replace(/['"]/g, '').trim(),
      bold: !!f.bold,
      size: f.size || cs.fontSize,
      color: f.color || rgbToHex(cs.color),
      bg: f.bg || '',
      move: false,
    });
    markSelected(spanNode, false);
  };

  const selectImage = (img, sec, sid) => {
    const field = resolveImageField(sec);
    const cfg = readCfg(keys) || ensureCfg();
    const st = ((cfg.imgStyles || []).find((x) => x.sid === sid && x.field === field)) || {};
    finishTextEdit(false);
    setSel({
      kind: 'image', el: img, sid, field,
      w: st.w || Math.round(img.getBoundingClientRect().width),
      move: false,
    });
    markSelected(img, true);
  };

  const selectFloatImage = (imgNode, f) => {
    finishTextEdit(false);
    setSel({
      kind: 'float_image', el: imgNode, sid: f.id, field: 'src', floatId: f.id,
      w: f.w || Math.round(imgNode.getBoundingClientRect().width),
      move: false,
    });
    markSelected(imgNode, true);
  };

  useEffect(() => {
    const cfg = readCfg(keys);
    if (cfg) renderFloating(cfg);
    // keep the template below the fixed top toolbar
    document.body.style.paddingTop = '54px';
    return () => { document.body.style.paddingTop = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const inToolbar = (e) => e.target.closest('.jux-toolbar') || e.target.closest('.jux-imgpicker');

    const onClick = (e) => {
      if (inToolbar(e)) return;
      const floatNode = e.target.closest?.('[data-jx-float]');
      if (floatNode) {
        e.preventDefault(); e.stopPropagation();
        const cfg = readCfg(keys) || ensureCfg();
        const id = floatNode.getAttribute('data-jx-float');
        const f = (cfg.floating || []).find((x) => x.id === id);
        if (!f) return;
        if (f.kind === 'text') {
          const span = floatNode.querySelector('span');
          if (span) selectFloatText(span, f);
        } else {
          const im = floatNode.querySelector('img');
          if (im) selectFloatImage(im, f);
        }
        return;
      }
      const wrap = e.target.closest?.('.jx-edit-wrap');
      if (!wrap) {
        finishTextEdit();
        setSel(null);
        clearSelectionUi();
        return;
      }
      const sid = wrap.dataset.sid;
      const cfg = readCfg(keys) || ensureCfg();
      const sec = (cfg.sections || []).find((s) => s.id === sid) || (getSections ? getSections().find((s) => s.id === sid) : null);
      if (!sec) return;
      e.preventDefault(); e.stopPropagation();
      const img = e.target.closest('img');
      if (img) { selectImage(img, sec, sid); return; }
      let el = e.target;
      while (el && el.children.length > 0) {
        const withText = [...el.children].find((c) => norm(c.textContent).length > 0 && !c.querySelector('img'));
        if (withText && norm(withText.textContent) === norm(el.textContent)) el = withText; else break;
      }
      if (el && norm(el.textContent)) selectTextEl(el, sec, sid);
    };

    const onDblClick = (e) => {
      if (inToolbar(e)) return;
      const floatNode = e.target.closest?.('[data-jx-float]');
      if (floatNode) {
        const cfg = readCfg(keys) || ensureCfg();
        const id = floatNode.getAttribute('data-jx-float');
        const f = (cfg.floating || []).find((x) => x.id === id);
        if (f && f.kind === 'text') {
          e.preventDefault(); e.stopPropagation();
          const span = floatNode.querySelector('span');
          if (!span) return;
          selectFloatText(span, f);
          span.setAttribute('contenteditable', 'true');
          span.classList.add('jx-editing');
          span.focus();
          const range = document.createRange();
          range.selectNodeContents(span);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        return;
      }
      const wrap = e.target.closest?.('.jx-edit-wrap');
      if (!wrap) return;
      const sid = wrap.dataset.sid;
      const cfg = readCfg(keys) || ensureCfg();
      const sec = (cfg.sections || []).find((s) => s.id === sid) || (getSections ? getSections().find((s) => s.id === sid) : null);
      if (!sec) return;
      e.preventDefault(); e.stopPropagation();
      let el = e.target;
      while (el && el.children.length > 0) {
        const withText = [...el.children].find((c) => norm(c.textContent).length > 0 && !c.querySelector('img'));
        if (withText && norm(withText.textContent) === norm(el.textContent)) el = withText; else break;
      }
      if (!el || !norm(el.textContent)) return;
      selectTextEl(el, sec, sid);
      el.setAttribute('contenteditable', 'true');
      el.classList.add('jx-editing');
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    };

    // ---- drag (Move) + image resize ----
    const onMouseDown = (e) => {
      if (inToolbar(e)) return;
      if (e.target.classList?.contains('jx-resize-handle')) {
        e.preventDefault(); e.stopPropagation();
        const img = e.target.__jxTarget;
        const cur = selRef.current;
        if (!img || !cur) return;
        dragRef.current = {
          mode: 'resize',
          startW: img.getBoundingClientRect().width,
          startX: e.clientX,
          img,
          isFloat: cur.kind === 'float_image',
          sid: cur.sid, field: cur.field, floatId: cur.floatId,
        };
        return;
      }
      const cur = selRef.current;
      const floatEl = e.target.closest?.('[data-jx-float]');
      // Added text/image boxes drag DIRECTLY — no Move button needed.
      if (floatEl) {
        const id = floatEl.getAttribute('data-jx-float');
        const cfgNow = readCfg(keys) || ensureCfg();
        const f = (cfgNow.floating || []).find((x) => x.id === id);
        if (f) {
          e.preventDefault(); e.stopPropagation();
          dragRef.current = {
            mode: 'float',
            node: floatEl,
            id,
            startX: e.clientX, startY: e.clientY,
            origLeft: floatEl.getBoundingClientRect().left,
            origTop: floatNodeTop(floatEl),
            moved: false,
            clickTarget: e.target,
            floatData: f,
          };
          return;
        }
      }
      if (!cur || !cur.move || !cur.el || !cur.el.contains(e.target)) return;
      e.preventDefault(); e.stopPropagation();
      if (cur.kind === 'float_text' || cur.kind === 'float_image') {
        const node = cur.el.closest('[data-jx-float]');
        dragRef.current = {
          mode: 'float',
          node,
          id: cur.floatId,
          startX: e.clientX, startY: e.clientY,
          origLeft: node.getBoundingClientRect().left,
          origTop: node.getBoundingClientRect().top + window.scrollY,
          moved: false,
        };
      } else {
        const st = cur.kind === 'image'
          ? ((readCfg(keys) || {}).imgStyles || []).find((x) => x.sid === cur.sid && x.field === cur.field) || {}
          : findStoredStyle(keys, cur.sid, cur.field) || {};
        dragRef.current = {
          mode: 'section',
          startX: e.clientX, startY: e.clientY,
          origDx: st.dx || 0, origDy: st.dy || 0,
          el: cur.el,
          sid: cur.sid, field: cur.field,
          isImage: cur.kind === 'image',
        };
      }
    };

    const onMouseMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      if (d.mode === 'resize') {
        const delta = e.clientX - d.startX;
        const w = Math.max(40, Math.round(d.startW + delta));
        d.img.style.width = `${w}px`;
        d.img.style.height = 'auto';
      } else if (d.mode === 'float') {
        d.node.style.left = `${d.origLeft + (e.clientX - d.startX)}px`;
        d.node.style.top = `${d.origTop + (e.clientY - d.startY)}px`;
      } else if (d.mode === 'section') {
        const dx = d.origDx + (e.clientX - d.startX);
        const dy = d.origDy + (e.clientY - d.startY);
        d.el.style.position = 'relative';
        d.el.style.transform = `translate(${dx}px, ${dy}px)`;
        d.el.style.zIndex = '5';
      }
    };

    const onMouseUp = () => {
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      if (d.mode === 'resize') {
        const w = Math.round(d.img.getBoundingClientRect().width);
        if (d.isFloat) saveFloating(d.floatId, { w });
        else saveImgStyle(d.sid, d.field, { w });
        const cur = selRef.current;
        if (cur) setSel({ ...cur, w });
      } else if (d.mode === 'float') {
        const left = d.node.getBoundingClientRect().left;
        const top = parseFloat(d.node.style.top) || 0;
        const vw = window.innerWidth || 1;
        saveFloating(d.id, { x: Math.max(0, Math.min(88, (left / vw) * 100)), y: Math.max(0, top) });
      } else if (d.mode === 'section') {
        const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(d.el.style.transform || '');
        const patch = { dx: m ? Number(m[1]) : 0, dy: m ? Number(m[2]) : 0 };
        if (d.isImage) saveImgStyle(d.sid, d.field, patch);
        else saveStyle(d.sid, d.field, patch);
      }
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('dblclick', onDblClick, true);
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('dblclick', onDblClick, true);
      document.removeEventListener('mousedown', onMouseDown, true);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearSelectionUi(), []);

  // ---- toolbar actions ----
  const applyStyle = (patch) => {
    const cur = selRef.current;
    if (!cur || !cur.el || (cur.kind !== 'text' && cur.kind !== 'float_text')) return;
    applyOneStyle(cur.el, patch);
    if (cur.floatId) saveFloating(cur.floatId, patch);
    else saveStyle(cur.sid, cur.field, patch);
    setSel({ ...cur, ...patch });
  };

  const replaceImage = (src) => {
    const cur = selRef.current;
    if (!cur) return;
    if (cur.floatId) {
      saveFloating(cur.floatId, { src });
    } else if (cur.el) {
      cur.el.src = src;
      saveField(cur.sid, cur.field, src);
    }
    setImgPick(null);
  };

  const deleteFloat = () => {
    const cur = selRef.current;
    if (!cur || !cur.floatId) return;
    const cfg = ensureCfg();
    cfg.floating = (cfg.floating || []).filter((x) => x.id !== cur.floatId);
    writeCfg(keys, cfg, subdomain);
    renderFloating(cfg);
    clearSelectionUi();
    setSel(null);
  };

  const handleDone = () => {
    finishTextEdit(true);
    clearSelectionUi();
    setSel(null);
  };

  const isText = sel && (sel.kind === 'text' || sel.kind === 'float_text');
  const isImage = sel && (sel.kind === 'image' || sel.kind === 'float_image');

  return (
    <>
      {/* ONE COMMON TOP TOOLBAR for the whole template */}
      <div className="jux-toolbar jux-topbar">
        <button
          onClick={() => setSel(sel ? { ...sel, move: !sel.move } : null)}
          disabled={!sel}
          className={'jux-tool-btn ' + (sel?.move ? 'jux-tool-active' : '')}
          title="Move — then drag the selected element anywhere"
        >
          ✥ Move
        </button>

        <select
          disabled={!isText}
          value={isText && FONTS.includes(sel.font) ? sel.font : FONTS[0]}
          onChange={(e) => applyStyle({ font: e.target.value })}
          className="jux-tool-select"
          title="Font family"
        >
          {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        <button disabled={!isText} onClick={() => applyStyle({ size: `${Math.max(10, parseInt(sel.size, 10) - 2)}px` })} className="jux-tool-btn" title="Decrease font size">A−</button>
        <button disabled={!isText} onClick={() => applyStyle({ size: `${Math.min(96, parseInt(sel.size, 10) + 2)}px` })} className="jux-tool-btn" title="Increase font size">A+</button>

        <button
          disabled={!isText}
          onClick={() => applyStyle({ bold: !sel.bold })}
          className={'jux-tool-btn ' + (isText && sel.bold ? 'jux-tool-active' : '')}
          title="Bold"
          style={{ fontWeight: 900 }}
        >
          B
        </button>

        <label className={'jux-tool-color ' + (!isText ? 'jux-tool-disabled' : '')} title="Font colour">
          <span className="jux-tool-color-icon" style={{ color: isText ? sel.color : '#999' }}>A</span>
          <input type="color" disabled={!isText} value={isText ? (sel.color || '#000000') : '#000000'} onChange={(e) => applyStyle({ color: e.target.value })} />
        </label>

        <span className="jux-tool-swatches">
          {SWATCHES.map((c) => (
            <button
              key={c}
              disabled={!isText}
              onClick={() => applyStyle({ color: c })}
              className={'jux-swatch ' + (isText && sel.color?.toLowerCase() === c.toLowerCase() ? 'jux-swatch-active' : '')}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </span>

        <span className="jux-tool-sep" />

        <button onClick={() => addFloating('text')} className="jux-tool-btn" title="Add a new text box anywhere">＋ Add Text</button>
        <button onClick={() => addFloating('image')} className="jux-tool-btn" title="Add a new image anywhere">＋ Add Image</button>

        {isImage && (
          <>
            <span className="jux-tool-sep" />
            <button onClick={() => setImgPick({})} className="jux-tool-btn" title="Replace this image">⟳ Replace</button>
            <button onClick={deleteFloat} disabled={!sel.floatId} className="jux-tool-btn" title="Delete this box">🗑 Delete</button>
          </>
        )}

        <span className="jux-tool-hint">
          {!sel
            ? 'Click any text or image in the template to select it · double-click text to edit'
            : (isImage ? 'Image selected — Move / Replace / drag the corner handle to resize' : 'Text selected — style it from the toolbar · double-click to edit')}
        </span>

        <button onClick={handleDone} className="jux-tool-done" title="Finish editing">Done</button>
      </div>

      {imgPick && (
        <div className="jux-imgpicker" style={{ left: Math.max(8, (window.innerWidth || 1200) / 2 - 130), top: 90 }}>
          <p className="jux-imgpicker-title">🖼️ {imgPick.sid?.startsWith?.('jxf_') ? 'Set Image' : 'Replace Image'}</p>
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
                rd.onload = () => replaceImage(rd.result);
                rd.readAsDataURL(f);
              }}
            />
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = e.target.elements.url.value.trim();
              if (v) replaceImage(v);
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
