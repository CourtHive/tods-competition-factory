import { drawEngine } from '../../../drawEngine';

import {
  reset,
  initialize,
  mainDrawPositions,
} from '../../tests/primitives/primitives';

import {
  SINGLE_ELIMINATION,
  FEED_IN,
  FMLC,
  MAIN,
  OLYMPIC,
} from '../../../constants/drawDefinitionConstants';

import { ROUND_NAMING_DEFAULT } from '../../../fixtures/roundNaming/ROUND_NAMING_DEFAULT';
import { SUCCESS } from '../../../constants/resultConstants';

it('can return matchUps with roundNames from an SINGLE_ELIMINATION structure', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const { structure } = drawEngine.generateDrawType({ drawType: SINGLE_ELIMINATION });
  expect(structure.structureName).toEqual(MAIN);
  const result = drawEngine.attachPolicy({
    policyDefinition: ROUND_NAMING_DEFAULT,
  });
  expect(result).toEqual(SUCCESS);

  const { structureId } = structure;
  const { matchUps } = drawEngine.allStructureMatchUps({ structureId });
  expect(matchUps.length).toEqual(15);

  let { upcomingMatchUps } = drawEngine.getStructureMatchUps({
    structureId,
    requireParticipants: false,
  });
  expect(upcomingMatchUps.length).toEqual(8);

  // requireParticipants defaults to true and no matches can be considered upcoming if no participants assigned
  ({ upcomingMatchUps } = drawEngine.getStructureMatchUps({
    structureId,
  }));
  expect(upcomingMatchUps.length).toEqual(0);

  matchUps.forEach((matchUp) => {
    const { finishingRound, roundNumber, roundName } = matchUp;
    if (finishingRound === 1) expect(roundName).toEqual('F');
    if (finishingRound === 2) expect(roundName).toEqual('SF');
    if (finishingRound === 3) expect(roundName).toEqual('QF');
    if (finishingRound === 4) expect(roundName).toEqual('R16');

    if (roundNumber === 1) expect(roundName).toEqual('R16');
    if (roundNumber === 2) expect(roundName).toEqual('QF');
    if (roundNumber === 3) expect(roundName).toEqual('SF');
    if (roundNumber === 4) expect(roundName).toEqual('F');
  });
});

it('can return matchUps with roundNames from a FMLC structure', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  let result = drawEngine.generateDrawType({ drawType: FMLC });
  const { mainStructure, consolationStructure } = result;
  expect(mainStructure.structureName).toEqual(MAIN);
  result = drawEngine.attachPolicy({
    policyDefinition: ROUND_NAMING_DEFAULT,
  });
  expect(result).toEqual(SUCCESS);

  let { structureId } = mainStructure;
  let { matchUps } = drawEngine.allStructureMatchUps({ structureId });
  expect(matchUps.length).toEqual(15);

  let { upcomingMatchUps } = drawEngine.getStructureMatchUps({
    structureId,
    requireParticipants: false,
  });
  expect(upcomingMatchUps.length).toEqual(8);

  // requireParticipants defaults to true and no matches can be considered upcoming if no participants assigned
  ({ upcomingMatchUps } = drawEngine.getStructureMatchUps({
    structureId,
  }));
  expect(upcomingMatchUps.length).toEqual(0);

  matchUps.forEach((matchUp) => {
    const { finishingRound, roundNumber, roundName } = matchUp;
    if (finishingRound === 1) expect(roundName).toEqual('F');
    if (finishingRound === 2) expect(roundName).toEqual('SF');
    if (finishingRound === 3) expect(roundName).toEqual('QF');
    if (finishingRound === 4) expect(roundName).toEqual('R16');

    if (roundNumber === 1) expect(roundName).toEqual('R16');
    if (roundNumber === 2) expect(roundName).toEqual('QF');
    if (roundNumber === 3) expect(roundName).toEqual('SF');
    if (roundNumber === 4) expect(roundName).toEqual('F');
  });

  ({ structureId } = consolationStructure);
  ({ matchUps } = drawEngine.allStructureMatchUps({ structureId }));

  matchUps.forEach((matchUp) => {
    const { finishingRound, roundNumber, roundName } = matchUp;
    if (finishingRound === 1) expect(roundName).toEqual('C-F');
    if (finishingRound === 2) expect(roundName).toEqual('C-SF');
    if (finishingRound === 3) expect(roundName).toEqual('C-QF');

    if (roundNumber === 1) expect(roundName).toEqual('C-QF');
    if (roundNumber === 2) expect(roundName).toEqual('C-SF');
    if (roundNumber === 3) expect(roundName).toEqual('C-F');
  });
});

