import { POLICY_TYPE_SCORING } from '../../constants/policyConstants';
import { MAIN } from '../../constants/drawDefinitionConstants';

/**
 * without a SCORING_POLICY which sets { requireAllPositionsAssigned: false },  all stage:MAIN, stageSequence:1 drawPositions must be assigned **BEFORE** scoring is enabled,
 * scoring is enabled in consolation and compass/playoff structures when not all drawPositions have been filled
 */
export const POLICY_SCORING_DEFAULT = {
  [POLICY_TYPE_SCORING]: {
    defaultMatchUpFormat: 'SET3-S:6/TB7',
    requireAllPositionsAssigned: false,
    processCodes: {
      incompleteAssignmentsOnDefault: ['RANKING.IGNORE'],
    },
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
