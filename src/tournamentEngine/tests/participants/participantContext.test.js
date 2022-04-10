import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
} from '../../../constants/drawDefinitionConstants';

test('hydrated consolation matchUps include seeding', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: FIRST_MATCH_LOSER_CONSOLATION,
        seedsCount: 2,
        drawSize: 4,
        outcomes: [
          {
            drawPositions: [1, 2],
            scoreString: '6-1 6-2',
            winningSide: 2,
          },
        ],
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const firstRoundFirstPositionMain = matchUps.find(
    ({ roundNumber, roundPosition, stage }) =>
      stage === MAIN && roundNumber === 1 && roundPosition === 1
  );

  expect(firstRoundFirstPositionMain.sides[0].seedValue).toEqual(1);

  const firstSeedParticipantId =
    firstRoundFirstPositionMain.sides[0].participantId;

  const firstRoundFirstPositionConsolation = matchUps.find(
    ({ roundNumber, roundPosition, stage }) =>
      stage === CONSOLATION && roundNumber === 1 && roundPosition === 1
  );

  expect(firstRoundFirstPositionConsolation.sides[0].participantId).toEqual(
    firstSeedParticipantId
  );

  const {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });

  const consolationStructure = structures.find(
    (structure) => structure.stage === CONSOLATION
  );

  expect(consolationStructure.seedAssignments[0].seedValue).toEqual(1);

  const result = tournamentEngine.getEventData({ eventId });
  expect(
    result.eventData.drawsData[0].structures[1].roundMatchUps[1][0].sides[0]
      .seedValue
  ).toEqual(1);

  /*
  TODO: check finishingPositionRange for FMLC consolation structure
  console.log(
    matchUps.map(({ finishingPositionRange }) => finishingPositionRange)
  );
  */
});
