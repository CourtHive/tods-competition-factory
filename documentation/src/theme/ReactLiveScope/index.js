/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Draw from '../../../docs/components/DrawDefinition';
import RenderCSV from '../../../docs/components/RenderCSV';
import RenderJSON from '../../../docs/components/RenderJSON';
import Tournament from '../../../docs/components/TournamentRecord';
import Participants from '../../../docs/components/Participants';
import MatchUps from '../../../docs/components/MatchUps';
import {
  utilities,
  drawEngine,
  mocksEngine,
  tournamentEngine,
  competitionEngine,
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
  tournamentEngine,
  competitionEngine,
  Participants,
  Tournament,
  RenderJSON,
  RenderCSV,
  MatchUps,
  Draw,
};

export default ReactLiveScope;
