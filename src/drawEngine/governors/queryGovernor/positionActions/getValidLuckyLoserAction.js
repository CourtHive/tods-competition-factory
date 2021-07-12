import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { getStructureMatchUps } from '../../../getters/getMatchUps/getStructureMatchUps';
import { getInitialRoundNumber } from '../../../getters/getInitialRoundNumber';
import { findStructure } from '../../../getters/findStructure';

import { MISSING_DRAW_ID } from '../../../../constants/errorConditionConstants';
import {
  LUCKY_PARTICIPANT,
  LUCKY_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';
import { ROUND_OUTCOME } from '../../../../constants/drawDefinitionConstants';

export function getValidLuckyLosersAction({
  drawPosition,
  structureId,
  drawId,

  structure,
  drawDefinition,
  activeDrawPositions,
  positionAssignments,
  isWinRatioFedStructure,
  possiblyDisablingAction,
  tournamentParticipants = [],
}) {
  if (!drawId)
    return { error: MISSING_DRAW_ID, method: 'getValidLuckyLosersAction' };
  if (activeDrawPositions.includes(drawPosition) || isWinRatioFedStructure)
    return {};

  /*
  Available Lucky Losers are those participants who are assigned drawPositions
  in source draw structures and have already lost

  If links are by ROUND_OUTCOME, and...
  If there is only one source structure and only one target structure, then no round restrictions;
  otherwise restrict the aviailable lucky losers by the source round in the source structure
  */

  const { sourceStructureIds, targetStructureIds } =
    drawDefinition.links?.reduce(
      (ids, link) => {
        const sourceStructureId = link.source?.structureId;
        const targetStructureId = link.target?.structureId;
        if (!ids.sourceStructureIds.includes(sourceStructureId))
          ids.sourceStructureIds.push(sourceStructureId);
        if (!ids.targetStructureIds.includes(targetStructureId))
          ids.targetStructureIds.push(targetStructureId);
        return ids;
      },
      { sourceStructureIds: [], targetStructureIds: [] }
    ) || {};

  let relevantLink = drawDefinition.links?.find(
    (link) => link.target?.structureId === structure.structureId
  );
  const sourceStructureId = relevantLink?.source?.structureId;

  const { structure: sourceStructure } = findStructure({
    drawDefinition,
    structureId: sourceStructureId,
  });

  const restrictBySourceRound =
    sourceStructure?.finishingPosition === ROUND_OUTCOME &&
    (sourceStructureIds?.length !== 1 || targetStructureIds?.length !== 1);

  const matchUpFilters = {};
  if (restrictBySourceRound) {
    const { matchUps } = getAllStructureMatchUps({
      structure,
      drawDefinition,
    });
    const { initialRoundNumber } = getInitialRoundNumber({
      matchUps,
      drawPosition,
    });
    relevantLink = drawDefinition.links?.find(
      (link) =>
        link.target?.structureId === structure?.structureId &&
        link.target.roundNumber === initialRoundNumber
    );
    const sourceRoundNumber = relevantLink?.source?.roundNumber;
    matchUpFilters.roundNumbers = [sourceRoundNumber];
  }

  const { completedMatchUps } = getStructureMatchUps({
    structureId: sourceStructureId,
    inContext: true,
    matchUpFilters,
    drawDefinition,
  });

  const assignedParticipantIds = positionAssignments
    .map((assignment) => assignment.participantId)
    .filter(Boolean);

  const availableLuckyLoserParticipantIds = completedMatchUps
    ?.map(({ winningSide, sides }) => sides[1 - (winningSide - 1)])
    .map(({ participantId }) => participantId)
    .filter((participantId) => !assignedParticipantIds.includes(participantId));

  const availableLuckyLosers = tournamentParticipants?.filter((participant) =>
    availableLuckyLoserParticipantIds?.includes(participant.participantId)
  );

  availableLuckyLosers?.forEach((luckyLoser) => {
    const entry = (drawDefinition.entries || []).find(
      (entry) => entry.participantId === luckyLoser.participantId
    );
    luckyLoser.entryPosition = entry?.entryPosition;
  });

  if (availableLuckyLoserParticipantIds?.length) {
    const validLuckyLosersAction = {
      type: LUCKY_PARTICIPANT,
      method: LUCKY_PARTICIPANT_METHOD,
      availableLuckyLosers,
      availableLuckyLoserParticipantIds,
      willDisableLinks: possiblyDisablingAction,
      payload: { drawId, structureId, drawPosition },
    };
    return { validLuckyLosersAction };
  }

  return {};
}
