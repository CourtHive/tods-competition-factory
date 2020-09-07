import { drawStructures } from 'src/drawEngine/getters/structureGetter';
import { structureMatchUps } from 'src/drawEngine/getters/getMatchUps';
/*
  return ALL matchUps within a drawDefinition, regardless of state
*/
export function getAllDrawMatchUps(props) {
  Object.assign(props, { requireParticipants: false });
  const {
    completedMatchUps,
    upcomingMatchUps,
    pendingMatchUps,
    byeMatchUps
  } = getDrawMatchUps(props);
  const matchUps  = [].concat(...completedMatchUps, ...upcomingMatchUps, ...pendingMatchUps, ...byeMatchUps);
  return { matchUps };
}

export function getDrawMatchUps({
  drawDefinition, tournamentParticipants,
  requireParticipants, roundFilter,
  inContext, includeByeMatchUps,
  context, matchUpFilters, contextFilters
}) {
  let allByeMatchUps = [];
  let allPendingMatchUps = [];
  let allUpcomingMatchUps = [];
  let allAbandonedMatchUps = [];
  let allCompletedMatchUps = [];
  
  const { structures } = drawStructures({drawDefinition});
  
  structures.forEach(structure => {
    const {
      byeMatchUps=[],
      pendingMatchUps,
      upcomingMatchUps,
      completedMatchUps,
      abandonedMatchUps,
    } = structureMatchUps({
        structure,
        inContext,
        roundFilter,
        context,
        matchUpFilters,
        contextFilters,
        includeByeMatchUps,
        requireParticipants,
        tournamentParticipants,
      });

    allByeMatchUps = allByeMatchUps.concat(...byeMatchUps);
    allPendingMatchUps = allPendingMatchUps.concat(...pendingMatchUps);
    allUpcomingMatchUps = allUpcomingMatchUps.concat(...upcomingMatchUps);
    allAbandonedMatchUps = allAbandonedMatchUps.concat(...abandonedMatchUps);
    allCompletedMatchUps = allCompletedMatchUps.concat(...completedMatchUps);
  });
    
  let matchUpGroups = {
    byeMatchUps: allByeMatchUps,
    pendingMatchUps: allPendingMatchUps,
    upcomingMatchUps: allUpcomingMatchUps,
    abandonedMatchUps: allAbandonedMatchUps,
    completedMatchUps: allCompletedMatchUps
  };
  
  return matchUpGroups;
}
