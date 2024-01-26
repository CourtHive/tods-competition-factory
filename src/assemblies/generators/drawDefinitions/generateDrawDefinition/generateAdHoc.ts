import { generateAdHocRounds } from '../drawTypes/adHoc/generateAdHocRounds';
import { addAdHocMatchUps } from '@Mutate/structures/addAdHocMatchUps';
import { drawMatic } from '../drawTypes/adHoc/drawMatic/drawMatic';
import { getParticipantId } from '@Functions/global/extractors';

// constants
import { STRUCTURE_SELECTED_STATUSES } from '../../../../constants/entryStatusConstants';
import { MAIN } from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function generateAdHoc(params) {
  const { tournamentRecord, drawDefinition, structureId, idPrefix, isMock, event } = params;

  const entries = event?.entries?.filter(
    ({ entryStage, entryStatus }) =>
      (!entryStage || entryStage === MAIN) && entryStatus && STRUCTURE_SELECTED_STATUSES.includes(entryStatus),
  );
  const participantIds = entries?.map(getParticipantId);
  const matchUpsCount = entries ? Math.floor(entries.length / 2) : 0;

  if (params.automated) {
    return automateAdHoc({ ...params, participantIds });
  } else {
    const genResult = generateAdHocRounds({
      roundsCount: params.roundsCount,
      drawDefinition,
      matchUpsCount,
      idPrefix,
      isMock,
      event,
    });
    if (genResult.error) return genResult;
    if (genResult.matchUps?.length) {
      addAdHocMatchUps({
        matchUps: genResult.matchUps,
        suppressNotifications: true,
        tournamentRecord,
        drawDefinition,
        structureId,
        event,
      });
    }
  }

  return { ...SUCCESS };
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
  if (result.error) return result;

  result?.matchUps?.length &&
    addAdHocMatchUps({
      tournamentRecord: params.tournamentRecord,
      drawDefinition: params.drawDefinition,
      suppressNotifications: true,
      matchUps: result.matchUps,
      event: params.event,
      structureId,
    });

  return { ...SUCCESS };
}
