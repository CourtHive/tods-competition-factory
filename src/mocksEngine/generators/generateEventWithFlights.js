import { tournamentEngine } from '../../tournamentEngine/sync';
import { completeDrawMatchUps } from './completeDrawMatchUps';

import {
  MAIN,
  QUALIFYING,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../constants/drawDefinitionConstants';
import { SINGLES, DOUBLES } from '../../constants/eventConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { DIRECT_ACCEPTANCE } from '../../constants/entryStatusConstants';

export function generateEventWithFlights({
  eventProfile,
  participants,
  completeAllMatchUps,
  randomWinningSide,
}) {
  const {
    category,
    eventName = 'Generated Event',
    eventType = SINGLES,
    // matchUpFormat = FORMAT_STANDARD,
    drawProfiles,
  } = eventProfile;

  const stageParticipantsCount = drawProfiles.reduce(
    (stageParticipantsCount, drawProfile) => {
      const stage = drawProfile.stage || MAIN;
      const participantsCount =
        (drawProfile.drawSize || 0) - (drawProfile.qualifyingPositions || 0);
      if (!Object.keys(stageParticipantsCount).includes(stage))
        stageParticipantsCount[stage] = 0;
      stageParticipantsCount[stage] = Math.max(
        participantsCount,
        stageParticipantsCount[stage]
      );
      return stageParticipantsCount;
    },
    []
  );

  const eventParticipantType =
    eventType === SINGLES
      ? INDIVIDUAL
      : eventType === DOUBLES
      ? PAIR
      : eventType;

  const stageParticipants = {
    QUALIFYING: participants
      .filter(({ participantType }) => participantType === eventParticipantType)
      .slice(0, stageParticipantsCount[QUALIFYING]),
    MAIN: participants
      .filter(({ participantType }) => participantType === eventParticipantType)
      .slice(
        stageParticipantsCount[QUALIFYING],
        stageParticipantsCount[QUALIFYING] + stageParticipantsCount[MAIN]
      ),
  };

  const event = { eventName, eventType, category };
  let {
    event: { eventId },
    error,
  } = tournamentEngine.addEvent({ event });
  if (error) return { error };

  for (const drawProfile of drawProfiles) {
    const { stage, drawName, drawSize, qualifyingPositions } = drawProfile;
    const entriesCount = (drawSize || 0) - (qualifyingPositions || 0);
    const drawParticipantIds = (stageParticipants[stage || MAIN] || [])
      .slice(0, entriesCount)
      .map(({ participantId }) => participantId);
    if (drawParticipantIds.length) {
      tournamentEngine.addEventEntries({
        eventId,
        stage: stage || MAIN,
        participantIds: drawParticipantIds,
      });
    }
    const drawEntries = drawParticipantIds.map(({ participantId }) => ({
      participantId,
      entryStage: stage || MAIN,
      entryStatus: DIRECT_ACCEPTANCE,
    }));
    tournamentEngine.addFlight({
      stage,
      eventId,
      drawName,
      drawSize,
      drawEntries,
      qualifyingPositions,
    });
  }

  const drawIds = [];
  const { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  const success = flightProfile?.flights?.every((flight, index) => {
    const { drawId, drawSize, stage, drawName, drawEntries } = flight;
    const drawType = drawProfiles[index].drawType;
    const automated = drawProfiles[index].automated;
    const matchUpFormat = drawProfiles[index].matchUpFormat;
    const { drawDefinition } = tournamentEngine.generateDrawDefinition({
      stage,
      drawId,
      eventId,
      drawSize,
      drawType,
      drawName,
      automated,
      drawEntries,
      matchUpFormat,
      matchUpType: eventType,
    });
    const result = tournamentEngine.addDrawDefinition({
      eventId,
      drawDefinition,
    });
    drawIds.push(flight.drawId);

    const manual = automated === false;
    if (!manual && completeAllMatchUps) {
      completeDrawMatchUps({
        tournamentEngine,
        randomWinningSide,
        matchUpFormat,
        drawId,
      });
      if (drawProfiles[index].drawType === ROUND_ROBIN_WITH_PLAYOFF) {
        const mainStructure = drawDefinition.structures.find(
          (structure) => structure.stage === MAIN
        );
        tournamentEngine.automatedPlayoffPositioning({
          drawId: flight.drawId,
          structureId: mainStructure.structureId,
        });
        completeDrawMatchUps({
          tournamentEngine,
          randomWinningSide,
          matchUpFormat,
          drawId,
        });
      }
    }
    return !result.error;
  });
  if (!success) return { error: 'Draws not generated ' };

  return { drawIds, eventId };
}
