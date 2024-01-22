import { addAdHocMatchUps } from '../../../../mutate/structures/addAdHocMatchUps';
import { getParticipantId } from '../../../../global/functions/extractors';
import { generateAdHocMatchUps } from '../generateAdHocMatchUps';
import { generateRange } from '../../../../tools/arrays';
import { drawMatic } from '../drawMatic/drawMatic';

import { STRUCTURE_SELECTED_STATUSES } from '../../../../constants/entryStatusConstants';
import { MAIN } from '../../../../constants/drawDefinitionConstants';

export function generateAdHoc(params) {
  const { tournamentRecord, drawDefinition, structureId, idPrefix, isMock, event } = params;

  const entries = event?.entries?.filter(
    ({ entryStage, entryStatus }) =>
      (!entryStage || entryStage === MAIN) && entryStatus && STRUCTURE_SELECTED_STATUSES.includes(entryStatus),
  );
  const participantIds = entries?.map(getParticipantId);
  const matchUpsCount = entries ? Math.floor(entries.length / 2) : 0;

  if (params.automated) {
    automateAdHoc({ ...params, participantIds });
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

function automateAdHoc(params) {
  const { restrictEntryStatus, generateMatchUps, structureId, matchUpIds, scaleName } = params.drawMatic ?? {};

  const result = drawMatic({
    ...params,
    eventType: params.drawMatic?.eventType ?? params.matchUpType,
    generateMatchUps: generateMatchUps ?? true,
    participantIds: params.participantIds,
    roundsCount: params.roundsCount,
    restrictEntryStatus,
    structureId,
    matchUpIds,
    scaleName, // custom rating name to seed dynamic ratings
  });

  result?.matchUps?.length &&
    addAdHocMatchUps({
      tournamentRecord: params.tournamentRecord,
      drawDefinition: params.drawDefinition,
      suppressNotifications: true,
      matchUps: result.matchUps,
      event: params.event,
      structureId,
    });
}
