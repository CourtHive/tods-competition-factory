import { tournamentRecordWithParticipants } from '../primitives/generateTournament';
import { extractAttributeValues } from '../../../drawEngine/getters/getAttributeGrouping';
import {
  fixtures,
  tournamentEngine,
  resultConstants,
  eventConstants,
} from '../../..';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { chunkArray } from '../../../utilities';
import { intersection } from '../../../utilities/arrays';

const { SUCCESS } = resultConstants;
const { SINGLES, DOUBLES } = eventConstants;

const { avoidance } = fixtures;
const { AVOIDANCE_COUNTRY } = avoidance;

let result;

it('can generate drawDefinition using country avoidance', () => {
  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',

    matchUpType: DOUBLES, // only used to generate doubles pairs; also generates individuals
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
    eventType: DOUBLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants
    .filter(participant => participant.participantType === PAIR)
    .map(p => p.participantId);
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

  const { policyAttributes } = AVOIDANCE_COUNTRY.avoidance;
  const positionedParticipants = positionAssignments.map(assignment => {
    const participant = participantsMap[assignment.participantId];
    const { values } = extractAttributeValues({
      participant,
      policyAttributes,
    });
    return Object.assign({}, assignment, { values });
  });

  const pairedParticipants = chunkArray(positionedParticipants, 2);
  pairedParticipants.forEach(matchUpPair => {
    const avoidanceConflict = intersection(
      matchUpPair[0].values,
      matchUpPair[1].values
    ).length;

    if (avoidanceConflict) {
      console.log('CONFLICT', matchUpPair);
    }
  });

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);
});

it('can generate Singles drawDefinition using country avoidance', () => {
  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',

    matchUpType: SINGLES, // only used to generate doubles pairs; also generates individuals
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
    eventType: DOUBLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants
    .filter(participant => participant.participantType === INDIVIDUAL)
    .map(p => p.participantId);
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

  const { policyAttributes } = AVOIDANCE_COUNTRY.avoidance;
  const positionedParticipants = positionAssignments.map(assignment => {
    const participant = participantsMap[assignment.participantId];
    const { values } = extractAttributeValues({
      participant,
      policyAttributes,
    });
    return Object.assign({}, assignment, { values });
  });

  const pairedParticipants = chunkArray(positionedParticipants, 2);
  pairedParticipants.forEach(matchUpPair => {
    const avoidanceConflict = intersection(
      matchUpPair[0].values,
      matchUpPair[1].values
    ).length;

    if (avoidanceConflict) {
      console.log('CONFLICT', matchUpPair);
    }
  });

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);
});
