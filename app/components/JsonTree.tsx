"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-80">
      Loading tree visualization...
    </div>
  ),
});

type JsonTreeProps = {
  jsonData: any;
};

export default function JsonTree({ jsonData }: JsonTreeProps) {
  type GraphNode = {
    id: string;
    name: string;
    val: number;
    color: string;
    level: number;
    x?: number;
    y?: number;
    isRoot?: boolean;
    isLeafValue?: boolean;
    isLeafProperty?: boolean;
    isObject?: boolean;
    isArray?: boolean;
  };

  type GraphLink = {
    source: any;
    target: any;
    value: number;
  };

  type GraphData = {
    nodes: GraphNode[];
    links: GraphLink[];
  };

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const jsonDataString = useMemo(() => {
    try {
      return jsonData ? JSON.stringify(jsonData) : null;
    } catch (e) {
      return null;
    }
  }, [jsonData]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();

    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (!jsonDataString) return;

    try {
      const jsonDataObj = JSON.parse(jsonDataString);

      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      const nodeById = new Map();

      const processObject = (
        obj: any,
        parentId: string | null = null,
        path = "",
        depth = 0
      ) => {
        if (depth > 10) return;

        let currentId: string;

        if (parentId === null) {
          currentId = "root";
          const rootNode = {
            id: currentId,
            name: "Root",
            val: 8,
            color: "#5D8AA8",
            level: depth,
            isRoot: true,
          };
          nodes.push(rootNode);
          nodeById.set(currentId, rootNode);
        } else {
          currentId = parentId;
        }

        if (obj === null || obj === undefined) return;

        if (typeof obj !== "object") {
          const valueId = `${parentId}_value`;
          const valueStr = String(obj).substring(0, 50);
          const valueNode = {
            id: valueId,
            name: valueStr,
            val: 5,
            color: "#7FBA00",
            level: depth + 1,
            isLeafValue: true,
          };
          nodes.push(valueNode);
          nodeById.set(valueId, valueNode);

          links.push({
            source: nodeById.get(parentId),
            target: valueNode,
            value: 1,
          });
          return;
        }

        const isArray = Array.isArray(obj);

        Object.entries(obj).forEach(([key, value], index) => {
          const childId = parentId ? `${parentId}.${key}` : key;
          const displayName = isArray ? `[${key}]` : key;

          const childNode = {
            id: childId,
            name: displayName,
            val: isArray ? 6 : 7,
            color: isArray ? "#F25022" : "#FFB900",
            level: depth + 1,
            isLeafProperty: typeof value !== "object" || value === null,
            isObject:
              typeof value === "object" &&
              value !== null &&
              !Array.isArray(value),
            isArray: Array.isArray(value),
          };
          nodes.push(childNode);
          nodeById.set(childId, childNode);

          if (parentId) {
            links.push({
              source: nodeById.get(parentId),
              target: childNode,
              value: 1,
            });
          } else {
            links.push({
              source: nodeById.get("root"),
              target: childNode,
              value: 1,
            });
          }

          processObject(value, childId, childId, depth + 1);
        });
      };

      processObject(jsonDataObj);

      setGraphData({ nodes, links });
    } catch (error) {
      console.error("Error processing JSON for tree view:", error);
    }
  }, [jsonDataString]);

  return (
    <div className="p-4 mt-6 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
      <h2 className="mb-4 text-xl font-bold text-zinc-800 dark:text-white">
        Hierarchical Graph View
      </h2>
      <div
        ref={containerRef}
        className="h-[70vh] border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden"
      >
        {graphData.nodes.length > 0 && (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeLabel="name"
            dagMode="lr"
            dagLevelDistance={160}
            dagNodeFilter={(node) => true}
            nodeColor={(node) => (node as GraphNode).color}
            linkColor={() => "#cccccc"}
            nodeVal={(node) => (node as GraphNode).val}
            nodeRelSize={3}
            backgroundColor="#f8fafc"
            cooldownTicks={100}
            linkDirectionalParticleWidth={0}
            linkWidth={0.8}
            d3AlphaDecay={0.03}
            d3VelocityDecay={0.4}
            onEngineStop={() => {
              if (fgRef.current) {
                fgRef.current.zoomToFit(400, 60);
              }
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const n = node as GraphNode & {
                isRoot?: boolean;
                isLeafValue?: boolean;
                isLeafProperty?: boolean;
                isObject?: boolean;
                isArray?: boolean;
                x: number;
                y: number;
              };
              const label = n.name;

              if (n.isRoot) {
                const size = 10 / globalScale;
                ctx.fillStyle = "#5D8AA8";
                ctx.fillRect(n.x - size / 2, n.y - size / 2, size, size);
              } else if (n.isLeafProperty || n.isObject) {
                const size = 6 / globalScale;
                ctx.fillStyle = "#FFB900";
                ctx.fillRect(n.x - size / 2, n.y - size / 2, size, size);
              } else if (n.isArray) {
                ctx.beginPath();
                ctx.fillStyle = "#F25022";
                ctx.arc(n.x, n.y, 4 / globalScale, 0, 2 * Math.PI, false);
                ctx.fill();
              } else {
                ctx.beginPath();
                ctx.fillStyle = "#7FBA00";
                ctx.arc(n.x, n.y, 4 / globalScale, 0, 2 * Math.PI, false);
                ctx.fill();
              }

              const fontSize = 10 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.fillStyle = "#000";
              ctx.textAlign = "left";
              ctx.textBaseline = "middle";
              ctx.fillText(label, n.x + 8 / globalScale, n.y);
            }}
            width={dimensions.width}
            height={dimensions.height}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 md:grid-cols-4">
        <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
          <div className="w-4 h-4 bg-[#5D8AA8] mr-2 rounded"></div>
          <div>Root element</div>
        </div>
        <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
          <div className="w-4 h-4 bg-[#FFB900] mr-2 rounded"></div>
          <div>Object property</div>
        </div>
        <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
          <div className="w-4 h-4 bg-[#F25022] mr-2 rounded"></div>
          <div>Array element</div>
        </div>
        <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
          <div className="w-4 h-4 bg-[#7FBA00] mr-2 rounded"></div>
          <div>Value</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-zinc-800 dark:text-zinc-400">
        <em>Hover over nodes to see their full details</em>
      </div>
    </div>
  );
}
