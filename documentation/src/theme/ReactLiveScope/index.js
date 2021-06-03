/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import RenderJSON from '../../../docs/components/RenderJSON';
import Draw from '../../../docs/components/DrawDefinition';
import Tournament from '../../../docs/components/TournamentRecord';
import {
  drawEngine,
  mocksEngine,
  tournamentEngine,
} from 'tods-competition-factory';

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  RenderJSON,
  mocksEngine,
  drawEngine,
  tournamentEngine,
  Tournament,
  Draw,
};

export default ReactLiveScope;
