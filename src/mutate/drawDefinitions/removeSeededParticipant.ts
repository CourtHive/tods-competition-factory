import { ResultType, decorateResult } from '../../global/functions/decorateResult';

import { DrawDefinition, Tournament } from '../../types/tournamentTypes';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_STRUCTURE,
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
  NOT_FOUND,
  STRUCTURE_NOT_FOUND,
} from '../../constants/errorConditionConstants';
import { MAIN, QUALIFYING } from '../../constants/drawDefinitionConstants';

type RemoveSeededParticipantArgs = {
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  participantId: string;
  structureId: string;
};

export function removeSeededParticipant({
  tournamentRecord,
  drawDefinition,
  participantId,
  structureId,
}: RemoveSeededParticipantArgs): ResultType {
  const stack = 'removeSeededParticipant';

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const structure = (drawDefinition.structures ?? []).find((structure) => structure.structureId === structureId);
  if (!structure) return decorateResult({ result: { error: STRUCTURE_NOT_FOUND }, stack });

  if (
    !structure.stage ||
    ![MAIN, QUALIFYING].includes(structure.stage) ||
    (structure.stage === MAIN && structure.stageSequence !== 1)
  ) {
    return decorateResult({ result: { error: INVALID_STRUCTURE }, stack });
  }

  const seedAssignment = structure.seedAssignments?.find((assignment) => assignment.participantId === participantId);

  if (!seedAssignment)
    return decorateResult({
      info: 'participant not seeded',
      result: { error: NOT_FOUND },
      context: { participantId },
    });

  // TODO: implement rotation of seeded players

  return { ...SUCCESS };
}
