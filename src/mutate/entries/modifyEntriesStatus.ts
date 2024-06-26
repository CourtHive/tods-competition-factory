import { getAssignedParticipantIds } from '@Query/drawDefinition/getAssignedParticipantIds';
import { modifyDrawNotice } from '../notifications/drawNotifications';
import { decorateResult } from '@Functions/global/decorateResult';
import { refreshEntryPositions } from './refreshEntryPositions';
import { removeExtension } from '../extensions/removeExtension';
import { isValidExtension } from '@Validators/isValidExtension';
import { getFlightProfile } from '@Query/event/getFlightProfile';
import { addExtension } from '../extensions/addExtension';
import { findParticipant } from '@Acquire/findParticipant';
import { isUngrouped } from '@Query/entries/isUngrouped';

// Constants
import { INDIVIDUAL, PAIR, TEAM_PARTICIPANT } from '@Constants/participantConstants';
import { validStages } from '@Constants/drawDefinitionConstants';
import { DOUBLES, TEAM_EVENT } from '@Constants/eventConstants';
import { SUCCESS } from '@Constants/resultConstants';
import {
  ENTRY_STATUS_NOT_ALLOWED_FOR_EVENT,
  INVALID_ENTRY_STATUS,
  INVALID_PARTICIPANT_ID,
  MISSING_EVENT,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  MISSING_VALUE,
  INVALID_VALUES,
  INVALID_STAGE,
} from '@Constants/errorConditionConstants';
import {
  ALTERNATE,
  DRAW_SPECIFIC_STATUSES,
  EQUIVALENT_ACCEPTANCE_STATUSES,
  VALID_ENTRY_STATUSES,
  WITHDRAWN,
} from '@Constants/entryStatusConstants';

import {
  DrawDefinition,
  Entry,
  EntryStatusUnion,
  Event,
  Extension,
  StageTypeUnion,
  Tournament,
} from '@Types/tournamentTypes';

