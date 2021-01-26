// import { assignCollectionPosition, assignDrawPosition } from './positionAssignment';
import { initializeStructureSeedAssignments } from './initializeSeedAssignments';
import { alternateDrawPositionAssignment } from './positionAlternate';
import { assignDrawPositionBye } from './byePositioning/assignDrawPositionBye';
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

  // probably not part of drawEngine final
  initializeStructureSeedAssignments,
  getNextSeedBlock,
};

export default positionGovernor;
