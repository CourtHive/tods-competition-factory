import { reset, initialize, mainDrawPositions } from '../primitives/primitives';
import { constantToString } from '../../../utilities/strings';
import { drawEngine } from '../../sync';
import { expect, it } from 'vitest';

import { POLICY_ROUND_NAMING_DEFAULT } from '../../../fixtures/policies/POLICY_ROUND_NAMING_DEFAULT';
import {
  SINGLE_ELIMINATION,
  FEED_IN,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
  OLYMPIC,
} from '../../../constants/drawDefinitionConstants';

it('can return matchUps with roundNames from an SINGLE_ELIMINATION structure', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const {
    structures: [structure],
  } = drawEngine.generateDrawTypeAndModifyDrawDefinition({
    drawType: SINGLE_ELIMINATION,
  });
  expect(structure.structureName).toEqual(constantToString(MAIN));
  const result = drawEngine.attachPolicies({
    policyDefinitions: POLICY_ROUND_NAMING_DEFAULT,
  });
  expect(result.success).toEqual(true);

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
    const { abbreviatedRoundName, finishingRound, roundNumber, roundName } =
      matchUp;
    if (finishingRound === 1) expect(abbreviatedRoundName).toEqual('F');
    if (finishingRound === 2) expect(abbreviatedRoundName).toEqual('SF');
    if (finishingRound === 3) expect(abbreviatedRoundName).toEqual('QF');
    if (finishingRound === 4) expect(abbreviatedRoundName).toEqual('R16');
    if (finishingRound === 1) expect(roundName).toEqual('Final');
    if (finishingRound === 2) expect(roundName).toEqual('Semifinal');
    if (finishingRound === 3) expect(roundName).toEqual('Quarterfinal');
    if (finishingRound === 4) expect(roundName).toEqual('R16');

    if (roundNumber === 1) expect(roundName).toEqual('R16');
    if (roundNumber === 2) expect(roundName).toEqual('Quarterfinal');
    if (roundNumber === 3) expect(roundName).toEqual('Semifinal');
    if (roundNumber === 4) expect(roundName).toEqual('Final');
  });
});

it('can return matchUps with roundNames from a FIRST_MATCH_LOSER_CONSOLATION structure', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  let result = drawEngine.generateDrawTypeAndModifyDrawDefinition({
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
  });
  const {
    structures: [mainStructure, consolationStructure],
  } = result;
  expect(mainStructure.structureName).toEqual(constantToString(MAIN));
  result = drawEngine.attachPolicies({
    policyDefinitions: POLICY_ROUND_NAMING_DEFAULT,
  });
  expect(result.success).toEqual(true);

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
    if (finishingRound === 1) expect(roundName).toEqual('Final');
    if (finishingRound === 2) expect(roundName).toEqual('Semifinal');
    if (finishingRound === 3) expect(roundName).toEqual('Quarterfinal');
    if (finishingRound === 4) expect(roundName).toEqual('R16');

    if (roundNumber === 1) expect(roundName).toEqual('R16');
    if (roundNumber === 2) expect(roundName).toEqual('Quarterfinal');
    if (roundNumber === 3) expect(roundName).toEqual('Semifinal');
    if (roundNumber === 4) expect(roundName).toEqual('Final');
  });

  ({ structureId } = consolationStructure);
  ({ matchUps } = drawEngine.allStructureMatchUps({ structureId }));

  matchUps.forEach((matchUp) => {
    const { abbreviatedRoundName, finishingRound, roundNumber, roundName } =
      matchUp;
    if (finishingRound === 1) expect(abbreviatedRoundName).toEqual('C-F');
    if (finishingRound === 2) expect(abbreviatedRoundName).toEqual('C-SF');
    if (finishingRound === 3) expect(abbreviatedRoundName).toEqual('C-QF');

    if (roundNumber === 1) expect(abbreviatedRoundName).toEqual('C-QF-Q');
    if (roundNumber === 2) expect(abbreviatedRoundName).toEqual('C-QF');
    if (roundNumber === 3) expect(abbreviatedRoundName).toEqual('C-SF');
    if (roundNumber === 4) expect(abbreviatedRoundName).toEqual('C-F');
    if (roundNumber === 4) expect(roundName).toEqual('C-Final');
  });
});

