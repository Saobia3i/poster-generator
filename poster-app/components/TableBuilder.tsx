'use client';

import React from 'react';
import { Plus, Trash2, Columns } from 'lucide-react';

interface TableBuilderProps {
  headers: string[];
  rows: string[][];
  onHeadersChange: (headers: string[]) => void;
  onRowsChange: (rows: string[][]) => void;
}

export default function TableBuilder({
  headers,
  rows,
  onHeadersChange,
  onRowsChange,
}: TableBuilderProps) {
  const colCount = headers.length;

  const updateHeader = (i: number, value: string) => {
    const next = [...headers];
    next[i] = value;
    onHeadersChange(next);
  };

  const addColumn = () => {
    if (colCount >= 5) return;
    onHeadersChange([...headers, `Column ${colCount + 1}`]);
    onRowsChange(rows.map((row) => [...row, '']));
  };

  const removeColumn = (ci: number) => {
    if (colCount <= 1) return;
    onHeadersChange(headers.filter((_, i) => i !== ci));
    onRowsChange(rows.map((row) => row.filter((_, i) => i !== ci)));
  };

  const addRow = () => {
    onRowsChange([...rows, Array(colCount).fill('')]);
  };

  const removeRow = (ri: number) => {
    onRowsChange(rows.filter((_, i) => i !== ri));
  };

  const updateCell = (ri: number, ci: number, value: string) => {
    const next = rows.map((row) => [...row]);
    next[ri][ci] = value;
    onRowsChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Columns size={15} className="text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Table Builder
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            id="btn-add-col"
            onClick={addColumn}
            disabled={colCount >= 5}
            className="text-xs font-semibold px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 disabled:opacity-30 transition cursor-pointer"
          >
            + Column
          </button>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 self-center">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table editor */}
      <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900">
        <table className="w-full border-collapse text-xs">
          {/* Header row */}
          <thead>
            <tr className="bg-purple-100 dark:bg-purple-900/40 border-b border-slate-300 dark:border-slate-700/80">
              {headers.map((header, ci) => (
                <th key={ci} className="p-0 border-r border-slate-300 dark:border-slate-700/80 last:border-r-0">
                  <div className="flex items-center">
                    <input
                      id={`table-header-${ci}`}
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(ci, e.target.value)}
                      placeholder={`Column ${ci + 1}`}
                      className="flex-1 bg-transparent px-3 py-2 text-purple-900 dark:text-purple-200 font-bold placeholder-purple-400 dark:placeholder-purple-400/50 focus:outline-none text-xs"
                    />
                    {colCount > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(ci)}
                        className="px-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-t border-slate-200 dark:border-slate-800 group hover:bg-purple-50/50 dark:hover:bg-slate-800">
                {row.map((cell, ci) => (
                  <td key={ci} className="border-r border-slate-200 dark:border-slate-800 last:border-r-0 p-0">
                    <input
                      id={`table-cell-${ri}-${ci}`}
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      placeholder="—"
                      className="w-full bg-transparent px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-xs focus:bg-purple-500/5"
                    />
                  </td>
                ))}
                {/* Row remove button */}
                <td className="w-8 border-l border-slate-200 dark:border-slate-800 p-0">
                  <button
                    type="button"
                    onClick={() => removeRow(ri)}
                    disabled={rows.length <= 1}
                    aria-label={`Delete row ${ri + 1}`}
                    className="w-full h-full flex items-center justify-center text-slate-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-0 transition p-2 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        id="btn-add-row"
        onClick={addRow}
        disabled={rows.length >= 10}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-purple-300 dark:border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Plus size={14} />
        Add row {rows.length >= 10 && '(max 10)'}
      </button>

      {rows.length >= 5 && (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
          ⚠ Dense table — logos will auto-scale to 70% to make room.
        </p>
      )}
    </div>
  );
}
