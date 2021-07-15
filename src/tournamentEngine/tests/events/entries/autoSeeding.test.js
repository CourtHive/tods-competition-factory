import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';

import { SINGLES } from '../../../../constants/eventConstants';
import { RANKING, RATING, SEEDING } from '../../../../constants/scaleConstants';
import SEEDING_USTA from '../../../../fixtures/policies/POLICY_SEEDING_USTA';

it('can autoSeed by Rankings', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantCount: 32,
  });
  const event = {
    eventType: SINGLES,
  };

  let result = tournamentEngine.setState(tournamentRecord).addEvent({ event });
  expect(result.success).toEqual(true);
  const { event: createdEvent } = result;
  const { eventId } = createdEvent;

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  const scaleValuesRating = [3.3, 4.4, 5.5, 1.1, 2.2, 6.6, 7.7, 8.8, 10.1, 9.9];
  const scaleValuesRanking = [100, 90, 80, 30, 20, 10, 70, 60, 50, 40];
  const scaleItemsWithParticipantIds = tournamentParticipants.map(
    (participant, index) => {
      const { participantId } = participant;
      const scaleItems = [
        {
          scaleValue: scaleValuesRating[index],
          scaleName: 'WTN',
          scaleType: RATING,
          eventType: SINGLES,
          scaleDate: '2021-01-01',
        },
        {
          scaleValue: scaleValuesRanking[index],
          scaleName: 'U18',
          scaleType: RANKING,
          eventType: SINGLES,
          scaleDate: '2021-01-01',
        },
      ];

      return { participantId, scaleItems };
    }
  );

  result = tournamentEngine.setParticipantScaleItems({
    scaleItemsWithParticipantIds,
  });
  expect(result.success).toEqual(true);

  let scaleAttributes = {
    scaleName: 'WTN',
    scaleType: RATING,
    eventType: SINGLES,
  };
  result = tournamentEngine.autoSeeding({
    eventId,
    scaleName: 'U18',
    scaleAttributes,
    policyDefinition: SEEDING_USTA,
    sortDescending: true,
  });
  let scaleValues = result.scaleItemsWithParticipantIds
    .map(({ scaleItems }) => scaleItems[0].scaleValue)
    .filter(Boolean);
  expect(scaleValues).toEqual([8, 7, 6, 5, 4, 3, 1, 2]);

  result = tournamentEngine.setParticipantScaleItems({
    scaleItemsWithParticipantIds: result.scaleItemsWithParticipantIds,
  });
  expect(result.success).toEqual(true);

  let seedingScaleAttributes = {
    scaleType: SEEDING,
    scaleName: 'U18',
    eventType: SINGLES,
  };
  let { scaledEntries } = tournamentEngine.getScaledEntries({
    eventId,
    scaleAttributes: seedingScaleAttributes,
  });
  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());

  // check that a timeItem was added
  expect(tournamentParticipants[0].timeItems.length).toEqual(3);
  expect(scaledEntries.length).toEqual(8);

  // now test that { sortDescending: false } sorts the other way
  result = tournamentEngine.autoSeeding({
    eventId,
    scaleName: 'U18',
    scaleAttributes,
    policyDefinition: SEEDING_USTA,
    sortDescending: false,
  });
  scaleValues = result.scaleItemsWithParticipantIds
    .map(({ scaleItems }) => scaleItems[0].scaleValue)
    .filter(Boolean);
  expect(scaleValues).toEqual([3, 4, 5, 1, 2, 6, 7, 8]);
  result = tournamentEngine.setParticipantScaleItems({
    scaleItemsWithParticipantIds: result.scaleItemsWithParticipantIds,
  });
  expect(result.success).toEqual(true);

  // now test seeding by ranking
  scaleAttributes = {
    scaleName: 'U18',
    scaleType: RANKING,
    eventType: SINGLES,
  };
  result = tournamentEngine.autoSeeding({
    eventId,
    scaleName: 'U18',
    scaleAttributes,
    policyDefinition: SEEDING_USTA,
  });
  scaleValues = result.scaleItemsWithParticipantIds
    .map(({ scaleItems }) => scaleItems[0].scaleValue)
    .filter(Boolean);
  expect(scaleValues).toEqual([8, 3, 2, 1, 7, 6, 5, 4]);
  result = tournamentEngine.setParticipantScaleItems({
    scaleItemsWithParticipantIds: result.scaleItemsWithParticipantIds,
  });
  expect(result.success).toEqual(true);

  seedingScaleAttributes = {
    scaleType: SEEDING,
    scaleName: 'U18',
    eventType: SINGLES,
  };
  ({ scaledEntries } = tournamentEngine.getScaledEntries({
    eventId,
    scaleAttributes: seedingScaleAttributes,
  }));
  expect(scaledEntries.length).toEqual(8);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());

  // check that a timeItem was added
  expect(tournamentParticipants[0].timeItems.length).toEqual(5);

  result = tournamentEngine.removeSeeding({
    eventId,
    scaleName: 'U18',
  });

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
});
