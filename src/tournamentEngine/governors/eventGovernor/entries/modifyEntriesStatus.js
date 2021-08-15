import { getAssignedParticipantIds } from '../../../../drawEngine/getters/getAssignedParticipantIds';
import { refreshEntryPositions } from '../../../../common/producers/refreshEntryPositions';
import { findParticipant } from '../../../../common/deducers/findParticipant';
import { getFlightProfile } from '../../../getters/getFlightProfile';

import { SUCCESS } from '../../../../constants/resultConstants';
import { PAIR } from '../../../../constants/participantTypes';
import { isUngrouped } from '../../../../global/isUngrouped';
import {
  INVALID_ENTRY_STATUS,
  INVALID_PARTICIPANT_ID,
  MISSING_EVENT,
  PARTICIPANT_ASSIGNED_DRAW_POSITION,
} from '../../../../constants/errorConditionConstants';
import {
  VALID_ENTERED_TYPES,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';

export function modifyEntriesStatus({
  tournamentRecord,
  drawDefinition,
  participantIds,
  entryStatus,
  drawId,
  stage,
  event,

  eventSync,
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
  // disallow changing entryStatus to WITHDRAWN or UNGROUPED for assignedParticipants
  const assignedParticipantIds = [];
  if (entryStatus === WITHDRAWN || isUngrouped(entryStatus)) {
    event.drawDefinitions?.forEach((drawDefinition) => {
      const participantIds = getAssignedParticipantIds({ drawDefinition });
      assignedParticipantIds.push(...participantIds);
    });
  }

  const tournamentParticipants = tournamentRecord?.participants || [];

  const validEntryStatusForAllParticipantIds = participantIds.every(
    (participantId) => {
      const { participantType } = findParticipant({
        tournamentParticipants,
        participantId,
      });
      return !(participantType === PAIR && isUngrouped(entryStatus));
    }
  );

  if (!validEntryStatusForAllParticipantIds)
    return { error: INVALID_ENTRY_STATUS };

  const updateEntryStatus = (entries = []) => {
    const filteredEntries = entries
      // filter out entries by stage (if specified)
      .filter((entry) => {
        return !stage || !entry.entryStage || stage === entry.entryStage;
      })
      // filter by specified participantIds
      .filter(({ participantId }) => participantIds.includes(participantId));

    const isAssigned = (entry) =>
      assignedParticipantIds.includes(entry.participantId);

    const success = filteredEntries.every((entry) => {
      if (isAssigned(entry)) return false;
      entry.entryStatus = entryStatus;
      delete entry.entryPosition;
      return true;
    });

    return success ? SUCCESS : { error: PARTICIPANT_ASSIGNED_DRAW_POSITION };
  };

  const { flightProfile } = getFlightProfile({ event });
  const flight = flightProfile?.flights?.find(
    (flight) => flight.drawId === drawId
  );

  const autoPosition = () => {
    event.entries = refreshEntryPositions({
      entries: event.entries,
    });
    if (flight) {
      flight.drawEntries = refreshEntryPositions({
        entries: flight.drawEntries,
      });
    }
    if (drawDefinition) {
      drawDefinition.entries = refreshEntryPositions({
        entries: drawDefinition.entries,
      });
    }
  };

  const entryPositionsExist =
    event.entries?.find(({ entryPosition }) => !isNaN(entryPosition)) ||
    flight?.drawEntries?.find(({ entryPosition }) => !isNaN(entryPosition)) ||
    drawDefinition?.entries?.find(({ entryPosition }) => !isNaN(entryPosition));

  // before modifying, if autoEntryPositions: true, pre-assign entryPositions
  if (autoEntryPositions && !entryPositionsExist) autoPosition();

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

  const singleDraw =
    flightProfile?.flights?.length === 1 &&
    event.drawDefinitions?.length <= flightProfile?.flights?.length;

  if (
    (!flight && !drawDefinition) ||
    entryStatus === WITHDRAWN ||
    (eventSync && singleDraw) // if there is only one draw keep event entries in sync
  ) {
    // if entryStatus is WITHDRAWN then participantIds appearing in ANY flight or drawDefinition must be removed
    const result = updateEntryStatus(event.entries);
    if (result.error) return result;

    let error;
    if (entryStatus === WITHDRAWN) {
      flightProfile?.flights?.every(({ drawEntries }) => {
        const result = updateEntryStatus(drawEntries);
        if (result.error) {
          error = result.error;
          return false;
        }
        return true;
      });
      event.drawDefinitions?.every(({ entries }) => {
        const result = updateEntryStatus(entries);
        if (result.error) {
          error = result.error;
          return false;
        }
        return true;
      });
    }
    if (error) return { error };
  }

  if (autoEntryPositions) autoPosition();

  return SUCCESS;
}
