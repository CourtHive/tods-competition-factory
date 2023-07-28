import { getParticipantId } from '../../../../global/functions/extractors';
import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import { expect, it } from 'vitest';

import SEEDING_USTA from '../../../../fixtures/policies/POLICY_SEEDING_USTA';
import { RANKING, RATING } from '../../../../constants/scaleConstants';
import { SINGLES_EVENT } from '../../../../constants/eventConstants';
import { WTN } from '../../../../constants/ratingConstants';
import { ROUND_ROBIN } from '../../../../constants/drawDefinitionConstants';

it('can autoSeed by Rankings and then generate Round Robin', () => {
  const participantsCount = 32;
  const startDate = '2023-01-01';
  const categoryName = 'U18';

  const {
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles: [{ eventName: 'Auto Seeded', category: { categoryName } }],
    participantsProfile: { participantsCount },
    startDate,
  });

  tournamentEngine.setState(tournamentRecord);
  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();

  const participantIds = tournamentParticipants.map(getParticipantId);

  let result = tournamentEngine.addEventEntries({
    participantIds,
    eventId,
  });

  const scaleValuesRating = [3.3, 4.4, 5.5, 1.1, 2.2, 6.6, 7.7, 8.8, 10.1, 9.9];
  const scaleValuesRanking = [100, 90, 80, 30, 20, 10, 70, 60, 50, 40];
  const scaleItemsWithParticipantIds = participantIds.map(
    (participantId, index) => {
      const scaleItems = [
        {
          scaleValue: scaleValuesRating[index],
          eventType: SINGLES_EVENT,
          scaleDate: startDate,
          scaleType: RATING,
          scaleName: WTN,
        },
        {
          scaleValue: scaleValuesRanking[index],
          eventType: SINGLES_EVENT,
          scaleName: categoryName,
          scaleDate: startDate,
          scaleType: RANKING,
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
    eventType: SINGLES_EVENT,
    scaleName: categoryName,
    scaleType: RANKING,
  };
  result = tournamentEngine.autoSeeding({
    policyDefinitions: SEEDING_USTA,
    sortDescending: true,
    scaleAttributes,
    eventId,
  });

  expect(result.scaleItemsWithParticipantIds.length).toEqual(32);
  result = tournamentEngine.setParticipantScaleItems(result);
  expect(result.success).toEqual(true);

  scaleAttributes = {
    eventType: SINGLES_EVENT,
    scaleType: RATING,
    scaleName: WTN,
  };
  result = tournamentEngine.autoSeeding({
    policyDefinitions: SEEDING_USTA,
    sortDescending: true,
    scaleAttributes,
    eventId,
  });

  expect(result.scaleItemsWithParticipantIds.length).toEqual(32);
  result = tournamentEngine.setParticipantScaleItems(result);
  expect(result.success).toEqual(true);

  const { event } = tournamentEngine.getEvent({ eventId });
  expect(event.entries.length).toEqual(participantsCount);

  tournamentParticipants = tournamentEngine.getTournamentParticipants({
    withSeeding: true,
    withEvents: true,
  }).tournamentParticipants;

  const seededParticipants = tournamentParticipants.filter(
    ({ events }) => events?.[0]?.seedValue
  );

  expect(seededParticipants.length).toEqual(8);

  result = tournamentEngine.generateDrawDefinition({
    drawSize: participantsCount,
    drawType: ROUND_ROBIN,
    automated: true,
    eventId,
  });
  expect(result.success).toEqual(true);
});
