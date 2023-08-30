import { getPairedParticipant } from '../../participantGovernor/getPairedParticipant';
import { addParticipants } from '../../participantGovernor/addParticipants';
import { getParticipantId } from '../../../../global/functions/extractors';
import { addNotice } from '../../../../global/state/globalState';
import { intersection } from '../../../../utilities/arrays';
import { addEventEntries } from './addEventEntries';

import { INDIVIDUAL, PAIR } from '../../../../constants/participantConstants';
import { ADD_PARTICIPANTS } from '../../../../constants/topicConstants';
import { ALTERNATE } from '../../../../constants/entryStatusConstants';
import { COMPETITOR } from '../../../../constants/participantRoles';
import { DOUBLES } from '../../../../constants/matchUpTypes';
import { UUID } from '../../../../utilities';
import {
  INVALID_EVENT_TYPE,
  INVALID_PARTICIPANT_IDS,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  EntryStatusEnum,
  Event,
  StageTypeEnum,
  Tournament,
} from '../../../../types/tournamentFromSchema';

/**
 *
 * Add PAIR participant to an event
 * Creates new { participantType: PAIR } participants if necessary
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} eventId - tournamentEngine automatically retrieves event
 * @param {string[][]} participantIdPairs - array paired id arrays for all participants to add to event
 * @param {string} enryStatus - entryStatus enum
 * @param {string} entryStage - entryStage enum
 *
 */

type AddEventEntryPairsArgs = {
  allowDuplicateParticipantIdPairs?: boolean;
  participantIdPairs?: string[][];
  entryStatus?: EntryStatusEnum;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  entryStage?: StageTypeEnum;
  uuids?: string[];
  event: Event;
};
export function addEventEntryPairs({
  allowDuplicateParticipantIdPairs,
  entryStage = StageTypeEnum.Main,
  entryStatus = ALTERNATE,
  participantIdPairs = [],
  tournamentRecord,
  drawDefinition,
  event,
  uuids,
}: AddEventEntryPairsArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };
  if (event.eventType !== DOUBLES) return { error: INVALID_EVENT_TYPE };

  const tournamentParticipants = tournamentRecord.participants || [];
  const individualParticipantIds: string[] = tournamentParticipants
    .filter((participant) => participant.participantType === INDIVIDUAL)
    .map((participant) => participant.participantId);

  // ensure all participants are present in the tournament record
  const invalidParticipantIds = individualParticipantIds.filter(
    (participantId) => !individualParticipantIds.includes(participantId)
  );
  if (invalidParticipantIds.length)
    return { error: INVALID_PARTICIPANT_IDS, invalidParticipantIds };

  // ensure all participantIdPairs have two individual participantIds
  const invalidParticipantIdPairs = participantIdPairs.filter(
    (pair) => pair.length !== 2
  );
  if (invalidParticipantIdPairs.length)
    return { error: INVALID_PARTICIPANT_IDS, invalidParticipantIdPairs };

  // make an array of all existing PAIR participantIds
  const existingParticipantIdPairs = tournamentParticipants
    .filter((participant) => participant.participantType === PAIR)
    .map((participant) => participant.individualParticipantIds);

  // create provisional participant objects
  const provisionalParticipants: any[] = participantIdPairs.map(
    (individualParticipantIds) => ({
      participantId: uuids?.pop() || UUID(),
      participantRole: COMPETITOR,
      individualParticipantIds,
      participantType: PAIR,
    })
  );

  // filter out existing participants unless allowDuplicateParticipantIdPairs is true
  const newParticipants = allowDuplicateParticipantIdPairs
    ? provisionalParticipants
    : provisionalParticipants.filter((participant) => {
        return !existingParticipantIdPairs.find(
          (existing) =>
            intersection(existing, participant.individualParticipantIds)
              .length === 2
        );
      });

  let info;
  let addedParticipants: any[] = [];
  if (newParticipants) {
    const result = addParticipants({
      allowDuplicateParticipantIdPairs,
      participants: newParticipants,
      returnParticipants: true,
      tournamentRecord,
    });
    if (result.error) return result;
    addedParticipants = result.participants || [];
    info = result.info;
  }

  const pairParticipantIds = participantIdPairs
    .map((participantIds) => {
      const addedParticipant = addedParticipants.find(
        (addedPair) =>
          intersection(addedPair.individualParticipantIds, participantIds)
            .length === 2
      );
      if (addedParticipant) return addedParticipant;

      const { participant } = getPairedParticipant({
        tournamentRecord,
        participantIds,
      });
      return participant;
    })
    .map((participant) => participant.participantId);

  const result = addEventEntries({
    participantIds: pairParticipantIds,
    tournamentRecord,
    drawDefinition,
    entryStatus,
    entryStage,
    event,
  });

  if (newParticipants.length) {
    addNotice({ topic: ADD_PARTICIPANTS, participants: newParticipants });
  }

  const newParticipantIds = newParticipants.map(getParticipantId);

  return { ...result, info, newParticipantIds };
}
