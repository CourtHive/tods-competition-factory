import { tournamentRecordWithParticipants } from '../primitives/generateTournament';
import { tournamentEngine, resultConstants } from '../../..';

import { ELIMINATION } from '../../../constants/drawDefinitionConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { RANKING } from '../../../constants/participantConstants';
import ITF_SEEDING from '../../../fixtures/seeding/SEEDING_ITF';

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

  const drawSize = 32;
  const seedsCount = 8;
  const category = { categoryName: 'U18' };

  const relevantParticipants = participants
    .filter(participant => participant.participantType === participantType)
    .slice(0, seedsCount);

  relevantParticipants.forEach((participant, index) => {
    const scaleItem = {
      scaleValue: index + 1,
      scaleName: category.categoryName,
      scaleType: RANKING,
      eventType: eventType,
    };

    const { participantId } = participant;
    tournamentEngine.setParticipantScaleItem({ participantId, scaleItem });
  });

  const event = {
    eventName: 'Test Event',
    category,
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
    eventId,
    drawSize,
    drawType,
    seedsCount,
    automated: true,
    event: eventResult,
    policyDefinitions: [{ avoidance }, ITF_SEEDING],
  };
  const { conflicts, drawDefinition } = tournamentEngine.generateDrawDefinition(
    values
  );

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);
  return { conflicts, drawDefinition, participants };
}
