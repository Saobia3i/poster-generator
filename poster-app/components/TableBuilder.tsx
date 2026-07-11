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
          <Columns size={13} className="text-purple-400" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">
            Table Builder
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            id="btn-add-col"
            onClick={addColumn}
            disabled={colCount >= 5}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-purple-500/50 disabled:opacity-30 transition"
          >
            + Column
          </button>
          <span className="text-[10px] text-white/25 self-center">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table editor */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full border-collapse text-xs">
          {/* Header row */}
          <thead>
            <tr className="bg-purple-900/30">
              {headers.map((header, ci) => (
                <th key={ci} className="p-0 border-r border-white/10 last:border-r-0">
                  <div className="flex items-center">
                    <input
                      id={`table-header-${ci}`}
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(ci, e.target.value)}
                      placeholder={`Column ${ci + 1}`}
                      className="flex-1 bg-transparent px-3 py-2 text-purple-200 font-semibold placeholder-purple-400/30 focus:outline-none text-xs"
                    />
                    {colCount > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(ci)}
                        className="px-1.5 text-white/20 hover:text-red-400 transition"
                      >
                        <Trash2 size={11} />
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
              <tr key={ri} className="border-t border-white/10 group">
                {row.map((cell, ci) => (
                  <td key={ci} className="border-r border-white/10 last:border-r-0 p-0">
                    <input
                      id={`table-cell-${ri}-${ci}`}
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      placeholder="—"
                      className="w-full bg-transparent px-3 py-2 text-white/70 placeholder-white/15 focus:outline-none text-xs focus:bg-purple-500/5"
                    />
                  </td>
                ))}
                {/* Row remove button */}
                <td className="w-8 border-l border-white/10 p-0">
                  <button
                    type="button"
                    onClick={() => removeRow(ri)}
                    disabled={rows.length <= 1}
                    className="w-full h-full flex items-center justify-center text-white/0 group-hover:text-white/30 hover:!text-red-400 disabled:opacity-0 transition p-2"
                  >
                    <Trash2 size={11} />
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
        className="flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 text-xs transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus size={12} />
        Add row {rows.length >= 10 && '(max 10)'}
      </button>

      {rows.length >= 5 && (
        <p className="text-[10px] text-yellow-400/60">
          ⚠ Dense table — logos will auto-scale to 70% to make room.
        </p>
      )}
    </div>
  );
}