// disallow changing entryStatus to WITHDRAWN or UNGROUPED for assignedParticipants
type ModifyEntriesStatusArgs = {
  drawDefinition?: DrawDefinition;
  autoEntryPositions?: boolean;
  tournamentRecord: Tournament;
  entryStatus?: EntryStatusUnion;
  ignoreAssignment?: boolean;
  entryStage?: StageTypeUnion;
  participantIds: string[];
  extension?: Extension;
  eventSync?: boolean;
  drawId: string;
  stage?: StageTypeUnion;
  event?: Event;
};
export function modifyEntriesStatus({
  autoEntryPositions = true,
  ignoreAssignment, // override check for existing assignments
  tournamentRecord,
  drawDefinition,
  participantIds,
  entryStatus,
  entryStage,
  extension, // modify the specified extension (remove if value undefined)
  eventSync,
  drawId,
  stage,
  event,
}: ModifyEntriesStatusArgs) {
  if (!participantIds || !Array.isArray(participantIds))
    return {
      error: INVALID_PARTICIPANT_ID,
      method: 'modifyEntriesStatus',
      participantIds,
    };

  if (!drawDefinition && !event) return { error: MISSING_EVENT };
  if (entryStatus && !VALID_ENTRY_STATUSES.includes(entryStatus)) return { error: INVALID_ENTRY_STATUS };

  if (entryStage && !validStages.includes(entryStage)) return { error: INVALID_STAGE };

  const stack = 'modifyEntriesStatus';
  const modifiedDrawIds: string[] = [];

  if (!entryStatus && !extension)
    return decorateResult({
      result: { error: MISSING_VALUE },
      info: 'Missing entryStatus',
      stack,
    });

  if (extension && !isValidExtension({ extension, requiredAttributes: ['name'] }))
    // valid without value (will remove extension)
    return decorateResult({
      result: { error: INVALID_VALUES },
      info: 'Invalid extension',
      context: { extension },
      stack,
    });

  // build up an array of participantIds which are assigned positions in structures
  const assignedParticipantIds: string[] = [];
  event?.drawDefinitions?.forEach((drawDefinition) => {
    const participantIds =
      getAssignedParticipantIds({
        stages: stage && [stage],
        drawDefinition,
      }).assignedParticipantIds ?? [];
    assignedParticipantIds.push(...participantIds);
  });

  const tournamentParticipants = tournamentRecord?.participants ?? [];

  const validEntryStatusForAllParticipantIds = participantIds.every((participantId) => {
    const participantType = findParticipant({
      tournamentParticipants,
      participantId,
    })?.participantType;
    return (
      !(participantType && [PAIR, TEAM_PARTICIPANT].includes(participantType) && isUngrouped(entryStatus)) &&
      !(
        entryStatus &&
        event?.eventType &&
        participantType === INDIVIDUAL &&
        [DOUBLES, TEAM_EVENT].includes(event.eventType) &&
        [ALTERNATE, ...EQUIVALENT_ACCEPTANCE_STATUSES].includes(entryStatus)
      )
    );
  });

  if (!validEntryStatusForAllParticipantIds) return { error: INVALID_ENTRY_STATUS };

  const flightProfile = event && getFlightProfile({ event }).flightProfile;
  const flight = flightProfile?.flights?.find((flight) => flight.drawId === drawId);

  // ------------------------------------------------------------------------
  // reusable functions
  const updateEntryStatus = (entries?) => {
    const filteredEntries = (entries || [])
      // filter out entries by stage (if specified)
      .filter((entry: Entry) => {
        return !stage || !entry.entryStage || stage === entry.entryStage;
      })
      // filter by specified participantIds
      .filter(({ participantId }) => participantIds.includes(participantId));

    const isAssigned = (entry) =>
      entryStatus &&
      assignedParticipantIds.includes(entry.participantId) &&
      !(
        EQUIVALENT_ACCEPTANCE_STATUSES.includes(entry.entryStatus) &&
        EQUIVALENT_ACCEPTANCE_STATUSES.includes(entryStatus)
      );

    const success = filteredEntries.every((entry: Entry) => {
      if (isAssigned(entry) && !ignoreAssignment) return false;
      if (entryStatus) {
        entry.entryStatus = entryStatus;
        // since entryStatus has changed remove current entryPosition
        delete entry.entryPosition;
      }
      if (entryStage) {
        entry.entryStage = entryStage;
        // since entryStage has changed remove current entryPosition
        delete entry.entryPosition;
      }
      if (extension) {
        if (extension.value) {
          addExtension({ element: entry, extension });
        } else {
          removeExtension({ element: entry, name: extension.name });
        }
      }
      return true;
    });

    return success ? { ...SUCCESS } : { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };
  };

  const autoPosition = ({ flight, drawDefinition }) => {
    if (event) {
      event.entries = refreshEntryPositions({
        entries: event.entries ?? [],
      });
    }
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
  const updateDrawEntries = (params) => {
    const { flight, drawDefinition } = params;
    const stack = 'updateDrawEntries';
    if (flight) {
      const result = updateEntryStatus(flight.drawEntries);
      if (result.error) return decorateResult({ result, stack });
    }
    if (drawDefinition) {
      const result = updateEntryStatus(drawDefinition.entries);
      if (result.error) return decorateResult({ result, stack });

      if (!modifiedDrawIds.includes(drawDefinition.drawId)) modifiedDrawIds.push(drawDefinition.drawId);
    }
    return { ...SUCCESS };
  };

  // ------------------------------------------------------------------------
  // before modifying, if autoEntryPositions: true, pre-assign entryPositions
  const entryPositionsExist =
    event?.entries?.find(({ entryPosition }) => entryPosition) ??
    (flight?.drawEntries?.find(({ entryPosition }) => entryPosition) ||
      drawDefinition?.entries?.find(({ entryPosition }) => entryPosition));

  if (autoEntryPositions && !entryPositionsExist) autoPosition({ flight, drawDefinition });

  // ------------------------------------------------------------------------
  // if flight or drawDefinition scope modifications
  if (flight || drawDefinition) {
    const result = updateDrawEntries({ flight, drawDefinition });
    if (result.error) return decorateResult({ result, stack });
  }

  // ------------------------------------------------------------------------
  // update any flights which have no draw generated to keep entries in sync
  const generatedDrawIds = event?.drawDefinitions?.map(({ drawId }) => drawId) ?? [];
  const flightsNoDraw = flightProfile?.flights?.filter((flight) => !generatedDrawIds.includes(flight.drawId)) || [];

  for (const flight of flightsNoDraw) {
    const result = flight && updateDrawEntries({ flight });
    if (result?.error) return decorateResult({ result, stack });
  }

  // ------------------------------------------------------------------------
  const singleDraw =
    flightProfile?.flights?.length === 1 && (event?.drawDefinitions?.length ?? 0) <= flightProfile?.flights?.length;

  if (!flight && !drawDefinition && entryStatus && DRAW_SPECIFIC_STATUSES.includes(entryStatus)) {
    return { error: ENTRY_STATUS_NOT_ALLOWED_FOR_EVENT };
  }

  if (
    (!flight && !drawDefinition) ||
    entryStatus === WITHDRAWN ||
    (eventSync && singleDraw) // if there is only one draw keep event entries in sync
  ) {
    // if entryStatus is WITHDRAWN then participantIds appearing in ANY flight or drawDefinition must be removed

    const result = updateEntryStatus(event?.entries);
    if (result?.error) return decorateResult({ result, stack });

    let error;
    if (entryStatus === WITHDRAWN) {
      flightProfile?.flights?.every((flight) => {
        const result = updateEntryStatus(flight.drawEntries);
        if (result.error) {
          error = result.error;
          return false;
        }
        flight.drawEntries = flight.drawEntries.filter(({ participantId }) => !participantIds.includes(participantId));
        return true;
      });

      event?.drawDefinitions?.every((drawDefinition) => {
        const result = updateEntryStatus(drawDefinition.entries);
        if (result.error) {
          error = result.error;
          return false;
        }
        drawDefinition.entries = drawDefinition.entries?.filter(
          ({ participantId }) => !participantIds.includes(participantId),
        );
        return true;
      });
    }
    if (error) return decorateResult({ result: { error }, stack });
  }

  if (autoEntryPositions) autoPosition({ flight, drawDefinition });

  for (const drawDefinition of event?.drawDefinitions ?? []) {
    if (modifiedDrawIds.length && !modifiedDrawIds.includes(drawDefinition.drawId)) continue;

    modifyDrawNotice({
      tournamentId: tournamentRecord.tournamentId,
      eventId: event?.eventId,
      drawDefinition,
    });
  }

  return { ...SUCCESS };
}
