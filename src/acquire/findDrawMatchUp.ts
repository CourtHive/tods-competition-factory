import { getAllStructureMatchUps } from '../query/matchUps/getAllStructureMatchUps';
import { getContextContent } from '../query/hierarchical/getContextContent';
import { getMatchUp } from '../query/matchUps/getMatchUpFromMatchUps';
import { MatchUpsMap } from '../query/matchUps/getMatchUpsMap';
import { makeDeepCopy } from '../utilities/makeDeepCopy';
import { getDrawStructures } from './findStructure';

import { ContextContent, ContextProfile } from '../types/factoryTypes';
import { HydratedMatchUp } from '../types/hydrated';
import {
  ErrorType,
  INVALID_VALUES,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
} from '../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Participant,
  Structure,
} from '../types/tournamentTypes';

/*
  public version of findMatchUp
*/
export function publicFindDrawMatchUp(params) {
  Object.assign(params, { inContext: true });
  return {
    matchUp: makeDeepCopy(findDrawMatchUp(params).matchUp, false, true),
  };
}

type FindDrawMatchUpArgs = {
  tournamentParticipants?: Participant[];
  context?: { [key: string]: any };
  contextContent?: ContextContent;
  contextProfile?: ContextProfile;
  afterRecoveryTimes?: boolean;
  drawDefinition: DrawDefinition;
  matchUpsMap?: MatchUpsMap;
  inContext?: boolean;
  matchUpId: string;
  event?: Event;
};

export function findDrawMatchUp({
  tournamentParticipants,
  afterRecoveryTimes,
  contextContent,
  contextProfile,
  drawDefinition,
  matchUpsMap,
  matchUpId,
  inContext,
  context,
  event,
}: FindDrawMatchUpArgs): {
  matchUp?: HydratedMatchUp;
  structure?: Structure;
  error?: ErrorType;
} {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (typeof matchUpId !== 'string') return { error: INVALID_VALUES };

  const { structures = [] } = getDrawStructures({ drawDefinition });

  if (contextProfile && !contextContent)
    contextContent = getContextContent({ contextProfile, drawDefinition });

  for (const structure of structures) {
    const { matchUps } = getAllStructureMatchUps({
      tournamentParticipants,
      afterRecoveryTimes,
      contextContent,
      drawDefinition,
      contextProfile,
      matchUpsMap,
      inContext,
      structure,
      context,
      event,
    });
    const { matchUp } = getMatchUp({ matchUps, matchUpId });

    if (matchUp) return { matchUp, structure };
  }

  return { error: MATCHUP_NOT_FOUND };
}
