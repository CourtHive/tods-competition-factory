import { checkParticipantProfileInitialization } from './checkParticipantProfileInitialization';
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
 * @returns {string[]} relevantParticipantIds - array of participantIds relevant to current matchUp
 * @modifies individualParticipantProfiles - increments counters
 */
export function checkDailyLimits({
  individualParticipantProfiles,
  matchUpPotentialParticipantIds,
  matchUpDailyLimits = {},
  matchUp,
}) {
  const { matchUpId, matchUpType } = matchUp;
  const { enteredIndividualParticipantIds } =
    getIndividualParticipantIds(matchUp);

  // don't include potentials if matchUp is in round robin
  // this is because potentials uses { sidesTo } attribute which must be present for other calculations
  const potentialParticipantIds = (
    (matchUp.roundPosition && matchUpPotentialParticipantIds[matchUpId]) ||
    []
  ).flat();

  const relevantParticipantIds = unique(
    enteredIndividualParticipantIds.concat(...potentialParticipantIds)
  );

  relevantParticipantIds.forEach((participantId) => {
    checkParticipantProfileInitialization({
      individualParticipantProfiles,
      participantId,
    });
  });

  const participantIdsAtLimit = relevantParticipantIds.filter(
    (participantId) => {
      const profile = individualParticipantProfiles[participantId];
      if (profile) {
        return [matchUpType, TOTAL].find((counterName) => {
          const participantCount =
            (profile.counters && profile.counters[counterName]) || 0;
          const dailyLimit = matchUpDailyLimits[counterName] || 0;
          return (
            participantCount && dailyLimit && participantCount >= dailyLimit
          );
        });
      }
    }
  );

  return { participantIdsAtLimit, relevantParticipantIds };
}
