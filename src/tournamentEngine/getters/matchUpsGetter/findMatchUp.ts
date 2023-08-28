import { findMatchUp as drawEngineFindMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { makeDeepCopy } from '../../../utilities/makeDeepCopy';
import { hydrateParticipants } from './hydrateParticipants';
import { allTournamentMatchUps } from './matchUpsGetter';
import { getContextContent } from '../getContextContent';
import { findEvent } from '../eventGetter';

import {
  DrawDefinition,
  Tournament,
  Event,
} from '../../../types/tournamentFromSchema';
import {
  DRAW_DEFINITION_NOT_FOUND,
  MATCHUP_NOT_FOUND,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function publicFindMatchUp(params) {
  Object.assign(params, { inContext: true });
  const { matchUp, error } = findMatchUp(params);
  return { matchUp: makeDeepCopy(matchUp, true, true), error };
}

type FindMatchUpType = {
  tournamentRecord: Tournament;
  drawDefinition?: DrawDefinition;
  participantsProfile?: any;
  afterRecoveryTimes?: any;
  contextContent?: any;
  contextProfile?: any;
  inContext?: boolean;
  matchUpId: string;
  eventId?: string;
  drawId?: string;
  event?: Event;
};
export function findMatchUp({
  participantsProfile,
  afterRecoveryTimes,
  tournamentRecord,
  contextContent,
  contextProfile,
  drawDefinition,
  matchUpId,
  inContext,
  eventId,
  drawId,
  event,
}: FindMatchUpType) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (typeof matchUpId !== 'string') return { error: MISSING_MATCHUP_ID };

  if (!drawDefinition || !event) {
    const { matchUps } = allTournamentMatchUps({ tournamentRecord });

    const inContextMatchUp = matchUps.find(
      (matchUp) => matchUp.matchUpId === matchUpId
    );
    if (!inContextMatchUp) return { error: MATCHUP_NOT_FOUND };

    // since drawEngineFindMatchUp is being used, additional context needs to be provided
    ({ eventId, drawId } = inContextMatchUp);
    ({ event, drawDefinition } = findEvent({
      tournamentRecord,
      eventId,
      drawId,
    }));
  }

  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  if (contextProfile && !contextContent)
    contextContent = getContextContent({ tournamentRecord, contextProfile });

  const additionalContext = {
    surfaceCategory: event?.surfaceCategory || tournamentRecord.surfaceCategory,
    indoorOutDoor: event?.indoorOutdoor || tournamentRecord.indoorOutdoor,
    endDate: event?.endDate || tournamentRecord.endDate,
    tournamentId: tournamentRecord.tournamentId,
    eventId: eventId || event?.eventId,
    drawId,
  };

  const { participants: tournamentParticipants = [] } = hydrateParticipants({
    participantsProfile,
    tournamentRecord,
    contextProfile,
    inContext,
  });

  const { matchUp, structure } = drawEngineFindMatchUp({
    context: inContext && additionalContext,
    tournamentParticipants,
    afterRecoveryTimes,
    contextContent,
    drawDefinition,
    contextProfile,
    matchUpId,
    inContext,
    event,
  });

  return { matchUp, structure, drawDefinition };
}
