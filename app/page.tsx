"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import JsonView from "./components/JsonView";
import JsonGraph from "./components/JsonGraph";
import JsonTree from "./components/JsonTree";
import JsonStructure from "./components/JsonStructure";
import JsonText from "./components/JsonText";
import JsonTable from "./components/JsonTable";

export default function Home() {
  const [jsonData, setJsonData] = useState<any>(null);
  const [jsonOutput, setJsonOutput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "json" | "tree" | "graph" | "explainer" | "text" | "table"
  >("json");
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [jsonControls, setJsonControls] = useState<{
    collapseAll: () => void;
    expandAll: () => void;
    search: (term: string) => void;
  } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const [tabContentHeight, setTabContentHeight] = useState<number>(400);

  useEffect(() => {
    if (jsonData && tabContentRef.current) {
      const timer = setTimeout(() => {
        const activeContent = tabContentRef.current?.querySelector(
          `.tab-panel-${activeTab}`
        );
        if (activeContent) {
          const contentHeight = activeContent.getBoundingClientRect().height;
          setTabContentHeight(contentHeight);
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [activeTab, jsonData]);

  const handleTabChange = useCallback(
    (tab: "json" | "tree" | "graph" | "explainer" | "text" | "table") => {
      if (isTabChanging) return;

      setIsTabChanging(true);
      setActiveTab(tab);

      setTimeout(() => {
        setIsTabChanging(false);
      }, 350);
    },
    [isTabChanging]
  );

  const handleJsonUpdate = useCallback(
    (data: any) => {
      setJsonData(data);
      handleTabChange("json");
    },
    [handleTabChange]
  );

  const handleJsonOutput = useCallback((outputHtml: string) => {
    setJsonOutput(outputHtml);
  }, []);

  const handleJsonControls = useCallback(
    (controls: {
      collapseOne: () => void;
      expandOne: () => void;
      collapseAll: () => void;
      expandAll: () => void;
      search: (term: string) => void;
    }) => {
      setJsonControls(controls);
    },
    []
  );

  const handleSearch = useCallback(() => {
    if (jsonControls && searchInputRef.current) {
      jsonControls.search(searchInputRef.current.value);
    }
  }, [jsonControls]);

  return (
    <main className="min-h-screen p-4 md:p-6 bg-zinc-50 dark:bg-zinc-900">
      <div className="flex items-center mb-4">
        <div className="flex justify-center">
          <img
            src="/assets/icons/favicon.svg"
            alt="JSON Visualizer"
            className="rounded-lg w-9 h-9"
          />
          <h1 className="ml-3 text-3xl font-black text-zinc-800 dark:text-white">
            JSON Visualizer
          </h1>
        </div>
      </div>

      <JsonView
        onJsonUpdate={handleJsonUpdate}
        onJsonOutput={handleJsonOutput}
        onJsonControls={handleJsonControls}
      />

      <div className="mt-6 border-b border-zinc-200 dark:border-zinc-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => handleTabChange("json")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "json"
                  ? "text-zinc-600 border-b-2 border-zinc-600 dark:text-zinc-300 dark:border-zinc-300"
                  : jsonData
                  ? "hover:text-zinc-800 hover:border-zinc-300 dark:hover:text-zinc-100 cursor-pointer"
                  : "text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              }`}
              disabled={!jsonData || isTabChanging}
            >
              JSON View
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => handleTabChange("graph")}
              disabled={!jsonData || isTabChanging}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "graph"
                  ? "text-zinc-600 border-b-2 border-zinc-600 dark:text-zinc-300 dark:border-zinc-300"
                  : jsonData
                  ? "hover:text-zinc-800 hover:border-zinc-300 dark:hover:text-zinc-100 cursor-pointer"
                  : "text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              }`}
            >
              Graph View
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => handleTabChange("tree")}
              disabled={!jsonData || isTabChanging}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "tree"
                  ? "text-zinc-600 border-b-2 border-zinc-600 dark:text-zinc-300 dark:border-zinc-300"
                  : jsonData
                  ? "hover:text-zinc-800 hover:border-zinc-300 dark:hover:text-zinc-100 cursor-pointer"
                  : "text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              }`}
            >
              Tree View
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => handleTabChange("table")}
              disabled={!jsonData || isTabChanging}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "table"
                  ? "text-zinc-600 border-b-2 border-zinc-600 dark:text-zinc-300 dark:border-zinc-300"
                  : jsonData
                  ? "hover:text-zinc-800 hover:border-zinc-300 dark:hover:text-zinc-100 cursor-pointer"
                  : "text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              }`}
            >
              Table View
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => handleTabChange("explainer")}
              disabled={!jsonData || isTabChanging}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "explainer"
                  ? "text-zinc-600 border-b-2 border-zinc-600 dark:text-zinc-300 dark:border-zinc-300"
                  : jsonData
                  ? "hover:text-zinc-800 hover:border-zinc-300 dark:hover:text-zinc-100 cursor-pointer"
                  : "text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              }`}
            >
              Structure View
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => handleTabChange("text")}
              disabled={!jsonData || isTabChanging}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "text"
                  ? "text-zinc-600 border-b-2 border-zinc-600 dark:text-zinc-300 dark:border-zinc-300"
                  : jsonData
                  ? "hover:text-zinc-800 hover:border-zinc-300 dark:hover:text-zinc-100 cursor-pointer"
                  : "text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              }`}
            >
              Text View
            </button>
          </li>
        </ul>
      </div>

      <div
        ref={tabContentRef}
        className="relative mt-4 tab-content"
        style={{
          height: jsonData ? `${tabContentHeight}px` : "auto",
          transition: "height 0.3s ease-in-out",
        }}
      >
        {!jsonData && (
          <div className="p-4 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
            <p className="text-center text-zinc-500 dark:text-zinc-400">
              Input your JSON and click &quot;Visualize&quot; to access
              different views
            </p>
          </div>
        )}

        {jsonData && (
          <>
            <div
              className={`absolute w-full transition-all duration-300 tab-panel-json ${
                activeTab === "json"
                  ? "opacity-100 z-10 translate-x-0"
                  : "opacity-0 z-0 pointer-events-none translate-x-4"
              }`}
            >
              <div className="p-4 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-zinc-800 dark:text-white">
                    JSON Structure
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => jsonControls?.collapseAll()}
                      disabled={!jsonControls}
                      className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-500 text-zinc-800 dark:text-white rounded text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      Collapse All
                    </button>
                    <button
                      onClick={() => jsonControls?.expandAll()}
                      disabled={!jsonControls}
                      className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-500 text-zinc-800 dark:text-white rounded text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      Expand All
                    </button>
                    <div className="relative flex items-center flex-grow md:flex-grow-0 md:w-64">
                      <input
                        ref={searchInputRef}
                        type="text"
                        className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-300 rounded text-sm focus:ring-2 focus:ring-zinc-500 focus:border-transparent bg-white dark:bg-zinc-700 shadow-sm"
                        placeholder="Search for field..."
                        onKeyUp={(e) => e.key === "Enter" && handleSearch()}
                      />
                      <button
                        onClick={handleSearch}
                        className="absolute p-1 transform rounded-md right-1 top-1 -tranzinc-y-1/2 bg-zinc-100 dark:bg-zinc-500"
                        disabled={!jsonControls}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  className="font-mono text-sm overflow-auto max-h-[70vh] bg-zinc-50 dark:bg-zinc-900 p-3 rounded border border-zinc-200 dark:border-zinc-700 shadow-inner"
                  dangerouslySetInnerHTML={{ __html: jsonOutput }}
                ></div>
              </div>
            </div>

            <div
              className={`absolute w-full transition-all duration-300 tab-panel-graph ${
                activeTab === "graph"
                  ? "opacity-100 z-10 translate-x-0"
                  : "opacity-0 z-0 pointer-events-none translate-x-4"
              }`}
            >
              <div className="p-4 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
                <JsonGraph jsonData={jsonData} />
              </div>
            </div>

            <div
              className={`absolute w-full transition-all duration-300 tab-panel-tree ${
                activeTab === "tree"
                  ? "opacity-100 z-10 translate-x-0"
                  : "opacity-0 z-0 pointer-events-none translate-x-4"
              }`}
            >
              <div className="p-4 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
                <JsonTree jsonData={jsonData} />
              </div>
            </div>

            <div
              className={`absolute w-full transition-all duration-300 tab-panel-table ${
                activeTab === "table"
                  ? "opacity-100 z-10 translate-x-0"
                  : "opacity-0 z-0 pointer-events-none translate-x-4"
              }`}
            >
              <div className="p-4 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
                <JsonTable jsonData={jsonData} />
              </div>
            </div>

            <div
              className={`absolute w-full transition-all duration-300 tab-panel-explainer ${
                activeTab === "explainer"
                  ? "opacity-100 z-10 translate-x-0"
                  : "opacity-0 z-0 pointer-events-none translate-x-4"
              }`}
            >
              <div className="p-4 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
                <JsonStructure jsonData={jsonData} />
              </div>
            </div>

            <div
              className={`absolute w-full transition-all duration-300 tab-panel-text ${
                activeTab === "text"
                  ? "opacity-100 z-10 translate-x-0"
                  : "opacity-0 z-0 pointer-events-none translate-x-4"
              }`}
            >
              <div className="p-4 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
                <JsonText jsonData={jsonData} />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
