#!/usr/bin/env node

import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vaultRoot = path.resolve(siteRoot, "..");
const wikiRoot = path.join(vaultRoot, "wiki");
const outputRoot = path.join(vaultRoot, "output");
const destination = path.join(siteRoot, "src", "content.generated.json");

function walkMarkdown(root) {
  const files = [];
  for (const entry of readdirSync(root)) {
    const absolute = path.join(root, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) files.push(...walkMarkdown(absolute));
    if (stat.isFile() && entry.endsWith(".md")) files.push(absolute);
  }
  return files;
}

function firstHeading(markdown, fallback) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback;
}

function metadataBlock(markdown) {
  return markdown.match(/<!--\s*[\s\S]*?元数据:\s*([\s\S]*?)-->/)?.[1] || "";
}

function metaValue(markdown, key) {
  const block = metadataBlock(markdown);
  return block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() || "";
}

function parseTags(markdown) {
  return metaValue(markdown, "tags")
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function section(markdown, heading) {
  const match = markdown.match(new RegExp(`^##\\s+${heading}\\s*$([\\s\\S]*?)(?=^##\\s+|\\Z)`, "m"));
  return match?.[1]?.trim() || "";
}

function plainText(value) {
  return value
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/!\[\[[^\]]+\]\]/g, " ")
    .replace(/\[\[([^\]|]+)(?:\\?\|([^\]]+))?\]\]/g, (_, target, label) => label || target)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#|\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summaryFor(markdown) {
  const candidate = section(markdown, "摘要") || section(markdown, "概览");
  const paragraph = candidate
    .split(/\n\s*\n/)
    .map(plainText)
    .find((value) => value.length > 24);
  return (paragraph || plainText(markdown)).slice(0, 220);
}

function slugFromFile(file) {
  return path.basename(file, ".md").replace(/^_+/, "");
}

function stripDocumentChrome(markdown) {
  return markdown
    .replace(/^#\s+.+\n+/, "")
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/^---\s*$/gm, "")
    .trim();
}

const domainIndexFiles = walkMarkdown(wikiRoot).filter((file) => file.endsWith(`${path.sep}_index.md`));
const domains = domainIndexFiles.map((file) => {
  const markdown = readFileSync(file, "utf8");
  const id = path.basename(path.dirname(file));
  const articleFiles = readdirSync(path.dirname(file))
    .filter((name) => name.endsWith(".md") && name !== "_index.md")
    .sort();
  return {
    id,
    title: firstHeading(markdown, id),
    summary: summaryFor(markdown),
    updated: metaValue(markdown, "updated") || "2026-08-22",
    tags: parseTags(markdown),
    articleCount: articleFiles.length,
    body: stripDocumentChrome(markdown),
    sourcePath: path.relative(vaultRoot, file),
  };
});

const articles = domainIndexFiles.flatMap((indexFile) => {
  const domainId = path.basename(path.dirname(indexFile));
  return readdirSync(path.dirname(indexFile))
    .filter((name) => name.endsWith(".md") && name !== "_index.md")
    .sort()
    .map((name) => {
      const file = path.join(path.dirname(indexFile), name);
      const markdown = readFileSync(file, "utf8");
      const slug = slugFromFile(file);
      return {
        id: `${domainId}/${slug}`,
        domainId,
        slug,
        title: firstHeading(markdown, slug),
        summary: summaryFor(markdown),
        created: metaValue(markdown, "created"),
        updated: metaValue(markdown, "updated") || "2026-08-22",
        tags: parseTags(markdown),
        body: stripDocumentChrome(markdown),
        sourcePath: path.relative(vaultRoot, file),
      };
    });
});

const outputFiles = walkMarkdown(outputRoot).filter((file) => !file.endsWith("_output_log.md"));
const notes = outputFiles.map((file) => {
  const markdown = readFileSync(file, "utf8");
  const slug = slugFromFile(file);
  const kind = path.basename(path.dirname(file));
  return {
    id: `${kind}/${slug}`,
    kind,
    slug,
    title: firstHeading(markdown, slug),
    summary: summaryFor(markdown),
    updated: metaValue(markdown, "generated") || "2026-08-14",
    status: metaValue(markdown, "status"),
    tags: parseTags(markdown),
    body: stripDocumentChrome(markdown),
    sourcePath: path.relative(vaultRoot, file),
  };
});

