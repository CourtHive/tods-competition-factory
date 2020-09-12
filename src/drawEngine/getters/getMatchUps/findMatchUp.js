import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { drawStructures } from '../findStructure';
import { getMatchUp } from '../../accessors/matchUpAccessor/matchUps';
import { makeDeepCopy } from '../../../utilities';

/*
  public version of findMatchUp
*/
export function publicFindMatchUp(props) {
  Object.assign(props, { inContext: true });
  return { matchUp: makeDeepCopy(findMatchUp(props).matchUp) };
}

/*
  function to find a matchUp within a draw
*/
export function findMatchUp({
  drawDefinition,
  policies,
  tournamentParticipants,
  matchUpId,
  inContext,
}) {
  const { structures } = drawStructures({ drawDefinition });
  const { matchUp, structure } = structures.reduce((result, structure) => {
    const { matchUps } = getAllStructureMatchUps({
      drawDefinition,
      structure,
      tournamentParticipants,
      inContext,
      policies,
    });
    const { matchUp } = getMatchUp({ matchUps, matchUpId });
    return matchUp ? { matchUp, structure } : result;
  }, {});

  return { matchUp, structure };
}
