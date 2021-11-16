import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import tieFormatDefaults from '../../../tournamentEngine/generators/tieFormatDefaults';
import { getStructureMatchUps } from '../../getters/getMatchUps/getStructureMatchUps';
import { setMatchUpFormat } from '../../governors/matchUpGovernor/matchUpFormat';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { getMatchUpType } from '../../accessors/matchUpAccessor';
import { getDrawStructures } from '../../getters/findStructure';
import { drawEngine } from '../../sync';

import {
  reset,
  initialize,
  mainDrawPositions,
} from '../../tests/primitives/primitives';

import {
  MAIN,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';
import {
  INVALID_TIE_FORMAT,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_FORMAT,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

it('can return matchUps from an SINGLE_ELIMINATION structure', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const {
    structures: [structure],
  } = drawEngine.generateDrawType({
    drawType: SINGLE_ELIMINATION,
  });
  const { matchUps } = getAllStructureMatchUps({ structure, inContext: true });
  expect(matchUps.length).toEqual(15);
  const { upcomingMatchUps } = getStructureMatchUps({
    requireParticipants: false,
    structure,
  });
  expect(upcomingMatchUps.length).toEqual(8);

  let { matchUpType } = getMatchUpType({
    matchUp: matchUps[0],
  });
  expect(matchUpType).toEqual(undefined);
});

it('matchUps returned with context cannot modify original', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  drawEngine.generateDrawType({ drawType: SINGLE_ELIMINATION });
  let { drawDefinition } = drawEngine.getState();
  const { drawId } = drawDefinition;
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage: MAIN });
  const { structureId } = structure;
  const { matchUps } = getAllStructureMatchUps({ structure });

  // no matchUp should include a drawId
  matchUps.forEach((matchUp) => expect(matchUp.drawId).toEqual(undefined));

  const matchUp = matchUps[0];
  const { matchUpId } = matchUp;

  // refetch the drawDefintion after the modification has been made
  ({ drawDefinition } = drawEngine.getState());
  let { matchUp: retrievedMatchUp } = findMatchUp({
    drawDefinition,
    matchUpId,
  });
  expect(retrievedMatchUp.drawId).toEqual(undefined);
  expect(retrievedMatchUp.structureId).toEqual(undefined);

  // retrieve matchUp with context and add an attribute
  const { matchUp: contextMatchUp } = findMatchUp({
    drawDefinition,
    matchUpId,
    inContext: true,
  });
  contextMatchUp.newAttribute = 'newAttribute';

  // contextMatchUp should include drawId and structureId
  expect(contextMatchUp.drawId).toEqual(drawId);
  expect(contextMatchUp.structureId).toEqual(structureId);

  // refetch the drawDefintion after the modification has been made
  ({ drawDefinition } = drawEngine.getState());

  // retrieve matchUp from drawDefinition
  // newAttribute should not be present with no context added
  ({ matchUp: retrievedMatchUp } = findMatchUp({
    drawDefinition,
    matchUpId,
  }));
  expect(retrievedMatchUp.newAttribute).toEqual(undefined);
  expect(retrievedMatchUp.drawId).toEqual(undefined);
  expect(retrievedMatchUp.structureId).toEqual(undefined);
});

it('can return matchUps from a ROUND_ROBIN structure', () => {
  reset();
  initialize();
  const drawType = ROUND_ROBIN;
  mainDrawPositions({ drawSize: 16 });
  const {
    structures: [structure],
  } = drawEngine.generateDrawType({ drawType });
  const { matchUps } = getAllStructureMatchUps({ structure });
  expect(matchUps.length).toEqual(24);
  const { upcomingMatchUps } = getStructureMatchUps({
    structure,
    requireParticipants: false,
  });
  expect(upcomingMatchUps.length).toEqual(24);
  const { upcomingMatchUps: filteredActiveMatchUps } = getStructureMatchUps({
    structure,
    requireParticipants: false,
    roundFilter: 1,
  });
  expect(filteredActiveMatchUps.length).toEqual(8);

  const allDrawMatchUps = drawEngine.drawMatchUps({
    requireParticipants: false,
  });
  expect(allDrawMatchUps.upcomingMatchUps.length).toEqual(24);
  expect(allDrawMatchUps.pendingMatchUps.length).toEqual(0);
  expect(allDrawMatchUps.completedMatchUps.length).toEqual(0);
});

it('can set matchUpFormat', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const {
    structures: [structure],
  } = drawEngine.generateDrawType({
    drawType: SINGLE_ELIMINATION,
  });
  const { matchUps } = getAllStructureMatchUps({ structure });
  expect(matchUps.length).toEqual(15);
  const { upcomingMatchUps } = getStructureMatchUps({
    structure,
    requireParticipants: false,
  });

  const matchUpFormat = 'SET1-S:T10';
  const matchUp = upcomingMatchUps[0];
  expect(matchUp.matchUpFormat).toEqual(undefined);

  const { matchUpId } = matchUp;
  const { drawDefinition } = drawEngine.getState();
  let result = setMatchUpFormat({ drawDefinition, matchUpId, matchUpFormat });
  expect(result.success).toEqual(true);

  const { matchUp: modifiedMatchUp } = findMatchUp({
    drawDefinition,
    matchUpId,
  });
  expect(modifiedMatchUp.matchUpFormat).toEqual(matchUpFormat);

  result = setMatchUpFormat({ drawDefinition, matchUpId });
  expect(result.error).toEqual(MISSING_MATCHUP_FORMAT);

  result = setMatchUpFormat({ matchUpId: 'bogus matchUpId', matchUpFormat });
  expect(result.error).toEqual(MISSING_DRAW_DEFINITION);
  result = setMatchUpFormat({
    matchUpId: 'bogus matchUpId',
    drawDefinition,
    matchUpFormat,
  });
  expect(result.error).toEqual(MATCHUP_NOT_FOUND);
  result = setMatchUpFormat({
    structureId: 'bogus structureId',
    drawDefinition,
    matchUpFormat,
  });
  expect(result.error).toEqual(STRUCTURE_NOT_FOUND);
  result = setMatchUpFormat({
    structureId: structure.structureId,
    drawDefinition,
    matchUpFormat,
  });
  expect(result.success).toEqual(true);

  result = setMatchUpFormat({
    structureId: structure.structureId,
    drawDefinition,
    tieFormat: {},
  });
  expect(result.error).toEqual(INVALID_TIE_FORMAT);

  result = setMatchUpFormat({
    drawDefinition,
    tieFormat: {},
    matchUpId,
  });
  expect(result.error).toEqual(INVALID_TIE_FORMAT);

  result = setMatchUpFormat({
    tieFormat: tieFormatDefaults(),
    drawDefinition,
  });
  expect(result.success).toEqual(true);

  result = setMatchUpFormat({
    structureId: structure.structureId,
    tieFormat: tieFormatDefaults(),
    drawDefinition,
  });
  expect(result.success).toEqual(true);
});
