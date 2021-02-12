import { getDrawMatchUps } from '../../../getters/getMatchUps/drawMatchUps';

import {
  CONSOLATION,
  MAIN,
  PLAY_OFF,
  QUALIFYING,
} from '../../../../constants/drawDefinitionConstants';
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
  tournamentParticipants = [],
}) {
  if (!drawId)
    return { error: MISSING_DRAW_ID, method: 'getValidLuckyLosersAction' };
  if (
    activeDrawPositions.includes(drawPosition) ||
    structure.stage === PLAY_OFF
  )
    return {};

  /*
  Available Lucky Losers are those participants who are assigned drawPositions
  in previous draw structures and have already lost
  */

  const stages = structure.stage === CONSOLATION ? [MAIN] : [QUALIFYING];
  const contextFilters = { stages };
  const { completedMatchUps } = getDrawMatchUps({
    drawDefinition,
    contextFilters,
    inContext: true,
  });

  const availableLuckyLoserParticipantIds = completedMatchUps
    .map(({ winningSide, sides }) => sides[1 - (winningSide - 1)])
    .map(({ participantId }) => participantId);

  // WIP: logic beyond this is in development
  if (drawDefinition) return {};

  const availableLuckyLosers = tournamentParticipants?.filter((participant) =>
    availableLuckyLoserParticipantIds.includes(participant.participantId)
  );
  availableLuckyLosers.forEach((alternate) => {
    const entry = (drawDefinition.entries || []).find(
      (entry) => entry.participantId === alternate.participantId
    );
    alternate.entryPosition = entry?.entryPosition;
  });

  if (availableLuckyLoserParticipantIds.length) {
    const validAlternatesAction = {
      type: LUCKY_PARTICIPANT,
      method: LUCKY_PARTICIPANT_METHOD,
      availableLuckyLosers,
      availableLuckyLoserParticipantIds,
      payload: { drawId, structureId, drawPosition },
    };
    return { validAlternatesAction };
  }

  return {};
}
