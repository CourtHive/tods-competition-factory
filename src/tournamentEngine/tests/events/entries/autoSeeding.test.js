import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';

import { RANKING, RATING, SEEDING } from '../../../../constants/scaleConstants';
import { MISSING_EVENT } from '../../../../constants/errorConditionConstants';
import SEEDING_USTA from '../../../../fixtures/policies/POLICY_SEEDING_USTA';
import { SINGLES } from '../../../../constants/eventConstants';

it('can autoSeed by Rankings', () => {
  const {
    drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
    participantCount: 32,
  });

  tournamentEngine.setState(tournamentRecord);
  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();

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

  let result = tournamentEngine.setParticipantScaleItems({
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
    policyDefinitions: SEEDING_USTA,
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
    policyDefinitions: SEEDING_USTA,
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
    policyDefinitions: SEEDING_USTA,
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
    scaleName: 'U18',
  });
  expect(result.error).toEqual(MISSING_EVENT);

  result = tournamentEngine.removeSeeding({
    scaleName: 'U18',
    eventId,
  });
  expect(result.success).toEqual(true);

  // check that all seeding timeItems were removed
  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
  expect(tournamentParticipants[0].timeItems.length).toEqual(2);

  result = tournamentEngine.removeSeeding({
    scaleName: 'U18',
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);

  // now remove the flightProfile so that subsequent call can fall through to drawDefinition.entries
  result = tournamentEngine.removeEventExtension({
    name: 'flightProfile',
    eventId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.removeSeeding({
    scaleName: 'U18',
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);

  // also need to test this with scale items that are stageEntries on a drawDefinition where the scaleAttributes include drawId-specific scaleName
});
