import { mocksEngine, tournamentEngine } from '../../../..';
import { expect, it } from 'vitest';

import { COLLEGE_D3 } from '../../../../constants/tieFormatConstants';
import { SINGLES_MATCHUP } from '../../../../constants/matchUpTypes';
import { TEAM } from '../../../../constants/eventConstants';
import { INVALID_VALUES } from '../../../../constants/errorConditionConstants';

const PRO_SET = 'SET1-S:8/TB7@7';

it('can add collectionDefinitions to tieFormat in a drawDefinition', () => {
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 2, eventType: TEAM, tieFormatName: COLLEGE_D3 }],
  });

  tournamentEngine.setState(tournamentRecord);

  const {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
      roundNumbers: [1],
    },
  });

  expect(matchUp.tieMatchUps.length).toEqual(9);

  const collectionDefinition: any = {
    matchUpType: SINGLES_MATCHUP,
    collectionName: 'Exhibition',
    matchUpFormat: PRO_SET,
    matchUpCount: 3,
  };

  let result = tournamentEngine.addCollectionDefinition({
    uuids: ['a01', 'a02', 'a03'],
    collectionDefinition,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  collectionDefinition.collectionValue = 1;
  collectionDefinition.matchUpValue = 1;
  result = tournamentEngine.addCollectionDefinition({
    uuids: ['a01', 'a02', 'a03'],
    collectionDefinition,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  collectionDefinition.collectionValue = undefined;
  collectionDefinition.matchUpValue = 0;
  result = tournamentEngine.addCollectionDefinition({
    uuids: ['a01', 'a02', 'a03'],
    checkValueDefinition: false,
    collectionDefinition,
    drawId,
  });
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(7);
  expect(result.addedMatchUps.length).toEqual(3);
});
