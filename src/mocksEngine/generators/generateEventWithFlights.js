// import { completeDrawMatchUps, completeMatchUp } from './completeDrawMatchUps';
import { tournamentEngine } from '../../tournamentEngine/sync';
// import { intersection } from '../../utilities';

/*
import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import {
  MAIN,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';
import { ALTERNATE } from '../../constants/entryStatusConstants';
import { COMPLETED } from '../../constants/matchUpStatusConstants';
*/
// import { FORMAT_STANDARD } from '../../fixtures/scoring/matchUpFormats/formatConstants';
import { SINGLES } from '../../constants/eventConstants';

export function generateEventWithFlights({
  eventProfile,
  // completeAllMatchUps,
  // randomWinningSide,
}) {
  const {
    category,
    // participants,
    eventName = 'Generated Event',
    eventType = SINGLES,
    // matchUpFormat = FORMAT_STANDARD,
    drawProfiles,
  } = eventProfile;

  const event = { eventName, eventType, category };
  let {
    event: { eventId },
    error,
  } = tournamentEngine.addEvent({ event });
  if (error) return { error };

  drawProfiles.forEach((drawProfile) => {
    const { stage, drawName, drawSize, qualifyingPositions } = drawProfile;
    tournamentEngine.addFlight({
      eventId,
      stage,
      drawName,
      drawSize,
      qualifyingPositions,
    });
  });

  return { drawIds: [], eventId };
}
