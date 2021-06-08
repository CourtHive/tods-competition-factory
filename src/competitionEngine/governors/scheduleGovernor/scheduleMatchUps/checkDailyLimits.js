import { getIndividualParticipantIds } from './getIndividualParticipantIds';
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
  matchUp,
  matchUpDailyLimits,
  individualParticipantProfiles
) {
  const { matchUpType } = matchUp;
  const individualParticipantIds = getIndividualParticipantIds(matchUp);

  const participantIdsAtLimit = individualParticipantIds.filter(
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
    individualParticipantIds.forEach((participantId) => {
      if (!individualParticipantProfiles[participantId])
        individualParticipantProfiles[participantId] = { counters: {} };
      const counters = individualParticipantProfiles[participantId].counters;
      if (counters[matchUpType]) counters[matchUpType] += 1;
      else counters[matchUpType] = 1;
      if (counters[TOTAL]) counters[TOTAL] += 1;
      else counters[TOTAL] = 1;
    });
  }

  return participantIdsAtLimit;
}
