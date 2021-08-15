import drawEngine from '../../../../drawEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import { tournamentEngine } from '../../../sync';

import { WITHDRAWN } from '../../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { DOUBLES } from '../../../../constants/eventConstants';
import { PAIR } from '../../../../constants/participantTypes';
import { isUngrouped } from '../../../../global/isUngrouped';

it('can add doubles events to a tournament record', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsProfile: { participantType: PAIR, participantsCount: 32 },
  });
  const { participants } = tournamentRecord;

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: DOUBLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants
    .filter((participant) => participant.participantType === PAIR)
    .map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  let { event: updatedEvent } = tournamentEngine.getEvent({ eventId });
  expect(updatedEvent.entries.length).toEqual(32);

  const pairParticipantId = updatedEvent.entries[0].participantId;
  result = tournamentEngine.destroyPairEntry({
    eventId,
    participantId: pairParticipantId,
  });

  ({ event: updatedEvent } = tournamentEngine.getEvent({ eventId }));
  expect(updatedEvent.entries.length).toEqual(33);

  const unpairedEntries = updatedEvent.entries.filter((entry) =>
    isUngrouped(entry.entryStatus)
  );
  const unpairedParticipantIds = unpairedEntries.map(
    (entry) => entry.participantId
  );

  result = tournamentEngine.modifyEntriesStatus({
    eventId,
    participantIds: unpairedParticipantIds,
    entryStatus: WITHDRAWN,
  });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    event: eventResult,
  };
  const { success: drawGenrationSuccess, drawDefinition } =
    tournamentEngine.generateDrawDefinition(values);
  expect(drawGenrationSuccess).toEqual(true);

  const { matchUps } = drawEngine.setState(drawDefinition).allDrawMatchUps();
  expect(matchUps.length).toEqual(31);

  const { positionAssignments } = drawDefinition.structures[0];
  expect(positionAssignments[1].bye).toEqual(true);
});
