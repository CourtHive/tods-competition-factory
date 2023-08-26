import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';

import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { MatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import {
  DrawDefinition,
  Event,
  PositionAssignment,
  Structure,
  Tournament,
} from '../../../types/tournamentFromSchema';

type ModifyRoundRobinMatchUpStatusArgs = {
  positionAssignments: PositionAssignment[];
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  matchUpsMap?: MatchUpsMap;
  structure: Structure;
  event?: Event;
};
export function modifyRoundRobinMatchUpsStatus({
  positionAssignments,
  tournamentRecord,
  drawDefinition,
  matchUpsMap,
  structure,
  event,
}: ModifyRoundRobinMatchUpStatusArgs) {
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    matchUpsMap,
    structure,
    event,
  });

  matchUps.forEach((matchUp) => {
    const matchUpAssignments = positionAssignments.filter(
      ({ drawPosition }) => matchUp.drawPositions?.includes(drawPosition)
    );
    const matchUpContainsBye = matchUpAssignments.filter(
      (assignment) => assignment.bye
    ).length;

    if (!matchUp.winningSide) {
      const matchUpStatus = matchUpContainsBye ? BYE : TO_BE_PLAYED;

      Object.assign(matchUp, { matchUpStatus });
      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        context: 'modifyRoundRobinMatchUpsStatus',
        eventId: event?.eventId,
        drawDefinition,
        matchUp,
      });
    }
  });
}
