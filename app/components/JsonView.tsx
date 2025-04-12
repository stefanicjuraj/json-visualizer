"use client";

import { useEffect, useRef, useState } from "react";

type JsonViewProps = {
  onJsonUpdate?: (jsonData: any) => void;
  onJsonOutput?: (outputHtml: string) => void;
  onJsonControls?: (controls: {
    collapseOne: () => void;
    expandOne: () => void;
    collapseAll: () => void;
    expandAll: () => void;
    search: (term: string) => void;
  }) => void;
};

export default function JsonView({
  onJsonUpdate,
  onJsonOutput,
  onJsonControls,
}: JsonViewProps) {
  const jsonInputRef = useRef<HTMLTextAreaElement>(null);
  const jsonOutputRef = useRef<HTMLDivElement>(null);
  const visualizeBtnRef = useRef<HTMLButtonElement>(null);
  const [currentJsonObj, setCurrentJsonObj] = useState<any>(null);
  const [hasJsonInput, setHasJsonInput] = useState(false);

  const currentLevelRef = useRef(0);
  const maxLevelRef = useRef(0);

  const sampleJsonData = {
    status: "success",
    code: 200,
    data: {
      users: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          address: {
            city: "New York",
            country: "USA",
          },
          tags: ["developer", "designer"],
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          address: {
            city: "San Francisco",
            country: "USA",
          },
          tags: ["manager", "marketing"],
        },
      ],
      meta: {
        total: 2,
        page: 1,
      },
    },
  };

  const loadSampleData = () => {
    if (jsonInputRef.current && visualizeBtnRef.current) {
      jsonInputRef.current.value = JSON.stringify(sampleJsonData, null, 2);
      setHasJsonInput(true);

      setTimeout(() => {
        visualizeBtnRef.current?.click();
      }, 50);
    }
  };

  const handleJsonInputChange = () => {
    const jsonInput = jsonInputRef.current;
    if (jsonInput) {
      setHasJsonInput(jsonInput.value.trim().length > 0);
    }
  };

  useEffect(() => {
    const jsonInput = jsonInputRef.current;
    const jsonOutput = jsonOutputRef.current;
    const visualizeBtn = visualizeBtnRef.current;

    if (!jsonInput || !jsonOutput || !visualizeBtn) {
      return;
    }

    jsonInput.addEventListener("input", handleJsonInputChange);

    handleJsonInputChange();

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("json-collapse-marker")) {
        const parentDiv = target.closest("div");
        if (!parentDiv) return;

        const contentDiv = Array.from(parentDiv.children).find((child) =>
          child.classList.contains("json-item")
        ) as HTMLElement;

        if (contentDiv) {
          contentDiv.style.display =
            contentDiv.style.display === "none" ? "block" : "none";
          target.textContent = contentDiv.style.display === "none" ? "▶" : "▼";
        }
      }
    };

    document.addEventListener("click", handleDocumentClick);

    const countLevels = (obj: any, level = 1): number => {
      if (typeof obj !== "object" || obj === null) return level;

      let maxChildLevel = level;
      for (const key in obj) {
        const childLevel = countLevels(obj[key], level + 1);
        maxChildLevel = Math.max(maxChildLevel, childLevel);
      }
      return maxChildLevel;
    };

    const actualVisualizeJson = () => {
      try {
        const jsonString = jsonInput.value.trim();
        if (!jsonString) {
          jsonOutput.innerHTML =
            '<span class="text-red-500">Please enter JSON data</span>';
          if (onJsonOutput) {
            onJsonOutput(jsonOutput.innerHTML);
          }
          return;
        }

        const parsedJson = JSON.parse(jsonString);
        setCurrentJsonObj(parsedJson);
        if (onJsonUpdate) {
          onJsonUpdate(parsedJson);
        }

        maxLevelRef.current = countLevels(parsedJson);
        currentLevelRef.current = maxLevelRef.current;
        renderJson(parsedJson);
      } catch (error) {
        const errorMessage = `<span class="text-red-500">Invalid JSON: ${
          (error as Error).message
        }</span>`;
        jsonOutput.innerHTML = errorMessage;
        if (onJsonOutput) {
          onJsonOutput(errorMessage);
        }
      }
    };

    const renderJson = (jsonObj: any) => {
      const output = formatJson(jsonObj, "", "", 0);
      jsonOutput.innerHTML = output;
      if (onJsonOutput) {
        onJsonOutput(output);
      }
    };

    const getValueType = (value: any): string => {
      if (value === null) return "null";
      if (Array.isArray(value)) return "array";
      return typeof value;
    };

    const formatJson = (
      obj: any,
      path = "",
      breadcrumb = "",
      depth = 0
    ): string => {
      if (obj === null) return `<span class="json-null">null</span>`;

      const type = getValueType(obj);

      if (type === "string") {
        return `<span class="json-string">&quot;${escapeHtml(
          obj
        )}&quot;</span>`;
      }

      if (type === "number" || type === "boolean") {
        return `<span class="json-${type}">${obj}</span>`;
      }

      if (type === "array" || type === "object") {
        const isArray = type === "array";
        const openBracket = isArray ? "[" : "{";
        const closeBracket = isArray ? "]" : "}";

        if (Object.keys(obj).length === 0) {
          return `<span class="json-mark">${openBracket}${closeBracket}</span>`;
        }

        let result = `<div class="json-object-container" data-depth="${depth}">
          <span class="json-collapse-marker" data-depth="${depth}">▼</span><span class="json-mark">${openBracket}</span>`;

        if (breadcrumb) {
          result += `<span class="json-breadcrumb">${breadcrumb}</span>`;
        }

        result += `<div class="json-item" data-depth="${depth}">`;

        const entries = isArray
          ? obj.map((item: any, index: number) => [index, item])
          : Object.entries(obj);

        result += entries
          .map(([key, value]: [string, any]) => {
            const currentPath = path ? `${path}.${key}` : key;
            const currentBreadcrumb = breadcrumb
              ? `${breadcrumb}.${key}`
              : `${key}`;

            const nextDepth = depth + 1;
            const formattedValue = formatJson(
              value,
              currentPath,
              currentBreadcrumb,
              nextDepth
            );

            if (isArray) {
              return `<div data-path="${currentPath}" class="py-1">
                ${formattedValue}
              </div>`;
            } else {
              return `<div data-path="${currentPath}" class="py-1">
                <span class="json-key">&quot;${key}&quot;</span><span class="json-mark">: </span>${formattedValue}
              </div>`;
            }
          })
          .join("");

        result += `</div><span class="json-mark">${closeBracket}</span></div>`;

        return result;
      }

      return `<span>${String(obj)}</span>`;
    };

    const escapeHtml = (str: string): string => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const collapseOneLevel = () => {
      if (!currentJsonObj || currentLevelRef.current <= 0) return;

      currentLevelRef.current--;

      document
        .querySelectorAll(".json-object-container")
        .forEach((container) => {
          const depth = parseInt(
            container.getAttribute("data-depth") || "0",
            10
          );

          if (depth === currentLevelRef.current) {
            const item = container.querySelector(".json-item") as HTMLElement;
            const marker = container.querySelector(
              ".json-collapse-marker"
            ) as HTMLElement;

            if (item && marker) {
              item.style.display = "none";
              marker.textContent = "▶";
            }
          }
        });
    };

    const expandOneLevel = () => {
      if (!currentJsonObj || currentLevelRef.current >= maxLevelRef.current)
        return;

      currentLevelRef.current++;

      for (let i = 0; i <= currentLevelRef.current; i++) {
        document
          .querySelectorAll(`.json-object-container[data-depth="${i}"]`)
          .forEach((container) => {
            const item = container.querySelector(".json-item") as HTMLElement;
            const marker = container.querySelector(
              ".json-collapse-marker"
            ) as HTMLElement;

            if (item && marker) {
              item.style.display = "block";
              marker.textContent = "▼";
            }
          });
      }

      document
        .querySelectorAll(".json-object-container")
        .forEach((container) => {
          const depth = parseInt(
            container.getAttribute("data-depth") || "0",
            10
          );

          if (depth > currentLevelRef.current) {
            const item = container.querySelector(".json-item") as HTMLElement;
            const marker = container.querySelector(
              ".json-collapse-marker"
            ) as HTMLElement;

            if (item && marker) {
              item.style.display = "none";
              marker.textContent = "▶";
            }
          }
        });
    };

    const collapseAll = () => {
      currentLevelRef.current = 0;

      document
        .querySelectorAll(".json-object-container")
        .forEach((container) => {
          const depth = parseInt(
            container.getAttribute("data-depth") || "0",
            10
          );
          const item = container.querySelector(".json-item") as HTMLElement;
          const marker = container.querySelector(
            ".json-collapse-marker"
          ) as HTMLElement;

          if (depth === 0) {
            if (item) item.style.display = "block";
            if (marker) marker.textContent = "▼";
          } else {
            if (item) item.style.display = "none";
            if (marker) marker.textContent = "▶";
          }
        });
    };

    const expandAll = () => {
      currentLevelRef.current = maxLevelRef.current;

      document.querySelectorAll(".json-collapse-marker").forEach((marker) => {
        marker.textContent = "▼";
        const container = marker.closest(".json-object-container");
        if (container) {
          const contentDiv = container.querySelector(".json-item");
          if (contentDiv) {
            (contentDiv as HTMLElement).style.display = "block";
          }
        }
      });
    };

    const searchInJson = (searchTerm: string) => {
      const term = searchTerm.trim().toLowerCase();

      document.querySelectorAll(".highlight").forEach((el) => {
        el.classList.remove("highlight");
      });

      if (!term) {
        document.querySelectorAll("[data-path]").forEach((el) => {
          (el as HTMLElement).style.display = "";
        });
        expandAll();
        return;
      }

      document.querySelectorAll("[data-path]").forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      let matchFound = false;
      const matchingElements: Set<Element> = new Set();

      document.querySelectorAll("[data-path]").forEach((el) => {
        const path = (el as HTMLElement).dataset.path || "";
        const content = el.textContent || "";

        if (
          path.toLowerCase().includes(term) ||
          content.toLowerCase().includes(term)
        ) {
          matchFound = true;

          matchingElements.add(el);

          let parent = el.parentElement;
          while (parent && parent !== jsonOutput) {
            if (parent.hasAttribute("data-path")) {
              matchingElements.add(parent);
            }
            parent = parent.parentElement;
          }
        }
      });

      matchingElements.forEach((el) => {
        (el as HTMLElement).style.display = "";

        const path = (el as HTMLElement).dataset.path || "";
        const content = el.textContent || "";

        if (
          path.toLowerCase().includes(term) ||
          content.toLowerCase().includes(term)
        ) {
          el.classList.add("highlight");

          let parent = el.parentElement;
          while (parent) {
            if (parent.classList.contains("json-item")) {
              (parent as HTMLElement).style.display = "block";

              const container = parent.closest(".json-object-container");
              if (container) {
                const marker = container.querySelector(".json-collapse-marker");
                if (marker) {
                  marker.textContent = "▼";
                }
              }
            }
            parent = parent.parentElement;
          }
        }
      });

      if (!matchFound) {
        const noMatchesMessage = `<div class="mt-4 text-red-500">No matches found for "${term}"</div>`;
        if (jsonOutput.querySelector(".no-matches-message")) {
          jsonOutput.querySelector(".no-matches-message")!.remove();
        }
        const messageDiv = document.createElement("div");
        messageDiv.className = "no-matches-message";
        messageDiv.innerHTML = noMatchesMessage;
        jsonOutput.appendChild(messageDiv);

        if (onJsonOutput) {
          onJsonOutput(jsonOutput.innerHTML);
        }
      }
    };

    if (onJsonControls) {
      onJsonControls({
        collapseOne: collapseOneLevel,
        expandOne: expandOneLevel,
        collapseAll: collapseAll,
        expandAll: expandAll,
        search: searchInJson,
      });
    }

    visualizeBtn.addEventListener("click", actualVisualizeJson);

    return () => {
      visualizeBtn.removeEventListener("click", actualVisualizeJson);
      document.removeEventListener("click", handleDocumentClick);
      jsonInput.removeEventListener("input", handleJsonInputChange);
    };
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
      <div className="mb-4">
        <textarea
          ref={jsonInputRef}
          className="w-full h-48 p-3 font-mono text-sm bg-white border rounded-md border-zinc-300 dark:border-zinc-700 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
          placeholder="Paste your JSON here..."
          onChange={handleJsonInputChange}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            ref={visualizeBtnRef}
            disabled={!hasJsonInput}
            className={`py-3 text-white transition-colors rounded shadow-sm px-7 ${
              hasJsonInput
                ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                : "bg-zinc-600 opacity-70 cursor-not-allowed"
            }`}
          >
            Visualize
          </button>
          <button
            onClick={loadSampleData}
            className="py-3 text-white transition-colors bg-blue-600 rounded shadow-sm cursor-pointer px-7 hover:bg-blue-700"
          >
            Sample Data
          </button>
          {hasJsonInput && (
            <button
              onClick={() => {
                if (jsonInputRef.current) {
                  jsonInputRef.current.value = "";
                  setHasJsonInput(false);
                }
              }}
              className="py-3 text-white transition-colors bg-red-600 rounded shadow-sm cursor-pointer px-7 hover:bg-red-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div ref={jsonOutputRef} className="hidden"></div>
    </div>
  );
}
