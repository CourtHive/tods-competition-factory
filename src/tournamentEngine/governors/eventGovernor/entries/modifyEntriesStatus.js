import { getPositionAssignments } from '../../../../drawEngine/getters/positionsGetter';
import { findParticipant } from '../../../../drawEngine/getters/participantGetter';
import { getMaxEntryPosition } from '../../../../deducers/getMaxEntryPosition';
import { getFlightProfile } from '../../../getters/getFlightProfile';

import {
  INVALID_ENTRY_STATUS,
  INVALID_PARTICIPANT_ID,
  MISSING_EVENT,
  PARTICIPANT_ASSIGNED_DRAW_POSITION,
} from '../../../../constants/errorConditionConstants';
import {
  UNPAIRED,
  VALID_ENTERED_TYPES,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { PAIR } from '../../../../constants/participantTypes';

export function modifyEntriesStatus({
  tournamentRecord,
  drawDefinition,
  participantIds,
  entryStatus,
  drawId,
  stage,
  event,

  autoEntryPositions = true,
}) {
  if (!participantIds || !Array.isArray(participantIds))
    return {
      error: INVALID_PARTICIPANT_ID,
      method: 'modifyEntriesStatus',
      participantIds,
    };
  if (!VALID_ENTERED_TYPES.includes(entryStatus))
    return { error: INVALID_ENTRY_STATUS };

  if (!drawDefinition && !event) return { error: MISSING_EVENT };

  // build up an array of participantIds which are assigned positions in structures
  // disallow changing entryStatus to WITHDRAWN or UNPAIRED for assignedParticipants
  const assignedParticipantIds = [];
  if ([WITHDRAWN, UNPAIRED].includes(entryStatus)) {
    event.drawDefinitions?.forEach(({ structures } = {}) => {
      (structures || []).forEach((structure) => {
        const { positionAssignments } = getPositionAssignments({
          drawDefinition,
          structure,
        });
        const participantIds = (positionAssignments || [])
          .map(({ participantId }) => participantId)
          .filter((f) => f);
        assignedParticipantIds.push(...participantIds);
      });
    });
  }

  const tournamentParticipants = tournamentRecord?.participants || [];

  const validEntryStatusForAllParticipantIds = participantIds.every(
    (participantId) => {
      const { participantType } = findParticipant({
        tournamentParticipants,
        participantId,
      });
      return !(participantType === PAIR && entryStatus === UNPAIRED);
    }
  );

  if (!validEntryStatusForAllParticipantIds)
    return { error: INVALID_ENTRY_STATUS };

  const updateEntryStatus = (entries = []) => {
    const stageFilteredEntries = entries.filter((entry) => {
      return !stage || !entry.entryStage || stage === entry.entryStage;
    });
    let maxEntryPosition = getMaxEntryPosition({
      entries: stageFilteredEntries,
      entryStatus,
      stage,
    });
    let modifications = 0;
    const assigned = (entry) =>
      assignedParticipantIds.includes(entry.participantId);

    stageFilteredEntries.forEach((entry) => {
      const modify =
        participantIds.includes(entry.participantId) && !assigned(entry);
      if (modify) {
        entry.entryStatus = entryStatus;
        if (autoEntryPositions) {
          entry.entryPosition = maxEntryPosition + 1;
          maxEntryPosition++;
          modifications++;
        } else {
          delete entry.entryPosition;
        }
      }
    });
    return modifications === participantIds.length
      ? SUCCESS
      : { error: PARTICIPANT_ASSIGNED_DRAW_POSITION };
  };

  const { flightProfile } = getFlightProfile({ event });
  const flight = flightProfile?.flights?.find(
    (flight) => flight.drawId === drawId
  );

  const updateDrawEntries = ({ flight, drawDefinition }) => {
    if (flight) {
      const result = updateEntryStatus(flight.drawEntries);
      if (result.error) return result;
    }
    if (drawDefinition) {
      const result = updateEntryStatus(drawDefinition.entries);
      if (result.error) return result;
    }
  };

  // if flight or drawDefinition scope modifications
  if (flight || drawDefinition) updateDrawEntries({ flight, drawDefinition });

  if ((!flight && !drawDefinition) || entryStatus === WITHDRAWN) {
    // if entryStatus is WITHDRAWN then participantIds appearing in ANY flight or drawDefinition must be removed
    const result = updateEntryStatus(event.entries);
    if (result.error) return result;

    if (entryStatus === WITHDRAWN) {
      flightProfile?.flights?.forEach(({ drawEntries }) => {
        const result = updateEntryStatus(drawEntries);
        if (result.error) return result;
      });
      event.drawDefinitions?.forEach(({ entries }) => {
        const result = updateEntryStatus(entries);
        if (result.error) return result;
      });
    }
  }

  return SUCCESS;
}
