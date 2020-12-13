import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { addParticipants } from '../participantGovernor/addParticipants';
import { intersection } from '../../../utilities/arrays';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
  INVALID_PARTICIPANT_IDS,
} from '../../../constants/errorConditionConstants';

import {
  DIRECT_ACCEPTANCE,
  UNPAIRED,
} from '../../../constants/entryStatusConstants';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import { MAIN } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

// TODO: untested
export function modifyEventEntries({
  event,
  tournamentRecord,
  entryStage = MAIN,
  participantIdPairs = [],
  unpairedParticipantIds = [],
  entryStatus = DIRECT_ACCEPTANCE,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const tournamentParticipants = tournamentRecord.particpants || [];
  const individualParticipantIds = tournamentParticipants
    .filter((participant) => participant.participantType === INDIVIDUAL)
    .map((participant) => participant.participantId);

  // concat all incoming INDIVIDUAL participantIds
  const incomingIndividualParticipantIds = unpairedParticipantIds
    .concat(...participantIdPairs)
    .flat(Infinity);

  // insure all participants are present in the tournament record
  const invalidParticipantIds = incomingIndividualParticipantIds.filter(
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

  // make an array of all existing PAIR partiicpantIds
  const existingParticipantIdPairs = tournamentParticipants
    .filter((participant) => participant.participantType === PAIR)
    .map((participant) => participant.individualParticipantIds);

  // determine participantIdPairs which do not already exist
  const newParticipantIdPairs = participantIdPairs.filter(
    (incoming) =>
      !existingParticipantIdPairs.find(
        (existing) => intersection(existing, incoming).length === 2
      )
  );

  // create new participant objects
  const newParticipants = newParticipantIdPairs.map(
    (individualParticipantIds) => ({
      participantType: PAIR,
      participantRole: COMPETITOR,
      individualParticipantIds,
    })
  );

  const result = addParticipants({
    tournamentRecord,
    participants: newParticipants,
  });

  if (result.error) return { error: result.error };

  // get all participantIds for PAIR participants
  const pairParticipantEntries = participantIdPairs
    .map((participantIds) => {
      const { participant } = getPairedParticipant({
        tournamentRecord,
        participantIds,
      });
      return participant;
    })
    .map((participantId) => ({
      participantId,
      entryStatus,
      entryStage,
    }));

  const unpairedParticipantEntries = unpairedParticipantIds.map(
    (participantId) => ({
      entryStatus: UNPAIRED,
      participantId,
      entryStage,
    })
  );

  event.entries = event.entries.filter(
    (entry) => entry.entryStage === entryStage
  );

  event.entries = event.entries.concat(
    ...pairParticipantEntries,
    ...unpairedParticipantEntries
  );

  return SUCCESS;
}
