import { addDrawDefinition } from '../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { automatedPlayoffPositioning } from '../../tournamentEngine/governors/eventGovernor/automatedPositioning';
import { addEventEntries } from '../../tournamentEngine/governors/eventGovernor/entries/addEventEntries';
import { generateDrawDefinition } from '../../tournamentEngine/generators/generateDrawDefinition';
import { addFlight } from '../../tournamentEngine/governors/eventGovernor/addFlight';
import { getFlightProfile } from '../../tournamentEngine/getters/getFlightProfile';
import { addEvent } from '../../tournamentEngine/governors/eventGovernor/addEvent';
import { completeDrawMatchUps } from './completeDrawMatchUps';
import { UUID } from '../../utilities';

import { DIRECT_ACCEPTANCE } from '../../constants/entryStatusConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { SINGLES, DOUBLES } from '../../constants/eventConstants';
import {
  MAIN,
  QUALIFYING,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';

export function generateEventWithFlights({
  tournamentRecord,
  completeAllMatchUps,
  randomWinningSide,
  eventProfile,
  participants,
}) {
  const {
    category,
    eventName = 'Generated Event',
    eventType = SINGLES,
    drawProfiles,
    tieFormat: eventTieFormat,
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

  const eventId = UUID();
  const newEvent = {
    eventId,
    eventName,
    eventType,
    category,
    tieFormat: eventTieFormat,
  };
  let result = addEvent({ tournamentRecord, event: newEvent });
  if (result.error) return result;
  const { event } = result;

  for (const drawProfile of drawProfiles) {
    const {
      stage,
      drawName,
      drawType = SINGLE_ELIMINATION,
      drawSize,
      qualifyingPositions,
    } = drawProfile;
    const entriesCount = (drawSize || 0) - (qualifyingPositions || 0);
    const drawParticipantIds = (stageParticipants[stage || MAIN] || [])
      .slice(0, entriesCount)
      .map(({ participantId }) => participantId);
    if (drawParticipantIds.length) {
      const result = addEventEntries({
        tournamentRecord,
        event,
        stage: stage || MAIN,
        participantIds: drawParticipantIds,
        autoEntryPositions: false,
      });
      if (result.error) return result;
    }
    const drawEntries = drawParticipantIds.map(({ participantId }) => ({
      participantId,
      entryStage: stage || MAIN,
      entryStatus: DIRECT_ACCEPTANCE,
    }));
    const result = addFlight({
      event,
      stage,
      drawName: drawName || drawType,
      drawSize,
      drawEntries,
      qualifyingPositions,
    });
    if (result.error) {
      return result;
    }
  }

  const drawIds = [];
  const { flightProfile } = getFlightProfile({ event });
  const success = flightProfile?.flights?.every((flight, index) => {
    const { drawId, drawSize, stage, drawName, drawEntries } = flight;
    const drawType = drawProfiles[index].drawType || SINGLE_ELIMINATION;
    const automated = drawProfiles[index].automated;
    const matchUpFormat = drawProfiles[index].matchUpFormat;
    const tieFormat = drawProfiles[index].tieFormat || eventTieFormat;
    const { drawDefinition } = generateDrawDefinition({
      stage,
      drawId,
      event,
      drawSize,
      drawType,
      drawName,
      automated,
      tieFormat,
      drawEntries,
      matchUpFormat,
      matchUpType: eventType,
      tournamentRecord,
    });
    let result = addDrawDefinition({
      drawDefinition,
      event,
    });
    if (result.error) {
      return false;
    }
    drawIds.push(flight.drawId);

    const manual = automated === false;
    if (!manual && completeAllMatchUps) {
      const result = completeDrawMatchUps({
        randomWinningSide,
        matchUpFormat,
        drawDefinition,
      });
      if (result.error) return false;
      if (drawProfiles[index].drawType === ROUND_ROBIN_WITH_PLAYOFF) {
        const mainStructure = drawDefinition.structures.find(
          (structure) => structure.stage === MAIN
        );
        let result = automatedPlayoffPositioning({
          structureId: mainStructure.structureId,
          tournamentRecord,
          drawDefinition,
          event,
        });
        if (result.error) return false;

        result = completeDrawMatchUps({
          randomWinningSide,
          matchUpFormat,
          drawDefinition,
        });
        if (result.error) return false;
      }
    }
    return true;
  });

  if (!success) return { error: 'Draws not generated ' };

  return { drawIds, eventId };
}
