import { mocksEngine, tournamentEngine } from '../../../..';
import { intersection, unique } from '../../../../utilities';

import { FEED_IN_CHAMPIONSHIP_TO_R16 } from '../../../../constants/drawDefinitionConstants';
import { DOUBLES } from '../../../../constants/eventConstants';

import { FEMALE, MALE } from '../../../../constants/genderConstants';
import { BYE } from '../../../../constants/matchUpStatusConstants';
import { PAIR } from '../../../../constants/participantTypes';

it('can schedule potential rounds properly in scenarios with recovery times greater than average matchUp times', () => {
  const venueProfiles = [{ courtsCount: 31 }];
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
      gender: MALE,
      drawSize: 32,
      withPlayoffs,
    },
  ];

  const {
    drawIds,
    tournamentRecord,
    venueIds: [venueId],
  } = mocksEngine.generateTournamentRecord({
    venueProfiles,
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [PAIR] },
    }
  );

  // expect default of 32 + (2 * 32 unique) + (24 unique)
  expect(tournamentParticipants.length).toEqual(120);
  console.log({ venueId });

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
});
