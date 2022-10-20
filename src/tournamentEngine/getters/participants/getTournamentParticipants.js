import { addNationalityCode } from '../../governors/participantGovernor/addNationalityCode';
import { attributeFilter, makeDeepCopy } from '../../../utilities';
import { addParticipantContext } from './addParticipantContext';
import { filterParticipants } from './filterParticipants';
import { getScaleValues } from './getScaleValues';

import { POLICY_TYPE_PARTICIPANT } from '../../../constants/policyConstants';
import { GROUP, PAIR, TEAM } from '../../../constants/participantConstants';
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
 * @param {boolean} withDraws - include all matchUps in which participant appears
 * @param {boolean} withEvents - include all events in which participant appears
 * @param {boolean} withMatchUps - include all matchUps in which participant appears
 * @param {boolean} withStatistics - adds events: { [eventId]: eventName }, matchUps: { [matchUpId]: score }, statistics: [{ statCode: 'winRatio'}]
 * @param {boolean} withScheduleItems - include schedule items; scheduled matchUps
 * @param {boolean} scheduleAnalysis - analysis of conflicts
 * @param {boolean} withGroupings - include teams and groups and pairs in which individual participants appear
 * @param {boolean} withOpponents - include opponent participantIds
 * @param {boolean} usePublishState - when hydrating participants consider publish state (currently applies to seeding)
 *
 */
export function getTournamentParticipants({
  participantFilters = {},
  withRankingProfile,
  convertExtensions,
  policyDefinitions,
  withScheduleItems,
  scheduleAnalysis,
  withSignInStatus,
  withTeamMatchUps, // not implemented
  tournamentRecord,
  usePublishState,
  withScaleValues,
  withStatistics,
  withGroupings,
  withOpponents,
  withMatchUps,
  withSeeding,
  withEvents,
  withDraws,
  inContext,
  withISO2,
  withIOC,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) return { error: MISSING_PARTICIPANTS };

  const allTournamentParticipants = tournamentRecord.participants.map(
    // (participant) => makeDeepCopy(participant, convertExtensions, true)
    (participant) => makeDeepCopy(participant, convertExtensions) // removed until Mongo/Mongoose issues resolved
  );

  if (typeof participantFilters !== 'object')
    return { error: INVALID_OBJECT, participantFilters };

  if (inContext) {
    allTournamentParticipants?.forEach((participant) => {
      if ([PAIR, TEAM, GROUP].includes(participant.participantType)) {
        participant.individualParticipants =
          participant.individualParticipantIds?.map((participantId) => {
            const targetParticipant = tournamentRecord.participants.find(
              (p) => p.participantId === participantId
            );
            const individualParticipant = makeDeepCopy(
              targetParticipant,
              convertExtensions,
              true
            );

            // individualParticipants only need to be hydrated withScaleValues and nationalityCode variations
            if (withScaleValues) {
              const { ratings, rankings } = getScaleValues({
                participant: individualParticipant,
              });
              individualParticipant.ratings = ratings;
              individualParticipant.rankings = rankings;
            }

            if (withIOC || withISO2)
              addNationalityCode({
                participant: individualParticipant,
                withISO2,
                withIOC,
              });
            return individualParticipant;
          });
      }
    });
  }

  let tournamentParticipants = participantFilters
    ? filterParticipants({
        participants: allTournamentParticipants,
        participantFilters,
        tournamentRecord,
      })
    : allTournamentParticipants;

  let participantIdsWithConflicts, eventsPublishStatuses;

  const addContext =
    withRankingProfile ||
    withScheduleItems ||
    withSignInStatus ||
    scheduleAnalysis ||
    withScaleValues ||
    withStatistics ||
    withGroupings ||
    withOpponents ||
    withMatchUps ||
    withSeeding ||
    withEvents ||
    withDraws ||
    withISO2 ||
    withIOC;

  if (addContext) {
    const result = addParticipantContext({
      tournamentEvents: tournamentRecord.events,
      allTournamentParticipants,
      tournamentParticipants,
      participantFilters,
      withRankingProfile,
      withScheduleItems,
      withSignInStatus,
      tournamentRecord,
      scheduleAnalysis,
      withTeamMatchUps,
      usePublishState,
      withScaleValues,
      withStatistics,
      withGroupings,
      withOpponents,
      withMatchUps,
      withSeeding,
      withEvents,
      withDraws,
      withISO2,
      withIOC,
    });

    participantIdsWithConflicts = result?.participantIdsWithConflicts;
    eventsPublishStatuses = result?.eventsPublishStatuses;
  }

  const participantAttributes = policyDefinitions?.[POLICY_TYPE_PARTICIPANT];
  if (participantAttributes?.participant) {
    tournamentParticipants = tournamentParticipants.map((participant) =>
      attributeFilter({
        template: participantAttributes.participant,
        source: participant,
      })
    );
  }

  return {
    participantIdsWithConflicts,
    tournamentParticipants,
    eventsPublishStatuses,
  };
}
