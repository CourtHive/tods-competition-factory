import { getMatchUpsMap } from './getMatchUpsMap';
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
  tournamentRecord,
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

  tournamentParticipants =
    tournamentParticipants || tournamentRecord?.prticipants;
  const { structures } = getDrawStructures({ drawDefinition });
  const mappedMatchUps = getMatchUpsMap({ drawDefinition });

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
      mappedMatchUps,
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
      const nextFilter = (typeof nextMatchUps === 'object' && nextMatchUps) || {
        completed: true,
        upcoming: true,
        pending: true,
        bye: true,
      };
      const { completed, upcoming, pending, bye } = nextFilter;
      const matchUps = [].concat(
        ...((completed && completedMatchUps) || []),
        ...((upcoming && upcomingMatchUps) || []),
        ...((pending && pendingMatchUps) || []),
        ...((bye && byeMatchUps) || [])
      );
      addUpcomingMatchUps({ drawDefinition, matchUps });
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
