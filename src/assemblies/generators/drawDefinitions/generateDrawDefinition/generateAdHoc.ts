import { addAdHocMatchUps } from '../../../../mutate/structures/addAdHocMatchUps';
import { getParticipantId } from '../../../../global/functions/extractors';
import { generateAdHocMatchUps } from '../generateAdHocMatchUps';
import { generateRange } from '../../../../tools/arrays';
import { drawMatic } from '../drawMatic/drawMatic';

import { STRUCTURE_SELECTED_STATUSES } from '../../../../constants/entryStatusConstants';
import { MAIN } from '../../../../constants/drawDefinitionConstants';

export function generateAdHoc(params) {
  const { tournamentRecord, drawDefinition, matchUpType, structureId, idPrefix, isMock, event } = params;

  const entries = event?.entries?.filter(
    ({ entryStage, entryStatus }) =>
      (!entryStage || entryStage === MAIN) && entryStatus && STRUCTURE_SELECTED_STATUSES.includes(entryStatus),
  );
  const participantIds = entries?.map(getParticipantId);
  const matchUpsCount = entries ? Math.floor(entries.length / 2) : 0;

  if (params.automated) {
    const { restrictEntryStatus, generateMatchUps, structureId, matchUpIds, scaleName } = params.drawMatic ?? {};

    const result = drawMatic({
      eventType: params.drawMatic?.eventType ?? matchUpType,
      generateMatchUps: generateMatchUps ?? true,
      roundsCount: params.roundsCount,
      restrictEntryStatus,
      tournamentRecord,
      participantIds,
      drawDefinition,
      structureId,
      matchUpIds,
      scaleName, // custom rating name to seed dynamic ratings
      idPrefix,
      isMock,
      event,
    });

    result?.matchUps?.length &&
      addAdHocMatchUps({
        suppressNotifications: true,
        matchUps: result.matchUps,
        tournamentRecord,
        drawDefinition,
        structureId,
        event,
      });
  } else {
    generateRange(1, params.roundsCount + 1).forEach(() => {
      const matchUps = generateAdHocMatchUps({
        newRound: true,
        drawDefinition,
        matchUpsCount,
        idPrefix,
        isMock,
        event,
      }).matchUps;

      matchUps?.length &&
        addAdHocMatchUps({
          suppressNotifications: true,
          tournamentRecord,
          drawDefinition,
          structureId,
          matchUps,
          event,
        });
    });
  }
}
