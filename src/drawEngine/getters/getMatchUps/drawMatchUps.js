import { addUpcomingMatchUps } from '../../governors/matchUpGovernor/addUpcomingMatchUps';
import { getStructureMatchUps } from './getStructureMatchUps';
import { getDrawStructures } from '../findStructure';
import { getMatchUpsMap } from './getMatchUpsMap';

import { SUCCESS } from '../../../constants/resultConstants';
import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';

/*
  return ALL matchUps within a drawDefinition, regardless of state
*/
export function getAllDrawMatchUps(params) {
  if (!params.drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  Object.assign(params, { requireParticipants: false });

  const {
    abandonedMatchUps,
    completedMatchUps,
    upcomingMatchUps,
    pendingMatchUps,
    byeMatchUps,

    matchUpsMap,
  } = getDrawMatchUps(params);
  const matchUps = [].concat(
    ...abandonedMatchUps,
    ...completedMatchUps,
    ...upcomingMatchUps,
    ...pendingMatchUps,
    ...byeMatchUps
  );

  return { matchUps, matchUpsMap };
}

export function getDrawMatchUps({
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
  tournamentParticipants,
  requireParticipants,
  includeByeMatchUps,
  policyDefinitions,
  tournamentRecord,
  drawDefinition,
  matchUpFilters,
  contextFilters,
  scheduleTiming,
  nextMatchUps,
  roundFilter,
  matchUpsMap,
  inContext,
  context,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  let allAbandonedMatchUps = [];
  let allCompletedMatchUps = [];
  let allUpcomingMatchUps = [];
  let allPendingMatchUps = [];
  let allByeMatchUps = [];

  tournamentParticipants =
    (tournamentParticipants?.length && tournamentParticipants) ||
    tournamentRecord?.participants;
  const { structures } = getDrawStructures({ drawDefinition });

  if (!matchUpsMap) {
    matchUpsMap = getMatchUpsMap({ drawDefinition });
  }

  // TODO: get QUALIFYING/MAIN { stageSequence: 1 } seedAssignments
  // ...optionally pass these seedAssignments to other stage structures

  structures.forEach((structure) => {
    const {
      byeMatchUps = [],
      pendingMatchUps,
      upcomingMatchUps,
      completedMatchUps,
      abandonedMatchUps,
    } = getStructureMatchUps({
      inContext: inContext || nextMatchUps,
      tournamentAppliedPolicies,
      scheduleVisibilityFilters,
      tournamentParticipants,
      requireParticipants,
      includeByeMatchUps,
      policyDefinitions,
      drawDefinition,
      matchUpFilters,
      contextFilters,
      scheduleTiming,
      matchUpsMap,
      roundFilter,
      structure,
      context,
      event,
    });

    allAbandonedMatchUps = allAbandonedMatchUps.concat(...abandonedMatchUps);
    allCompletedMatchUps = allCompletedMatchUps.concat(...completedMatchUps);
    allUpcomingMatchUps = allUpcomingMatchUps.concat(...upcomingMatchUps);
    allPendingMatchUps = allPendingMatchUps.concat(...pendingMatchUps);
    allByeMatchUps = allByeMatchUps.concat(...byeMatchUps);
  });

  const matchUpGroups = {
    matchUpsMap,

    byeMatchUps: allByeMatchUps,
    pendingMatchUps: allPendingMatchUps,
    upcomingMatchUps: allUpcomingMatchUps,
    abandonedMatchUps: allAbandonedMatchUps,
    completedMatchUps: allCompletedMatchUps,
    ...SUCCESS,
  };

  if (nextMatchUps) {
    const nextFilter = (typeof nextMatchUps === 'object' && nextMatchUps) || {
      abandoned: true,
      completed: true,
      upcoming: true,
      pending: true,
      bye: true,
    };
    const { abandoned, completed, upcoming, pending, bye } = nextFilter;
    const matchUps = [].concat(
      ...((abandoned && matchUpGroups.abandonedMatchUps) || []),
      ...((completed && matchUpGroups.completedMatchUps) || []),
      ...((upcoming && matchUpGroups.upcomingMatchUps) || []),
      ...((pending && matchUpGroups.pendingMatchUps) || []),
      ...((bye && matchUpGroups.byeMatchUps) || [])
    );
    addUpcomingMatchUps({ drawDefinition, inContextDrawMatchUps: matchUps });
  }

  return matchUpGroups;
}
