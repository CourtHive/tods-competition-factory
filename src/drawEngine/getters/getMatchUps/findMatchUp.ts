import { getContextContent } from '../../../tournamentEngine/getters/getContextContent';
import { getMatchUp } from '../../accessors/matchUpAccessor/matchUps';
import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { getDrawStructures } from '../findStructure';
import { makeDeepCopy } from '../../../utilities';
import {
  INVALID_VALUES,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Participant,
} from '../../../types/tournamentFromSchema';

/*
  public version of findMatchUp
*/
export function publicFindMatchUp(params) {
  Object.assign(params, { inContext: true });
  return { matchUp: makeDeepCopy(findMatchUp(params).matchUp, false, true) };
}

type FindMatchUpArgs = {
  tournamentParticipants?: Participant[];
  drawDefinition: DrawDefinition;
  afterRecoveryTimes?: any;
  contextContent?: any;
  contextProfile?: any;
  inContext?: boolean;
  matchUpsMap?: any;
  matchUpId: string;
  context?: any;
  event?: Event;
};
export function findMatchUp({
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
}: FindMatchUpArgs) {
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
