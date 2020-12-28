// import { assignCollectionPosition, assignDrawPosition } from './positionAssignment';
import { initializeStructureSeedAssignments } from './initializeSeedAssignments';
import { automatedPositioning } from './automatedPositioning';
import { getNextSeedBlock } from '../../getters/seedGetter';
import { assignDrawPosition } from './positionAssignment';
import { assignDrawPositionBye } from './positionByes';
import { clearDrawPosition } from './positionClear';
import { alternateDrawPositionAssignment } from './positionAlternate';
import { swapDrawPositionAssignments } from './positionSwap';

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
