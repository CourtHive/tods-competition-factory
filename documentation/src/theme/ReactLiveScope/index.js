import { tournamentEngine, mocksEngine, askEngine, tools } from 'tods-competition-factory';
import ConstantsViewer from '../../../docs/components/ConstantsViewr';
import JsonViewer from '../../../docs/components/JsonViewer';
import RenderCSV from '../../../docs/components/RenderCSV';
import React from 'react';

const cfv = tournamentEngine.version();
console.log(`%cfactory: ${cfv}`, 'color: lightblue');

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  tools,
  askEngine,
  mocksEngine,
  tournamentEngine,
  ConstantsViewer,
  JsonViewer,
  RenderCSV,
};

export default ReactLiveScope;
