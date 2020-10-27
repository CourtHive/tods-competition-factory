import { tournamentRecordWithParticipants } from '../primitives/generateTournament';
import { tournamentEngine, resultConstants } from '../../..';
import { ELIMINATION } from '../../../constants/drawDefinitionConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';

const { SUCCESS } = resultConstants;

/**
 *
 * @param {object} avoidance - an avoidance policy
 * @param {string} eventType - DOUBLES or SINGLES; controls what type of event is generated
 * @param {string} participantType = INDIVIDUAL or PAIR; used to filter participants for draw generation
 *
 * @param {number} valuesCount - how many variations to generate for each value type
 * @param {number} participantsCount - how many participants to place in the draw
 * @param {string} drawType - type of draw to generate
 *
 */

export function avoidanceTest(props) {
  const { avoidance, eventType, participantType } = props;
  const {
    valuesCount = 10,
    valuesInstanceLimit,
    participantsCount = 32,
    drawType = ELIMINATION,
  } = props;

  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',

    participantType,
    participantsCount,

    valuesInstanceLimit,
    nationalityCodesCount: valuesCount,
    addressProps: {
      citiesCount: valuesCount,
      statesCount: valuesCount,
      postalCodesCount: valuesCount,
    },
  });

  tournamentEngine.setState(tournamentRecord);

  const event = {
    eventName: 'Test Event',
    eventType,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const eventParticipantType =
    eventType === SINGLES ? INDIVIDUAL : DOUBLES ? PAIR : participantType;

  const participantIds = participants
    .filter(participant => participant.participantType === eventParticipantType)
    .map(p => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 32,
    drawType,
    eventId,
    event: eventResult,
    policyDefinitions: [{ avoidance }],
  };
  const { conflicts, drawDefinition } = tournamentEngine.generateDrawDefinition(
    values
  );

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);
  return { conflicts, drawDefinition };
}
