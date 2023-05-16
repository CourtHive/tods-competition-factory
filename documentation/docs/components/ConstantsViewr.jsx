import { factoryConstants } from 'tods-competition-factory';
import React from 'react';

export const ConstantsViewer = ({ grouping }) => {
  const constantGroupings = Object.keys(factoryConstants);
  const validGrouping = constantGroupings.includes(grouping);
  if (!validGrouping) return constantGroupings;

  const mapConstant = (constant, i) => <pre key={i}>{constant}</pre>;
  const targetConstants = factoryConstants[grouping];
  if (Array.isArray(targetConstants)) {
    return targetConstants.map(mapConstant);
  } else {
    return Object.keys(targetConstants).map(mapConstant);
  }
};

export default ConstantsViewer;
