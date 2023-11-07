import { findMatchUp as drawEngineFindMatchUp } from '../../../drawEngine/getters/getMatchUps/findDrawMatchUp';
import { makeDeepCopy } from '../../../utilities/makeDeepCopy';
import { hydrateParticipants } from './hydrateParticipants';
import { allTournamentMatchUps } from './matchUpsGetter';
import { getContextContent } from '../getContextContent';
import { findEvent } from '../findEvent';

import { HydratedMatchUp } from '../../../types/hydrated';
import {
  ContextContent,
  ContextProfile,
  ParticipantsProfile,
} from '../../../types/factoryTypes';
import {
  DrawDefinition,
  Tournament,
  Event,
  Structure,
} from '../../../types/tournamentFromSchema';
import {
  DRAW_DEFINITION_NOT_FOUND,
  ErrorType,
  MATCHUP_NOT_FOUND,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

type FindMatchUpType = {
  participantsProfile?: ParticipantsProfile;
  contextContent?: ContextContent;
  contextProfile?: ContextProfile;
  drawDefinition?: DrawDefinition;
  afterRecoveryTimes?: boolean;
  tournamentRecord: Tournament;
  inContext?: boolean;
  matchUpId: string;
  eventId?: string;
  drawId?: string;
  event?: Event;
};

type FindMatchUpResult = {
  drawDefinition?: DrawDefinition;
  matchUp?: HydratedMatchUp;
  structure?: Structure;
  error?: ErrorType;
};

export function publicFindMatchUp(params: FindMatchUpType): FindMatchUpResult {
  Object.assign(params, { inContext: true });
  const { matchUp, error } = findMatchUp(params);
  return { matchUp: makeDeepCopy(matchUp, true, true), error };
}

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
}: FindMatchUpType): FindMatchUpResult {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (typeof matchUpId !== 'string') return { error: MISSING_MATCHUP_ID };

  if (!drawDefinition || !event) {
    const matchUps = allTournamentMatchUps({ tournamentRecord }).matchUps ?? [];

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
    surfaceCategory: event?.surfaceCategory ?? tournamentRecord.surfaceCategory,
    indoorOutDoor: event?.indoorOutdoor ?? tournamentRecord.indoorOutdoor,
    endDate: event?.endDate ?? tournamentRecord.endDate,
    tournamentId: tournamentRecord.tournamentId,
    eventId: eventId ?? event?.eventId,
    drawId,
  };

  const { participants: tournamentParticipants = [] } = hydrateParticipants({
    participantsProfile,
    tournamentRecord,
    contextProfile,
    inContext,
  });

  const { matchUp, structure } = drawEngineFindMatchUp({
    context: inContext ? additionalContext : undefined,
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
