import { getIndividualParticipantIds } from './getIndividualParticipantIds';
import { unique } from '../../../../utilities';

import { TOTAL } from '../../../../constants/scheduleConstants';

/**
 *
 * @param {object[]} sides - matchUp.sides
 * @param {string} matchUpType - SINGLES, DOUBLES, TEAM
 * @param {object} matchUpDailyLimits - { SINGLES, DOUBLES, TOTAL } - counters
 * @param {object} individualParticipantProfiles - participantIds are attributes { [participantId]: { counters: { SINGLES, DOUBLES, TOTAL }}}
 * @returns {string[]} participantIdsAtLimit - array of participantIds who are at or beyond daily matchUp limit
 * @modifies individualParticipantProfiles - increments counters
 */
export function checkDailyLimits(
  individualParticipantProfiles,
  matchUpPotentialParticipantIds,
  matchUpDailyLimits,
  scheduleDate,
  matchUp
) {
  const { matchUpId, matchUpType } = matchUp;
  const individualParticipantIds = getIndividualParticipantIds(matchUp);

  // don't include potentials if matchUp is in round robin
  // this is because potentials uses { sidesTo } attribute which must be present for other calculations
  const potentialParticipantIds = (
    (matchUp.roundPosition && matchUpPotentialParticipantIds[matchUpId]) ||
    []
  ).flat();

  const relevantParticipantids = unique(
    individualParticipantIds.concat(...potentialParticipantIds)
  );

  const participantIdsAtLimit = relevantParticipantids.filter(
    (participantId) => {
      const profile = individualParticipantProfiles[participantId];
      if (profile) {
        const limitReached = [matchUpType, TOTAL].find((counterName) => {
          const participantCount =
            (profile.counters && profile.counters[counterName]) || 0;
          const dailyLimit = matchUpDailyLimits[counterName];
          return (
            participantCount && dailyLimit && participantCount >= dailyLimit
          );
        });
        return limitReached;
      }
    }
  );

  if (!participantIdsAtLimit.length) {
    relevantParticipantids.forEach((participantId) => {
      if (!individualParticipantProfiles[participantId])
        individualParticipantProfiles[participantId] = {
          counters: {},
          potentialCounted: {},
          priorMatchUpType: undefined,
          timeAfterRecovery: undefined,
          typeChangeTimeAfterRecovery: undefined,
        };
      const counters = individualParticipantProfiles[participantId].counters;
      if (counters[matchUpType]) counters[matchUpType] += 1;
      else counters[matchUpType] = 1;
      if (counters[TOTAL]) counters[TOTAL] += 1;
      else counters[TOTAL] = 1;
    });
  }

  return participantIdsAtLimit;
}
