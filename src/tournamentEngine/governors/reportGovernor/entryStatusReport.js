import { getParticipants } from '../../getters/participants/getParticipants';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getDetailsWTN } from './getDetailsWTN';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { STRUCTURE_SELECTED_STATUSES } from '../../../constants/entryStatusConstants';
import { WITHDRAW_PARTICIPANT } from '../../../constants/positionActionConstants';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { INDIVIDUAL } from '../../../constants/participantConstants';
import { DOUBLES_EVENT } from '../../../constants/eventConstants';
import { COMPETITOR } from '../../../constants/participantRoles';
import {
  DOUBLES_MATCHUP,
  SINGLES_MATCHUP,
} from '../../../constants/matchUpTypes';

export function getEntryStatusReports({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const tournamentId = tournamentRecord.tournamentId;
  const { participantMap } = getParticipants({
    withScaleValues: true,
    withEvents: true, // so that event rankings will be present
    withSeeding: true,
    tournamentRecord,
    withDraws: true,
  });

  const nonTeamMatchUps = allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES_MATCHUP, DOUBLES_MATCHUP] },
    tournamentRecord,
  }).matchUps;

  const nonTeamEnteredParticipantIds = nonTeamMatchUps
    .flatMap(({ sides, matchUpType }) =>
      sides
        .flatMap(({ participant, participantId }) =>
          matchUpType === DOUBLES_MATCHUP
            ? participant?.individualParticipantIds
            : participant?.participantId || participantId
        )
        .filter(Boolean)
    )
    .filter(Boolean);

  const withDrawnParticipantIds = [];
  const participantEntryReports = {};
  const entryStatusReports = {};
  const eventReports = {};

  let drawDefinitionsCount = 0;

  const pushEntryReport = ({ id, entry, eventId, eventType }) => {
    const { qualifyingSeeding, mainSeeding, entryStatus, entryStage, drawId } =
      entry;

    if (!participantEntryReports[id]) participantEntryReports[id] = [];

    const { participant, events } = participantMap[id];
    const entryDetailsWTN = getDetailsWTN({ participant, eventType });
    const ranking = events?.[eventId]?.ranking;

    if (entryStatus === WITHDRAW_PARTICIPANT) withDrawnParticipantIds.push(id);

    participantEntryReports[id].push({
      participantType: participant?.participantType,
      participantId: id,
      tournamentId,
      eventType,
      eventId,
      drawId,
      entryStatus,
      entryStage,
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
        drawDefinitionsCount += 1;

        // build up assignedParticipantIds array
        // to ensure that only assignedParticipants are included
        const stageFilter = ({ stage, stageSequence }) =>
          (stage === MAIN && stageSequence === 1) || stage === QUALIFYING;
        const assignedParticipantIds = structures
          .filter(stageFilter)
          .flatMap(({ positionAssignments }) => positionAssignments)
          .map(({ participantId }) => participantId)
          .filter(Boolean);

        const entryFilter = ({ participantId }) =>
          assignedParticipantIds.includes(participantId);

        const createEntryProfile = ({
          participantId,
          entryStatus,
          entryStage,
        }) => {
          countEntryStatus(entryStatus);

          const mainSeeding =
            participantMap[participantId]?.draws?.[drawId]?.seedAssignments?.[
              MAIN
            ];
          const qualifyingSeeding =
            participantMap[participantId]?.draws?.[drawId]?.seedAssignments?.[
              QUALIFYING
            ];

          return {
            qualifyingSeeding,
            participantId,
            mainSeeding,
            entryStatus,
            entryStage,
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

      // add entry details into participantEntryReports
      entries.forEach(processIndividuals);
    };

    if (eventType === DOUBLES_EVENT) {
      processDoublesEvent();
    } else {
      // add entry details into participantEntryReports
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

  const individualParticipants = Object.values(participantMap).filter(
    ({ participant: { participantType, participantRole } }) =>
      participantType === INDIVIDUAL && participantRole === COMPETITOR
  );
  const nonParticipatingParticipants = individualParticipants
    .filter(
      ({ participant }) =>
        !nonTeamEnteredParticipantIds.includes(participant.participantId)
    )
    .map(({ participant }) => participant.participantId);

  const tournamentEntryReport = {
    nonParticipatingEntriesCount: nonParticipatingParticipants.length,
    individualParticipantsCount: individualParticipants.length,
    eventsCount: Object.values(eventReports).length,
    drawDefinitionsCount,
    tournamentId,
  };

  return {
    entryStatusReports: Object.values(entryStatusReports).flat(),
    participantEntryReports: Object.values(participantEntryReports).flat(),
    eventReports: Object.values(eventReports).flat(),
    withDrawnParticipantIds,
    tournamentEntryReport,
  };
}
