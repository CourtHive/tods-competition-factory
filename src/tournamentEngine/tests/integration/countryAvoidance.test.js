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
  avoidanceTest({
    avoidance: AVOIDANCE_COUNTRY.avoidance,
    eventType: DOUBLES,
    participantType: PAIR,
  });
});

it('can generate drawDefinition using country avoidance', () => {
  avoidanceTest({
    avoidance: AVOIDANCE_COUNTRY.avoidance,
    eventType: SINGLES,
    participantType: INDIVIDUAL,
  });
});

/**
 *
 * @param {object} avoidance - an avoidance policy
 * @param {string} eventType - DOUBLES or SINGLES; controls what type of event is generated
 * @param {string} participantType = INDIVIDUAL or PAIR; used to filter participants for draw generation
 *
 */
function avoidanceTest({ avoidance, eventType, participantType }) {
  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',

    participantType,
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
    eventType,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants
    .filter(participant => participant.participantType === participantType)
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

  const { policyAttributes } = avoidance;
  const positionedParticipants = positionAssignments.map(assignment => {
    const participant = participantsMap[assignment.participantId];
    const { values } = extractAttributeValues({
      participant,
      policyAttributes,
    });
    return Object.assign({}, assignment, { values });
  });

  let conflicts = 0;
  const pairedParticipants = chunkArray(positionedParticipants, 2);
  pairedParticipants.forEach(matchUpPair => {
    const avoidanceConflict = intersection(
      matchUpPair[0].values,
      matchUpPair[1].values
    ).length;

    if (avoidanceConflict) {
      conflicts++;
      console.log(`${participantType} CONFLICT`, matchUpPair);
    }
  });

  if (conflicts) console.log(pairedParticipants.map(p => p.map(v => v.values)));

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);
}
