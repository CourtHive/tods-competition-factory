import { setSubscriptions } from '../../../../global/state/globalState';
import { mocksEngine, tournamentEngine } from '../../../..';

import { DELETED_MATCHUP_IDS } from '../../../../constants/topicConstants';
import { TEAM } from '../../../../constants/eventConstants';
import {
  COLLEGE_D3,
  USTA_BREWER_CUP,
} from '../../../../constants/tieFormatConstants';

it('can remove a collectionDefinition from a tieFormat', () => {
  const deletedMatchUpIds = [];
  let result = setSubscriptions({
    subscriptions: {
      [DELETED_MATCHUP_IDS]: (notices) => {
        notices.forEach(({ matchUpIds }) =>
          deletedMatchUpIds.push(...matchUpIds)
        );
      },
    },
  });
  expect(result.success).toEqual(true);

  const {
    drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 2, eventType: TEAM, tieFormatName: COLLEGE_D3 }],
  });

  tournamentEngine.setState(tournamentRecord);

  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const originalMatchUpsCount = matchUps.length;

  const { drawDefaultTieFormat } = tournamentEngine.getTieFormat({ drawId });
  const { eventDefaultTieFormat } = tournamentEngine.getTieFormat({ eventId });

  expect(drawDefaultTieFormat).toBeUndefined();
  expect(eventDefaultTieFormat.winCriteria.valueGoal).toEqual(5);

  const collectionId =
    eventDefaultTieFormat.collectionDefinitions[0].collectionId;
  result = tournamentEngine.removeCollectionDefinition({
    collectionId,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(4);
  expect(result.tieFormat.tieFormatName).toBeUndefined();

  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const prunedMatchUpsCount = matchUps.length;

  expect(deletedMatchUpIds.length).toEqual(3);
  expect(prunedMatchUpsCount).toEqual(
    originalMatchUpsCount - deletedMatchUpIds.length
  );
});

// * will also remove collectionGroupNumber from all relevant collectionDefinitions
// ...valueGoal needs to be recalculated
it('removing collectionDefinition that is part of collectionGroup will remove collectionGroup', () => {
  const deletedMatchUpIds = [];
  let result = setSubscriptions({
    subscriptions: {
      [DELETED_MATCHUP_IDS]: (notices) => {
        notices.forEach(({ matchUpIds }) =>
          deletedMatchUpIds.push(...matchUpIds)
        );
      },
    },
  });
  expect(result.success).toEqual(true);

  const {
    drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 2, eventType: TEAM, tieFormatName: USTA_BREWER_CUP },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const originalMatchUpsCount = matchUps.length;

  const { drawDefaultTieFormat } = tournamentEngine.getTieFormat({ drawId });
  const { eventDefaultTieFormat } = tournamentEngine.getTieFormat({ eventId });
  expect(drawDefaultTieFormat).toBeUndefined();
  expect(eventDefaultTieFormat.winCriteria.valueGoal).toEqual(4);

  // select one of the collectionDefinitions that is part of the collectionGroup
  const collectionId = eventDefaultTieFormat.collectionDefinitions.find(
    ({ collectionGroupNumber }) => collectionGroupNumber === 1
  ).collectionId;

  expect(collectionId).not.toBeUndefined();

  result = tournamentEngine.removeCollectionDefinition({
    collectionId,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(5);
  expect(result.tieFormat.tieFormatName).toBeUndefined();

  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const prunedMatchUpsCount = matchUps.length;

  expect(deletedMatchUpIds.length).toEqual(1);
  expect(prunedMatchUpsCount).toEqual(
    originalMatchUpsCount - deletedMatchUpIds.length
  );
});
