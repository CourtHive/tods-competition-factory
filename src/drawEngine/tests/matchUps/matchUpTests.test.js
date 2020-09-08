import { getDrawDefinition, drawEngine } from '../../../drawEngine';
import { findMatchUp} from '../../getters/getMatchUps';
import { drawStructures } from '../../getters/structureGetter';
import { knockoutMatchUpsWithParticipants } from '../../tests/primitives/primitives';

import { structureMatchUps } from '../../getters/getMatchUps';
import { getAllStructureMatchUps, } from '../../getters/getMatchUps'; 

import {
  reset, initialize, mainDrawPositions
} from '../../tests/primitives/primitives';

import {
  MAIN, ROUND_ROBIN, KNOCKOUT
} from '../../../constants/drawDefinitionConstants';

it('can return matchUps from a KNOCKOUT structure', () => {
  reset();
  initialize();
  mainDrawPositions({drawSize: 16});
  const { structure } = drawEngine.generateDrawType({drawType: KNOCKOUT});
  const { matchUps } = getAllStructureMatchUps({structure});
  expect(matchUps.length).toEqual(15);
  const { upcomingMatchUps } = structureMatchUps({structure, requireParticipants: false});
  expect(upcomingMatchUps.length).toEqual(8);
});
 
it('matchUps returned with context cannot modify original', () => {
  reset();
  initialize();
  mainDrawPositions({drawSize: 16});
  drawEngine.generateDrawType({drawType: KNOCKOUT});
  let { drawDefinition } = getDrawDefinition();
  const { drawId } = drawDefinition;
  const { structures: [structure]} = drawStructures({drawDefinition, stage: MAIN});
  const { structureId } = structure;
  const { matchUps } = getAllStructureMatchUps({structure});

  // no matchUp should include a drawId
  matchUps.forEach(matchUp => expect(matchUp.drawId).toEqual(undefined))
 
  // add a test attribute to first matchUp
  let matchUp = matchUps[0];
  const { matchUpId } = matchUp;
  matchUp.testAttribute = 'testAttribute';
 
  // refetch the drawDefintion after the modification has been made
  ({ drawDefinition } = getDrawDefinition());
  let { matchUp: retrievedMatchUp } = findMatchUp({drawDefinition, matchUpId});
  expect(retrievedMatchUp.testAttribute).toEqual(matchUp.testAttribute);
  expect(retrievedMatchUp.drawId).toEqual(undefined);
  expect(retrievedMatchUp.structureId).toEqual(undefined);
 
  // retrieve matchUp with context and add an attribute
  const { matchUp: contextMatchUp } = findMatchUp({drawDefinition, matchUpId, inContext: true});
  contextMatchUp.newAttribute = 'newAttribute';
  
  // contextMatchUp should include drawId and structureId
  expect(contextMatchUp.drawId).toEqual(drawId);
  expect(contextMatchUp.structureId).toEqual(structureId);
 
  // refetch the drawDefintion after the modification has been made
  ({ drawDefinition } = getDrawDefinition());
  
  // retrieve matchUp from drawDefinition
  // newAttribute should not be present with no context added
  ({ matchUp: retrievedMatchUp } = findMatchUp({drawDefinition, matchUpId}));
  expect(retrievedMatchUp.newAttribute).toEqual(undefined);
  expect(retrievedMatchUp.drawId).toEqual(undefined);
  expect(retrievedMatchUp.structureId).toEqual(undefined);
});
 
it('can return matchUps from KNOCKOUT structure with participants', () => {
  knockoutMatchUpsWithParticipants({drawSize: 4});
  knockoutMatchUpsWithParticipants({drawSize: 8});
  knockoutMatchUpsWithParticipants({drawSize: 16});
  knockoutMatchUpsWithParticipants({drawSize: 32});
});

it('can return matchUps from a ROUND ROBIN structure', () => {
  reset();
  initialize();
  const drawType = ROUND_ROBIN;
  mainDrawPositions({drawSize: 16});
  let { structure } = drawEngine.generateDrawType({drawType});
  const { matchUps } = getAllStructureMatchUps({structure});
  expect(matchUps.length).toEqual(24);
  const { upcomingMatchUps } = structureMatchUps({structure, requireParticipants: false});
  expect(upcomingMatchUps.length).toEqual(24);
  const {
    upcomingMatchUps: filteredActiveMatchUps
  } = structureMatchUps({structure, requireParticipants: false, roundFilter: 1});
  expect(filteredActiveMatchUps.length).toEqual(8);

  const getDrawMatchUps = drawEngine.drawMatchUps({requireParticipants: false});
  expect(getDrawMatchUps.upcomingMatchUps.length).toEqual(24);
  expect(getDrawMatchUps.pendingMatchUps.length).toEqual(0);
  expect(getDrawMatchUps.completedMatchUps.length).toEqual(0);
});