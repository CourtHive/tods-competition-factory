import { setSubscriptions } from '../../../../global/state/globalState';
import { mocksEngine, tournamentEngine } from '../../../..';

import { TEAM } from '../../../../constants/eventConstants';
import { DELETED_MATCHUP_IDS } from '../../../../constants/topicConstants';

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
    drawProfiles: [
      { drawSize: 2, eventType: TEAM, tieFormatName: 'COLLEGE_D3' },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const originalMatchUpsCount = matchUps.length;

  let { drawDefaultTieFormat } = tournamentEngine.getTieFormat({ drawId });
  let { eventDefaultTieFormat } = tournamentEngine.getTieFormat({ eventId });
  expect(eventDefaultTieFormat.winCriteria.valueGoal).toEqual(5);

  const collectionId =
    drawDefaultTieFormat.collectionDefinitions[0].collectionId;
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
