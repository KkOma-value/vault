import content from "./content.generated.json";

export { content };

export const preferredDomainOrder = [
  "graph-engineering",
  "multiagent-coordination",
  "agent-platform",
  "agent-cost-optimization",
  "agent-eval",
  "ai-security",
  "claude-code",
  "pi-agent",
  "code-migration",
  "agent-fleet",
  "ai-tools",
  "ai-automation",
  "ai-design",
  "ai-self-media",
  "indie-dev",
  "ai-industry",
  "dev-toolchain",
  "algo-trading",
  "overseas-access",
];

export const orderedDomains = [...content.domains].sort((left, right) => {
  const leftIndex = preferredDomainOrder.indexOf(left.id);
  const rightIndex = preferredDomainOrder.indexOf(right.id);
  return (leftIndex < 0 ? 999 : leftIndex) - (rightIndex < 0 ? 999 : rightIndex);
});

export function findDomain(id) {
  return content.domains.find((domain) => domain.id === id);
}

export function findArticle(domainId, slug) {
  return content.articles.find((article) => article.domainId === domainId && article.slug === slug);
}

export function findNote(kind, slug) {
  return content.notes.find((note) => note.kind === kind && note.slug === slug);
}

export function articlesForDomain(domainId) {
  return content.articles.filter((article) => article.domainId === domainId);
}

export function relationsForDomain(domainId) {
  return content.domainRelations
    .filter((relation) => relation.source === domainId || relation.target === domainId)
    .sort((left, right) => right.weight - left.weight);
}

export function neighboringDomains(domainId, limit = 6) {
  return relationsForDomain(domainId)
    .map((relation) => findDomain(relation.source === domainId ? relation.target : relation.source))
    .filter(Boolean)
    .slice(0, limit);
}

export function shortTitle(title) {
  return title.split(" / ")[0].replace("Multi-Agent 工作流成本优化", "Agent 成本优化");
}

export function buildGlobalGraph() {
  return {
    nodes: orderedDomains.map((domain, index) => ({
      id: domain.id,
      label: shortTitle(domain.title),
      route: `/wiki/${domain.id}`,
      group: index < 7 ? "core" : index < 14 ? "practice" : "field",
      size: 5 + Math.min(domain.articleCount, 5),
    })),
    links: content.domainRelations.map((relation) => ({
      source: relation.source,
      target: relation.target,
      weight: relation.weight,
      kind: relation.kind,
    })),
  };
}

export function buildDomainGraph(domainId) {
  const domain = findDomain(domainId);
  if (!domain) return { nodes: [], links: [] };
  const neighbors = neighboringDomains(domainId, 6);
  return {
    nodes: [
      {
        id: domain.id,
        label: shortTitle(domain.title),
        route: `/wiki/${domain.id}`,
        group: "selected",
        size: 12,
      },
      ...neighbors.map((neighbor, index) => ({
        id: neighbor.id,
        label: shortTitle(neighbor.title),
        route: `/wiki/${neighbor.id}`,
        group: index < 3 ? "core" : "field",
        size: 7,
      })),
    ],
    links: neighbors.map((neighbor) => {
      const relation = content.domainRelations.find(
        (candidate) =>
          (candidate.source === domainId && candidate.target === neighbor.id) ||
          (candidate.target === domainId && candidate.source === neighbor.id),
      );
      return {
        source: domainId,
        target: neighbor.id,
        weight: relation?.weight || 1,
        kind: relation?.kind || "tags",
      };
    }),
  };
}

export function buildArticleGraph(article) {
  const domain = findDomain(article.domainId);
  const neighbors = neighboringDomains(article.domainId, 4);
  const tagNodes = article.tags.slice(0, 5).map((tag) => ({
    id: `tag:${tag}`,
    label: tag,
    group: "concept",
    size: 5,
  }));
  const center = {
    id: `article:${article.id}`,
    label: article.title,
    route: `/wiki/${article.domainId}/${article.slug}`,
    group: "selected",
    size: 13,
  };
  const domainNode = {
    id: domain.id,
    label: shortTitle(domain.title),
    route: `/wiki/${domain.id}`,
    group: "core",
    size: 9,
  };
  return {
    nodes: [
      center,
      domainNode,
      ...neighbors.map((neighbor) => ({
        id: neighbor.id,
        label: shortTitle(neighbor.title),
        route: `/wiki/${neighbor.id}`,
        group: "field",
        size: 7,
      })),
      ...tagNodes,
    ],
    links: [
      { source: center.id, target: domain.id, weight: 5, kind: "explicit" },
      ...neighbors.map((neighbor) => ({
        source: domain.id,
        target: neighbor.id,
        weight: 2,
        kind: "tags",
      })),
      ...tagNodes.map((tag) => ({
        source: center.id,
        target: tag.id,
        weight: 1,
        kind: "concept",
      })),
    ],
  };
}

export function searchEntries(query) {
  const needle = query.trim().toLocaleLowerCase("zh-CN");
  if (!needle) return [];
  const entries = [
    ...content.domains.map((domain) => ({
      kind: "领域",
      title: domain.title,
      summary: domain.summary,
      tags: domain.tags,
      route: `/wiki/${domain.id}`,
    })),
    ...content.articles.map((article) => ({
      kind: "Wiki",
      title: article.title,
      summary: article.summary,
      tags: article.tags,
      route: `/wiki/${article.domainId}/${article.slug}`,
    })),
    ...content.notes.map((note) => ({
      kind: note.kind === "reports" ? "报告" : note.kind === "summaries" ? "摘要" : "草稿",
      title: note.title,
      summary: note.summary,
      tags: note.tags,
      route: `/notes/${note.kind}/${note.slug}`,
    })),
  ];
  return entries
    .map((entry) => {
      const haystack = `${entry.title} ${entry.summary} ${entry.tags.join(" ")}`.toLocaleLowerCase("zh-CN");
      const score =
        entry.title.toLocaleLowerCase("zh-CN").includes(needle) * 4 +
        entry.tags.some((tag) => tag.toLocaleLowerCase("zh-CN").includes(needle)) * 2 +
        haystack.includes(needle);
      return { ...entry, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);
}

export function extractHeadings(markdown) {
  return [...markdown.matchAll(/^(##|###)\s+(.+)$/gm)].map((match) => ({
    depth: match[1].length,
    text: match[2].replace(/[*_`]/g, ""),
    id: headingId(match[2]),
  }));
}

export function headingId(value) {
  return String(value)
    .replace(/[*_`]/g, "")
    .trim()
    .toLocaleLowerCase("zh-CN")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
