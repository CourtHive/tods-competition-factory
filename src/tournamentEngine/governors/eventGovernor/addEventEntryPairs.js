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
  tournamentRecord,
  entryStage = MAIN,
  participantIdPairs = [],
  entryStatus = ALTERNATE,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };
  if (event.eventType !== DOUBLES) return { error: INVALID_EVENT_TYPE };

  const tournamentParticipants = tournamentRecord.particpants || [];
  const individualParticipantIds = tournamentParticipants
    .filter(participant => participant.participantType === INDIVIDUAL)
    .map(participant => participant.participantId);

  // insure all participants are present in the tournament record
  const invalidParticipantIds = individualParticipantIds.filter(
    participantId => !individualParticipantIds.includes(participantId)
  );
  if (invalidParticipantIds.length)
    return { error: INVALID_PARTICIPANT_IDS, invalidParticipantIds };

  // insure all participantIdPairs have two individual participantIds
  const invalidParticipantIdPairs = participantIdPairs.filter(
    pair => pair.length !== 2
  );
  if (invalidParticipantIdPairs.length)
    return { error: INVALID_PARTICIPANT_IDS, invalidParticipantIdPairs };

  // make an array of all existing PAIR partiicpantIds
  const existingParticipantIdPairs = tournamentParticipants
    .filter(participant => participant.participantType === PAIR)
    .map(participant => participant.individualParticipantIds);

  // determine participantIdPairs which do not already exist
  const newParticipantIdPairs = participantIdPairs.filter(
    incoming =>
      !existingParticipantIdPairs.find(
        existing => intersection(existing, incoming).length === 2
      )
  );

  // create new participant objects
  const newParticipants = newParticipantIdPairs.map(
    individualParticipantIds => ({
      participantType: PAIR,
      participantRole: COMPETITOR,
      individualParticipantIds,
    })
  );

  if (newParticipants) {
    const result = addParticipants({
      tournamentRecord,
      participants: newParticipants,
    });

    if (result.error) return { error: result.error };
  }

  const pairParticipantIds = participantIdPairs
    .map(participantIds => {
      const { participant } = getPairedParticipant({
        tournamentRecord,
        participantIds,
      });
      return participant;
    })
    .map(participant => participant.participantId);

  return addEventEntries({
    event,
    entryStage,
    entryStatus,
    tournamentRecord,
    participantIds: pairParticipantIds,
  });
}
