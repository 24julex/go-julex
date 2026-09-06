import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';

// ============================================================================
// CANVA-STYLE INLINE STOREFRONT EDITOR
// Inside the merchant Visual Customizer only (?julex_edit=1):
//  • Click any text in the template → erase & type over it directly
//  • A floating toolbar on the selected text: font family, Bold, size +/-
//  • Click any section image → an "Add Photos" overlay (upload or URL)
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

// Re-applies saved per-field font/bold/size styling on every store load
// (runs on the LIVE store too, not just in edit mode).
export const applyJuxInlineStyles = (storeId, subdomain) => {
  const cfg = readCfg(cfgKeys(storeId, subdomain));
  if (!cfg || !Array.isArray(cfg.inlineStyles) || cfg.inlineStyles.length === 0) return;
  requestAnimationFrame(() => {
    cfg.inlineStyles.forEach((st) => {
      const wrap = document.querySelector(`.jx-live-root [data-sid="${st.sid}"], [data-sid="${st.sid}"]`);
      if (!wrap) return;
      const sec = (cfg.sections || []).find((s) => s.id === st.sid);
      const val = sec?.data?.[st.field];
      if (val == null) return;
      const el = [...wrap.querySelectorAll('h1,h2,h3,h4,p,span,a,button,strong')].find(
        (e) => e.children.length === 0 && norm(e.textContent) === norm(val)
      );
      if (!el) return;
      if (st.font) el.style.fontFamily = `'${st.font}', sans-serif`;
      if (st.bold !== undefined) el.style.fontWeight = st.bold ? '800' : '400';
      if (st.size) el.style.fontSize = st.size;
    });
  });
};

export const JuxInlineEditor = ({ storeId, subdomain, getSections, getStyles }) => {
  const keys = cfgKeys(storeId, subdomain);
  const [sel, setSel] = useState(null); // { el, sid, type, field, font, bold, size }
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
        updatedAt: new Date().toISOString(),
      };
    }
    if (!Array.isArray(cfg.inlineStyles)) cfg.inlineStyles = [];
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

  const resolveTextField = (el, sec) => {
    if (!sec) return null;
    const fields = TEXT_FIELDS_BY_TYPE[sec.type] || [];
    // 1) exact value match against the section data
    for (const f of fields) {
      if (sec.data && norm(sec.data[f]) === norm(el.textContent) && norm(el.textContent)) return f;
    }
    // 2) tag heuristics for default/fallback copy not yet in data
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

  useEffect(() => {
    const onDblClick = (e) => {
      if (e.target.closest('.jux-toolbar') || e.target.closest('.jux-imgpicker')) return;
      const wrap = e.target.closest?.('.jx-edit-wrap');
      if (!wrap) return;
      const sid = wrap.dataset.sid;
      const cfg = readCfg(keys) || ensureCfg();
      const sec = (cfg.sections || []).find((s) => s.id === sid) || (getSections ? getSections().find((s) => s.id === sid) : null);
      if (!sec) return;
      e.preventDefault();
      e.stopPropagation();

      // TEXT — find the deepest element that directly holds text
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
        x: Math.max(8, Math.min(window.innerWidth - 320, r.left)),
        y: Math.max(8, r.top - 52),
      });
    };

    const finishEdit = () => {
      const cur = selRef.current;
      if (cur && cur.el) {
        const text = norm(cur.el.textContent);
        if (text) saveField(cur.sid, cur.field, text);
        cur.el.removeAttribute('contenteditable');
        cur.el.classList.remove('jx-editing');
      }
      setSel(null);
    };
    window.__juxFinishEdit = finishEdit;

    const onClick = (e) => {
      if (e.target.closest('.jux-toolbar') || e.target.closest('.jux-imgpicker')) return;
      const wrap = e.target.closest?.('.jx-edit-wrap');
      if (!wrap) { finishEdit(); setImgPick(null); return; }
      const sid = wrap.dataset.sid;
      const cfg = readCfg(keys) || ensureCfg();
      const sec = (cfg.sections || []).find((s) => s.id === sid) || (getSections ? getSections().find((s) => s.id === sid) : null);
      if (!sec) return;
      // IMAGES — Add Photos overlay on single click (images are not functional)
      const img = e.target.closest('img');
      if (img) {
        e.preventDefault();
        e.stopPropagation();
        finishEdit();
        const r = img.getBoundingClientRect();
        setImgPick({ el: img, sid, sec, x: Math.max(8, Math.min(window.innerWidth - 240, r.left + r.width / 2 - 110)), y: Math.max(8, r.top + 8) });
      }
      // TEXT/BUTTONS: single click passes through so the store stays fully
      // usable inside the customizer; DOUBLE-CLICK enters text editing.
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('dblclick', onDblClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('dblclick', onDblClick, true);
      delete window.__juxFinishEdit;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyStyle = (patch) => {
    if (!sel || !sel.el) return;
    if (patch.font !== undefined) sel.el.style.fontFamily = `'${patch.font}', sans-serif`;
    if (patch.bold !== undefined) { sel.el.style.fontWeight = patch.bold ? '800' : '400'; }
    if (patch.size !== undefined) sel.el.style.fontSize = patch.size;
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

  return (
    <>
      <div className="jx-edit-badge">✏️ Double-click text to edit · click an image to replace · single clicks work normally</div>

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
