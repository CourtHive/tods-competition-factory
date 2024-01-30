import { conditionallyDisableLinkPositioning } from './positionGovernor/conditionallyDisableLinkPositioning';
import { assignDrawPositionBye } from '@Mutate/matchUps/drawPositions/assignDrawPositionBye';
import { addPositionActionTelemetry } from './positionGovernor/addPositionActionTelemetry';
import { clearDrawPosition } from '@Mutate/matchUps/drawPositions/positionClear';
import { findTournamentParticipant } from '@Acquire/findTournamentParticipant';
import { modifyEntriesStatus } from '@Mutate/entries/modifyEntriesStatus';
import { destroyPairEntry } from '@Mutate/entries/destroyPairEntry';
import { decorateResult } from '@Functions/global/decorateResult';
import { findStructure } from '@Acquire/findStructure';

// constants and types
import { ALTERNATE, WITHDRAWN } from '@Constants/entryStatusConstants';
import { PAIR } from '@Constants/participantConstants';
import { ResultType } from '../../types/factoryTypes';

export function removeDrawPositionAssignment(params): ResultType & { participantId?: string } {
  const { tournamentRecord, replaceWithBye, drawDefinition, destroyPair, entryStatus, matchUpsMap, drawId } = params;

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
