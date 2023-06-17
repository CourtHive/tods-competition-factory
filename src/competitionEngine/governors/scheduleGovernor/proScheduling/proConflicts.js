import { getMatchUpDependencies } from '../scheduleMatchUps/getMatchUpDependencies';
import { generateRange, instanceCount, unique } from '../../../../utilities';
import { matchUpSort } from '../../../../drawEngine/getters/matchUpSort';

import {
  MISSING_CONTEXT,
  MISSING_MATCHUPS,
} from '../../../../constants/errorConditionConstants';
import {
  SCHEDULE_ISSUE_IDS,
  SCHEDULE_CONFLICT,
  SCHEDULE_WARNING,
  SCHEDULE_ERROR,
  SCHEDULE_ISSUE,
  SCHEDULE_STATE,
  CONFLICT_MATCHUP_ORDER,
  CONFLICT_PARTICIPANTS,
} from '../../../../constants/scheduleConstants';

// NOTE: matchUps are assumed to be { inContext: true, nextMatchUps: true }
export function proConflicts({ tournamentRecords, matchUps } = {}) {
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };
  if (matchUps.some(({ hasContext }) => !hasContext)) {
    return {
      info: 'matchUps must have { inContext: true, nextMatchUps: true }',
      error: MISSING_CONTEXT,
    };
  }

  const maxCourtOrder = Math.max(
    ...matchUps
      .map(({ schedule }) => schedule?.courtOrder || 1)
      .map((order) => parseInt(order))
  );
  const filteredRows = generateRange(1, maxCourtOrder + 1).map((courtOrder) =>
    matchUps.filter((m) => parseInt(m.schedule?.courtOrder) === courtOrder)
  );

  const matchUpsMap = {};
  const courtIssues = {};
  const rowIndices = {};

  const sortedFiltered = filteredRows.flat().filter(Boolean).sort(matchUpSort);

  sortedFiltered.forEach(({ schedule }) => delete schedule[SCHEDULE_STATE]);

  const drawIds = unique(matchUps.map(({ drawId }) => drawId));
  const deps = getMatchUpDependencies({
    includeParticipantDependencies: true,
    tournamentRecords,
    drawIds,
  }).matchUpDependencies;

  const rowProfiles = filteredRows.map((row, rowIndex) =>
    row.reduce(
      (profile, matchUp) => {
        if (!matchUp.matchUpId) return profile;

        const { matchUpId, winnerMatchUpId, loserMatchUpId, schedule } =
          matchUp;
        const courtId = schedule?.courtId;
        rowIndices[matchUpId] = rowIndex;
        courtIssues[courtId] = [];

        profile.matchUpIds.push(matchUpId);
        matchUpsMap[matchUpId] = matchUp;

        const sourceMatchUpIds = deps[matchUpId].matchUpIds;
        sourceMatchUpIds.length &&
          profile.sourceMatchUpIds.push(...sourceMatchUpIds);

        profile.participantIds.push(...deps[matchUpId].participantIds);

        winnerMatchUpId && profile.targetMatchUpIds.push(winnerMatchUpId);
        loserMatchUpId && profile.targetMatchUpIds.push(loserMatchUpId);

        return profile;
      },
      {
        matchUpIds: [],
        sourceMatchUpIds: [],
        targetMatchUpIds: [],
        participantIds: [],
      }
    )
  );

  const sourceDistance = (a, b) =>
    deps[a].sources.reduce(
      (distance, round, index) => (round.includes(b) && index + 1) || distance,
      0
    );

  const rowIssues = rowProfiles.map(() => []);
  const annotate = (matchUpId, issue, issueType, issueIds) => {
    if (!matchUpsMap[matchUpId].schedule[SCHEDULE_STATE]) {
      // store issue for display below by order of severity
      matchUpsMap[matchUpId].schedule[SCHEDULE_STATE] = issue;
      matchUpsMap[matchUpId].schedule[SCHEDULE_ISSUE_IDS] = issueIds;

      // update row issues
      rowIssues[rowIndices[matchUpId]].push({
        matchUpId,
        issue,
        issueType,
        issueIds,
      });

      // update court issues
      const courtId = matchUpsMap[matchUpId].schedule.courtId;
      if (!courtIssues[courtId]) courtIssues[courtId] = [];
      courtIssues[courtId].push({ matchUpId, issue, issueType, issueIds });
    }
  };

  rowProfiles.forEach((row, rowIndex) => {
    const previousRow = rowIndex ? rowProfiles[rowIndex - 1] : undefined;
    const subsequentRows = rowProfiles.slice(rowIndex + 1);

    const participantConflicts = {};

    const instances = instanceCount(row.participantIds);
    const conflictedParticipantIds = Object.keys(instances).filter(
      (key) => instances[key] > 1
    );
    const conflictedMatchUpIds = row.matchUpIds.filter((matchUpId) =>
      deps[matchUpId].participantIds.some((id) =>
        conflictedParticipantIds.includes(id)
      )
    );
    conflictedMatchUpIds.forEach((matchUpId) => {
      if (!participantConflicts[matchUpId])
        participantConflicts[matchUpId] = {};
      if (!participantConflicts[matchUpId][SCHEDULE_CONFLICT]) {
        participantConflicts[matchUpId][SCHEDULE_CONFLICT] =
          conflictedMatchUpIds.filter((id) => id !== matchUpId);
      }
    });

    const previousRowWarnings =
      previousRow &&
      row.participantIds.filter((id) =>
        previousRow.participantIds.includes(id)
      );
    if (previousRowWarnings) {
      previousRowWarnings.forEach((participantId) => {
        const warnedMatchUpIds = row.matchUpIds
          .concat(previousRow.matchUpIds)
          .filter((matchUpId) =>
            deps[matchUpId].participantIds.includes(participantId)
          );
        warnedMatchUpIds.forEach((matchUpId) => {
          if (!participantConflicts[matchUpId])
            participantConflicts[matchUpId] = {};
          if (!participantConflicts[matchUpId][SCHEDULE_WARNING]) {
            participantConflicts[matchUpId][SCHEDULE_WARNING] =
              warnedMatchUpIds.filter((id) => id !== matchUpId);
          }
        });
      });
    }

    row.matchUpIds.forEach((matchUpId) => {
      const sourceMatchUpIds = deps[matchUpId].matchUpIds;

      // IMPORTANT: maintain order of annotations
      // SCHEDULE_STATE values progress from ERROR => CONFLICT => WARNING

      // ERRORS Section
      for (const subsequentRow of subsequentRows) {
        const sourceAfter = subsequentRow.matchUpIds.filter((id) =>
          sourceMatchUpIds.includes(id)
        );
        if (sourceAfter?.length) {
          sourceAfter.forEach((id) =>
            annotate(id, SCHEDULE_ERROR, CONFLICT_MATCHUP_ORDER, [matchUpId])
          );
          annotate(
            matchUpId,
            SCHEDULE_ERROR,
            CONFLICT_MATCHUP_ORDER,
            sourceAfter
          );
        }
      }

      // CONFLICTS Section
      if (participantConflicts[matchUpId]?.[SCHEDULE_CONFLICT]) {
        annotate(
          matchUpId,
          SCHEDULE_CONFLICT,
          CONFLICT_PARTICIPANTS,
          participantConflicts[matchUpId][SCHEDULE_CONFLICT]
        );
      }

      // if the matchUpId is part of the sources for other row matchUps => conflict
      if (row.sourceMatchUpIds.includes(matchUpId)) {
        const sources = row.matchUpIds.filter((id) =>
          deps[id].matchUpIds.includes(matchUpId)
        );
        annotate(matchUpId, SCHEDULE_CONFLICT, CONFLICT_MATCHUP_ORDER, sources);
        row.matchUpIds
          .filter((id) => deps[id].matchUpIds.includes(matchUpId))
          .forEach((id) =>
            annotate(id, SCHEDULE_CONFLICT, CONFLICT_MATCHUP_ORDER, [matchUpId])
          );
      }

      // ISSUES Section
      const insufficientGap = previousRow?.matchUpIds?.filter(
        (id) => sourceDistance(matchUpId, id) > 1
      );
      if (insufficientGap?.length) {
        annotate(
          matchUpId,
          SCHEDULE_ISSUE,
          CONFLICT_MATCHUP_ORDER,
          insufficientGap
        );
        insufficientGap.forEach((id) =>
          annotate(id, SCHEDULE_ISSUE, CONFLICT_MATCHUP_ORDER, [matchUpId])
        );
      }

      // WARNINGS Section
      if (participantConflicts[matchUpId]?.[SCHEDULE_WARNING]) {
        annotate(
          matchUpId,
          SCHEDULE_WARNING,
          CONFLICT_PARTICIPANTS,
          participantConflicts[matchUpId][SCHEDULE_WARNING]
        );
      }
      if (previousRow?.targetMatchUpIds?.includes(matchUpId)) {
        // IF: connected matchUps are on the same court with sufficient time between them
        // OR: connected matchUps are on the same court and the target matchUp has 'FOLLOWED_BY'
        // THEN: no WARNING will be given
        const consideredCourtId = matchUpsMap[matchUpId].schedule.courtId;
        const warningMatchUpIds = sourceMatchUpIds.filter((id) =>
          previousRow.matchUpIds.includes(id)
        );
        const allSameCourt = warningMatchUpIds.some(
          (id) => matchUpsMap[id].schedule.courtId === consideredCourtId
        );
        if (!allSameCourt) {
          warningMatchUpIds.forEach((id) =>
            annotate(id, SCHEDULE_WARNING, CONFLICT_MATCHUP_ORDER, [matchUpId])
          );
          annotate(
            matchUpId,
            SCHEDULE_WARNING,
            CONFLICT_MATCHUP_ORDER,
            warningMatchUpIds
          );
        }
      }
    });
  });

  return { courtIssues, rowIssues };
}
