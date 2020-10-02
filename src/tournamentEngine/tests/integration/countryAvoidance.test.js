import { tournamentRecordWithParticipants } from '../primitives/generateTournament';
import {
  fixtures,
  tournamentEngine,
  resultConstants,
  eventConstants,
} from '../../..';

const { SUCCESS } = resultConstants;
const { SINGLES, DOUBLES } = eventConstants;

const { avoidance } = fixtures;
const { AVOIDANCE_COUNTRY } = avoidance;

let result;

it('can generate drawDefinition using country avoidance', () => {
  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',

    matchUpType: DOUBLES,
    participantsCount: 32,

    nationalityCodesCount: 10,
    addressProps: {
      citiesCount: 10,
      statesCount: 10,
      postalCodesCount: 10,
    },
  });

  tournamentEngine.setState(tournamentRecord);

  const event = {
    eventName: 'Test Event',
    eventType: SINGLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map(p => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    event: eventResult,
    policyDefinitions: [AVOIDANCE_COUNTRY],
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);

  const { positionAssignments } = drawDefinition.structures[0];
  const participantsMap = Object.assign(
    {},
    ...participants.map(participant => ({
      [participant.participantId]: participant,
    }))
  );
  const positionedParticipants = positionAssignments.map(assignment =>
    Object.assign({}, assignment, {
      participant: participantsMap[assignment.participantId],
    })
  );
  console.log(positionedParticipants);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);
});
