import { addParticipantGroupings } from '../../governors/positionGovernor/avoidance/addParticipantGroupings';
import { addUpcomingMatchUps } from '../../governors/matchUpGovernor/addUpcomingMatchUps';
import { getContextContent } from '../../../tournamentEngine/getters/getContextContent';
import { getExitProfiles } from '../../governors/queryGovernor/getExitProfile';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getStructureMatchUps } from './getStructureMatchUps';
import { getDrawStructures } from '../findStructure';
import { getMatchUpsMap } from './getMatchUpsMap';
import { filterMatchUps } from './filterMatchUps';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/*
  return ALL matchUps within a drawDefinition, regardless of state
*/
export function getAllDrawMatchUps(params) {
  const stack = 'getAllDrawMatchUps';
  Object.assign(params, { requireParticipants: false });

  const result = getDrawMatchUps(params);

  if (result.error) return decorateResult({ result, stack });

  const {
    abandonedMatchUps,
    completedMatchUps,
    upcomingMatchUps,
    pendingMatchUps,
    byeMatchUps,
    matchUpsMap,
  } = result;

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
  participantsProfile,
  afterRecoveryTimes,
  includeByeMatchUps,
  policyDefinitions,
  tournamentRecord,
  contextContent,
  contextFilters,
  contextProfile,
  drawDefinition,
  matchUpFilters,
  scheduleTiming,
  participantMap,
  nextMatchUps,
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

  if (contextProfile && !contextContent) {
    contextContent = getContextContent({
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      event,
    });
  }

  // getTournamentParticipants() calls getDrawMatchUps()
  // ...so participants must be sourced directly from tournamentRecord
  // ...and groupings must be added independent of that

  if (!tournamentParticipants?.length && tournamentRecord) {
    tournamentParticipants = tournamentRecord?.participants;

    if (
      (inContext || participantsProfile?.withGroupings) &&
      tournamentParticipants?.length
    ) {
      tournamentParticipants = addParticipantGroupings({
        participants: tournamentParticipants,
        participantsProfile,
      });
    }
  }

  const { structures } = getDrawStructures({ drawDefinition });

  if (!matchUpsMap) {
    matchUpsMap = getMatchUpsMap({ drawDefinition });
  }

  // TODO: get QUALIFYING/MAIN { stageSequence: 1 } seedAssignments
  // ...optionally pass these seedAssignments to other stage structures

  const exitProfiles =
    drawDefinition && getExitProfiles({ drawDefinition }).exitProfiles;

  structures.forEach((structure) => {
    const {
      byeMatchUps = [],
      pendingMatchUps,
      upcomingMatchUps,
      completedMatchUps,
      abandonedMatchUps,
    } = getStructureMatchUps({
      // if nextMatchUps then the filters can't be applied at this level
      matchUpFilters: !nextMatchUps ? matchUpFilters : undefined,
      contextFilters: !nextMatchUps ? contextFilters : undefined,
      inContext: inContext || nextMatchUps || contextFilters,
      tournamentAppliedPolicies,
      scheduleVisibilityFilters,
      tournamentParticipants,
      requireParticipants,
      afterRecoveryTimes,
      includeByeMatchUps,
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      contextContent,
      drawDefinition,
      participantMap,
      scheduleTiming,
      exitProfiles,
      matchUpsMap,
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

  // only apply this filter if filters haven't already been applied
  const applyFilter = (matchUps) => {
    if (!matchUpFilters && !nextMatchUps && !contextFilters) return matchUps;
    if (matchUpFilters) {
      matchUps = filterMatchUps({ matchUps, ...matchUpFilters });
    }
    if (contextFilters) {
      matchUps = filterMatchUps({
        matchUps,
        ...contextFilters,
        processContext: true,
      });
    }
    return matchUps;
  };

  const matchUpGroups = {
    abandonedMatchUps: applyFilter(allAbandonedMatchUps),
    completedMatchUps: applyFilter(allCompletedMatchUps),
    upcomingMatchUps: applyFilter(allUpcomingMatchUps),
    pendingMatchUps: applyFilter(allPendingMatchUps),
    byeMatchUps: applyFilter(allByeMatchUps),
    matchUpsMap,
    ...SUCCESS,
  };

  if (nextMatchUps) {
    const nextFilter = typeof nextMatchUps === 'object' || {
      abandoned: true,
      completed: true,
      upcoming: true,
      pending: true,
      bye: true,
    };
    const { abandoned, completed, upcoming, pending, bye } = nextFilter;
    const matchUps = [].concat(
      ...((abandoned && allAbandonedMatchUps) || []),
      ...((completed && allCompletedMatchUps) || []),
      ...((upcoming && allUpcomingMatchUps) || []),
      ...((pending && allPendingMatchUps) || []),
      ...((bye && allByeMatchUps) || [])
    );
    addUpcomingMatchUps({
      inContextDrawMatchUps: matchUps,
      drawDefinition,
    });
  }

  return matchUpGroups;
}
