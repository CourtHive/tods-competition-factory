import React from 'react';
import { factoryConstants } from 'tods-competition-factory';

export const ConstantsViewer = ({ grouping }) => {
  const constantGroupings = Object.keys(factoryConstants);
  const validGrouping = constantGroupings.includes(grouping);

  return (
    validGrouping ? Object.keys(factoryConstants[grouping]) : constantGroupings
  ).map((constant, i) => <pre key={i}>{constant}</pre>);
};

export default ConstantsViewer;
