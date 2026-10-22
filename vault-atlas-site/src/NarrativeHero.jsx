import { useEffect, useRef } from "react";
import { ArrowDown, ArrowRight } from "@phosphor-icons/react";

const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX"];
export const roman = (i) => ROMAN[i] || String(i + 1);

// Shopify Winter'26 手法平替：巨型展示词 + 衬线斜体重音 + 罗马数字章节索引 + 滚动视差 + 达芬奇细线 overlay
// 原版用 PP Neue Montreal + HWCigars + WebGL 全屏粘性画布；这里用系统展示栈 + Georgia 斜体 + CSS/SVG 实现零依赖版本
export function NarrativeHero({ kicker, giant, accent, copy, chapters = [], activeId, onSelect, cta, onCta }) {
  const root = useRef(null);
  const word = useRef(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = root.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, rect.height + window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total));
      el.style.setProperty("--hero-p", progress.toFixed(4));
      if (word.current) {
        const y = progress * 90;
        const scale = 1 + progress * 0.06;
        word.current.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
        word.current.style.opacity = String(Math.max(0.25, 1 - progress * 0.55));
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [giant]);

  return <section ref={root} className="narrative-hero" aria-label={giant}>
    <svg className="davinci-lines" aria-hidden="true" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
      <g stroke="currentColor" fill="none">
        <line x1="0" y1="120" x2="1200" y2="120" />
        <line x1="0" y1="300" x2="1200" y2="300" />
        <line x1="0" y1="480" x2="1200" y2="480" />
        <line x1="200" y1="0" x2="200" y2="600" />
        <line x1="600" y1="0" x2="600" y2="600" />
        <line x1="1000" y1="0" x2="1000" y2="600" />
        <circle cx="600" cy="300" r="180" />
        <circle cx="600" cy="300" r="120" strokeDasharray="3 6" />
        <line x1="420" y1="300" x2="780" y2="300" strokeDasharray="2 5" />
      </g>
    </svg>
    <div className="narrative-inner">
      <div className="narrative-main">
        <small className="narrative-kicker">{kicker}</small>
        <h1 ref={word} className="giant-word">{giant}</h1>
        {accent && <p className="serif-accent">{accent}</p>}
        {copy && <p className="narrative-copy">{copy}</p>}
        {cta && <button className="narrative-cta" onClick={onCta}>{cta} <ArrowDown size={16} /></button>}
      </div>
      {chapters.length > 0 && <nav className="chapter-index" aria-label="章节索引">
        {chapters.map((c, i) => <button key={c.id} className={c.id === activeId ? "active" : ""} onClick={() => onSelect?.(c.id)}>
          <b>{c.label}</b><i className="leader" /><span>{roman(i)}</span>
        </button>)}
        <footer className="chapter-foot"><span>VAULT ATLAS</span><span>FIELD INDEX</span></footer>
      </nav>}
    </div>
    <div className="narrative-scroll-hint" aria-hidden="true"><span />向下滚动进入观测站<ArrowRight size={14} /></div>
  </section>;
}
