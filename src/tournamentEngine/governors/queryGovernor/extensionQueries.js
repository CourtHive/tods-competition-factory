import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { decorateResult } from '../../../global/functions/decorateResult';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';

const stack = 'extensionQueries';

export function findExtension({ element, name }) {
  if (!element || !name)
    return decorateResult({ result: { error: MISSING_VALUE }, stack });
  if (!Array.isArray(element.extensions)) return { info: NOT_FOUND };

  const extension = element.extensions.find(
    (extension) => extension?.name === name
  );

  const info = !extension ? NOT_FOUND : undefined;

  return { extension, info };
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
  if (!event)
    return decorateResult({ result: { error: MISSING_EVENT }, stack });
  return findExtension({ element: event, name });
}

/**
 *
 * @param {string} drawId - tournamentEngine will resolve drawId to draw
 * @param {string} name
 *
 */
export function findDrawDefinitionExtension({ drawDefinition, name }) {
  if (!drawDefinition)
    return decorateResult({
      result: { error: MISSING_DRAW_DEFINITION },
      stack,
    });
  return findExtension({ element: drawDefinition, name });
}

export function findParticipantExtension({
  tournamentRecord,
  participantId,
  name,
}) {
  if (!tournamentRecord)
    return decorateResult({
      result: { error: MISSING_TOURNAMENT_RECORD },
      stack,
    });
  if (!participantId)
    return decorateResult({ result: { error: MISSING_PARTICIPANT_ID }, stack });

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });
  return findExtension({ element: participant, name });
}
