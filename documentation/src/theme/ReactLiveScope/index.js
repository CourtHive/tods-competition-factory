import { tournamentEngine, mocksEngine, askEngine, tools } from 'tods-competition-factory';
import ConstantsViewer from '../../../docs/components/ConstantsViewr';
import Tournament from '../../../docs/components/TournamentRecord';
import Participants from '../../../docs/components/Participants';
import RenderJSON from '../../../docs/components/RenderJSON';
import RenderCSV from '../../../docs/components/RenderCSV';
import Draw from '../../../docs/components/DrawDefinition';
import MatchUps from '../../../docs/components/MatchUps';
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
  Participants,
  Tournament,
  RenderJSON,
  RenderCSV,
  MatchUps,
  Draw,
};

export default ReactLiveScope;
