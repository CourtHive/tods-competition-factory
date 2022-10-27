import { getParticipants } from '../../getters/participants/getParticipants';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getDetailsWTN } from './getDetailsWTN';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { STRUCTURE_SELECTED_STATUSES } from '../../../constants/entryStatusConstants';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { DOUBLES_EVENT } from '../../../constants/eventConstants';
import {
  DOUBLES_MATCHUP,
  SINGLES_MATCHUP,
} from '../../../constants/matchUpTypes';

export function entryStatusReport({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const tournamentId = tournamentRecord.tournamentId;
  const { participantMap } = getParticipants({
    withScaleValues: true,
    withEvents: true, // so that event rankings will be present
    tournamentRecord,
    // withDraws: true,
  });

  const nonTeamMatchUps = allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES_MATCHUP, DOUBLES_MATCHUP] },
    tournamentRecord,
  }).matchUps;
  const nonTeamEnteredParticipantIds = nonTeamMatchUps.flatMap(({ sides }) =>
    sides.flatMap(({ participant }) =>
      participant
        ? participant.individualParticipantIds || [participant.participantId]
        : []
    )
  );
  const personEntryReports = {};
  const entryStatusReports = {};
  const eventReports = {};

  // Who was in a draw and how they got there...
  for (const event of tournamentRecord.events || []) {
    const entryStatuses = {};
    const countEntryStatus = (entryStatus) => {
      if (!entryStatuses[entryStatus])
        entryStatuses[entryStatus] = { count: 0 };
      entryStatuses[entryStatus].count += 1;
    };

    const { drawDefinitions = [], eventType, eventId } = event;
    const entries = drawDefinitions.flatMap(
      ({ drawId, entries, structures = [] }) => {
        // build up assignedParticipantIds array
        // to ensure that only assignedParticipants are included
        const assignedParticipantIds = structures
          .filter(
            ({ stage, stageSequence }) =>
              (stage === MAIN && stageSequence === 1) || stage === QUALIFYING
          )
          .flatMap(({ positionAssignments }) => positionAssignments)
          .map(({ participantId }) => participantId)
          .filter(Boolean);

        return entries
          .filter(
            ({ entryStage, participantId }) =>
              entryStage === MAIN &&
              assignedParticipantIds.includes(participantId)
          )
          .map(({ entryStatus, participantId }) => {
            countEntryStatus(entryStatus);
            return {
              participantId,
              drawId,
              entryStatus,
            };
          });
      }
    );

    if (eventType === DOUBLES_EVENT) {
      const participantEntriesMap = Object.assign(
        {},
        ...entries
          .map((entry) => {
            const participantId = entry.participantId;
            const individualParticipantIds = participantMap[
              participantId
            ].participant.individualParticipantIds.filter(
              // ensure that for TEAM events individuals who did not compete are not included
              (id) => nonTeamEnteredParticipantIds.includes(id)
            );
            return (
              participantId && { [participantId]: { individualParticipantIds } }
            );
          })
          .filter(Boolean)
      );

      // add entry details into personEntryReports
      for (const entry of entries) {
        const { participantId, entryStatus, drawId } = entry;
        for (const individualParticipantId of participantEntriesMap[
          participantId
        ].individualParticipantIds) {
          if (!personEntryReports[individualParticipantId])
            personEntryReports[individualParticipantId] = [];

          const { participant, events } =
            participantMap[individualParticipantId];
          const entryDetailsWTN = getDetailsWTN({ participant, eventType });
          const ranking = events?.[eventId]?.ranking;

          personEntryReports[individualParticipantId].push({
            participantId: individualParticipantId,
            tournamentId,
            eventId,
            drawId,
            entryStatus,
            ...entryDetailsWTN,
            ranking,
          });
        }
      }
    } else {
      // add entry details into personEntryReports
      for (const entry of entries) {
        const { participantId, entryStatus, drawId } = entry;

        if (!personEntryReports[participantId])
          personEntryReports[participantId] = [];

        const { participant, events } = participantMap[participantId];
        const entryDetailsWTN = getDetailsWTN({ participant, eventType });
        const ranking = events?.[eventId]?.ranking;

        personEntryReports[participantId].push({
          participantId,
          tournamentId,
          eventId,
          drawId,
          entryStatus,
          ...entryDetailsWTN,
          ranking,
        });
      }
    }

    const totalEntries = Object.values(entryStatuses).reduce(
      (p, c) => (p += c.count),
      0
    );
    for (const key of Object.keys(entryStatuses)) {
      entryStatuses[key].pct = (entryStatuses[key].count / totalEntries) * 100;
    }

    // for each entry of each event get their WTN and eventRanking
    eventReports[eventId] = { eventId, entries, entryStatuses };

    const selectedStatuses = Object.assign(
      {},
      ...STRUCTURE_SELECTED_STATUSES.flatMap((entryStatus) => {
        return [
          {
            [entryStatus + '_count']: entryStatuses[entryStatus]?.count,
          },
          {
            [entryStatus + '_pct']: entryStatuses[entryStatus]?.pct,
          },
        ];
      })
    );
    entryStatusReports[eventId] = {
      eventId,
      ...selectedStatuses,
    };
  }

  return {
    eventReports: Object.values(eventReports).flat(),
    entryStatusReports: Object.values(entryStatusReports).flat(),
    personEntryReports: Object.values(personEntryReports).flat(),
  };
}
