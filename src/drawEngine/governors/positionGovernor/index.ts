import { initializeStructureSeedAssignments } from './initializeSeedAssignments';
import { assignDrawPositionBye } from './byePositioning/assignDrawPositionBye';
import { resolveDrawPositions } from '../../generators/drawPositionsResolver';
import { alternateDrawPositionAssignment } from '../../../mutate/matchUps/drawPositions/positionAlternate';
import { setPositionAssignments } from './setPositionAssignments';
import { automatedPositioning } from './automatedPositioning';
import { swapDrawPositionAssignments } from '../../../mutate/matchUps/drawPositions/positionSwap';
import { getNextSeedBlock } from '../../getters/seedGetter';
import { resetMatchUpLineUps } from './resetMatchUpLineUps';
import { assignDrawPosition } from '../../../mutate/matchUps/drawPositions/positionAssignment';
import { clearDrawPosition } from '../../../mutate/matchUps/drawPositions/positionClear';
import { setSubOrder } from './setSubOrder';

const positionGovernor = {
  setSubOrder,
  clearDrawPosition,
  assignDrawPosition,
  setPositionAssignments,

  automatedPositioning,
  assignDrawPositionBye,
  swapDrawPositionAssignments,
  alternateDrawPositionAssignment,

  resolveDrawPositions,
  resetMatchUpLineUps,

  // probably not part of drawEngine final
  initializeStructureSeedAssignments,
  getNextSeedBlock,
};

export default positionGovernor;
