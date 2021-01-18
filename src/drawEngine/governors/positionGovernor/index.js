// import { assignCollectionPosition, assignDrawPosition } from './positionAssignment';
import { initializeStructureSeedAssignments } from './initializeSeedAssignments';
import { alternateDrawPositionAssignment } from './positionAlternate';
import { assignDrawPositionBye } from './assignDrawPositionBye';
import { automatedPositioning } from './automatedPositioning';
import { swapDrawPositionAssignments } from './positionSwap';
import { getNextSeedBlock } from '../../getters/seedGetter';
import { assignDrawPosition } from './positionAssignment';
import { clearDrawPosition } from './positionClear';

const positionGovernor = {
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
