import { getAssignedParticipantIds } from '../../../../drawEngine/getters/getAssignedParticipantIds';
import { refreshEntryPositions } from '../../../../global/functions/producers/refreshEntryPositions';
import { findParticipant } from '../../../../global/functions/deducers/findParticipant';
import { isUngrouped } from '../../../../global/functions/isUngrouped';
import { getFlightProfile } from '../../../getters/getFlightProfile';

import { SUCCESS } from '../../../../constants/resultConstants';
import { PAIR } from '../../../../constants/participantTypes';
import {
  ENTRY_STATUS_NOT_ALLOWED_FOR_EVENT,
  INVALID_ENTRY_STATUS,
  INVALID_PARTICIPANT_ID,
  MISSING_EVENT,
  PARTICIPANT_ASSIGNED_DRAW_POSITION,
} from '../../../../constants/errorConditionConstants';
import {
  DRAW_SPECIFIC_STATUSES,
  EQUIVALENT_ACCEPTANCE_STATUSES,
  VALID_ENTRY_STATUSES,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';

// disallow changing entryStatus to WITHDRAWN or UNGROUPED for assignedParticipants

export function modifyEntriesStatus({
  autoEntryPositions = true,
  tournamentRecord,
  drawDefinition,
  participantIds,
  entryStatus,
  eventSync,
  drawId,
  stage,
  event,
}) {
  if (!participantIds || !Array.isArray(participantIds))
    return {
      error: INVALID_PARTICIPANT_ID,
      method: 'modifyEntriesStatus',
      participantIds,
    };

  if (!VALID_ENTRY_STATUSES.includes(entryStatus))
    return { error: INVALID_ENTRY_STATUS };

  if (!drawDefinition && !event) return { error: MISSING_EVENT };

  // build up an array of participantIds which are assigned positions in structures
  const assignedParticipantIds = [];
  event.drawDefinitions?.forEach((drawDefinition) => {
    const participantIds = getAssignedParticipantIds({ drawDefinition });
    assignedParticipantIds.push(...participantIds);
  });

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

  const { flightProfile } = getFlightProfile({ event });
  const flight = flightProfile?.flights?.find(
    (flight) => flight.drawId === drawId
  );

  // ------------------------------------------------------------------------
  // reusable functions
  const updateEntryStatus = (entries = []) => {
    const filteredEntries = entries
      // filter out entries by stage (if specified)
      .filter((entry) => {
        return !stage || !entry.entryStage || stage === entry.entryStage;
      })
      // filter by specified participantIds
      .filter(({ participantId }) => participantIds.includes(participantId));

    const isAssigned = (entry) =>
      assignedParticipantIds.includes(entry.participantId) &&
      !(
        EQUIVALENT_ACCEPTANCE_STATUSES.includes(entry.entryStatus) &&
        EQUIVALENT_ACCEPTANCE_STATUSES.includes(entryStatus)
      );

    const success = filteredEntries.every((entry) => {
      if (isAssigned(entry)) return false;
      entry.entryStatus = entryStatus;
      delete entry.entryPosition;
      return true;
    });

    return success ? SUCCESS : { error: PARTICIPANT_ASSIGNED_DRAW_POSITION };
  };

  const autoPosition = ({ flight, drawDefinition }) => {
    event.entries = refreshEntryPositions({
      entries: event.entries || [],
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
  const updateDrawEntries = ({ flight, drawDefinition }) => {
    if (flight) {
      const result = updateEntryStatus(flight.drawEntries);
      if (result.error) return result;
    }
    if (drawDefinition) {
      const result = updateEntryStatus(drawDefinition.entries);
      if (result.error) return result;
    }
    return { ...SUCCESS };
  };

  // ------------------------------------------------------------------------
  // before modifying, if autoEntryPositions: true, pre-assign entryPositions
  const entryPositionsExist =
    event.entries?.find(({ entryPosition }) => !isNaN(entryPosition)) ||
    flight?.drawEntries?.find(({ entryPosition }) => !isNaN(entryPosition)) ||
    drawDefinition?.entries?.find(({ entryPosition }) => !isNaN(entryPosition));

  if (autoEntryPositions && !entryPositionsExist)
    autoPosition({ flight, drawDefinition });

  // ------------------------------------------------------------------------
  // if flight or drawDefinition scope modifications
  if (flight || drawDefinition) {
    const result = updateDrawEntries({ flight, drawDefinition });
    if (result.error) return result;
  }

  // ------------------------------------------------------------------------
  // update any flights which have no draw generated to keep entries in sync
  const generatedDrawIds =
    event.drawDefinitions?.map(({ drawId }) => drawId) || [];
  const flightsNoDraw =
    flightProfile?.flights?.filter(
      (flight) => !generatedDrawIds.includes(flight.drawId)
    ) || [];

  for (const flight of flightsNoDraw) {
    const result = updateDrawEntries({ flight });
    if (result.error) return result;
  }

  // ------------------------------------------------------------------------
  const singleDraw =
    flightProfile?.flights?.length === 1 &&
    event.drawDefinitions?.length <= flightProfile?.flights?.length;

  if (
    !flight &&
    !drawDefinition &&
    DRAW_SPECIFIC_STATUSES.includes(entryStatus)
  ) {
    return { error: ENTRY_STATUS_NOT_ALLOWED_FOR_EVENT };
  }

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
      flightProfile?.flights?.every((flight) => {
        const result = updateEntryStatus(flight.drawEntries);
        if (result.error) {
          error = result.error;
          return false;
        }
        flight.drawEntries = flight.drawEntries.filter(
          ({ participantId }) => !participantIds.includes(participantId)
        );
        return true;
      });

      event.drawDefinitions?.every((drawDefinition) => {
        const result = updateEntryStatus(drawDefinition.entries);
        if (result.error) {
          error = result.error;
          return false;
        }
        drawDefinition.entries = drawDefinition.entries?.filter(
          ({ participantId }) => !participantIds.includes(participantId)
        );
        return true;
      });
    }
    if (error) return { error };
  }

  if (autoEntryPositions) autoPosition({ flight, drawDefinition });

  return SUCCESS;
}
