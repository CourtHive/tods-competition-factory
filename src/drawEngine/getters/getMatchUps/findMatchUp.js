import { getContextContent } from '../../../tournamentEngine/getters/getContextContent';
import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { getMatchUp } from '../../accessors/matchUpAccessor/matchUps';
import { getDrawStructures } from '../findStructure';
import { makeDeepCopy } from '../../../utilities';
import {
  INVALID_VALUES,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';

/*
  public version of findMatchUp
*/
export function publicFindMatchUp(params) {
  Object.assign(params, { inContext: true });
  return { matchUp: makeDeepCopy(findMatchUp(params).matchUp, false, true) };
}

/*
  function to find a matchUp within a draw
*/
export function findMatchUp({
  tournamentParticipants,
  afterRecoveryTimes,
  drawDefinition,
  contextProfile,
  contextContent,
  matchUpsMap,
  matchUpId,
  inContext,
  context,
  event,
}) {
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
      drawDefinition,
      contextProfile,
      contextContent,
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
