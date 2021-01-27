import { getMatchUpsMap } from './getMatchUpsMap';
import { getDrawStructures } from '../findStructure';
import { getStructureMatchUps } from './getStructureMatchUps';
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
    mappedMatchUps,
  } = getDrawMatchUps(props);
  const matchUps = [].concat(
    ...completedMatchUps,
    ...upcomingMatchUps,
    ...pendingMatchUps,
    ...byeMatchUps
  );
  return { matchUps, mappedMatchUps };
}

export function getDrawMatchUps({
  context,
  inContext,
  roundFilter,
  nextMatchUps,
  drawDefinition,
  matchUpFilters,
  contextFilters,
  mappedMatchUps,
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
  mappedMatchUps = mappedMatchUps || getMatchUpsMap({ drawDefinition });

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
  });

  const matchUpGroups = {
    mappedMatchUps,
    byeMatchUps: allByeMatchUps,
    pendingMatchUps: allPendingMatchUps,
    upcomingMatchUps: allUpcomingMatchUps,
    abandonedMatchUps: allAbandonedMatchUps,
    completedMatchUps: allCompletedMatchUps,
    ...SUCCESS,
  };

  if (nextMatchUps) {
    const nextFilter = (typeof nextMatchUps === 'object' && nextMatchUps) || {
      completed: true,
      upcoming: true,
      pending: true,
      bye: true,
    };
    const { completed, upcoming, pending, bye } = nextFilter;
    const matchUps = [].concat(
      ...((completed && matchUpGroups.completedMatchUps) || []),
      ...((upcoming && matchUpGroups.upcomingMatchUps) || []),
      ...((pending && matchUpGroups.pendingMatchUps) || []),
      ...((bye && matchUpGroups.byeMatchUps) || [])
    );
    addUpcomingMatchUps({ drawDefinition, inContextDrawMatchUps: matchUps });
  }

  return matchUpGroups;
}
