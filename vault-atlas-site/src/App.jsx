import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Article, BookOpenText, CalendarBlank,
  ChartDonut, Clock, Command, Crosshair, FileText, Graph, List,
  MagnifyingGlass, NotePencil, Tag, X,
} from "@phosphor-icons/react";
import { GraphView } from "./GraphView.jsx";
import {
  articlesForDomain, buildArticleGraph, buildDomainGraph, buildGlobalGraph,
  content, extractHeadings, findArticle, findDomain, findNote, headingId,
  neighboringDomains, orderedDomains, searchEntries, shortTitle,
} from "./data.js";

const fmt = (value) => value?.replaceAll("-", ".") || "—";
const parts = (path) => path.split("/").filter(Boolean).map(decodeURIComponent);
const routeFromLocation = () => {
  const routed = new URLSearchParams(window.location.search).get("p");
  return routed?.startsWith("/") ? routed : window.location.pathname;
};

function useRouter() {
  const [pathname, setPathname] = useState(routeFromLocation);
  useEffect(() => {
    const update = () => setPathname(routeFromLocation());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  const navigate = (route) => {
    if (route.startsWith("#")) {
      document.querySelector(route)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const nextUrl = route === "/" ? "/" : `/?p=${encodeURIComponent(route)}`;
    window.history.pushState({}, "", nextUrl);
    setPathname(route);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return [pathname, navigate];
}

function Header({ pathname, navigate }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef(null);
  const results = useMemo(() => searchEntries(query), [query]);
  useEffect(() => {
    const keys = (event) => {
      if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") ||
          (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName))) {
        event.preventDefault(); setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, []);
  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 30); }, [open]);
  const select = (route) => { navigate(route); setOpen(false); setQuery(""); };
  return <>
    <header className="site-header">
      <button className="brand" onClick={() => navigate("/")} aria-label="返回首页">
        <b>VAULT <i>ATLAS</i></b><span>知识场域观测站</span>
      </button>
      <button className="header-search" onClick={() => setOpen(true)}>
        <MagnifyingGlass size={18}/><span>搜索领域、文章或概念</span><kbd><Command size={12}/> K</kbd>
      </button>
      <nav aria-label="主导航">
        <button className={pathname.startsWith("/wiki") ? "active" : ""} onClick={() => navigate("/")}>Wiki</button>
        <button className={pathname.startsWith("/notes") ? "active" : ""} onClick={() => navigate("/notes")}>报告</button>
        <button className={pathname === "/about" ? "active" : ""} onClick={() => navigate("/about")}>关于</button>
      </nav>
      <time>更新于 {fmt(content.lastUpdated)}</time>
    </header>
    {open && <div className="search-layer" role="dialog" aria-modal="true" onMouseDown={() => setOpen(false)}>
      <section className="search-dialog" onMouseDown={(event) => event.stopPropagation()}>
        <div className="search-input"><MagnifyingGlass size={22}/><input ref={input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索 Graph、Agent、安全、成本……"/><button onClick={() => setOpen(false)}><X size={19}/></button></div>
        <div className="search-results" aria-live="polite">
          {!query && <div className="search-hint"><Crosshair size={26}/><p>从 {content.stats.domains} 个领域与 {content.stats.articles} 篇 Wiki 中定位知识。</p>{["Graph","Agent","安全","成本"].map((x) => <button key={x} onClick={() => setQuery(x)}>{x}</button>)}</div>}
          {query && !results.length && <p className="no-results">没有找到匹配内容，试试更短的概念词。</p>}
          {results.map((r) => <button className="search-result" key={r.route} onClick={() => select(r.route)}><small>{r.kind}</small><span><b>{r.title}</b><em>{r.summary}</em></span><ArrowRight size={17}/></button>)}
        </div>
      </section>
    </div>}
  </>;
}

function FieldRail({ selected, onSelect, navigate, compact = false }) {
  return <aside className={`field-rail ${compact ? "compact" : ""}`}>
    <div className="rail-title"><b>{content.stats.domains} 个领域</b><Crosshair size={20}/></div>
    <div className="rail-list">{orderedDomains.map((d, i) => <button key={d.id} className={selected === d.id ? "selected" : ""} onClick={() => onSelect ? onSelect(d.id) : navigate(`/wiki/${d.id}`)}><span>{String(i + 1).padStart(2,"0")}</span><b>{shortTitle(d.title)}</b><small>{d.articleCount}</small>{selected === d.id && <ArrowRight size={15}/>}</button>)}</div>
  </aside>;
}

function ArticleRow({ article, index, navigate }) {
  return <article className="article-row">
    <span>{String(index + 1).padStart(2,"0")}</span><Article size={27} weight="light"/>
    <div><h3>{article.title}</h3><p>{article.summary}</p><div>{article.tags.slice(0,3).map((t) => <small key={t}>#{t}</small>)}</div></div>
    <time>{fmt(article.updated)}</time><button onClick={() => navigate(`/wiki/${article.domainId}/${article.slug}`)}>阅读全文 <ArrowRight size={16}/></button>
  </article>;
}

function Home({ navigate }) {
  const [selected, setSelected] = useState("graph-engineering");
  const domain = findDomain(selected) || orderedDomains[0];
  const articles = articlesForDomain(domain.id);
  const neighbors = neighboringDomains(domain.id, 4);
  const mini = useMemo(() => buildDomainGraph(domain.id), [domain.id]);
  const global = useMemo(() => buildGlobalGraph(), []);
  return <main>
    <section className="observatory">
      <FieldRail selected={domain.id} onSelect={setSelected} navigate={navigate}/>
      <section className="field-focus">
        <div className="coordinate"><b>FIELD {String(orderedDomains.findIndex((d) => d.id === domain.id)+1).padStart(2,"0")}</b><span>COORDINATE</span><span>31° 13′ N</span><span>121° 28′ E</span></div>
        <div className="field-intro"><small>SELECTED KNOWLEDGE FIELD</small><h1>{shortTitle(domain.title)}</h1><h2>{domain.tags.slice(0,3).join(" · ")}</h2><p>{domain.summary}</p></div>
        <div className="list-head"><b><BookOpenText size={20}/> {articles.length} 篇整理文章</b><button onClick={() => navigate(`/wiki/${domain.id}`)}>查看领域 <ArrowRight size={15}/></button></div>
        <div>{articles.slice(0,3).map((a,i) => <ArticleRow key={a.id} article={a} index={i} navigate={navigate}/>)}</div>
      </section>
      <aside className="relation-panel">
        <section className="related-list"><h2><ChartDonut size={20}/> 相关领域</h2>{neighbors.map((d) => <button key={d.id} onClick={() => setSelected(d.id)}><span>{String(orderedDomains.findIndex((x) => x.id === d.id)+1).padStart(2,"0")}</span><div><b>{shortTitle(d.title)}</b><small>{d.summary.slice(0,35)}…</small></div><ArrowRight size={17}/></button>)}</section>
        <section className="mini-graph"><div className="panel-head"><b>领域关系图</b><small>点击节点进入</small></div><GraphView data={mini} height={305} compact onNavigate={navigate}/><button className="graph-entry" onClick={() => navigate("#global-graph")}>进入全局知识图谱 <ArrowRight size={17}/></button></section>
      </aside>
    </section>
    <section className="observatory-lower">
      <div className="recent"><h2><FileText size={20}/> 最近更新的 Wiki</h2>{content.articles.slice(0,5).map((a) => <button key={a.id} onClick={() => navigate(`/wiki/${a.domainId}/${a.slug}`)}><span>{a.title}</span><time>{fmt(a.updated)}</time></button>)}<button className="text-link" onClick={() => navigate("/notes")}>查看研究报告 <ArrowRight size={15}/></button></div>
      <div className="atlas-preview"><div className="panel-head"><b>全局知识图谱概览</b><small>拖拽平移 · 滚轮缩放 · 点击进入</small></div><GraphView data={global} height={270} compact onNavigate={navigate}/><button onClick={() => navigate("#global-graph")}>全局知识图谱位于首页底部 <ArrowRight size={16}/></button></div>
    </section>
    <section className="dispatches"><Title kicker="FIELD DISPATCHES / 研究产出" title="从单篇整理，到跨领域判断" copy="报告与摘要把多个 Wiki 节点重新编排成可行动的观察。"/><div className="dispatch-grid">{content.notes.filter((n) => n.kind !== "drafts").map((n,i) => <button key={n.id} onClick={() => navigate(`/notes/${n.kind}/${n.slug}`)}><small>0{i+1} / {n.kind === "reports" ? "研究报告" : "跨域摘要"}</small><h3>{n.title}</h3><p>{n.summary}</p><b>打开阅读 <ArrowUpRight size={16}/></b></button>)}</div></section>
    <section id="global-graph" className="global-graph"><Title kicker={`GLOBAL KNOWLEDGE FIELD / 001—${String(content.stats.domains).padStart(3,"0")}`} title="全局知识图谱" copy="节点代表知识领域，连线来自 Wiki 的显式关联与共享标签。点击节点进入对应领域。"/><div className="graph-legend"><span><i className="dot lime"/>当前核心</span><span><i className="dot cyan"/>Agent 工程</span><span><i className="dot slate"/>延伸领域</span><span><i className="line solid"/>显式关联</span><span><i className="line"/>标签关联</span></div><GraphView data={global} height={560} onNavigate={navigate}/></section>
  </main>;
}

function Title({ kicker, title, copy }) {
  return <header className="section-title"><div><small>{kicker}</small><h2>{title}</h2></div>{copy && <p>{copy}</p>}</header>;
}

function Domain({ domain, navigate }) {
  const articles = articlesForDomain(domain.id);
  const neighbors = neighboringDomains(domain.id, 6);
  const graph = useMemo(() => buildDomainGraph(domain.id), [domain.id]);
  return <main className="domain-page"><FieldRail selected={domain.id} navigate={navigate} compact/><section className="domain-main"><button className="back" onClick={() => navigate("/")}><ArrowLeft/> 返回观测站</button><header className="domain-hero"><small>KNOWLEDGE FIELD / {domain.id.toUpperCase()}</small><h1>{domain.title}</h1><p>{domain.summary}</p><div><span><BookOpenText/> {articles.length} 篇 Wiki</span><span><CalendarBlank/> 更新 {fmt(domain.updated)}</span><span><Tag/> {domain.tags.length} 个标签</span></div></header><section className="domain-articles"><Title kicker="PROCESSED ARTICLES" title="已处理文章" copy="从原始资料到结构化观点，每篇文章保留来源与关联。"/>{articles.map((a,i) => <ArticleRow key={a.id} article={a} index={i} navigate={navigate}/>)}</section><section className="domain-notes"><Title kicker="FIELD NOTES" title="领域脉络"/><Markdown body={domain.body} navigate={navigate} compact/></section></section><aside className="domain-aside"><div className="panel-head"><b>关系坐标</b><small>{neighbors.length} 个相关领域</small></div><GraphView data={graph} height={360} compact onNavigate={navigate}/>{neighbors.map((d) => <button key={d.id} onClick={() => navigate(`/wiki/${d.id}`)}>{shortTitle(d.title)} <ArrowRight size={16}/></button>)}</aside></main>;
}

const childText = (c) => typeof c === "string" || typeof c === "number" ? String(c) : Array.isArray(c) ? c.map(childText).join("") : c?.props ? childText(c.props.children) : "";
function Markdown({ body, navigate, compact = false }) {
  const components = {
    h2: ({children}) => <h2 id={headingId(childText(children))}>{children}</h2>,
    h3: ({children}) => <h3 id={headingId(childText(children))}>{children}</h3>,
    a: ({href="", children}) => <a href={href} onClick={(e) => { if(href.startsWith("/")){ e.preventDefault(); navigate(href); }}} target={href.startsWith("/") ? undefined : "_blank"} rel="noreferrer">{children}{!href.startsWith("/") && <ArrowUpRight size={13}/>}</a>,
  };
  return <div className={`markdown ${compact ? "compact" : ""}`}><ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{body}</ReactMarkdown></div>;
}

function Progress() {
  const [value,setValue] = useState(0);
  useEffect(() => { const update=()=>{ const max=document.documentElement.scrollHeight-innerHeight; setValue(max > 0 ? Math.min(100, scrollY/max*100) : 0);}; update(); addEventListener("scroll",update,{passive:true}); addEventListener("resize",update); return()=>{removeEventListener("scroll",update);removeEventListener("resize",update);};},[]);
  return <div className="progress"><span style={{width:`${value}%`}}/></div>;
}

function ReadingLayout({ item, domain, kind, navigate, children, graph }) {
  const headings = extractHeadings(item.body);
  return <main className="reading-page"><Progress/><aside className="toc"><button className="back" onClick={() => navigate(domain ? `/wiki/${domain.id}` : "/notes")}><ArrowLeft/> {domain ? shortTitle(domain.title) : "返回研究产出"}</button><b><List/> 本文目录</b><nav>{headings.map((h) => <a key={`${h.id}-${h.depth}`} className={h.depth===3?"sub":""} href={`#${h.id}`}>{h.text}</a>)}</nav></aside><article className="reading"><header className="article-hero"><small>{kind.toUpperCase()} / FIELD NOTE</small><h1>{item.title}</h1><p>{item.summary}</p><div>{item.tags.map((t)=><span key={t}>#{t}</span>)}</div></header><Markdown body={item.body} navigate={navigate}/>{children}{graph && <section className="article-graph"><Title kicker="LOCAL KNOWLEDGE GRAPH" title="本文知识图" copy="当前文章位于中心，连接所属领域、相关主题与相邻知识场。"/><GraphView data={graph} height={470} onNavigate={navigate}/></section>}</article><aside className="article-meta">{domain && <div><small>领域</small><button onClick={() => navigate(`/wiki/${domain.id}`)}>{shortTitle(domain.title)} <ArrowUpRight/></button></div>}<div><small>最后更新</small><time>{fmt(item.updated)}</time></div><div><small>预计阅读</small><b><Clock/> {Math.max(6,Math.ceil(item.body.length/850))} 分钟</b></div><div><small>来源文件</small><code>{item.sourcePath}</code></div></aside></main>;
}

function ArticlePage({ article, navigate }) {
  const domain=findDomain(article.domainId); const siblings=articlesForDomain(article.domainId).filter((x)=>x.id!==article.id); const related=neighboringDomains(article.domainId,3); const graph=useMemo(()=>buildArticleGraph(article),[article]);
  return <ReadingLayout item={article} domain={domain} kind="processed wiki" navigate={navigate} graph={graph}><section className="continue"><Title kicker="CONTINUE EXPLORING" title="继续探索" copy="沿着同领域文章与相邻知识节点继续阅读。"/><div>{[...siblings.slice(0,2),...related.slice(0,Math.max(1,3-siblings.length))].slice(0,3).map((x)=><button key={x.id} onClick={()=>navigate(x.domainId?`/wiki/${x.domainId}/${x.slug}`:`/wiki/${x.id}`)}><small>{x.domainId?"同领域 Wiki":"相关领域"}</small><h3>{x.title}</h3><p>{x.summary}</p><b>打开 <ArrowRight/></b></button>)}</div></section></ReadingLayout>;
}

function Notes({ navigate }) {
  const groups=[{id:"reports",title:"研究报告",icon:FileText},{id:"summaries",title:"跨域摘要",icon:Graph},{id:"drafts",title:"写作草稿",icon:NotePencil}];
  return <main className="notes-page"><header><small>FIELD DISPATCHES</small><h1>报告、摘要与写作中的想法</h1><p>Wiki 是知识节点；这些输出把节点重新编排成主张、路线与判断。</p></header>{groups.map((g)=>{const Icon=g.icon;const list=content.notes.filter((n)=>n.kind===g.id);return <section key={g.id}><div className="notes-heading"><Icon/><h2>{g.title}</h2><span>{String(list.length).padStart(2,"0")}</span></div><div className="notes-list">{list.map((n)=><button key={n.id} onClick={()=>navigate(`/notes/${n.kind}/${n.slug}`)}><time>{fmt(n.updated)}</time><h3>{n.title}</h3><p>{n.summary}</p><ArrowRight/></button>)}</div></section>})}</main>;
}

function NotePage({ note, navigate }) { return <ReadingLayout item={note} kind={note.kind} navigate={navigate}/>; }
function About({ navigate }) { return <main className="about"><section><small>ABOUT THE OBSERVATORY</small><h1>不是收藏夹，<br/>而是一张持续生长的认知地图。</h1><p>Vault Atlas 从本地 Obsidian vault 读取经过处理的 Wiki、研究报告与摘要。每个页面保留更新时间、标签、来源与关联，把“读过”变成“可再次找到、可以继续连接”。</p><button onClick={()=>navigate("/")}>进入知识场域 <ArrowRight/></button></section><aside>{[[content.stats.domains,"知识领域"],[content.stats.articles,"整理后的 Wiki"],[content.stats.notes,"报告、摘要与草稿"],[content.stats.links,"知识链接"]].map(([v,l])=><div key={l}><b>{v}</b><span>{l}</span></div>)}</aside></main>; }
function Missing({navigate}) { return <main className="missing"><small>FIELD NOT FOUND / 404</small><h1>这个坐标没有知识节点。</h1><p>链接可能已移动，或者内容仍在整理中。</p><button onClick={()=>navigate("/")}>返回观测站 <ArrowRight/></button></main>; }

export function App() {
  const [pathname,navigate]=useRouter(); const p=parts(pathname); let page=<Home navigate={navigate}/>; let title="Vault Atlas · AI 知识 Wiki";
  if(p[0]==="wiki"&&p.length===2){const d=findDomain(p[1]);page=d?<Domain domain={d} navigate={navigate}/>:<Missing navigate={navigate}/>;title=d?`${d.title} · Vault Atlas`:"未找到 · Vault Atlas";}
  else if(p[0]==="wiki"&&p.length>=3){const a=findArticle(p[1],p.slice(2).join("/"));page=a?<ArticlePage article={a} navigate={navigate}/>:<Missing navigate={navigate}/>;title=a?`${a.title} · Vault Atlas`:"未找到 · Vault Atlas";}
  else if(p[0]==="notes"&&p.length===1){page=<Notes navigate={navigate}/>;title="研究产出 · Vault Atlas";}
  else if(p[0]==="notes"&&p.length>=3){const n=findNote(p[1],p.slice(2).join("/"));page=n?<NotePage note={n} navigate={navigate}/>:<Missing navigate={navigate}/>;title=n?`${n.title} · Vault Atlas`:"未找到 · Vault Atlas";}
  else if(p[0]==="about"){page=<About navigate={navigate}/>;title="关于 · Vault Atlas";}
  else if(p.length) page=<Missing navigate={navigate}/>;
  useEffect(()=>{document.title=title;},[title]);
  return <div className="app"><Header pathname={pathname} navigate={navigate}/>{page}<footer><span>VAULT ATLAS / LOCAL-FIRST KNOWLEDGE SYSTEM</span><span>{content.stats.domains} FIELDS · {content.stats.articles} WIKI · {content.stats.links} LINKS</span><button onClick={()=>navigate("/about")}>关于本站 <ArrowRight/></button></footer></div>;
}
