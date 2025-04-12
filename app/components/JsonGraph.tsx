"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-80">
      Loading graph visualization...
    </div>
  ),
});

type JsonGraphProps = {
  jsonData: any;
};

export default function JsonGraph({ jsonData }: JsonGraphProps) {
  type GraphNode = {
    id: string;
    name: string;
    val: number;
    color: string;
    level: number;
    x?: number;
    y?: number;
    isValue: boolean;
    isRoot?: boolean;
    isArray?: boolean;
    isObject?: boolean;
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
      const nodeMap = new Map();

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
            val: 10,
            color: "#5D8AA8",
            level: depth,
            isValue: false,
            isRoot: true,
          };
          nodes.push(rootNode);
          nodeMap.set(currentId, rootNode);
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
            isValue: true,
          };
          nodes.push(valueNode);

          if (parentId !== null) {
            links.push({
              source: nodeMap.get(parentId),
              target: valueNode,
              value: 1,
            });
          }

          nodeMap.set(valueId, valueNode);
          return;
        }

        const isArray = Array.isArray(obj);

        Object.entries(obj).forEach(([key, value], index) => {
          const childId = parentId ? `${parentId}.${key}` : key;
          const displayName = isArray ? `[${key}]` : key;

          const childNode = {
            id: childId,
            name: displayName,
            val: 7,
            color: isArray ? "#F25022" : "#FFB900",
            level: depth + 1,
            isValue: false,
            isArray: isArray,
            isObject: !isArray,
          };
          nodes.push(childNode);
          nodeMap.set(childId, childNode);

          if (parentId) {
            links.push({
              source: nodeMap.get(parentId),
              target: childNode,
              value: 1,
            });
          } else {
            links.push({
              source: nodeMap.get("root"),
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
      console.error("Error processing JSON for graph:", error);
    }
  }, [jsonDataString]);

  return (
    <div className="p-4 mt-6 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
      <h2 className="mb-4 text-xl font-bold text-zinc-800 dark:text-white">
        JSON Graph Visualization
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
            linkDirectionalParticles={1}
            linkDirectionalParticleSpeed={0.005}
            nodeRelSize={6}
            backgroundColor="#f8fafc"
            nodeCanvasObject={(node, ctx, globalScale) => {
              const n = node as GraphNode & {
                x: number;
                y: number;
                isValue?: boolean;
                isRoot?: boolean;
                isArray?: boolean;
                isObject?: boolean;
              };
              const label = n.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = n.color;

              const textWidth = ctx.measureText(label).width;
              const rectWidth = textWidth + 10;
              const rectHeight = fontSize + 6;

              ctx.fillRect(
                n.x - rectWidth / 2,
                n.y - rectHeight / 2,
                rectWidth,
                rectHeight
              );

              ctx.fillStyle = "#fff";
              ctx.fillText(label, n.x, n.y);
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
