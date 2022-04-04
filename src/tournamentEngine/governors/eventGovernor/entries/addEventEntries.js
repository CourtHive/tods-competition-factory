import { refreshEntryPositions } from '../../../../global/functions/producers/refreshEntryPositions';
import { isUngrouped } from '../../../../global/functions/isUngrouped';
import { addDrawEntries } from '../drawDefinitions/addDrawEntries';
import { removeEventEntries } from './removeEventEntries';

import { INDIVIDUAL, PAIR, TEAM } from '../../../../constants/participantTypes';
import { DIRECT_ACCEPTANCE } from '../../../../constants/entryStatusConstants';
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
    entryStatus = DIRECT_ACCEPTANCE,
    autoEntryPositions = true,
    participantIds = [],
    entryStageSequence,
    entryStage = MAIN,
    tournamentRecord,
    ignoreStageSpace,
    drawDefinition,
    drawId,
    event,
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
        if (
          event.eventType === TEAM &&
          (participant.participantType === TEAM ||
            (isUngrouped(entryStatus) &&
              participant.participantType === INDIVIDUAL))
        ) {
          return true;
        }
        return false;
      })
      .map((participant) => participant.participantId) || [];

  const validParticipantIds = participantIds.filter(
    (participantId) =>
      !typedParticipantIds.length || typedParticipantIds.includes(participantId)
  );

  if (!event.entries) event.entries = [];
  const existingIds = event.entries.map(
    (e) => e.participantId || (e.participant && e.participant.participantId)
  );

  validParticipantIds.forEach((participantId) => {
    if (!existingIds.includes(participantId)) {
      const entry = {
        participantId,
        entryStatus,
        entryStage,
      };
      if (entryStageSequence) entry.entryStageSequence = entryStageSequence;
      event.entries.push(entry);
    }
  });

  let message;
  if (drawId && !isUngrouped(entryStage)) {
    const result = addDrawEntries({
      participantIds: validParticipantIds,
      autoEntryPositions,
      entryStageSequence,
      ignoreStageSpace,
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
    const enteredParticipantIds = (event.entries || []).map(
      (entry) => entry.participantId
    );
    const unpairedIndividualParticipantIds = (event.entries || [])
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
      entries: event.entries || [],
    });
  }

  return !invalidParticipantIds
    ? Object.assign({ message }, SUCCESS)
    : { error: INVALID_PARTICIPANT_IDS };
}