it('can return matchUps with roundNames from a FEED_IN structure and identify feedRounds', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 12 });
  const {
    structures: [structure],
  } = drawEngine.generateDrawTypeAndModifyDrawDefinition({ drawType: FEED_IN });
  expect(structure.structureName).toEqual(constantToString(MAIN));
  const result = drawEngine.attachPolicies({
    policyDefinitions: POLICY_ROUND_NAMING_DEFAULT,
  });
  expect(result.success).toEqual(true);

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
    const {
      abbreviatedRoundName,
      feedRound,
      finishingRound,
      roundNumber,
      roundName,
    } = matchUp;
    if (roundNumber === 1) expect(abbreviatedRoundName).toEqual('QF-Q');
    if (roundNumber === 2) {
      expect(abbreviatedRoundName).toEqual('QF');
      expect(feedRound).toEqual(true);
    }
    if (roundNumber === 3) expect(abbreviatedRoundName).toEqual('SF');
    if (roundNumber === 4) expect(abbreviatedRoundName).toEqual('F');
    if (roundNumber === 4) expect(roundName).toEqual('Final');

    if (finishingRound === 1) expect(abbreviatedRoundName).toEqual('F');
    if (finishingRound === 2) expect(abbreviatedRoundName).toEqual('SF');
    if (finishingRound === 3) expect(abbreviatedRoundName).toEqual('QF');
    if (finishingRound === 4) expect(abbreviatedRoundName).toEqual('QF-Q');
  });
});

it('can return matchUps with roundNames from a OLYMPIC structure', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  let result = drawEngine.generateDrawTypeAndModifyDrawDefinition({
    drawType: OLYMPIC,
  });
  expect(result.success).toEqual(true);
  expect(result.structures.length).toEqual(4);

  const { drawDefinition } = drawEngine.getState();
  const { structures } = drawDefinition;
  expect(structures.length).toEqual(4);

  result = drawEngine.attachPolicies({
    policyDefinitions: POLICY_ROUND_NAMING_DEFAULT,
  });
  expect(result.success).toEqual(true);

  const { matchUps } = drawEngine.allDrawMatchUps({
    requireParticipants: false,
  });
  matchUps.forEach((matchUp) => {
    const {
      abbreviatedRoundName,
      finishingRound,
      roundNumber,
      roundName,
      structureName,
    } = matchUp;
    if (roundNumber === 1 && structureName === 'EAST') {
      expect(roundName).toEqual('E-R16');
      expect(finishingRound).toEqual(4);
    }
    if (roundNumber === 2 && structureName === 'EAST')
      expect(abbreviatedRoundName).toEqual('E-QF');
    if (roundNumber === 3 && structureName === 'EAST')
      expect(abbreviatedRoundName).toEqual('E-SF');
    if (roundNumber === 4 && structureName === 'EAST') {
      expect(abbreviatedRoundName).toEqual('E-F');
      expect(finishingRound).toEqual(1);
    }

    if (roundNumber === 1 && structureName === 'WEST')
      expect(abbreviatedRoundName).toEqual('W-QF');
    if (roundNumber === 2 && structureName === 'WEST')
      expect(abbreviatedRoundName).toEqual('W-SF');
    if (roundNumber === 3 && structureName === 'WEST')
      expect(abbreviatedRoundName).toEqual('W-F');

    if (roundNumber === 1 && structureName === 'NORTH')
      expect(abbreviatedRoundName).toEqual('N-SF');
    if (roundNumber === 2 && structureName === 'NORTH')
      expect(abbreviatedRoundName).toEqual('N-F');

    if (roundNumber === 1 && structureName === 'SOUTH')
      expect(abbreviatedRoundName).toEqual('S-SF');
    if (roundNumber === 2 && structureName === 'SOUTH')
      expect(abbreviatedRoundName).toEqual('S-F');
  });
});
