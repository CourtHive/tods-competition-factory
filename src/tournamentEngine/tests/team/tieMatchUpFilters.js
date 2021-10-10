import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';

it('can retrieve tieMatchUps by matchUpId using matchUpFilters', () => {
  const { tournamentRecord } = generateTeamTournament();
  tournamentEngine.setState(tournamentRecord);

  const {
    matchUps: [singlesMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });

  let { matchUpId, matchUpType } = singlesMatchUp;

  let {
    matchUps: [targetMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [matchUpId] },
  });
  expect(targetMatchUp.matchUpId).toEqual(matchUpId);
  expect(targetMatchUp.matchUpType).toEqual(matchUpType);

  const {
    matchUps: [doublesMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });

  ({ matchUpId, matchUpType } = doublesMatchUp);

  ({
    matchUps: [targetMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [matchUpId] },
  }));
  expect(targetMatchUp.matchUpId).toEqual(matchUpId);
  expect(targetMatchUp.matchUpType).toEqual(matchUpType);
});

function generateTeamTournament({ drawSize = 8, valueGoal = 2 } = {}) {
  const tieFormat = {
    winCriteria: { valueGoal },
    collectionDefinitions: [
      {
        collectionId: 'doublesCollectionId',
        collectionName: 'Doubles',
        matchUpType: DOUBLES,
        matchUpCount: 1,
        matchUpFormat: 'SET3-S:6/TB7-F:TB10',
        matchUpValue: 1,
      },
      {
        collectionId: 'singlesCollectionId',
        collectionName: 'Singles',
        matchUpType: SINGLES,
        matchUpCount: 2,
        matchUpFormat: 'SET3-S:6/TB7',
        matchUpValue: 1,
      },
    ],
  };

  const eventProfiles = [
    {
      eventType: TEAM,
      eventName: 'Test Team Event',
      tieFormat,
      drawProfiles: [
        {
          drawSize,
          tieFormat,
          drawName: 'Main Draw',
        },
      ],
    },
  ];

  const {
    eventIds: [eventId],
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ eventProfiles });

  return { tournamentRecord, eventId, drawId };
}
