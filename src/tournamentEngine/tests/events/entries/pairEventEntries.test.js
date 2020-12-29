import { tournamentEngine } from '../../..';
import { generateTournamentWithParticipants } from '../../../../mocksEngine/generators/generateTournamentWithParticipants';

import { DOUBLES } from '../../../../constants/eventConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { /*INDIVIDUAL,*/ PAIR } from '../../../../constants/participantTypes';
import {
  UNPAIRED,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';
import drawEngine from '../../../../drawEngine';
// import { COMPETITOR } from '../../../constants/participantRoles';
// import { ALTERNATE, UNPAIRED } from '../../../constants/entryStatusConstants';

let result;

it('can add doubles events to a tournament record', () => {
  const { tournamentRecord } = generateTournamentWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsCount: 32,
    participantType: PAIR,
  });
  const { participants } = tournamentRecord;

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: DOUBLES,
  };

  result = tournamentEngine.addEvent({ event });
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

  const unpairedEntries = updatedEvent.entries.filter(
    (entry) => entry.entryStatus === UNPAIRED
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
  const {
    success: drawGenrationSuccess,
    drawDefinition,
  } = tournamentEngine.generateDrawDefinition(values);
  expect(drawGenrationSuccess).toEqual(true);

  const { matchUps } = drawEngine.setState(drawDefinition).allDrawMatchUps();
  expect(matchUps.length).toEqual(31);

  const { positionAssignments } = drawDefinition.structures[0];
  expect(positionAssignments[1].bye).toEqual(true);
});
