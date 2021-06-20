// import { assignCollectionPosition, assignDrawPosition } from './positionAssignment';
import { initializeStructureSeedAssignments } from './initializeSeedAssignments';
import { assignDrawPositionBye } from './byePositioning/assignDrawPositionBye';
import { resolveDrawPositions } from '../../generators/drawPositionsResolver';
import { alternateDrawPositionAssignment } from './positionAlternate';
import { automatedPositioning } from './automatedPositioning';
import { swapDrawPositionAssignments } from './positionSwap';
import { getNextSeedBlock } from '../../getters/seedGetter';
import { assignDrawPosition } from './positionAssignment';
import { clearDrawPosition } from './positionClear';
import { setSubOrder } from './setSubOrder';

const positionGovernor = {
  setSubOrder,
  clearDrawPosition,
  assignDrawPosition,
  //  assignCollectionPosition,

  automatedPositioning,
  assignDrawPositionBye,
  swapDrawPositionAssignments,
  alternateDrawPositionAssignment,

  resolveDrawPositions,

  // probably not part of drawEngine final
  initializeStructureSeedAssignments,
  getNextSeedBlock,
};

export default positionGovernor;
