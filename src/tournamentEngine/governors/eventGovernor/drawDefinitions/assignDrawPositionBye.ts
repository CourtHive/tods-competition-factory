import { assignDrawPositionBye as assignBye } from '../../../../drawEngine/governors/positionGovernor/byePositioning/assignDrawPositionBye';
import {
  DrawDefinition,
  Tournament,
  Event,
} from '../../../../types/tournamentFromSchema';

type AssignDrawPositionByeArgs = {
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  drawPosition: number;
  structureId: string;
  event: Event;
};

export function assignDrawPositionBye({
  tournamentRecord,
  drawDefinition,
  drawPosition,
  structureId,
  event,
}: AssignDrawPositionByeArgs) {
  return assignBye({
    tournamentRecord,
    drawDefinition,
    drawPosition,
    structureId,
    event,
  });
}
