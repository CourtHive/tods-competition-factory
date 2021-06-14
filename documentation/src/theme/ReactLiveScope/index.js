/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Draw from '../../../docs/components/DrawDefinition';
import RenderJSON from '../../../docs/components/RenderJSON';
import Tournament from '../../../docs/components/TournamentRecord';
import Participants from '../../../docs/components/Participants';
import {
  drawEngine,
  mocksEngine,
  tournamentEngine,
  competitionEngine,
} from 'tods-competition-factory';

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  drawEngine,
  mocksEngine,
  tournamentEngine,
  competitionEngine,
  Participants,
  Tournament,
  RenderJSON,
  Draw,
};

export default ReactLiveScope;
