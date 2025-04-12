"use client";

import { useEffect, useState, useMemo } from "react";

type JsonStructureProps = {
  jsonData: any;
};

type ExplanationLine = {
  indent: number;
  text: string;
  type: "property" | "object" | "array" | "value" | "root";
  path: string;
  valueType?: string;
  key?: string;
  isSimpleValue?: boolean;
  hasChildren?: boolean;
  isLastChild?: boolean;
};

export default function JsonStructure({ jsonData }: JsonStructureProps) {
  const [explanation, setExplanation] = useState<ExplanationLine[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  const jsonDataString = useMemo(() => {
    try {
      return jsonData ? JSON.stringify(jsonData) : null;
    } catch (e) {
      return null;
    }
  }, [jsonData]);

  useEffect(() => {
    if (!jsonDataString) return;

    try {
      const jsonDataObj = JSON.parse(jsonDataString);
      const lines: ExplanationLine[] = [];
      let itemCount = 0;

      const processObject = (
        obj: any,
        path = "",
        depth = 0,
        pathSoFar = "",
        keyName = "",
        isLastSibling = false
      ) => {
        itemCount++;

        const hasChildren =
          obj !== null &&
          typeof obj === "object" &&
          Object.keys(obj).length > 0;

        if (obj === null || obj === undefined) {
          lines.push({
            indent: depth,
            text: `${path}: null`,
            type: "value",
            path: pathSoFar,
            valueType: "null",
            key: keyName,
            isSimpleValue: true,
            hasChildren: false,
            isLastChild: isLastSibling,
          });
          return;
        }

        const type = typeof obj;

        if (type !== "object") {
          let displayValue = String(obj);

          if (type === "string") {
            if (displayValue.length > 50) {
              displayValue = `"${displayValue.substring(0, 47)}..."`;
            } else {
              displayValue = `"${displayValue}"`;
            }
          }

          lines.push({
            indent: depth,
            text: `${path}: ${displayValue}`,
            type: "value",
            path: pathSoFar,
            valueType: type,
            key: keyName,
            isSimpleValue: true,
            hasChildren: false,
            isLastChild: isLastSibling,
          });
          return;
        }

        const isArray = Array.isArray(obj);
        const prefix = isArray ? "Array" : "Object";
        const count = Object.keys(obj).length;

        const itemText = count === 1 ? "item" : "items";

        if (path) {
          lines.push({
            indent: depth,
            text: `${path}: ${prefix} with ${count} ${itemText}`,
            type: isArray ? "array" : "object",
            path: pathSoFar,
            valueType: isArray ? "array" : "object",
            key: keyName,
            hasChildren: count > 0,
            isLastChild: isLastSibling,
          });
        } else {
          lines.push({
            indent: depth,
            text: `Root: ${prefix} with ${count} ${itemText}`,
            type: "root",
            path: "",
            valueType: isArray ? "array" : "object",
            key: "root",
            hasChildren: count > 0,
            isLastChild: false,
          });
        }

        if (isArray) {
          obj.forEach((value: any, index: number) => {
            const isLastItem = index === obj.length - 1;
            const displayPath = `[${index}]`;
            const nextPathSoFar = pathSoFar
              ? `${pathSoFar}.${index}`
              : `${index}`;

            processObject(
              value,
              displayPath,
              depth + 1,
              nextPathSoFar,
              String(index),
              isLastItem
            );
          });
        } else {
          const entries = Object.entries(obj);
          entries.forEach(([key, value], index) => {
            const isLastItem = index === entries.length - 1;
            const displayPath = key.toString();
            const nextPathSoFar = pathSoFar ? `${pathSoFar}.${key}` : `${key}`;

            processObject(
              value,
              displayPath,
              depth + 1,
              nextPathSoFar,
              key,
              isLastItem
            );
          });
        }
      };

      processObject(jsonDataObj);
      setExplanation(lines);
      setTotalItems(itemCount);
    } catch (error) {
      console.error("Error generating JSON explanation:", error);
      setExplanation([
        {
          indent: 0,
          text: `Error processing JSON: ${(error as Error).message}`,
          type: "value",
          path: "",
          valueType: "error",
          hasChildren: false,
          isLastChild: true,
        },
      ]);
      setTotalItems(0);
    }
  }, [jsonDataString]);

  const getConnectorClassName = (line: ExplanationLine, index: number) => {
    const prevLine = index > 0 ? explanation[index - 1] : null;
    const nextLine =
      index < explanation.length - 1 ? explanation[index + 1] : null;

    if (!line.hasChildren && line.isLastChild) {
      return "json-leaf json-last-child";
    }

    if (line.hasChildren && line.isLastChild) {
      return "json-parent json-last-child";
    }

    if (line.hasChildren) {
      return "json-parent";
    }

    return "json-leaf";
  };

  return (
    <div className="p-4 mt-6 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-white">
          JSON Structure Explanation
        </h2>
        {totalItems > 0 && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {totalItems} total items
          </div>
        )}
      </div>

      <style jsx>{`
        .json-tree-item {
          position: relative;
        }

        .json-tree-connector {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 1.5rem;
          pointer-events: none;
        }

        .json-tree-connector::before {
          content: "";
          position: absolute;
          top: 0.7rem;
          left: 0.75rem;
          width: 0.75rem;
          height: 1px;
          background-color: #a0aec0;
        }

        .json-tree-connector.json-parent::after,
        .json-tree-connector.json-leaf:not(.json-last-child)::after {
          content: "";
          position: absolute;
          top: 0.7rem;
          left: 0.75rem;
          width: 1px;
          height: 100%;
          background-color: #a0aec0;
        }

        .json-tree-connector.json-last-child::after {
          display: none;
        }

        .json-tree-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background-color: #a0aec0;
        }

        .dark .json-tree-connector::before,
        .dark .json-tree-connector::after,
        .dark .json-tree-line {
          background-color: #4a5568;
        }

        .json-tree-item:hover > .item-content {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .dark .json-tree-item:hover > .item-content {
          background-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>

      <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900 overflow-auto max-h-[70vh]">
        {explanation.length > 0 ? (
          <div className="font-mono text-sm text-zinc-800 dark:text-zinc-200">
            {explanation.map((line, index) => {
              const connectorLines = [];
              for (let i = 0; i < line.indent; i++) {
                let hasParentContinuation = false;
                for (let j = index + 1; j < explanation.length; j++) {
                  if (explanation[j].indent <= i) {
                    break;
                  }
                  if (explanation[j].indent === i + 1) {
                    hasParentContinuation = true;
                    break;
                  }
                }

                if (hasParentContinuation) {
                  connectorLines.push(
                    <div
                      key={`connector-${i}`}
                      className="json-tree-line"
                      style={{ left: `${i * 1.5 + 0.75}rem` }}
                    />
                  );
                }
              }

              return (
                <div
                  key={index}
                  className={`json-tree-item relative py-1 ${
                    index % 2 === 0 ? "bg-transparent" : "bg-transparent"
                  }`}
                  style={{ paddingLeft: `${line.indent * 1.5}rem` }}
                  title={line.path ? `Full path: ${line.path}` : "Root element"}
                >
                  {line.indent > 0 && (
                    <div
                      className={`json-tree-connector ${getConnectorClassName(
                        line,
                        index
                      )}`}
                    />
                  )}

                  {connectorLines}

                  <div className="flex items-start px-2 py-1 rounded-md item-content">
                    <div
                      className={`mr-2 pt-0.5 ${
                        line.type === "root"
                          ? "text-zinc-600 dark:text-zinc-400 font-bold"
                          : line.type === "object"
                          ? "text-purple-600 dark:text-purple-400"
                          : line.type === "array"
                          ? "text-orange-600 dark:text-orange-400"
                          : line.type === "value"
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }`}
                    >
                      {line.type === "array" && "▪ "}
                      {line.type === "object" && "○ "}
                      {line.type === "root" && "◆ "}
                      {line.type === "value" && "• "}
                    </div>
                    <div>
                      <span className="font-semibold">{line.text}</span>
                      {line.valueType && line.isSimpleValue && (
                        <span className="ml-2 text-xs text-zinc-800 dark:text-zinc-400">
                          ({line.valueType})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center text-zinc-800 dark:text-zinc-400">
            No JSON data available to explain.
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4 md:grid-cols-4">
        <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
          <div className="mr-2 font-bold text-zinc-600 dark:text-zinc-400">
            ◆
          </div>
          <div>Root element</div>
        </div>
        <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
          <div className="mr-2 font-bold text-purple-600 dark:text-purple-400">
            ○
          </div>
          <div>Object property</div>
        </div>
        <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
          <div className="mr-2 font-bold text-orange-600 dark:text-orange-400">
            ▪
          </div>
          <div>Array element</div>
        </div>
        <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
          <div className="mr-2 font-bold text-green-600 dark:text-green-400">
            •
          </div>
          <div>Value</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-zinc-800 dark:text-zinc-400">
        <em>Hover over items to see their full JSON path</em>
      </div>
    </div>
  );
}
