import { getDrawMatchUps } from '../../../getters/getMatchUps/drawMatchUps';

import { MISSING_DRAW_ID } from '../../../../constants/errorConditionConstants';
import {
  LUCKY_PARTICIPANT,
  LUCKY_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidLuckyLosersAction({
  drawPosition,
  structureId,
  drawId,

  structure,
  drawDefinition,
  activeDrawPositions,
  positionAssignments,
  possiblyDisablingAction,
  tournamentParticipants = [],
}) {
  if (!drawId)
    return { error: MISSING_DRAW_ID, method: 'getValidLuckyLosersAction' };
  if (activeDrawPositions.includes(drawPosition)) return {};

  /*
  Available Lucky Losers are those participants who are assigned drawPositions
  in source draw structures and have already lost
  */

  const relevantLink = drawDefinition.links?.find(
    (link) => link.target?.structureId === structure.structureId
  );
  const sourceStructureIds = [relevantLink?.source?.structureId].filter(
    (f) => f
  );

  const contextFilters = { structureIds: sourceStructureIds };
  let { completedMatchUps } = getDrawMatchUps({
    drawDefinition,
    contextFilters,
    inContext: true,
  });

  const assignedParticipantIds = positionAssignments
    .map((assignment) => assignment.participantId)
    .filter((f) => f);

  const availableLuckyLoserParticipantIds = completedMatchUps
    .map(({ winningSide, sides }) => sides[1 - (winningSide - 1)])
    .map(({ participantId }) => participantId)
    .filter((participantId) => !assignedParticipantIds.includes(participantId));

  const availableLuckyLosers = tournamentParticipants?.filter((participant) =>
    availableLuckyLoserParticipantIds.includes(participant.participantId)
  );

  availableLuckyLosers.forEach((luckyLoser) => {
    const entry = (drawDefinition.entries || []).find(
      (entry) => entry.participantId === luckyLoser.participantId
    );
    luckyLoser.entryPosition = entry?.entryPosition;
  });

  if (availableLuckyLoserParticipantIds.length) {
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
