import { makeDeepCopy } from 'src/utilities';
import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { getMatchUp } from 'src/drawEngine/accessors/matchUpAccessor';
import { drawStructures } from 'src/drawEngine/getters/structureGetter';

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
export function findMatchUp({drawDefinition, tournamentParticipants, matchUpId, inContext}) {
  const { structures } = drawStructures({drawDefinition});
  const { matchUp, structure } = structures.reduce((result, structure) => {
    const { matchUps } = getAllStructureMatchUps({structure, tournamentParticipants, inContext});
    const { matchUp } = getMatchUp({matchUps, matchUpId});
    return matchUp ? { matchUp, structure } : result;
  }, {});
  
  return { matchUp, structure };
}
