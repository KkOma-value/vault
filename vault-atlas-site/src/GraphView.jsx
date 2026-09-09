import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Crosshair } from "@phosphor-icons/react";

const colors = {
  selected: "#c8ff38",
  core: "#73d6ff",
  practice: "#6aa7ff",
  field: "#53758b",
  concept: "#ff826f",
};

function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 640, height: 360 });

  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(280, Math.floor(entry.contentRect.width));
      const height = Math.max(220, Math.floor(entry.contentRect.height));
      setSize({ width, height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}

export function GraphView({
  data,
  height = 360,
  onNavigate,
  compact = false,
  label = "知识关系图",
}) {
  const [containerRef, size] = useElementSize();
  const graphRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const graphData = useMemo(
    () => ({
      nodes: data.nodes.map((node) => ({ ...node })),
      links: data.links.map((link) => ({ ...link })),
    }),
    [data],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => graphRef.current?.zoomToFit(450, compact ? 44 : 70), 600);
    return () => window.clearTimeout(timer);
  }, [graphData, compact]);

  function drawNode(node, context, scale) {
    const isHovered = hovered === node.id;
    const radius = (node.size || 6) + (isHovered ? 2 : 0);
    const color = colors[node.group] || colors.field;
    context.beginPath();
    context.arc(node.x, node.y, radius, 0, Math.PI * 2);
    context.fillStyle = node.group === "selected" ? color : "#07131d";
    context.fill();
    context.lineWidth = isHovered ? 2.2 : 1.3;
    context.strokeStyle = color;
    context.stroke();

    if (compact && node.group === "selected") {
      const words = node.label.split(/\s+/).filter(Boolean);
      const lines = words.length > 1 ? words.slice(0, 2) : [node.label.slice(0, 9)];
      context.font = `700 4.2px "Noto Sans SC"`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#10200a";
      lines.forEach((line, index) => context.fillText(line, node.x, node.y + (index - (lines.length - 1) / 2) * 5));
      return;
    }

    if (!compact || isHovered) {
      const screenFontSize = node.group === "selected" ? 11 : 9;
      const fontSize = screenFontSize / Math.max(scale, 0.35);
      context.font = `${node.group === "selected" ? 650 : 520} ${fontSize}px "Noto Sans SC"`;
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillStyle = node.group === "selected" ? "#eaffaa" : "#d8e6ed";
      const limit = node.group === "selected" ? 28 : 15;
      const visible = node.label.length > limit ? `${node.label.slice(0, limit - 1)}…` : node.label;
      context.fillText(visible, node.x, node.y + radius + 4 / Math.max(scale, 0.35));
    }
  }

  return (
    <div
      className={`graph-view ${compact ? "graph-view--compact" : ""}`}
      ref={containerRef}
      style={{ height }}
      aria-label={label}
    >
      <ForceGraph2D
        ref={graphRef}
        width={size.width}
        height={size.height}
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)"
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={(node, color, context) => {
          context.fillStyle = color;
          context.beginPath();
          context.arc(node.x, node.y, (node.size || 6) + 8, 0, Math.PI * 2);
          context.fill();
        }}
        nodeLabel={(node) => node.label}
        linkColor={(link) => (link.kind === "explicit" ? "rgba(107,216,255,.75)" : "rgba(83,117,139,.42)")}
        linkWidth={(link) => Math.min(2.2, 0.45 + (link.weight || 1) * 0.2)}
        linkDirectionalParticles={compact ? 0 : 1}
        linkDirectionalParticleWidth={1.4}
        linkDirectionalParticleSpeed={0.003}
        onNodeHover={(node) => setHovered(node?.id || null)}
        onNodeClick={(node) => node.route && onNavigate?.(node.route)}
        onEngineStop={() => graphRef.current?.zoomToFit(350, compact ? 38 : 62)}
        enableNodeDrag={!compact}
        cooldownTicks={70}
        d3VelocityDecay={0.34}
      />
      <button
        type="button"
        className="graph-fit-button"
        onClick={() => graphRef.current?.zoomToFit(450, compact ? 38 : 62)}
        aria-label="将全部节点居中显示"
      >
        <Crosshair size={17} weight="bold" />
        {!compact && <span>重新定位</span>}
      </button>
      <ul className="sr-only">
        {data.nodes.filter((node) => node.route).map((node) => (
          <li key={node.id}>
            <button type="button" onClick={() => onNavigate?.(node.route)}>{node.label}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
