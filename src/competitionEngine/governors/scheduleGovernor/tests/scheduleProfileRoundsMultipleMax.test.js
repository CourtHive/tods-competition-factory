import { getContainedStructures } from '../../../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { mocksEngine, tournamentEngine, competitionEngine } from '../../../..';
import { intersection, unique } from '../../../../utilities';

import {
  FEED_IN_CHAMPIONSHIP_TO_R16,
  ROUND_ROBIN,
} from '../../../../constants/drawDefinitionConstants';
import { DOUBLES } from '../../../../constants/eventConstants';

import { FEMALE, MALE } from '../../../../constants/genderConstants';
import { BYE } from '../../../../constants/matchUpStatusConstants';
import { PAIR } from '../../../../constants/participantTypes';

it('can schedule potential rounds properly in scenarios with recovery times greater than average matchUp times', () => {
  const firstVenueId = 'firstVenueId';
  const venueProfiles = [{ venueId: firstVenueId, courtsCount: 31 }];
  const withPlayoffs = {
    roundProfiles: [{ 3: 1 }, { 4: 1 }],
    playoffAttributes: {
      '0-3': { name: 'Silver', abbreviation: 'S' },
      '0-4': { name: 'Gold', abbreviation: 'G' },
    },
  };
  const drawProfiles = [
    {
      drawType: FEED_IN_CHAMPIONSHIP_TO_R16,
      drawName: 'U16 Boys Doubles',
      uniqueParticipants: true,
      participantsCount: 32,
      eventType: DOUBLES,
      idPrefix: 'M16',
      drawId: 'idM16',
      gender: MALE,
      drawSize: 32,
      withPlayoffs,
    },
    {
      drawType: FEED_IN_CHAMPIONSHIP_TO_R16,
      drawName: 'U16 Girls Doubles',
      uniqueParticipants: true,
      participantsCount: 32,
      eventType: DOUBLES,
      idPrefix: 'F16',
      drawId: 'idF16',
      gender: FEMALE,
      drawSize: 32,
      withPlayoffs,
    },
    {
      drawType: FEED_IN_CHAMPIONSHIP_TO_R16,
      drawName: 'U18 Boys Doubles',
      uniqueParticipants: true,
      participantsCount: 24,
      eventType: DOUBLES,
      idPrefix: 'M18',
      drawId: 'idM18',
      gender: MALE,
      drawSize: 32,
      withPlayoffs,
    },
  ];

  const startDate = '2022-01-01';

  const schedulingProfile = [
    {
      scheduleDate: '2022-01-01',
      venues: [
        {
          venueId: firstVenueId,
          rounds: [
            { drawId: 'idM16', winnerFinishingPositionRange: '1-16' },
            { drawId: 'idF16', winnerFinishingPositionRange: '1-16' },
            { drawId: 'idM18', winnerFinishingPositionRange: '1-16' },
            { drawId: 'idM16', winnerFinishingPositionRange: '9-24' },
            { drawId: 'idF16', winnerFinishingPositionRange: '9-24' },
            { drawId: 'idM18', winnerFinishingPositionRange: '9-24' },
            { drawId: 'idM16', winnerFinishingPositionRange: '1-8' },
            { drawId: 'idF16', winnerFinishingPositionRange: '1-8' },
            { drawId: 'idM18', winnerFinishingPositionRange: '1-8' },
          ],
        },
      ],
    },
  ];

  const {
    drawIds,
    tournamentRecord,
    venueIds: [venueId],
  } = mocksEngine.generateTournamentRecord({
    schedulingProfile,
    venueProfiles,
    drawProfiles,
    startDate,
  });

  expect(drawIds).toEqual(['idM16', 'idF16', 'idM18']);

  tournamentEngine.setState(tournamentRecord);
  const { tournamentId } = tournamentRecord;

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [PAIR] },
    }
  );

  // expect default of 32 + (2 * 32 unique) + (24 unique)
  expect(tournamentParticipants.length).toEqual(120);

  const allMatchUpIds = [];
  const nonByeMatchUpsCount = [];
  const eventEnteredParticipantIds = [];

  // expect that 4 structures exist per drawDefinition, as follows:
  const expectations = { MAIN: 31, CONSOLATION: 23, Silver: 3, Gold: 1 };

  for (const drawId of drawIds) {
    const { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
    expect(drawDefinition.structures.length).toEqual(4);

    const drawMatchUps = [];
    drawDefinition.structures.forEach((structure) => {
      const { matchUps, structureName } = structure;
      expect(matchUps.length).toEqual(expectations[structureName]);

      drawMatchUps.push(...matchUps);
    });

    const enteredParticipantIds = event.entries.map(
      ({ participantId }) => participantId
    );
    eventEnteredParticipantIds.push(enteredParticipantIds);

    const matchUpIds = drawMatchUps.map(({ matchUpId }) => matchUpId);
    allMatchUpIds.push(...matchUpIds);

    const matchUpsNoBye = drawMatchUps.filter(
      ({ matchUpStatus }) => matchUpStatus !== BYE
    );
    nonByeMatchUpsCount.push(matchUpsNoBye.length);
  }

  // the 3rd draw has 24/32 positions assigned to participants
  expect(nonByeMatchUpsCount).toEqual([58, 58, 42]);

  // since matchUpIds are generated using idPrefix for each drawProfile, ensure they are unique
  expect(unique(allMatchUpIds).length).toEqual(allMatchUpIds.length);

  // expect than none of the draws shares entered participantIds
  expect(
    intersection(eventEnteredParticipantIds[0], eventEnteredParticipantIds[1])
      .length
  ).toEqual(0);

  expect(
    intersection(eventEnteredParticipantIds[0], eventEnteredParticipantIds[2])
      .length
  ).toEqual(0);

  expect(
    intersection(eventEnteredParticipantIds[1], eventEnteredParticipantIds[2])
      .length
  ).toEqual(0);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  // this won't work for round robin...
  const roundsToSchedule = ['1-16', '9-24', '1-8'];

  let scheduledRounds = 0;
  for (const drawId of drawIds) {
    const drawMatchUps = matchUps.filter(
      (matchUp) => matchUp.drawId === drawId
    );

    for (const target of roundsToSchedule) {
      const range = target.indexOf('-') > 0 && target.split('-').map((x) => +x);
      const matchUp = drawMatchUps.find(({ finishingPositionRange }) => {
        let result = range
          ? intersection(range, finishingPositionRange.winner).length === 2
          : undefined;
        return result;
      });

      if (matchUp) {
        const { eventId, structureId, roundNumber } = matchUp;
        let result = competitionEngine.addSchedulingProfileRound({
          scheduleDate: startDate,
          venueId,
          round: { tournamentId, eventId, drawId, structureId, roundNumber },
        });
        if (result.success) scheduledRounds += 1;
      }
    }
  }
  expect(scheduledRounds).toEqual(9);
});

it('rr', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawType: ROUND_ROBIN, drawSize: 16 }],
  });
  tournamentEngine.setState(tournamentRecord);
  const containedStructureIds = getContainedStructures(tournamentRecord);

  const {
    matchUps: [{ structureId }],
  } = tournamentEngine.allTournamentMatchUps();

  const containerStructureId = Object.keys(containedStructureIds).find(
    (containingStructureId) =>
      containedStructureIds[containingStructureId].includes(structureId)
  );
  expect(structureId).not.toBeUndefined();
  expect(containerStructureId).not.toBeUndefined();
  expect(structureId).not.toEqual(containerStructureId);
});
