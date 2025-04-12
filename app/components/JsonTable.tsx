"use client";

import React, { useState, useEffect, useMemo } from "react";

type JsonTableProps = {
  jsonData: any;
};

export default function JsonTable({ jsonData }: JsonTableProps) {
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isArray, setIsArray] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const jsonDataString = useMemo(() => {
    try {
      return jsonData ? JSON.stringify(jsonData) : null;
    } catch (e) {
      return null;
    }
  }, [jsonData]);

  useEffect(() => {
    if (!jsonDataString) {
      setTableData([]);
      setColumns([]);
      setIsArray(false);
      setError(null);
      setExpandedRows({});
      return;
    }

    try {
      const parsedData = JSON.parse(jsonDataString);

      if (typeof parsedData !== "object" || parsedData === null) {
        setError("Only objects or arrays can be displayed in table format");
        setTableData([]);
        setColumns([]);
        return;
      }

      if (Array.isArray(parsedData)) {
        setIsArray(true);

        if (parsedData.length === 0) {
          setTableData([]);
          setColumns([]);
          setError("Array is empty");
          return;
        }

        const allObjects = parsedData.every(
          (item) =>
            typeof item === "object" && item !== null && !Array.isArray(item)
        );

        if (allObjects) {
          const allColumns = new Set<string>();
          parsedData.forEach((item) => {
            Object.keys(item).forEach((key) => allColumns.add(key));
          });

          setColumns(Array.from(allColumns));
          setTableData(parsedData);
          setError(null);
        } else {
          setColumns(["index", "value", "type", "actions"]);
          setTableData(
            parsedData.map((item, index) => ({
              index,
              value:
                typeof item === "object" && item !== null
                  ? "Object" + (Array.isArray(item) ? " (Array)" : "")
                  : String(item),
              type: Array.isArray(item)
                ? "array"
                : item === null
                ? "null"
                : typeof item,
              originalValue: item,
            }))
          );
          setError(null);
        }
      } else {
        setColumns(["key", "value", "type", "actions"]);
        setTableData(
          Object.entries(parsedData).map(([key, value]) => ({
            key,
            value:
              typeof value === "object" && value !== null
                ? "Object" + (Array.isArray(value) ? " (Array)" : "")
                : String(value),
            type: Array.isArray(value)
              ? "array"
              : value === null
              ? "null"
              : typeof value,
            originalValue: value,
          }))
        );
        setError(null);
      }
    } catch (error) {
      setError(`Error processing JSON: ${(error as Error).message}`);
      setTableData([]);
      setColumns([]);
    }
  }, [jsonDataString]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return tableData;

    return [...tableData].sort((a, b) => {
      if (a[sortConfig.key] === undefined) return 1;
      if (b[sortConfig.key] === undefined) return -1;

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [tableData, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";

    if (sortConfig && sortConfig.key === key) {
      direction =
        sortConfig.direction === "ascending" ? "descending" : "ascending";
    }

    setSortConfig({ key, direction });
  };

  const toggleRowExpansion = (rowKey: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  const formatObjectPreview = (obj: any) => {
    if (!obj || typeof obj !== "object") return "";

    if (Array.isArray(obj)) {
      return `Array(${obj.length})`;
    }

    const entries = Object.entries(obj);
    if (entries.length === 0) return "Empty object";

    return (
      entries
        .slice(0, 3)
        .map(([key, val]) => {
          const valPreview =
            typeof val === "object" && val !== null
              ? Array.isArray(val)
                ? `[...]`
                : `{...}`
              : String(val).substring(0, 15);
          return `${key}: ${valPreview}`;
        })
        .join(", ") + (entries.length > 3 ? ", ..." : "")
    );
  };

  const renderNestedTable = (data: any, rowKey: string) => {
    if (data === null || data === undefined) {
      return <div className="p-2 text-zinc-500 dark:text-zinc-400">null</div>;
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return (
          <div className="p-2 text-zinc-500 dark:text-zinc-400">
            Empty array
          </div>
        );
      }

      const allObjects = data.every(
        (item) =>
          typeof item === "object" && item !== null && !Array.isArray(item)
      );

      if (allObjects) {
        const nestedColumns = Array.from(
          new Set(data.flatMap((item) => Object.keys(item)))
        );

        return (
          <table className="w-full mt-2 text-sm text-left border border-collapse text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700">
            <thead className="text-xs uppercase text-zinc-700 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300">
              <tr>
                {nestedColumns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-zinc-200 dark:border-zinc-700"
                >
                  {nestedColumns.map((col) => (
                    <td key={`${idx}-${col}`} className="px-3 py-2">
                      {item[col] !== undefined ? (
                        typeof item[col] === "object" && item[col] !== null ? (
                          <div>
                            <div>
                              <button
                                className="px-2 py-1 text-sm text-blue-700 bg-blue-100 rounded cursor-pointer dark:bg-blue-900/30 dark:text-blue-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(`${rowKey}-${idx}-${col}`);
                                }}
                              >
                                {expandedRows[`${rowKey}-${idx}-${col}`]
                                  ? "Hide"
                                  : "Expand"}
                              </button>
                              <span className="ml-2">
                                {formatObjectPreview(item[col])}
                              </span>
                            </div>
                            {expandedRows[`${rowKey}-${idx}-${col}`] && (
                              <div className="w-full mt-1 ml-4">
                                {renderNestedTable(
                                  item[col],
                                  `${rowKey}-${idx}-${col}`
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          String(item[col])
                        )
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">
                          -
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      } else {
        return (
          <table className="w-full mt-2 text-sm text-left border border-collapse text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700">
            <thead className="text-xs uppercase text-zinc-700 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300">
              <tr>
                <th className="px-3 py-2">Index</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-zinc-200 dark:border-zinc-700"
                >
                  <td className="px-3 py-2">{idx}</td>
                  <td className="px-3 py-2">
                    {typeof item === "object" && item !== null
                      ? formatObjectPreview(item)
                      : String(item)}
                  </td>
                  <td className="px-3 py-2">
                    {Array.isArray(item)
                      ? "array"
                      : item === null
                      ? "null"
                      : typeof item}
                  </td>
                  <td className="px-3 py-2">
                    {typeof item === "object" && item !== null && (
                      <button
                        className="px-2 py-1 text-sm text-blue-700 bg-blue-100 rounded cursor-pointer dark:bg-blue-900/30 dark:text-blue-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRowExpansion(`${rowKey}-array-${idx}`);
                        }}
                      >
                        {expandedRows[`${rowKey}-array-${idx}`]
                          ? "Hide"
                          : "Expand"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {data.map(
                (item, idx) =>
                  expandedRows[`${rowKey}-array-${idx}`] &&
                  typeof item === "object" &&
                  item !== null && (
                    <tr key={`${idx}-expanded`}>
                      <td
                        colSpan={4}
                        className="px-3 py-2 bg-zinc-50 dark:bg-zinc-700/20"
                      >
                        {renderNestedTable(item, `${rowKey}-array-${idx}`)}
                      </td>
                    </tr>
                  )
              )}
            </tbody>
          </table>
        );
      }
    } else if (typeof data === "object" && data !== null) {
      const entries = Object.entries(data);
      if (entries.length === 0) {
        return (
          <div className="p-2 text-zinc-500 dark:text-zinc-400">
            Empty object
          </div>
        );
      }

      return (
        <table className="w-full mt-2 text-sm text-left border border-collapse text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700">
          <thead className="text-xs uppercase text-zinc-700 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              <th className="px-3 py-2">Key</th>
              <th className="px-3 py-2">Value</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, value], idx) => (
              <tr
                key={idx}
                className="border-b border-zinc-200 dark:border-zinc-700"
              >
                <td className="px-3 py-2">{key}</td>
                <td className="px-3 py-2">
                  {typeof value === "object" && value !== null
                    ? formatObjectPreview(value)
                    : String(value)}
                </td>
                <td className="px-3 py-2">
                  {Array.isArray(value)
                    ? "array"
                    : value === null
                    ? "null"
                    : typeof value}
                </td>
                <td className="px-3 py-2">
                  {typeof value === "object" && value !== null && (
                    <button
                      className="px-2 py-1 text-sm text-blue-700 bg-blue-100 rounded cursor-pointer dark:bg-blue-900/30 dark:text-blue-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpansion(`${rowKey}-object-${key}`);
                      }}
                    >
                      {expandedRows[`${rowKey}-object-${key}`]
                        ? "Hide"
                        : "Expand"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {entries.map(
              ([key, value], idx) =>
                expandedRows[`${rowKey}-object-${key}`] &&
                typeof value === "object" &&
                value !== null && (
                  <tr key={`${key}-expanded`}>
                    <td
                      colSpan={4}
                      className="px-3 py-2 bg-zinc-50 dark:bg-zinc-700/20"
                    >
                      {renderNestedTable(value, `${rowKey}-object-${key}`)}
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      );
    }

    return (
      <div className="p-2 text-zinc-500 dark:text-zinc-400">{String(data)}</div>
    );
  };

  return (
    <div className="p-4 mt-6 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
      <h2 className="mb-4 text-xl font-bold text-zinc-800 dark:text-white">
        JSON Table View
      </h2>

      {error ? (
        <div className="p-4 mb-4 text-center text-red-600 bg-red-100 border border-red-200 rounded-md dark:text-red-400 dark:bg-red-900/20 dark:border-red-900">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          {tableData.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse text-zinc-500 dark:text-zinc-400">
              <thead className="text-xs uppercase text-zinc-700 bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-300">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-600"
                      onClick={() =>
                        column !== "actions" && requestSort(column)
                      }
                    >
                      {column}
                      {sortConfig?.key === column && (
                        <span className="ml-1">
                          {sortConfig.direction === "ascending" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, rowIndex) => {
                  const rowKey = isArray
                    ? `row-${rowIndex}`
                    : `row-${row.key || rowIndex}`;

                  return (
                    <React.Fragment key={rowKey}>
                      <tr className="border-b dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600">
                        {columns.map((column) => (
                          <td key={`${rowKey}-${column}`} className="px-6 py-3">
                            {column === "actions" ? (
                              typeof row.originalValue === "object" &&
                              row.originalValue !== null && (
                                <button
                                  className="px-2 py-1 text-sm text-blue-700 bg-blue-100 rounded cursor-pointer dark:bg-blue-900/30 dark:text-blue-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRowExpansion(rowKey);
                                  }}
                                >
                                  {expandedRows[rowKey] ? "Hide" : "Expand"}
                                </button>
                              )
                            ) : row[column] !== undefined ? (
                              <div className="max-w-xs overflow-hidden text-ellipsis">
                                {column === "value" &&
                                typeof row.originalValue === "object" &&
                                row.originalValue !== null ? (
                                  <span>
                                    {formatObjectPreview(row.originalValue)}
                                  </span>
                                ) : (
                                  <span>{row[column]}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-600">
                                -
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                      {expandedRows[rowKey] &&
                        typeof row.originalValue === "object" &&
                        row.originalValue !== null && (
                          <tr key={`${rowKey}-expanded`}>
                            <td
                              colSpan={columns.length}
                              className="px-6 py-3 bg-zinc-50 dark:bg-zinc-700/30"
                            >
                              {renderNestedTable(row.originalValue, rowKey)}
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-zinc-800 dark:text-zinc-400">
              No data available for table view
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-zinc-800 dark:text-zinc-400">
        <em>
          Click on column headers to sort the table. Use Expand buttons to view
          nested data.
        </em>
      </div>
    </div>
  );
}
