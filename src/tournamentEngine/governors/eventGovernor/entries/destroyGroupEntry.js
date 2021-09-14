import { deleteParticipants } from '../../participantGovernor/deleteParticipants';
import { getStageEntries } from '../../../getters/participants/getStageEntries';
import { removeEventEntries } from './removeEventEntries';
import { addEventEntries } from './addEventEntries';

import { UNGROUPED } from '../../../../constants/entryStatusConstants';
import { TEAM, DOUBLES } from '../../../../constants/eventConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { GROUP, PAIR } from '../../../../constants/participantTypes';
import {
  INVALID_EVENT_TYPE,
  INVALID_PARTICIPANT_TYPE,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_ENTRY_NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import { indices } from '../../../../utilities/arrays';

/**
 * When grouped participant entries are destroyed, individualParticipantIds will be added as { individualEntryStatus } participant entries
 *
 * @param {object} tournamentRecord - passed in by tournamentEngine
 * @param {string} participantId - id of TEAM/PAIR participant to remove
 * @param {string} eventId - resolved to { event } by tournamentEngine
 * @param {string} drawId - optional - resolved to { drawDefinition }
 * @param {string} entryStatus - assign to individuals removed from destroyed team
 * @param {boolean} removeGroupParticipant - whether to also remove grouping participant from tournamentRecord.participants
 *
 */

export function destroyGroupEntry({
  removeGroupParticipant,
  tournamentRecord,
  drawDefinition,
  participantId,
  entryStatus,
  drawId,
  stage,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!event) return { error: MISSING_EVENT };
  if (![DOUBLES, TEAM].includes(event.eventType)) {
    return { error: INVALID_EVENT_TYPE };
  }

  const tournamentParticipants = tournamentRecord.participants || [];
  const { stageEntries } = getStageEntries({
    entryTypes: [PAIR, GROUP],
    drawDefinition,
    drawId,
    event,
    stage,
  });

  const groupedParticipantIds = stageEntries.map(
    ({ participantId }) => participantId
  );
  const individualParticipantIdsInGroups = tournamentParticipants
    .filter(({ participantId }) =>
      groupedParticipantIds.includes(participantId)
    )
    .map(({ individualParticipantIds }) => individualParticipantIds)
    .flat()
    .filter(Boolean);

  const participant = tournamentParticipants.find(
    (participant) => participant.participantId === participantId
  );

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  if (
    ![PAIR, TEAM].includes(participant.participantType) ||
    (participant.participantType === TEAM && event.eventType !== TEAM) ||
    (participant.participantType === PAIR && event.eventType !== DOUBLES)
  ) {
    return { error: INVALID_PARTICIPANT_TYPE };
  }

  const defaultEntryStatus = UNGROUPED;

  const eventEntries = event.entries || [];
  const entry = eventEntries.find(
    (entry) => entry.participantId === participantId
  );
  if (!entry) return { error: PARTICIPANT_ENTRY_NOT_FOUND };

  // remove the group participant from event entries
  let result = removeEventEntries({
    event,
    drawId,
    drawDefinition,
    tournamentRecord,
    participantIds: [participantId],
  });
  if (result.error) return result;

  // find only those individualParticipantIds which do not occur MULTIPLE TIMES in PAIRs/GROUPs in the event.entries or drawEntries
  // this scenario can occur in e.g. ITA tournaments where an individual participant is paired multiple times across flights
  const individualParticipantIds = participant.individualParticipantIds.filter(
    (participantId) =>
      indices(participantId, individualParticipantIdsInGroups).length === 1
  );

  result = addEventEntries({
    event,
    drawId,
    drawDefinition,
    tournamentRecord,
    entryStage: entry.entryStage,
    entryStatus: entryStatus || defaultEntryStatus,
    participantIds: individualParticipantIds,
  });
  if (result.error) return result;

  let participantRemoved;
  if (removeGroupParticipant) {
    const result = deleteParticipants({
      tournamentRecord,
      participantIds: [participantId],
    });
    if (result.success) participantRemoved = true;
  }

  return { ...SUCCESS, participantRemoved };
}
