import {
  MISSING_DRAW_DEFINITION,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { findTournamentParticipant } from '../../getters/participants/participantGetter';

export function findExtension({ element, name }) {
  if (!element || !name) return { error: MISSING_VALUE };
  if (Array.isArray(element.extensions)) return { message: NOT_FOUND };

  const extension = element.extensions.find(
    (extension) => extension?.name === name
  );
  return { extension };
}

export function findTournamentExtension({ tournamentRecord, name }) {
  return findExtension({ element: tournamentRecord, name });
}

/**
 *
 * @param {string} eventId - tournamentEngine will resolve eventId to event
 * @param {string} name
 *
 */
export function findEventExtension({ event, name }) {
  if (!event) return { error: MISSING_EVENT };
  return findExtension({ element: event, name });
}

/**
 *
 * @param {string} drawId - tournamentEngine will resolve drawId to draw
 * @param {string} name
 *
 */
export function findDrawExtension({ drawDefinition, name }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  return findExtension({ element: drawDefinition, name });
}

export function findParticipantExtension({
  tournamentRecord,
  participantId,
  name,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });
  return findExtension({ element: participant, name });
}
