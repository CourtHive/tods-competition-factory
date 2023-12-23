import { conditionallyDisableLinkPositioning } from '../../../../mutate/drawDefinitions/positionGovernor/conditionallyDisableLinkPositioning';
import { addPositionActionTelemetry } from '../../../../mutate/drawDefinitions/positionGovernor/addPositionActionTelemetry';
import { assignDrawPositionBye } from '../../../../mutate/matchUps/drawPositions/assignDrawPositionBye';
import { clearDrawPosition } from '../../../../mutate/matchUps/drawPositions/positionClear';
import { findTournamentParticipant } from '../../../../acquire/findTournamentParticipant';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { findStructure } from '../../../../acquire/findStructure';
import { modifyEntriesStatus } from '../entries/modifyEntriesStatus';
import { destroyPairEntry } from '../entries/destroyPairEntry';

import { PAIR } from '../../../../constants/participantConstants';
import {
  ALTERNATE,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';

export function removeDrawPositionAssignment(params) {
  const {
    tournamentRecord,
    replaceWithBye,
    drawDefinition,
    destroyPair,
    entryStatus,
    matchUpsMap,
    drawId,
  } = params;

  const stack = 'removeDrawPositionAssignment';

  const result = clearDrawPosition(params);
  if (result.error) return decorateResult({ result, stack });

  const { participantId } = result;
  const { drawPosition, event, structureId } = params;

  if ([ALTERNATE, WITHDRAWN].includes(entryStatus) && participantId) {
    const { tournamentRecord } = params;
    const { participant } = findTournamentParticipant({
      tournamentRecord,
      participantId,
    });
    const { participantType, individualParticipantIds } = participant ?? {};

    if (destroyPair && participantType === PAIR) {
      const result = destroyPairEntry({
        tournamentRecord,
        drawDefinition,
        participantId,
        event,
      });
      if (result.error) return decorateResult({ result, stack });
      if (individualParticipantIds)
        modifyEntriesStatus({
          participantIds: individualParticipantIds,
          tournamentRecord,
          drawDefinition,
          entryStatus,
          drawId,
          event,
        });
    } else {
      modifyEntriesStatus({
        participantIds: [participantId],
        tournamentRecord,
        drawDefinition,
        entryStatus,
        drawId,
        event,
      });
    }
  }

  if (replaceWithBye) {
    const result = assignDrawPositionBye({
      tournamentRecord,
      drawDefinition,
      drawPosition,
      structureId,
      matchUpsMap,
      event,
    });
    if (result.error) return decorateResult({ result, stack });
  }

  const { structure } = findStructure({ drawDefinition, structureId });
  conditionallyDisableLinkPositioning({
    structure,
    drawPositions: [drawPosition],
  });
  const positionAction = {
    name: 'removeDrawPositionAssignment',
    replaceWithBye,
    drawPosition,
    entryStatus,
    structureId,
  };
  addPositionActionTelemetry({ drawDefinition, positionAction });

  return result;
}