it('can return matchUps with roundNames from a FEED_IN structure and identify feedRounds', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 12 });
  const { structure } = drawEngine.generateDrawType({ drawType: FEED_IN });
  expect(structure.structureName).toEqual(MAIN);
  const result = drawEngine.attachPolicy({
    policyDefinition: ROUND_NAMING_DEFAULT,
  });
  expect(result).toEqual(SUCCESS);

  const { structureId } = structure;
  const { matchUps } = drawEngine.allStructureMatchUps({ structureId });
  expect(matchUps.length).toEqual(11);

  const { upcomingMatchUps } = drawEngine.getStructureMatchUps({
    structureId,
    requireParticipants: false,
  });
  expect(upcomingMatchUps.length).toEqual(4);

  const { roundProfile } = drawEngine.getRoundMatchUps({ matchUps });
  expect(roundProfile[2].feedRound).toEqual(true);

  matchUps.forEach((matchUp) => {
    const { feedRound, finishingRound, roundNumber, roundName } = matchUp;
    if (roundNumber === 1) expect(roundName).toEqual('QF-Q');
    if (roundNumber === 2) {
      expect(roundName).toEqual('QF');
      expect(feedRound).toEqual(true);
    }
    if (roundNumber === 3) expect(roundName).toEqual('SF');
    if (roundNumber === 4) expect(roundName).toEqual('F');

    if (finishingRound === 1) expect(roundName).toEqual('F');
    if (finishingRound === 2) expect(roundName).toEqual('SF');
    if (finishingRound === 3) expect(roundName).toEqual('QF');
    if (finishingRound === 4) expect(roundName).toEqual('QF-Q');
  });
});

it('can return matchUps with roundNames from a OLYMPIC structure', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  let result = drawEngine.generateDrawType({
    drawType: OLYMPIC,
  });
  expect(result.success).toEqual(true);

  const { childStructures } = result;
  expect(childStructures.length).toEqual(2);

  const { drawDefinition } = drawEngine.getState();
  const { structures } = drawDefinition;
  expect(structures.length).toEqual(4);

  result = drawEngine.attachPolicy({
    policyDefinition: ROUND_NAMING_DEFAULT,
  });
  expect(result).toEqual(SUCCESS);

  const { matchUps } = drawEngine.allDrawMatchUps({
    requireParticipants: false,
  });
  matchUps.forEach((matchUp) => {
    const { finishingRound, roundNumber, roundName, structureName } = matchUp;
    if (roundNumber === 1 && structureName === 'EAST') {
      expect(roundName).toEqual('E-R16');
      expect(finishingRound).toEqual(4);
    }
    if (roundNumber === 2 && structureName === 'EAST')
      expect(roundName).toEqual('E-QF');
    if (roundNumber === 3 && structureName === 'EAST')
      expect(roundName).toEqual('E-SF');
    if (roundNumber === 4 && structureName === 'EAST') {
      expect(roundName).toEqual('E-F');
      expect(finishingRound).toEqual(1);
    }

    if (roundNumber === 1 && structureName === 'WEST')
      expect(roundName).toEqual('W-QF');
    if (roundNumber === 2 && structureName === 'WEST')
      expect(roundName).toEqual('W-SF');
    if (roundNumber === 3 && structureName === 'WEST')
      expect(roundName).toEqual('W-F');

    if (roundNumber === 1 && structureName === 'NORTH')
      expect(roundName).toEqual('N-SF');
    if (roundNumber === 2 && structureName === 'NORTH')
      expect(roundName).toEqual('N-F');

    if (roundNumber === 1 && structureName === 'SOUTH')
      expect(roundName).toEqual('S-SF');
    if (roundNumber === 2 && structureName === 'SOUTH')
      expect(roundName).toEqual('S-F');
  });
});
