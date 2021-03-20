import { addDrawEntries } from '../../../../drawEngine/governors/entryGovernor/addDrawEntries';
import { getMaxEntryPosition } from '../../../../deducers/getMaxEntryPosition';
import { removeEventEntries } from './removeEventEntries';

import { SUCCESS } from '../../../../constants/resultConstants';
import { MAIN } from '../../../../constants/drawDefinitionConstants';
import {
  DIRECT_ACCEPTANCE,
  UNPAIRED,
} from '../../../../constants/entryStatusConstants';
import { DOUBLES, SINGLES } from '../../../../constants/matchUpTypes';
import { INDIVIDUAL, PAIR, TEAM } from '../../../../constants/participantTypes';
import {
  EVENT_NOT_FOUND,
  INVALID_PARTICIPANT_IDS,
  MISSING_EVENT,
  MISSING_PARTICIPANT_IDS,
} from '../../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} eventId - tournamentEngine automatically retrieves event
 * @param {string[]} participantIds - ids of all participants to add to event
 * @param {string} enryStatus - entryStatus enum, e.g. DIRECT_ACCEPTANCE, ALTERNATE, UNPAIRED
 * @param {string} entryStage - entryStage enum, e.g. QUALIFYING, MAIN
 *
 */
export function addEventEntries(props) {
  const {
    tournamentRecord,
    drawDefinition,
    drawId,
    event,

    participantIds = [],
    entryStatus = DIRECT_ACCEPTANCE,
    entryStage = MAIN,

    autoEntryPositions = true,
  } = props;

  if (!event) return { error: MISSING_EVENT };
  if (!participantIds || !participantIds.length) {
    return { error: MISSING_PARTICIPANT_IDS };
  }

  if (!event || !event.eventId) return { error: EVENT_NOT_FOUND };

  const typedParticipantIds = tournamentRecord?.participants
    ?.filter((participant) => {
      if (
        event.eventType === SINGLES &&
        participant.participantType === INDIVIDUAL
      ) {
        return true;
      }
      if (event.eventType === DOUBLES && participant.participantType === PAIR) {
        return true;
      }
      if (
        event.eventType === DOUBLES &&
        participant.participantType === INDIVIDUAL &&
        entryStatus === UNPAIRED
      ) {
        return true;
      }
      if (event.eventType === TEAM && participant.participantType === TEAM) {
        return true;
      }
      return false;
    })
    .map((participant) => participant.participantId);

  const validParticipantIds = participantIds.filter((participantId) =>
    typedParticipantIds.includes(participantId)
  );

  if (!event.entries) event.entries = [];
  const existingIds = event.entries.map(
    (e) => e.participantId || (e.participant && e.participant.participantId)
  );

  let maxEntryPosition = getMaxEntryPosition({
    entries: event.entries,
    stage: entryStage,
    entryStatus,
  });
  validParticipantIds.forEach((participantId) => {
    if (!existingIds.includes(participantId)) {
      let entryPosition;
      if (autoEntryPositions) {
        entryPosition = maxEntryPosition + 1;
        maxEntryPosition++;
      }
      event.entries.push({
        participantId,
        entryPosition,
        entryStatus,
        entryStage,
      });
    }
  });
  if (drawId) {
    addDrawEntries({
      drawId,
      drawDefinition,
      participantIds: validParticipantIds,
      entryStatus,
      entryStage,
    });
  }

  // now remove any unpaired participantIds which exist as part of added paired participants
  if (event.eventType === DOUBLES) {
    const enteredParticipantIds = event.entries.map(
      (entry) => entry.participantId
    );
    const unpairedIndividualParticipantIds = event.entries
      .filter((entry) => entry.entryStatus === UNPAIRED)
      .map((entry) => entry.participantId);
    const tournamentParticipants = tournamentRecord.participants || [];
    const pairedIndividualParticipantIds = tournamentParticipants
      .filter(
        (participant) =>
          enteredParticipantIds.includes(participant.participantId) &&
          participant.participantType === PAIR
      )
      .map((participant) => participant.individualParticipantIds)
      .flat(Infinity);
    const unpairedParticipantIdsToRemove = unpairedIndividualParticipantIds.filter(
      (participantId) => pairedIndividualParticipantIds.includes(participantId)
    );
    if (unpairedParticipantIdsToRemove.length) {
      removeEventEntries({
        participantIds: unpairedParticipantIdsToRemove,
        event,
      });
    }
  }

  const invalidParticipantIds = !!(
    validParticipantIds.length !== participantIds.length
  );

  return !invalidParticipantIds ? SUCCESS : { error: INVALID_PARTICIPANT_IDS };
}
