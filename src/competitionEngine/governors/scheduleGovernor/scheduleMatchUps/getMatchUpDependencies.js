/**
 * Builds up an exhaustive map of all matchUpIds on which a matchUpId is depdendent
 * Optionally builds up an exhaustive map of all potential participantIds for each matchUpId
 */

import { getMatchUpParticipantIds } from '../../../../drawEngine/accessors/participantAccessor';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { matchUpSort } from '../../../../drawEngine/getters/matchUpSort';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_DRAW_ID,
  MISSING_MATCHUPS,
} from '../../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecords - passed in automatically by competitionEngine
 * @param {boolean} includeParticipantDependencies - whether to attach all participantIds/potentialParticipantIds
 * @param {object[]} matchUps - optional - optimization to pass matchUps (with nextMatchUps)
 * @param {string[]} drawIds - optional - scope processing to specified drawIds
 * @returns { [matchUpId]: { matchUpIds: [matchUpIdDependency] }, participantIds: [potentialParticipantId] }
 */
export function getMatchUpDependencies({
  tournamentRecords,
  includeParticipantDependencies,
  matchUps = [],
  drawIds = [],
}) {
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };
  if (!Array.isArray(drawIds)) return { error: MISSING_DRAW_ID };

  if (!matchUps.length) {
    ({ matchUps } = allCompetitionMatchUps({
      tournamentRecords,
      nextMatchUps: true,
    }));
  }

  if (!drawIds.length) {
    drawIds = tournamentRecords
      ? Object.values(tournamentRecords)
          .map(({ events = [] }) =>
            events.map(({ drawDefinitions = [] }) =>
              drawDefinitions.map(({ drawId }) => drawId)
            )
          )
          .flat(Infinity)
      : [];
  }

  const matchUpDependencies = {};

  const initializeMatchUpId = (matchUpId) => {
    if (!matchUpDependencies[matchUpId])
      matchUpDependencies[matchUpId] = { matchUpIds: [], participantIds: [] };
  };

  const propagateDependencies = (matchUpId, targetMatchUpId) => {
    matchUpDependencies[matchUpId].matchUpIds.forEach((matchUpIdDependency) =>
      matchUpDependencies[targetMatchUpId].matchUpIds.push(matchUpIdDependency)
    );
    matchUpDependencies[targetMatchUpId].matchUpIds.push(matchUpId);

    if (includeParticipantDependencies) {
      matchUpDependencies[matchUpId].participantIds.forEach(
        (participantIdDependency) =>
          matchUpDependencies[targetMatchUpId].participantIds.push(
            participantIdDependency
          )
      );
    }
  };

  for (const drawId of drawIds) {
    const drawMatchUps = matchUps
      // first get all matchUps for the draw
      .filter((matchUp) => matchUp.drawId === drawId)
      // sort by stage/stageSequence/roundNumber/roundPosition
      .sort(matchUpSort);

    for (const matchUp of drawMatchUps) {
      const { matchUpId, winnerMatchUpId, loserMatchUpId } = matchUp;
      initializeMatchUpId(matchUpId);

      if (includeParticipantDependencies) {
        const { allRelevantParticipantIds } = getMatchUpParticipantIds({
          matchUp,
        });
        matchUpDependencies[matchUpId].participantIds =
          allRelevantParticipantIds;
      }

      if (winnerMatchUpId) {
        initializeMatchUpId(winnerMatchUpId);
        propagateDependencies(matchUpId, winnerMatchUpId);
      }
      if (loserMatchUpId) {
        initializeMatchUpId(loserMatchUpId);
        propagateDependencies(matchUpId, loserMatchUpId);
      }
    }
  }

  return { matchUpDependencies, ...SUCCESS };
}
