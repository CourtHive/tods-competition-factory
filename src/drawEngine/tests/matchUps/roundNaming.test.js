import { drawEngine } from '../../../drawEngine';

import {
  reset,
  initialize,
  mainDrawPositions,
} from '../../tests/primitives/primitives';

import { ROUND_NAMING_DEFAULT } from '../../../fixtures/roundNaming/ROUND_NAMING_DEFAULT';
import {
  ELIMINATION,
  FEED_IN,
  MAIN,
  OLYMPIC,
} from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

it('can return matchUps from a KNOCKOUT structure', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const { structure } = drawEngine.generateDrawType({ drawType: ELIMINATION });
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
});

it('can return matchUps from a FEED_IN structure and identify feedRounds', () => {
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

  matchUps.forEach(matchUp => {
    const { feedRound, finishingRound, roundNumber, roundName } = matchUp;
    if (roundNumber === 1) expect(roundName).toEqual('Q4');
    if (roundNumber === 2) {
      expect(roundName).toEqual('QF');
      expect(feedRound).toEqual(true);
    }
    if (roundNumber === 3) expect(roundName).toEqual('SF');
    if (roundNumber === 4) expect(roundName).toEqual('F');

    if (finishingRound === 1) expect(roundName).toEqual('F');
    if (finishingRound === 2) expect(roundName).toEqual('SF');
    if (finishingRound === 3) expect(roundName).toEqual('QF');
    if (finishingRound === 4) expect(roundName).toEqual('Q4');
  });
});

it('can return matchUps from a OLYMPIC structure', () => {
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
  const namingResult = matchUps.map(matchUp => ({
    roundNumber: matchUp.roundNumber,
    roundName: matchUp.roundName,
  }));
  console.log({ namingResult });
});
