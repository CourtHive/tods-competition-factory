import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { it, expect } from 'vitest';

import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import { DOUBLES_MATCHUP } from '../../../constants/matchUpTypes';
import { TEAM_EVENT } from '../../../constants/eventConstants';

it('collectionDefinitions support processCodes', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { eventType: TEAM_EVENT, drawSize: 4, drawType: ROUND_ROBIN },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const processCode = 'RANKING.IGNORE';
  const processCodes = [processCode];
  const collectionDefinition = {
    matchUpType: DOUBLES_MATCHUP,
    matchUpFormat: 'SET1-S:T10P',
    collectionName: 'Overtime',
    matchUpCount: 1,
    matchUpValue: 1,
    processCodes,
  };

  result = tournamentEngine.addCollectionDefinition({
    collectionDefinition,
    drawId,
  });

  expect(result.addedMatchUps.length).toEqual(6);
  expect(
    result.addedMatchUps.every(
      (matchUp) => matchUp.processCodes[0] === processCode
    )
  ).toEqual(true);
});
