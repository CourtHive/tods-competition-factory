import { modifyMatchUpNotice } from '../../../../drawEngine/notifications/drawNotifications';
import { findMatchUp } from '../../../../drawEngine/getters/getMatchUps/findDrawMatchUp';
import { findExtension } from '../../queryGovernor/extensionQueries';
import { makeDeepCopy } from '../../../../utilities';

import { LINEUPS } from '../../../../constants/extensionConstants';
import { HydratedMatchUp } from '../../../../types/hydrated';
import {
  DrawDefinition,
  MatchUp,
} from '../../../../types/tournamentFromSchema';

type EnsureSideLineUpsArgs = {
  inContextDualMatchUp?: HydratedMatchUp;
  drawDefinition: DrawDefinition;
  tournamentId?: string;
  dualMatchUp?: MatchUp;
  eventId?: string;
};
export function ensureSideLineUps({
  inContextDualMatchUp,
  drawDefinition,
  tournamentId,
  dualMatchUp,
  eventId,
}: EnsureSideLineUpsArgs) {
  if (dualMatchUp && !dualMatchUp?.sides?.length) {
    if (!inContextDualMatchUp) {
      inContextDualMatchUp = findMatchUp({
        matchUpId: dualMatchUp.matchUpId,
        inContext: true,
        drawDefinition,
      })?.matchUp;
    }

    const { extension } = findExtension({
      element: drawDefinition,
      name: LINEUPS,
    });

    const lineUps = makeDeepCopy(extension?.value || {}, false, true);

    const extractSideDetail = ({
      displaySideNumber,
      drawPosition,
      sideNumber,
    }) => ({ drawPosition, sideNumber, displaySideNumber });

    dualMatchUp.sides = inContextDualMatchUp?.sides?.map((side: any) => {
      const participantId = side.participantId;
      return {
        ...extractSideDetail(side),
        lineUp: (participantId && lineUps[participantId]) || [],
      };
    });

    modifyMatchUpNotice({
      context: 'ensureSidLineUps',
      matchUp: dualMatchUp,
      drawDefinition,
      tournamentId,
      eventId,
    });
  }
}
