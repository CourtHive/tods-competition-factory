import { refreshEntryPositions } from '../../../../common/producers/refreshEntryPositions';
import { addDrawEntries } from '../drawDefinitions/addDrawEntries';
import { isUngrouped } from '../../../../global/isUngrouped';
import { removeEventEntries } from './removeEventEntries';

import { DIRECT_ACCEPTANCE } from '../../../../constants/entryStatusConstants';
import { INDIVIDUAL, PAIR, TEAM } from '../../../../constants/participantTypes';
import { DOUBLES, SINGLES } from '../../../../constants/matchUpTypes';
import { MAIN } from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  INVALID_PARTICIPANT_IDS,
  MISSING_EVENT,
  MISSING_PARTICIPANT_IDS,
} from '../../../../constants/errorConditionConstants';

/**
 *
 * Add entries into an event; optionally add to specified drawDefinition/flightProfile, if possible.
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} eventId - tournamentEngine automatically retrieves event
 * @param {string} drawId - optional - also add to drawDefinition.entries & flightProfile.drawEntries (if possible)
 * @param {string[]} participantIds - ids of all participants to add to event
 * @param {string} enryStatus - entryStatus enum
 * @param {string} entryStage - entryStage enum
 *
 */
export function addEventEntries(params) {
  const {
    tournamentRecord,
    drawDefinition,
    drawId,
    event,

    participantIds = [],
    entryStatus = DIRECT_ACCEPTANCE,
    entryStage = MAIN,

    autoEntryPositions = true,
  } = params;

  if (!event) return { error: MISSING_EVENT };
  if (!participantIds || !participantIds.length) {
    return { error: MISSING_PARTICIPANT_IDS };
  }

  if (!event || !event.eventId) return { error: EVENT_NOT_FOUND };

  const typedParticipantIds =
    tournamentRecord?.participants
      ?.filter((participant) => {
        if (
          event.eventType === SINGLES &&
          participant.participantType === INDIVIDUAL
        ) {
          return true;
        }
        if (
          event.eventType === DOUBLES &&
          participant.participantType === PAIR
        ) {
          return true;
        }
        if (
          event.eventType === DOUBLES &&
          participant.participantType === INDIVIDUAL &&
          isUngrouped(entryStatus)
        ) {
          return true;
        }
        if (event.eventType === TEAM && participant.participantType === TEAM) {
          return true;
        }
        return false;
      })
      .map((participant) => participant.participantId) || [];

  const validParticipantIds =
    !typedParticipantIds.length ||
    participantIds.filter((participantId) =>
      typedParticipantIds.includes(participantId)
    );

  if (!event.entries) event.entries = [];
  const existingIds = event.entries.map(
    (e) => e.participantId || (e.participant && e.participant.participantId)
  );

  validParticipantIds.forEach((participantId) => {
    if (!existingIds.includes(participantId)) {
      event.entries.push({
        participantId,
        entryStatus,
        entryStage,
      });
    }
  });

  let message;
  if (drawId) {
    const result = addDrawEntries({
      participantIds: validParticipantIds,
      autoEntryPositions,
      drawDefinition,
      entryStatus,
      entryStage,
      drawId,
      event,
    });

    // Ignore error if drawId is included but entry can't be added to drawDefinition/flightProfile
    // return error as message to client
    if (result.error) {
      message = result.error;
    }
  }

  // now remove any unpaired participantIds which exist as part of added paired participants
  if (event.eventType === DOUBLES) {
    const enteredParticipantIds = event.entries.map(
      (entry) => entry.participantId
    );
    const unpairedIndividualParticipantIds = event.entries
      .filter((entry) => isUngrouped(entry.entryStatus))
      .map((entry) => entry.participantId);
    const tournamentParticipants = tournamentRecord?.participants || [];
    const pairedIndividualParticipantIds = tournamentParticipants
      .filter(
        (participant) =>
          enteredParticipantIds.includes(participant.participantId) &&
          participant.participantType === PAIR
      )
      .map((participant) => participant.individualParticipantIds)
      .flat(Infinity);
    const unpairedParticipantIdsToRemove =
      unpairedIndividualParticipantIds.filter((participantId) =>
        pairedIndividualParticipantIds.includes(participantId)
      );
    if (unpairedParticipantIdsToRemove.length) {
      removeEventEntries({
        tournamentRecord,
        participantIds: unpairedParticipantIdsToRemove,
        autoEntryPositions: false, // because the method will be called below if necessary
        event,
      });
    }
  }

  const invalidParticipantIds = !!(
    validParticipantIds.length !== participantIds.length
  );

  if (autoEntryPositions) {
    event.entries = refreshEntryPositions({
      entries: event.entries,
    });
  }

  return !invalidParticipantIds
    ? Object.assign({ message }, SUCCESS)
    : { error: INVALID_PARTICIPANT_IDS };
}
