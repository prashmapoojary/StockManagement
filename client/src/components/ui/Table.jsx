import React from 'react';
import { twMerge } from 'tailwind-merge';

const Table = ({ headers, data, renderRow, className }) => {
  return (
    <div className="w-full overflow-auto rounded-[0.25rem] border border-border bg-card shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-muted/50 text-foreground font-sans uppercase text-xs border-b border-border">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 font-bold border-r border-border last:border-r-0">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border font-serif">
          {data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-muted-foreground italic">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
