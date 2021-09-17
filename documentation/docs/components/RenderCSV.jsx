import React from 'react';

export const RenderCSV = ({ data, rowJoiner, tableHeight = '300px' }) => {
  const rows = data.split(rowJoiner);
  return (
    <table style={{ height: tableHeight, overflow: 'auto' }}>
      <thead>
        <tr>
          {rows[0].split(',').map((column, c) => (
            <th
              style={{
                position: 'sticky',
                zIndex: 1,
                top: 0,
                background: '#eee',
              }}
              key={c}
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.slice(1).map((row, i) => (
          <tr key={i}>
            {row.split(',').map((column, c) => (
              <td nowrap="nowrap" key={`${i}-${c}`}>
                {column}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RenderCSV;
