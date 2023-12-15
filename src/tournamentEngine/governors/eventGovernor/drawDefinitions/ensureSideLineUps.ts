import { modifyMatchUpNotice } from '../../../../drawEngine/notifications/drawNotifications';
import { findDrawMatchUp } from '../../../../acquire/findDrawMatchUp';
import { findExtension } from '../../../../acquire/findExtensionQueries';
import { makeDeepCopy } from '../../../../utilities';

import { LINEUPS } from '../../../../constants/extensionConstants';
import { HydratedMatchUp } from '../../../../types/hydrated';
import { DrawDefinition, MatchUp } from '../../../../types/tournamentTypes';

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
  if (dualMatchUp) {
    if (!inContextDualMatchUp) {
      inContextDualMatchUp = findDrawMatchUp({
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

    dualMatchUp.sides = inContextDualMatchUp?.sides?.map((contextSide: any) => {
      const participantId = contextSide.participantId;
      const referenceLineUp =
        (participantId && lineUps[participantId]) || undefined;
      const { lineUp: noContextLineUp, ...noContextSideDetail } =
        dualMatchUp.sides?.find(
          ({ sideNumber }) => sideNumber === contextSide.sideNumber
        ) ?? {};
      const lineUp = noContextLineUp?.length
        ? noContextLineUp
        : referenceLineUp;
      return {
        ...extractSideDetail(contextSide),
        ...noContextSideDetail,
        lineUp,
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
