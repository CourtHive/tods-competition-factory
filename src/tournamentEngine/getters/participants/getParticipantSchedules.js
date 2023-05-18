import { getMatchUpDependencies } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { allTournamentMatchUps } from '../matchUpsGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_OBJECT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function getParticipantSchedules({
  participantFilters = {},
  tournamentRecord,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  if (typeof participantFilters !== 'object')
    return { error: INVALID_OBJECT, context: { participantFilters } };

  const matchUpFilters = { eventIds: participantFilters.eventIds };
  const matchUps = allTournamentMatchUps({
    tournamentRecord,
    matchUpFilters,
  }).matchUps;
  const matchUpsMap = Object.assign(
    {},
    ...matchUps.map((matchUp) => ({ [matchUp.matchUpId]: matchUp }))
  );

  const scheduledMatchUps = matchUps.filter(
    ({ schedule }) => schedule && Object.keys(schedule).length
  );

  const { sourceMatchUpIds } = getMatchUpDependencies({
    tournamentRecord,
    matchUps,
  });

  const participantAggregator = {};
  for (const matchUp of scheduledMatchUps) {
    const { sides } = matchUp;
    let relevantSourceMatchUps;

    const participants =
      sides
        ?.map(({ participant }) => {
          if (participant) {
            return [participant].concat(
              ...(participant.individualParticipants || [])
            );
          } else {
            if (
              sourceMatchUpIds[matchUp.matchUpId] &&
              !relevantSourceMatchUps
            ) {
              relevantSourceMatchUps = (
                sourceMatchUpIds[matchUp.matchUpId] || []
              )
                .map((matchUpId) => matchUpsMap[matchUpId])
                .filter(({ winningSide, bye }) => !winningSide && !bye);
            }
          }
        })
        .filter(Boolean)
        .flat() || [];

    for (const participant of participants) {
      const { participantId } = participant;
      if (!participantAggregator[participantId]) {
        participantAggregator[participantId] = {
          potentialMatchUps: [],
          participant,
          matchUps: [],
        };
      }

      participantAggregator[participantId].matchUps.push(matchUp);
    }

    const potentialParticipants =
      relevantSourceMatchUps
        ?.map(({ sides }) => sides)
        .flat()
        .map(
          ({ participant }) =>
            participant &&
            [participant].concat(...(participant.individualParticipants || []))
        )
        .filter(Boolean)
        .flat() || [];

    for (const participant of potentialParticipants) {
      const { participantId } = participant;
      if (!participantAggregator[participantId]) {
        participantAggregator[participantId] = {
          potentialMatchUps: [],
          participant,
          matchUps: [],
        };
      }

      participantAggregator[participantId].potentialMatchUps.push(matchUp);
    }
  }

  const participantSchedules = Object.values(participantAggregator).filter(
    ({ participant }) => {
      return (
        (participantFilters.participantIds &&
          !participantFilters.participantIds.includes(
            participant.participantId
          )) ||
        (participantFilters.participantTypes &&
          !participantFilters.participantTypes.includes(
            participant.participantType
          ))
      );
    }
  );

  return {
    participantSchedules,
    ...SUCCESS,
  };
}
