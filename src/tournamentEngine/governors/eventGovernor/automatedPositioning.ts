import { automatedPositioning as drawEngineAutomatedPositioning } from '../../../drawEngine/governors/positionGovernor/automatedPositioning';
import { isCompletedStructure } from '../../../drawEngine/governors/queryGovernor/structureActions';
import { getPlayoffStructures } from '../../getters/structureGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import { SeedingProfile } from '../../../types/factoryTypes';
import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
  ErrorType,
  INCOMPLETE_SOURCE_STRUCTURE,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  PositionAssignment,
  Tournament,
} from '../../../types/tournamentFromSchema';

type AutomatedPositioningArgs = {
  seedingProfile?: SeedingProfile;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  applyPositioning?: boolean;
  structureId: string;
  placeByes?: boolean;
  seedsOnly?: boolean;
  drawSize: number;
  event: Event;
};
export function automatedPositioning({
  applyPositioning = true,
  tournamentRecord,
  drawDefinition,
  seedingProfile,
  structureId,
  placeByes,
  seedsOnly,
  drawSize,
  event,
}: AutomatedPositioningArgs) {
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  const participants = tournamentRecord?.participants;

  return drawEngineAutomatedPositioning({
    tournamentRecord,
    applyPositioning,
    drawDefinition,
    seedingProfile,
    participants,
    structureId,
    placeByes,
    seedsOnly,
    drawSize,
  });
}

type StructurePositionAssignmentType = {
  positionAssignments: PositionAssignment[];
  structureId: string;
};

type AutomatedPlayoffPositioningArgs = {
  provisionalPositioning?: boolean;
  seedingProfile?: SeedingProfile;
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  applyPositioning?: boolean;
  structureId: string;
  placeByes?: boolean;
  seedsOnly?: boolean;
  event: Event;
};
export function automatedPlayoffPositioning(
  params: AutomatedPlayoffPositioningArgs
): {
  structurePositionAssignments?: StructurePositionAssignmentType[];
  success?: boolean;
  error?: ErrorType;
} {
  const {
    applyPositioning = true,
    provisionalPositioning,
    tournamentRecord,
    drawDefinition,
    seedingProfile,
    structureId,
    placeByes,
    seedsOnly,
    event,
  } = params;

  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  const structureIsComplete = isCompletedStructure({
    drawDefinition,
    structureId,
  });
  if (!structureIsComplete && !provisionalPositioning) {
    return { error: INCOMPLETE_SOURCE_STRUCTURE };
  }

  const { playoffStructures } = getPlayoffStructures({
    drawDefinition,
    structureId,
  });
  const structurePositionAssignments: StructurePositionAssignmentType[] = [];

  const participants = tournamentRecord?.participants;

  if (playoffStructures) {
    for (const structure of playoffStructures) {
      const { structureId: playoffStructureId } = structure;
      const result = drawEngineAutomatedPositioning({
        structureId: playoffStructureId,
        provisionalPositioning,
        applyPositioning,
        drawDefinition,
        seedingProfile,
        participants,
        placeByes,
        seedsOnly,
      });

      if (result.error) return result;

      if (result.positionAssignments) {
        structurePositionAssignments.push({
          positionAssignments: result.positionAssignments,
          structureId: playoffStructureId,
        });
      }
    }
  }

  return { ...SUCCESS, structurePositionAssignments };
}
