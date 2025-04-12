"use client";

import { useEffect, useState, useMemo } from "react";

type JsonTextProps = {
  jsonData: any;
};

type ExplanationSegment = {
  text: string;
  type: "normal" | "value" | "dataType";
};

export default function JsonText({ jsonData }: JsonTextProps) {
  const [explanation, setExplanation] = useState<ExplanationSegment[]>([]);

  const jsonDataString = useMemo(() => {
    try {
      return jsonData ? JSON.stringify(jsonData) : null;
    } catch (e) {
      return null;
    }
  }, [jsonData]);

  useEffect(() => {
    if (!jsonDataString) {
      setExplanation([
        { text: "No JSON data available to explain.", type: "normal" },
      ]);
      return;
    }

    try {
      const jsonDataObj = JSON.parse(jsonDataString);
      const segments: ExplanationSegment[] = [];

      const explainJson = (obj: any, path = "", depth = 0) => {
        const indent = "  ".repeat(depth);

        if (obj === null || obj === undefined) {
          segments.push({
            text: `${indent}${path} is `,
            type: "normal",
          });
          segments.push({ text: "null or undefined", type: "dataType" });
          segments.push({ text: "\n", type: "normal" });
          return;
        }

        const type = typeof obj;

        if (type !== "object") {
          const displayValue = type === "string" ? `"${obj}"` : String(obj);
          segments.push({
            text: `${indent}${path} is a `,
            type: "normal",
          });
          segments.push({ text: type, type: "dataType" });
          segments.push({ text: ": ", type: "normal" });
          segments.push({ text: displayValue, type: "value" });
          segments.push({ text: "\n", type: "normal" });
          return;
        }

        const isArray = Array.isArray(obj);
        const count = Object.keys(obj).length;

        if (path) {
          segments.push({
            text: `${indent}${path} is a`,
            type: "normal",
          });
          segments.push({
            text: isArray ? "n array" : " object",
            type: "dataType",
          });
          segments.push({
            text: ` with ${count} ${count === 1 ? "item" : "items"}`,
            type: "normal",
          });
          segments.push({ text: "\n", type: "normal" });
        } else {
          segments.push({
            text: `${indent}The root is a`,
            type: "normal",
          });
          segments.push({
            text: isArray ? "n array" : " object",
            type: "dataType",
          });
          segments.push({
            text: ` with ${count} ${count === 1 ? "item" : "items"}`,
            type: "normal",
          });
          segments.push({ text: "\n", type: "normal" });
        }

        if (isArray) {
          obj.forEach((item: any, index: number) => {
            const itemPath = path ? `${path}[${index}]` : `[${index}]`;
            const itemType = typeof item;

            if (itemType !== "object" || item === null) {
              const displayValue =
                itemType === "string" ? `"${item}"` : String(item);
              segments.push({
                text: `${indent}  ${itemPath} is a `,
                type: "normal",
              });
              segments.push({ text: itemType, type: "dataType" });
              segments.push({ text: ": ", type: "normal" });
              segments.push({ text: displayValue, type: "value" });
              segments.push({ text: "\n", type: "normal" });
            } else {
              explainJson(item, itemPath, depth + 1);
            }
          });
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            const propPath = path ? `${path}.${key}` : key;
            const valueType = typeof value;

            if (valueType !== "object" || value === null) {
              const displayValue =
                valueType === "string" ? `"${value}"` : String(value);
              segments.push({
                text: `${indent}  ${propPath} is a `,
                type: "normal",
              });
              segments.push({ text: valueType, type: "dataType" });
              segments.push({ text: ": ", type: "normal" });
              segments.push({ text: displayValue, type: "value" });
              segments.push({ text: "\n", type: "normal" });
            } else {
              explainJson(value, propPath, depth + 1);
            }
          });
        }
      };

      explainJson(jsonDataObj);
      setExplanation(segments);
    } catch (error) {
      setExplanation([
        {
          text: `Error processing JSON: ${(error as Error).message}`,
          type: "normal",
        },
      ]);
    }
  }, [jsonDataString]);

  return (
    <div className="p-4 mt-6 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-white">
          JSON Text Explanation
        </h2>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900 overflow-auto max-h-[70vh]">
        <pre className="font-mono text-sm whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
          {explanation.map((segment, index) => {
            if (segment.type === "value") {
              return (
                <span
                  key={index}
                  className="text-green-600 dark:text-green-400"
                >
                  {segment.text}
                </span>
              );
            } else if (segment.type === "dataType") {
              return (
                <span
                  key={index}
                  className="font-medium text-purple-600 dark:text-purple-400"
                >
                  {segment.text}
                </span>
              );
            } else {
              return <span key={index}>{segment.text}</span>;
            }
          })}
        </pre>
      </div>

      <div className="mt-4 text-xs text-zinc-800 dark:text-zinc-400">
        <em>
          A textual representation with{" "}
          <span className="font-bold text-zinc-600 dark:text-zinc-400">
            highlighted values
          </span>{" "}
          and{" "}
          <span className="font-medium text-purple-600 dark:text-purple-400">
            data types
          </span>
        </em>
      </div>
    </div>
  );
}
