import { updateTeamLineUp } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/updateTeamLineUp';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { getTargetMatchUps } from './getTargetMatchUps';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { MatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  DrawDefinition,
  Event,
  Structure,
  Tournament,
} from '../../../types/tournamentFromSchema';

type ResetLineUpsArgs = {
  inContextDrawMatchUps?: HydratedMatchUp[];
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  matchUpsMap?: MatchUpsMap;
  inheritance?: boolean;
  structure: Structure;
  assignments?: any;
  event?: Event;
};
export function resetLineUps({
  inContextDrawMatchUps,
  inheritance = true,
  tournamentRecord,
  drawDefinition,
  matchUpsMap,
  assignments,
  structure,
  event,
}: ResetLineUpsArgs) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { drawPositions, matchUps, targetMatchUps } = getTargetMatchUps({
    inContextDrawMatchUps,
    matchUpsMap,
    assignments,
    structure,
  });

  // remove all lineUps on appropriate sides of matchUps which include drawPositions
  // this will cause all lineUps to revert back to the team default lineUps (last modification) stored in LINEUPS extension
  for (const inContextMatchUp of targetMatchUps) {
    if (inContextMatchUp.matchUpType !== TEAM_MATCHUP) continue;

    (inContextMatchUp.sides || []).forEach((side: any, sideIndex) => {
      if (side?.drawPosition && drawPositions?.includes(side.drawPosition)) {
        const matchUp = matchUps.find(
          ({ matchUpId }) => matchUpId === inContextMatchUp.matchUpId
        );
        if (matchUp?.sides?.[sideIndex]) {
          delete matchUp.sides[sideIndex].lineUp;

          if (inheritance === false) {
            // remove lineup for team participantId from drawDefinition LINE_UP extension
            const tieFormat = inContextMatchUp.tieFormat;
            const participantId = side.participantId;

            if (tieFormat && participantId) {
              updateTeamLineUp({
                drawDefinition,
                participantId,
                lineUp: [],
                tieFormat,
              });
            }
          }

          modifyMatchUpNotice({
            tournamentId: tournamentRecord?.tournamentId,
            context: 'resetLineUps',
            eventId: event?.eventId,
            drawDefinition,
            matchUp,
          });
        }
      }
    });
  }

  return { ...SUCCESS };
}
