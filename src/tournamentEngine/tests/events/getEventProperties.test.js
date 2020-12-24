import { tournamentEngine } from '../..';
import { generateTournament } from '../../../mocksEngine/generators/generateTournament';

import { RATING } from '../../../constants/scaleConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';

it('can get event properties to determine if there are seeded, ranked, or rated participants', () => {
  const { tournamentRecord, participants } = generateTournament({
    participantsCount: 100,
  });
  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: SINGLES,
    category: {
      categoryName: 'WTN',
    },
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const scaleItemsWithParticipantIds = participants.map((participant) => {
    const { participantId } = participant;
    const scaleItems = [
      {
        scaleValue: 8.3,
        scaleName: 'WTN',
        scaleType: RATING,
        eventType: SINGLES,
        scaleDate: '2021-01-01',
      },
    ];

    return { participantId, scaleItems };
  });

  tournamentEngine.setParticipantScaleItems({
    scaleItemsWithParticipantIds,
  });

  const {
    tournamentRecord: { participants: modifiedParticipants },
  } = tournamentEngine.getState();

  modifiedParticipants.forEach((participant) => {
    expect(participant.timeItems.length).toEqual(1);
  });

  result = tournamentEngine.getEventProperties({ eventId });
  expect(result.hasSeededParticipants).toEqual(false);
  expect(result.hasRankedParticipants).toEqual(false);
  expect(result.hasRatedParticipants).toEqual(true);
});