const routeMap = new Map();
for (const domain of domains) {
  const route = `/wiki/${domain.id}`;
  routeMap.set(domain.id, route);
  routeMap.set(`${domain.id}/_index`, route);
  routeMap.set(`wiki/${domain.id}/_index`, route);
}
for (const article of articles) {
  const route = `/wiki/${article.domainId}/${article.slug}`;
  routeMap.set(article.slug, route);
  routeMap.set(`${article.domainId}/${article.slug}`, route);
  routeMap.set(`wiki/${article.domainId}/${article.slug}`, route);
}
for (const note of notes) {
  routeMap.set(note.slug, `/notes/${note.kind}/${note.slug}`);
  routeMap.set(`output/${note.kind}/${note.slug}`, `/notes/${note.kind}/${note.slug}`);
}

function normalizeTarget(target) {
  return target
    .replace(/\\\|/g, "|")
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/\.md$/, "")
    .replace(/^\/+/g, "")
    .replace(/^wiki\//, "wiki/");
}

function resolveRoute(target, sourcePath) {
  const clean = normalizeTarget(target).split("#")[0];
  const sourceDir = path.posix.dirname(sourcePath.replace(/\\/g, "/"));
  const relative = path.posix.normalize(path.posix.join(sourceDir, clean)).replace(/^\.\.\//g, "");
  const candidates = [clean, clean.replace(/^wiki\//, ""), relative, relative.replace(/^wiki\//, "")];
  for (const candidate of candidates) {
    if (routeMap.has(candidate)) return routeMap.get(candidate);
  }
  return null;
}

function linkify(markdown, sourcePath) {
  return markdown.replace(/(!?)\[\[([^\]]+)\]\]/g, (full, embed, inside) => {
    if (embed) return "";
    const separator = inside.includes("\\|") ? "\\|" : "|";
    const [target, ...labelParts] = inside.split(separator);
    const label = labelParts.join(separator).trim() || path.basename(target.trim());
    const route = resolveRoute(target.trim(), sourcePath);
    return route ? `[${label}](${route})` : label;
  });
}

for (const domain of domains) domain.body = linkify(domain.body, domain.sourcePath);
for (const article of articles) article.body = linkify(article.body, article.sourcePath);
for (const note of notes) note.body = linkify(note.body, note.sourcePath);

function extractWikiTargets(markdown, sourcePath) {
  const targets = [];
  for (const match of markdown.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const inside = match[1].replace(/\\\|/g, "|");
    const target = inside.split("|")[0].trim();
    const route = resolveRoute(target, sourcePath);
    if (route) targets.push(route);
  }
  return [...new Set(targets)];
}

const explicitDomainRelations = new Set();
for (const file of domainIndexFiles) {
  const domainId = path.basename(path.dirname(file));
  const markdown = readFileSync(file, "utf8");
  for (const route of extractWikiTargets(markdown, path.relative(vaultRoot, file))) {
    const match = route.match(/^\/wiki\/([^/]+)$/);
    if (!match || match[1] === domainId) continue;
    explicitDomainRelations.add([domainId, match[1]].sort().join("::"));
  }
}

const computedRelations = [];
for (let i = 0; i < domains.length; i += 1) {
  for (let j = i + 1; j < domains.length; j += 1) {
    const left = domains[i];
    const right = domains[j];
    const overlap = left.tags.filter((tag) => right.tags.includes(tag));
    if (overlap.length >= 2) computedRelations.push({ source: left.id, target: right.id, weight: overlap.length });
  }
}

const relationMap = new Map();
for (const key of explicitDomainRelations) {
  const [source, target] = key.split("::");
  relationMap.set(key, { source, target, weight: 5, kind: "explicit" });
}
for (const relation of computedRelations) {
  const key = [relation.source, relation.target].sort().join("::");
  if (!relationMap.has(key)) relationMap.set(key, { ...relation, kind: "tags" });
}

const articleLinks = [];
for (const article of articles) {
  const original = readFileSync(path.join(vaultRoot, article.sourcePath), "utf8");
  for (const route of extractWikiTargets(original, article.sourcePath)) {
    articleLinks.push({ source: article.id, targetRoute: route });
  }
}

const allMarkdown = [...walkMarkdown(wikiRoot), ...walkMarkdown(outputRoot)]
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
const wikiLinkCount = [...allMarkdown.matchAll(/\[\[[^\]]+\]\]/g)].length;

const payload = {
  generatedAt: new Date().toISOString(),
  lastUpdated: "2026-08-22",
  stats: {
    domains: domains.length,
    articles: articles.length,
    notes: notes.length,
    links: wikiLinkCount,
  },
  domains: domains.sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title)),
  articles: articles.sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title)),
  notes: notes.sort((a, b) => b.updated.localeCompare(a.updated)),
  domainRelations: [...relationMap.values()],
  articleLinks,
};

mkdirSync(path.dirname(destination), { recursive: true });
writeFileSync(destination, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Generated ${path.relative(siteRoot, destination)} from ${domains.length} domains and ${articles.length} articles.`);
