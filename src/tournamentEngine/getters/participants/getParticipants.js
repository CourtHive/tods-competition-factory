import { getParticipantEntries } from './getParticipantEntries';
import { filterParticipants } from './filterParticipants';
import { getParticipantMap } from './getParticipantMap';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getParticipants({
  withIndividualParticipants,
  participantFilters = {},
  withPotentialMatchUps,
  // withRankingProfile,
  convertExtensions,
  policyDefinitions,
  tournamentRecord,
  scheduleAnalysis,
  withSignInStatus,
  withTeamMatchUps,
  withScaleValues,
  // usePublishState,
  // withStatistics,
  withOpponents,
  withMatchUps,
  internalUse,
  withEvents,
  withDraws,
  withISO2,
  withIOC,
  // inContext, - may be deprecated in favor of `withIndividualParticipants`
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  let { participantMap } = getParticipantMap({
    withIndividualParticipants,
    convertExtensions,
    policyDefinitions,
    tournamentRecord,
    withSignInStatus,
    withScaleValues,
    internalUse,
    withISO2,
    withIOC,
  });

  let matchUps, derivedDrawInfo;
  ({ participantMap, matchUps, derivedDrawInfo } = getParticipantEntries({
    withPotentialMatchUps,
    policyDefinitions,
    tournamentRecord,
    scheduleAnalysis,
    withTeamMatchUps,
    participantMap,
    withOpponents,
    withMatchUps,
    withEvents,
    withDraws,
  }));

  let processedParticipants = Object.values(participantMap).map(
    ({ draws, events, matchUps, opponents, ...p }) => {
      const participantOpponents = Object.values(opponents);
      const participantDraws = Object.values(draws);
      participantDraws?.forEach((draw) => {
        draw.opponents = participantOpponents.filter(
          (opponent) => opponent.drawId === draw.drawId
        );
      });

      return {
        ...p.participant,
        opponents: participantOpponents,
        matchUps: Object.values(matchUps),
        events: Object.values(events),
        draws: participantDraws,
      };
    }
  );

  // filter must be last so attributes can be used for reporting & etc.
  let participants = filterParticipants({
    participants: processedParticipants,
    participantFilters,
    tournamentRecord,
  });

  return {
    derivedDrawInfo,
    participantMap,
    participants,
    ...SUCCESS,
    matchUps,
  };
}
