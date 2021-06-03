import React from 'react';

const colors = {
  docusaurusGreen: '#24c2a0',
};

export const Highlight = ({ children, color }) => (
  <span
    style={{
      backgroundColor: colors[color] || color,
      borderRadius: '2px',
      color: '#fff',
      padding: '0.2rem',
    }}
  >
    {children}
  </span>
);

export default Highlight;
