import { getPairedParticipant } from '../../query/participant/getPairedParticipant';
import { getParticipantId } from '../../global/functions/extractors';
import { addParticipants } from '../participants/addParticipants';
import { stringSort } from '../../functions/sorters/stringSort';
import { addNotice } from '../../global/state/globalState';
import { intersection } from '../../utilities/arrays';
import { addEventEntries } from './addEventEntries';
import { UUID } from '../../utilities/UUID';

import { INDIVIDUAL, PAIR } from '../../constants/participantConstants';
import { ADD_PARTICIPANTS } from '../../constants/topicConstants';
import { ALTERNATE } from '../../constants/entryStatusConstants';
import { COMPETITOR } from '../../constants/participantRoles';
import { MAIN } from '../../constants/drawDefinitionConstants';
import { DOUBLES } from '../../constants/matchUpTypes';
import {
  INVALID_EVENT_TYPE,
  INVALID_PARTICIPANT_IDS,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';
import {
  DrawDefinition,
  EntryStatusUnion,
  Event,
  StageTypeUnion,
  Tournament,
} from '../../types/tournamentTypes';
import { ANY, FEMALE, MALE, MIXED } from '../../constants/genderConstants';

/**
 * Add PAIR participant to an event
 * Creates new { participantType: PAIR } participants if necessary
 */

type AddEventEntryPairsArgs = {
  allowDuplicateParticipantIdPairs?: boolean;
  participantIdPairs?: string[][];
  entryStatus?: EntryStatusUnion;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  entryStage?: StageTypeUnion;
  uuids?: string[];
  event: Event;
};
export function addEventEntryPairs({
  allowDuplicateParticipantIdPairs,
  entryStage = MAIN,
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

  const existingParticipantIdPairs: string[][] = [];
  const genderMap = new Map<string, string>();

  for (const participant of tournamentRecord.participants ?? []) {
    const { participantType, participantId, person, individualParticipantIds } =
      participant;
    if (participantType === INDIVIDUAL && person?.sex) {
      genderMap.set(participantId, person.sex);
    } else if (participantType === PAIR && individualParticipantIds) {
      existingParticipantIdPairs.push(individualParticipantIds);
    }
  }

  // ensure all participantIdPairs have two individual participantIds
  const invalidParticipantIdPairs = participantIdPairs.filter((pair) => {
    // invalid if not two participantIds
    if (pair.length !== 2) return true;
    // invalid if either participantId does not exist
    if (!genderMap.has(pair[0]) || !genderMap.has(pair[1])) return true;
    // NOT invalid if event.gender is ANY or no gender is specified
    if (!event.gender || event.gender === ANY) return false;

    const participantGenders = pair.map((id) => genderMap.get(id));
    // invalid if event.gender is MALE/FEMALE and both participants do not match
    let invalidParticiapntGenders =
      (event.gender === MALE &&
        (participantGenders[0] !== MALE || participantGenders[1] !== MALE)) ||
      (event.gender === FEMALE &&
        (participantGenders[0] !== FEMALE || participantGenders[1] !== FEMALE));

    // invalid if event.gender is MIXED and participant genders are not different
    if (event.gender === MIXED) {
      participantGenders.sort(stringSort);
      if (participantGenders[0] !== FEMALE || participantGenders[1] !== MALE)
        invalidParticiapntGenders = true;
    }

    return invalidParticiapntGenders;
  });

  if (invalidParticipantIdPairs.length)
    return { error: INVALID_PARTICIPANT_IDS, invalidParticipantIdPairs };

  // create provisional participant objects
  const provisionalParticipants: any[] = participantIdPairs.map(
    (individualParticipantIds) => ({
      participantId: uuids?.pop() ?? UUID(),
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
    addNotice({
      payload: { participants: newParticipants },
      topic: ADD_PARTICIPANTS,
    });
  }

  const newParticipantIds = newParticipants.map(getParticipantId);

  return { ...result, info, newParticipantIds };
}
