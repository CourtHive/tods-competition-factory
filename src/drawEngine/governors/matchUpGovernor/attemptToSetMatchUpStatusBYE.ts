import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { decorateResult } from '../../../global/functions/decorateResult';

import { BYE } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_MATCHUP_STATUS,
  INVALID_MATCHUP_STATUS_BYE,
} from '../../../constants/errorConditionConstants';

export function attemptToSetMatchUpStatusBYE({
  tournamentRecord,
  drawDefinition,
  structure,
  matchUp,
}) {
  const stack = 'attemptToSetMatchUpStatusBYE';
  if (matchUp?.winningSide) {
    return decorateResult({
      result: { error: INVALID_MATCHUP_STATUS },
      context: { matchUpStatus: BYE },
      stack,
    });
  }

  // It is not possible to change matchUp status to BYE unless
  // matchUp.drawPositions includes BYE assigned position
  const { positionAssignments } = structureAssignedDrawPositions({
    structure,
  });

  const byeAssignedDrawPositions = positionAssignments
    ?.filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  const matchUpIncludesBye = matchUp.drawPositions?.some(
    (position) => byeAssignedDrawPositions?.includes(position)
  );

  if (matchUpIncludesBye) {
    matchUp.matchUpStatus = BYE;
    matchUp.matchUpStatusCodes = [];
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      context: stack,
      drawDefinition,
      matchUp,
    });
    return { ...SUCCESS };
  } else {
    return decorateResult({
      result: { error: INVALID_MATCHUP_STATUS_BYE },
      info: 'matchUp does not include BYE',
      stack,
    });
  }
}
