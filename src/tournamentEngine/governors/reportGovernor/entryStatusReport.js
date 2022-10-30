import { getParticipants } from '../../getters/participants/getParticipants';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getDetailsWTN } from './getDetailsWTN';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { STRUCTURE_SELECTED_STATUSES } from '../../../constants/entryStatusConstants';
import { WITHDRAW_PARTICIPANT } from '../../../constants/positionActionConstants';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { INDIVIDUAL } from '../../../constants/participantConstants';
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
    withDraws: true,
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

  const withDrawnParticipantIds = [];
  const personEntryReports = {};
  const entryStatusReports = {};
  const eventReports = {};

  const pushEntryReport = ({ id, entry, eventId, eventType }) => {
    const { qualifyingSeeding, mainSeeding, entryStatus, drawId } = entry;

    if (!personEntryReports[id]) personEntryReports[id] = [];

    const { participant, events } = participantMap[id];
    const entryDetailsWTN = getDetailsWTN({ participant, eventType });
    const ranking = events?.[eventId]?.ranking;

    if (entryStatus === WITHDRAW_PARTICIPANT) withDrawnParticipantIds.push(id);

    personEntryReports[id].push({
      participantId: id,
      tournamentId,
      eventId,
      drawId,
      entryStatus,
      ...entryDetailsWTN,
      ranking,
      mainSeeding,
      qualifyingSeeding,
    });
  };

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
        const stageFilter = ({ stage, stageSequence }) =>
          (stage === MAIN && stageSequence === 1) || stage === QUALIFYING;
        const assignedParticipantIds = structures
          .filter(stageFilter)
          .flatMap(({ positionAssignments }) => positionAssignments)
          .map(({ participantId }) => participantId)
          .filter(Boolean);

        const entryFilter = ({ entryStage, participantId }) =>
          entryStage === MAIN && assignedParticipantIds.includes(participantId);

        const createEntryProfile = ({ entryStatus, participantId }) => {
          countEntryStatus(entryStatus);

          const mainSeeding =
            participantMap[participantId]?.draws?.[drawId]?.mainSeeding;
          const qualifyingSeeding =
            participantMap[participantId]?.draws?.[drawId]?.qualifyingSeeding;

          return {
            qualifyingSeeding,
            participantId,
            entryStatus,
            mainSeeding,
            drawId,
          };
        };

        return entries.filter(entryFilter).map(createEntryProfile);
      }
    );

    const createEntryMap = (entry) => {
      const participantId = entry.participantId;
      const individualParticipantIds = participantMap[
        participantId
      ].participant.individualParticipantIds.filter(
        // ensure that for TEAM events individuals who did not compete are not included
        (id) => nonTeamEnteredParticipantIds.includes(id)
      );
      return participantId && { [participantId]: { individualParticipantIds } };
    };

    const processDoublesEvent = () => {
      const participantEntriesMap = Object.assign(
        {},
        ...entries.map(createEntryMap).filter(Boolean)
      );

      const processIndividuals = (entry) => {
        participantEntriesMap[
          entry.participantId
        ].individualParticipantIds.forEach((individualParticipantId) => {
          pushEntryReport({
            id: individualParticipantId,
            eventType,
            eventId,
            entry,
          });
        });
      };

      // add entry details into personEntryReports
      entries.forEach(processIndividuals);
    };

    if (eventType === DOUBLES_EVENT) {
      processDoublesEvent();
    } else {
      // add entry details into personEntryReports
      entries.forEach((entry) => {
        pushEntryReport({ id: entry.participantId, entry, eventId, eventType });
      });
    }

    const totalEntries = Object.values(entryStatuses).reduce(
      (p, c) => p + c.count,
      0
    );
    Object.keys(entryStatuses).forEach((key) => {
      entryStatuses[key].pct = (entryStatuses[key].count / totalEntries) * 100;
    });

    // for each entry of each event get their WTN and eventRanking
    eventReports[eventId] = { tournamentId, eventId, entries, entryStatuses };

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
      tournamentId,
      eventId,
      ...selectedStatuses,
    };
  }

  const nonParticipatingParticipants = Object.values(participantMap)
    .filter(
      ({ participant }) =>
        participant.participantType === INDIVIDUAL &&
        !nonTeamEnteredParticipantIds.includes(participant.participantId)
    )
    .map(({ participant }) => participant.participantId);

  const tournamentEntryReport = {
    nonParticipatingEntriesCount: nonParticipatingParticipants.length,
    tournamentId,
  };

  return {
    entryStatusReports: Object.values(entryStatusReports).flat(),
    personEntryReports: Object.values(personEntryReports).flat(),
    eventReports: Object.values(eventReports).flat(),
    tournamentEntryReport,
  };
}
