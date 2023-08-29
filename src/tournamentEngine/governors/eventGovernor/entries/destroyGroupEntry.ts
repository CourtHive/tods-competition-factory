import { deleteParticipants } from '../../participantGovernor/deleteParticipants';
import { getStageEntries } from '../../../getters/participants/getStageEntries';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { getParticipantId } from '../../../../global/functions/extractors';
import { arrayIndices } from '../../../../utilities/arrays';
import { removeEventEntries } from './removeEventEntries';
import { addEventEntries } from './addEventEntries';

import { UNGROUPED } from '../../../../constants/entryStatusConstants';
import { TEAM, DOUBLES } from '../../../../constants/eventConstants';
import { PAIR } from '../../../../constants/participantConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  ErrorType,
  INVALID_EVENT_TYPE,
  INVALID_PARTICIPANT_TYPE,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_ENTRY_NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Tournament,
  Event,
  TypeEnum,
  ParticipantTypeEnum,
} from '../../../../types/tournamentFromSchema';

/**
 * When grouped participant entries are destroyed, individualParticipantIds will be added as { individualEntryStatus } participant entries
 *
 * @param {object} tournamentRecord - passed in by tournamentEngine
 * @param {string} participantId - id of TEAM/PAIR participant to remove
 * @param {string} eventId - resolved to { event } by tournamentEngine
 * @param {string} drawId - optional - resolved to { drawDefinition }
 * @param {boolean} removeGroupParticipant - whether to also remove grouping participant from tournamentRecord.participants
 *
 */

type DestroyGroupEntryArgs = {
  removeGroupParticipant?: boolean;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  participantId: string;
  drawId: string;
  stage?: string;
  event: Event;
};

export function destroyGroupEntry({
  removeGroupParticipant,
  tournamentRecord,
  drawDefinition,
  participantId,
  drawId,
  stage,
  event,
}: DestroyGroupEntryArgs): {
  success?: boolean;
  error?: ErrorType;
  participantRemoved?: boolean;
} {
  const stack = 'destroyGroupEntry';
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId)
    return decorateResult({ result: { error: MISSING_PARTICIPANT_ID }, stack });
  if (!event) return { error: MISSING_EVENT };

  if (
    !event.eventType ||
    ![TypeEnum.Doubles, TypeEnum.Team].includes(event.eventType)
  ) {
    return decorateResult({ result: { error: INVALID_EVENT_TYPE }, stack });
  }

  const tournamentParticipants = tournamentRecord.participants || [];
  const participant = tournamentParticipants.find(
    (participant) => participant.participantId === participantId
  );

  if (!participant) {
    return decorateResult({ result: { error: PARTICIPANT_NOT_FOUND }, stack });
  }

  if (
    !participant.participantType ||
    ![ParticipantTypeEnum.Pair, ParticipantTypeEnum.Team].includes(
      participant.participantType
    ) ||
    (participant.participantType === TEAM && event.eventType !== TEAM) ||
    (participant.participantType === PAIR && event.eventType !== DOUBLES)
  ) {
    return { error: INVALID_PARTICIPANT_TYPE };
  }

  const eventEntries = event.entries || [];
  const entry = eventEntries.find(
    (entry) => entry.participantId === participantId
  );
  if (!entry) return { error: PARTICIPANT_ENTRY_NOT_FOUND };

  const { stageEntries } = getStageEntries({
    selected: false,
    drawDefinition,
    drawId,
    event,
    stage,
  });
  const groupedParticipantIds = stageEntries.map(getParticipantId);
  const individualParticipantIdsInGroups = tournamentParticipants
    .filter(({ participantId }) =>
      groupedParticipantIds.includes(participantId)
    )
    .map(({ individualParticipantIds }) => individualParticipantIds)
    .flat()
    .filter(Boolean);

  // find only those individualParticipantIds which do not occur MULTIPLE TIMES in PAIRs/GROUPs in the event.entries or drawEntries
  // this scenario can occur in e.g. ITA tournaments where an individual participant is paired multiple times across flights
  const individualParticipantIds = participant.individualParticipantIds?.filter(
    (participantId) =>
      arrayIndices(participantId, individualParticipantIdsInGroups).length === 1
  );

  // const individualParticipantIds = participant.individualParticipantIds;

  // remove the group participant from event entries
  let result = removeEventEntries({
    participantIds: [participantId],
    tournamentRecord,
    event,
  });
  if (result.error) return result;

  if (individualParticipantIds?.length) {
    result = addEventEntries({
      participantIds: individualParticipantIds,
      entryStatus: UNGROUPED,
      entryStage: entry.entryStage,
      tournamentRecord,
      drawDefinition,
      drawId,
      event,
    });
    if (result.error) return result;
  }

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
