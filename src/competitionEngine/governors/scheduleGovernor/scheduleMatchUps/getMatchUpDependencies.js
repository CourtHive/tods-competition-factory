/**
 * Builds up an exhaustive map of all matchUpIds on which a matchUpId is depdendent
 * Optionally builds up an exhaustive map of all potential participantIds for each matchUpId
 */

import { addGoesTo } from '../../../../drawEngine/governors/matchUpGovernor/addGoesTo';
import { allDrawMatchUps } from '../../../../tournamentEngine/getters/matchUpsGetter';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';
import { getIndividualParticipantIds } from './getIndividualParticipantIds';
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
 * @param {object} drawDefinition - optional - when called internally with subset of matchUps
 * @param {boolean} includeParticipantDependencies - whether to attach all participantIds/potentialParticipantIds
 * @param {object[]} matchUps - optional - optimization to pass matchUps (with nextMatchUps)
 * @param {string[]} drawIds - optional - scope processing to specified drawIds
 * @returns { [matchUpId]: { matchUpIds: [matchUpIdDependency] }, participantIds: [potentialParticipantId] }
 */
export function getMatchUpDependencies({
  includeParticipantDependencies,
  tournamentRecords = {},
  drawDefinition,
  matchUps = [], // requires matchUps { inContext: true }
  drawIds = [],
}) {
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };
  if (!Array.isArray(drawIds)) return { error: MISSING_DRAW_ID };

  const matchUpDependencies = {};

  const initializeMatchUpId = (matchUpId) => {
    if (!matchUpDependencies[matchUpId])
      matchUpDependencies[matchUpId] = {
        dependentMatchUpIds: [],
        participantIds: [],
        matchUpIds: [],
      };
  };

  const propagateDependencies = (matchUpId, targetMatchUpId) => {
    matchUpDependencies[matchUpId].matchUpIds.forEach((matchUpIdDependency) =>
      matchUpDependencies[targetMatchUpId].matchUpIds.push(matchUpIdDependency)
    );
    matchUpDependencies[targetMatchUpId].matchUpIds.push(matchUpId);
    matchUpDependencies[matchUpId].dependentMatchUpIds.push(targetMatchUpId);

    if (includeParticipantDependencies) {
      matchUpDependencies[matchUpId].participantIds.forEach(
        (participantIdDependency) =>
          matchUpDependencies[targetMatchUpId].participantIds.push(
            participantIdDependency
          )
      );
    }
  };

  const processMatchUps = (matchUpsToProcess) => {
    for (const matchUp of matchUpsToProcess) {
      const { matchUpId, winnerMatchUpId, loserMatchUpId } = matchUp;
      initializeMatchUpId(matchUpId);

      if (includeParticipantDependencies) {
        const { individualParticipantIds } =
          getIndividualParticipantIds(matchUp);
        matchUpDependencies[matchUpId].participantIds =
          individualParticipantIds;
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
  };

  if (drawDefinition) {
    addGoesTo({ drawDefinition });
    if (!matchUps.length) {
      ({ matchUps } = allDrawMatchUps({ drawDefinition }));
    }
    processMatchUps(matchUps);
  } else {
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

    for (const drawId of drawIds) {
      let drawMatchUps = matchUps
        // first get all matchUps for the draw
        .filter((matchUp) => matchUp.drawId === drawId)
        // sort by stage/stageSequence/roundNumber/roundPosition
        .sort(matchUpSort);

      const hasGoesTo = !!drawMatchUps.find(
        ({ winnerMatchUpId, loserMatchUpId }) =>
          winnerMatchUpId || loserMatchUpId
      );
      if (!hasGoesTo) {
        const isRoundRobin = drawMatchUps.find(
          ({ roundPosition }) => roundPosition
        );
        // skip this if Round Robin because there is no "Goes To"
        if (!isRoundRobin) {
          const hasTournamentId = drawMatchUps.find(
            ({ tournamentId }) => tournamentId
          );
          const { drawDefinition } = findEvent({
            tournamentRecord: tournamentRecords[hasTournamentId?.tournamentId],
            drawId,
          });
          if (drawDefinition) addGoesTo({ drawDefinition });
        }
      }

      processMatchUps(drawMatchUps);
    }
  }

  return { matchUpDependencies, ...SUCCESS };
}
