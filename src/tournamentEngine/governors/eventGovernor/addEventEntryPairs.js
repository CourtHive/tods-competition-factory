import { intersection } from '../../../utilities/arrays';
import { addParticipants } from '../participantGovernor/addParticipants';
import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { addEventEntries } from './addEventEntries';

import {
  INVALID_EVENT_TYPE,
  INVALID_PARTICIPANT_IDS,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { DOUBLES } from '../../../constants/matchUpTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import { ALTERNATE } from '../../../constants/entryStatusConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { MAIN } from '../../../constants/drawDefinitionConstants';

/**
 *
 * Add PAIR participant to an event
 * Creates new participantType: PAIR participants if necessary
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} eventId - tournamentEngine automatically retrieves event
 * @param {string[][]} participantIdPairs - array paired id arrays for all participants to add to event
 * @param {string} enryStatus - entryStatus enum, e.g. DIRECT_ACCEPTANCE, ALTERNATE, UNPAIRED
 * @param {string} entryStage - entryStage enum, e.g. QUALIFYING, MAIN
 *
 */
export function addEventEntryPairs({
  event,
  uuids,
  tournamentRecord,
  entryStage = MAIN,
  entryStatus = ALTERNATE,
  participantIdPairs = [],
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };
  if (event.eventType !== DOUBLES) return { error: INVALID_EVENT_TYPE };

  const tournamentParticipants = tournamentRecord.participants || [];
  const individualParticipantIds = tournamentParticipants
    .filter((participant) => participant.participantType === INDIVIDUAL)
    .map((participant) => participant.participantId);

  // insure all participants are present in the tournament record
  const invalidParticipantIds = individualParticipantIds.filter(
    (participantId) => !individualParticipantIds.includes(participantId)
  );
  if (invalidParticipantIds.length)
    return { error: INVALID_PARTICIPANT_IDS, invalidParticipantIds };

  // insure all participantIdPairs have two individual participantIds
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
  const provisionalParticipants = participantIdPairs.map(
    (individualParticipantIds) => ({
      participantId: uuids?.pop(),
      participantType: PAIR,
      participantRole: COMPETITOR,
      individualParticipantIds,
    })
  );

  // filter out existing participants
  const newParticipants = provisionalParticipants.filter((participant) => {
    return !existingParticipantIdPairs.find(
      (existing) =>
        intersection(existing, participant.individualParticipantIds).length ===
        2
    );
  });

  let message;
  if (newParticipants) {
    const result = addParticipants({
      tournamentRecord,
      participants: newParticipants,
    });

    if (result.error) return { error: result.error };
    message = result.message;
  }

  const pairParticipantIds = participantIdPairs
    .map((participantIds) => {
      const { participant } = getPairedParticipant({
        tournamentRecord,
        participantIds,
      });
      return participant;
    })
    .map((participant) => participant.participantId);

  const result = addEventEntries({
    event,
    entryStage,
    entryStatus,
    tournamentRecord,
    participantIds: pairParticipantIds,
  });

  return Object.assign({}, result, { message });
}
