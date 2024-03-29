import { checkParticipantProfileInitialization } from './checkParticipantProfileInitialization';
import { getIndividualParticipantIds } from '../../../../query/matchUp/getIndividualParticipantIds';
import { unique } from '@Tools/arrays';

// constants
import { TOTAL } from '@Constants/scheduleConstants';

/**
 * @param {object} matchUp
 * @param {object} matchUpDailyLimits - { SINGLES, DOUBLES, TOTAL } - counters
 * @param {string[]} matchUpPotentialParticipantIds - participantIds are attributes { [participantId]: { counters: { SINGLES, DOUBLES, TOTAL }}}
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
  const { enteredIndividualParticipantIds } = getIndividualParticipantIds(matchUp);
  const { matchUpId, matchUpType } = matchUp;

  // don't include potentials if matchUp is in round robin
  // this is because potentials uses { sidesTo } attribute which must be present for other calculations
  const potentialParticipantIds = ((matchUp.roundPosition && matchUpPotentialParticipantIds[matchUpId]) || []).flat();

  const relevantParticipantIds = unique(enteredIndividualParticipantIds.concat(...potentialParticipantIds));

  relevantParticipantIds.forEach((participantId) => {
    checkParticipantProfileInitialization({
      individualParticipantProfiles,
      participantId,
    });
  });

  const participantIdsAtLimit = relevantParticipantIds.filter((participantId) => {
    const profile = individualParticipantProfiles[participantId];
    if (profile) {
      return [matchUpType, TOTAL].find((counterName) => {
        const participantsCount = profile.counters?.[counterName] || 0;
        const dailyLimit = matchUpDailyLimits[counterName] || 0;
        return participantsCount && dailyLimit && participantsCount >= dailyLimit;
      });
    }
  });

  return { participantIdsAtLimit, relevantParticipantIds };
}
