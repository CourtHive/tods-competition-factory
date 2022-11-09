import { getMatchUpDependencies } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { getParticipantEntries } from './getParticipantEntries';
import { filterParticipants } from './filterParticipants';
import { getParticipantMap } from './getParticipantMap';
import { definedAttributes } from '../../../utilities';

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
  if (withMatchUps) getMatchUpDependencies({ tournamentRecord }); // ensure goesTos are present

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

  let matchUps, derivedDrawInfo, derivedEventInfo, mappedMatchUps;
  ({
    derivedEventInfo,
    derivedDrawInfo,
    participantMap,
    mappedMatchUps,
    matchUps,
  } = getParticipantEntries({
    withPotentialMatchUps,
    policyDefinitions,
    convertExtensions,
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
      const participantDraws = Object.values(draws);
      const participantOpponents = Object.values(opponents);
      if (withOpponents) {
        participantDraws?.forEach((draw) => {
          draw.opponents = participantOpponents.filter(
            (opponent) => opponent.drawId === draw.drawId
          );
        });
      }

      return definedAttributes(
        {
          ...p.participant,
          opponents: withOpponents ? participantOpponents : undefined,
          matchUps: withMatchUps ? Object.values(matchUps) : undefined,
          events: withEvents ? Object.values(events) : undefined,
          draws: withDraws ? participantDraws : undefined,
        },
        false,
        false,
        true
      );
    }
  );

  // filter must be last so attributes can be used for reporting & etc.
  let participants = filterParticipants({
    participants: processedParticipants,
    participantFilters,
    tournamentRecord,
  });

  return {
    derivedEventInfo,
    derivedDrawInfo,
    mappedMatchUps,
    participantMap,
    participants,
    ...SUCCESS,
    matchUps,
  };
}
