import { attributeFilter, makeDeepCopy } from '../../../utilities';
import { addParticipantContext } from './addParticipantContext';
import { filterParticipants } from './filterParticipants';

import { POLICY_TYPE_PARTICIPANT } from '../../../constants/policyConstants';
import { GROUP, PAIR, TEAM } from '../../../constants/participantTypes';
import {
  INVALID_OBJECT,
  MISSING_PARTICIPANTS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

/**
 * Returns deepCopies of tournament participants filtered by participantFilters which are arrays of desired participant attribute values
 *
 * @param {object} tournamentRecord - tournament object (passed automatically from tournamentEngine state)
 * @param {object} participantFilters - attribute arrays with filter value strings
 * @param {boolean} inContext - adds individualParticipants for all individualParticipantIds
 * @param {boolean} withStatistics - adds events: { [eventId]: eventName }, matchUps: { [matchUpId]: score }, statistics: [{ statCode: 'winRatio'}]
 * @param {boolean} withOpponents - include opponent participantIds
 * @param {boolean} withMatchUps - include all matchUps in which participant appears
 *
 */
export function getTournamentParticipants({
  tournamentRecord,

  participantFilters = {},
  policyDefinitions,

  withScheduleItems,
  withStatistics,
  withGroupings,
  withOpponents,
  withMatchUps,
  withEvents,
  withDraws,

  convertExtensions,
  scheduleAnalysis,
  inContext,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) return { error: MISSING_PARTICIPANTS };

  let tournamentParticipants = tournamentRecord.participants.map(
    (participant) => makeDeepCopy(participant, convertExtensions)
  );

  if (typeof participantFilters !== 'object')
    return { error: INVALID_OBJECT, participantFilters };

  if (inContext) {
    tournamentParticipants?.forEach((participant) => {
      if ([PAIR, TEAM, GROUP].includes(participant.participantType)) {
        participant.individualParticipants =
          participant.individualParticipantIds.map((participantId) => {
            const individualParticipant = tournamentRecord.participants.find(
              (p) => p.participantId === participantId
            );
            return makeDeepCopy(individualParticipant, convertExtensions, true);
          });
      }
    });
  }

  if (participantFilters)
    tournamentParticipants = filterParticipants({
      tournamentRecord,
      participantFilters,
      participants: tournamentParticipants,
    });

  let participantIdsWithConflicts;
  if (
    withEvents ||
    withDraws ||
    withMatchUps ||
    withGroupings ||
    withOpponents ||
    withStatistics ||
    scheduleAnalysis ||
    withScheduleItems
  ) {
    const result = addParticipantContext({
      tournamentRecord,
      tournamentEvents: tournamentRecord.events,
      tournamentParticipants,
      participantFilters,
      withScheduleItems,
      scheduleAnalysis,
      withStatistics,
      withGroupings,
      withOpponents,
      withMatchUps,
      withEvents,
      withDraws,
    });

    participantIdsWithConflicts = result?.participantIdsWithConflicts;
  }

  const participantAttributes = policyDefinitions?.[POLICY_TYPE_PARTICIPANT];
  if (participantAttributes?.participant) {
    tournamentParticipants = tournamentParticipants.map((participant) =>
      attributeFilter({
        source: participant,
        template: participantAttributes.participant,
      })
    );
  }

  return { tournamentParticipants, participantIdsWithConflicts };
}
