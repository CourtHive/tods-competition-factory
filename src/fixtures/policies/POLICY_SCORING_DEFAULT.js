import { MAIN } from '../../constants/drawDefinitionConstants';
import { POLICY_TYPE_SCORING } from '../../constants/policyConstants';

/**
 * default SCORING_POLICY requires all stage:MAIN, stageSequence:1 drawPositions to be assigned **BEFORE** scoring is enabled,
 * while allowing scoring in consolation and compass/playoff structures when not all drawPositions have been filled
 */
export const POLICY_SCORING_DEFAULT = {
  [POLICY_TYPE_SCORING]: {
    defaultMatchUpFormat: 'SET3-S:6/TB7',
    requireAllPositionsAssigned: false,
    stage: {
      [MAIN]: {
        stageSequence: {
          1: {
            requireAllPositionsAssigned: true,
          },
        },
      },
    },
  },
};

export default POLICY_SCORING_DEFAULT;
