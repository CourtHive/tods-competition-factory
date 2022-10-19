import { addParticipantGroupings } from '../../governors/positionGovernor/avoidance/addParticipantGroupings';
import { addUpcomingMatchUps } from '../../governors/matchUpGovernor/addUpcomingMatchUps';
import { getContextContent } from '../../../tournamentEngine/getters/getContextContent';
import { getExitProfiles } from '../../governors/queryGovernor/getExitProfile';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getStructureMatchUps } from './getStructureMatchUps';
import { getDrawStructures } from '../findStructure';
import { getMatchUpsMap } from './getMatchUpsMap';

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
      inContext: inContext || nextMatchUps,
      tournamentAppliedPolicies,
      scheduleVisibilityFilters,
      tournamentParticipants,
      requireParticipants,
      afterRecoveryTimes,
      includeByeMatchUps,
      policyDefinitions,
      tournamentRecord,
      contextFilters,
      contextProfile,
      contextContent,
      drawDefinition,
      matchUpFilters,
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

  const matchUpGroups = {
    abandonedMatchUps: allAbandonedMatchUps,
    completedMatchUps: allCompletedMatchUps,
    upcomingMatchUps: allUpcomingMatchUps,
    pendingMatchUps: allPendingMatchUps,
    byeMatchUps: allByeMatchUps,
    matchUpsMap,
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
