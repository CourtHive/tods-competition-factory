import ConstantsViewer from '../../../docs/components/ConstantsViewr';
import Tournament from '../../../docs/components/TournamentRecord';
import Participants from '../../../docs/components/Participants';
import Configurator from '../../../docs/components/Configurator';
import RenderJSON from '../../../docs/components/RenderJSON';
import RenderCSV from '../../../docs/components/RenderCSV';
import Draw from '../../../docs/components/DrawDefinition';
import MatchUps from '../../../docs/components/MatchUps';
import React from 'react';
import {
  competitionEngine,
  tournamentEngine,
  scoreGovernor,
  mocksEngine,
  drawEngine,
  utilities,
} from 'tods-competition-factory';

const cfv = tournamentEngine.version();
console.log(`%cfactory: ${cfv}`, 'color: lightblue');

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  utilities,
  drawEngine,
  mocksEngine,
  competitionEngine,
  tournamentEngine,
  scoreGovernor,
  ConstantsViewer,
  Configurator,
  Participants,
  Tournament,
  RenderJSON,
  RenderCSV,
  MatchUps,
  Draw,
};

export default ReactLiveScope;
