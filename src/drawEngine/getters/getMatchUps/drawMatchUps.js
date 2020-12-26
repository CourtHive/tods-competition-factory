import { getDrawStructures } from '../findStructure';
import { getStructureMatchUps } from './structureMatchUps';
import { addUpcomingMatchUps } from '../../../tournamentEngine/getters/addUpcomingMatchUps';

import { SUCCESS } from '../../../constants/resultConstants';

/*
  return ALL matchUps within a drawDefinition, regardless of state
*/
export function getAllDrawMatchUps(props) {
  Object.assign(props, { requireParticipants: false });
  const {
    completedMatchUps,
    upcomingMatchUps,
    pendingMatchUps,
    byeMatchUps,
  } = getDrawMatchUps(props);
  const matchUps = [].concat(
    ...completedMatchUps,
    ...upcomingMatchUps,
    ...pendingMatchUps,
    ...byeMatchUps
  );
  return { matchUps };
}

export function getDrawMatchUps({
  context,
  inContext,
  roundFilter,
  nextMatchUps,
  drawDefinition,
  matchUpFilters,
  contextFilters,
  includeByeMatchUps,
  requireParticipants,
  tournamentParticipants,
  tournamentAppliedPolicies,
}) {
  let allByeMatchUps = [];
  let allPendingMatchUps = [];
  let allUpcomingMatchUps = [];
  let allAbandonedMatchUps = [];
  let allCompletedMatchUps = [];

  const { structures } = getDrawStructures({ drawDefinition });

  structures.forEach((structure) => {
    const {
      byeMatchUps = [],
      pendingMatchUps,
      upcomingMatchUps,
      completedMatchUps,
      abandonedMatchUps,
    } = getStructureMatchUps({
      context,
      structure,
      roundFilter,
      drawDefinition,
      matchUpFilters,
      contextFilters,
      includeByeMatchUps,
      requireParticipants,
      tournamentParticipants,
      tournamentAppliedPolicies,
      inContext: inContext || nextMatchUps,
    });

    allByeMatchUps = allByeMatchUps.concat(...byeMatchUps);
    allPendingMatchUps = allPendingMatchUps.concat(...pendingMatchUps);
    allUpcomingMatchUps = allUpcomingMatchUps.concat(...upcomingMatchUps);
    allAbandonedMatchUps = allAbandonedMatchUps.concat(...abandonedMatchUps);
    allCompletedMatchUps = allCompletedMatchUps.concat(...completedMatchUps);
    if (nextMatchUps) {
      addUpcomingMatchUps({ drawDefinition, matchUps: allByeMatchUps });
      addUpcomingMatchUps({ drawDefinition, matchUps: allPendingMatchUps });
      addUpcomingMatchUps({ drawDefinition, matchUps: allUpcomingMatchUps });
      addUpcomingMatchUps({ drawDefinition, matchUps: allAbandonedMatchUps });
      addUpcomingMatchUps({ drawDefinition, matchUps: allCompletedMatchUps });
    }
  });

  const matchUpGroups = {
    byeMatchUps: allByeMatchUps,
    pendingMatchUps: allPendingMatchUps,
    upcomingMatchUps: allUpcomingMatchUps,
    abandonedMatchUps: allAbandonedMatchUps,
    completedMatchUps: allCompletedMatchUps,
    ...SUCCESS,
  };

  return matchUpGroups;
}
