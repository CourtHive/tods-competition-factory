import { MAIN } from '../../constants/drawDefinitionConstants';

/**
 * default SCORING_POLICY requires all stage:MAIN, stageSequence:1 drawPositions to be assigned **BEFORE** scoring is enabled,
 * while allowing scoring in consolation and compass/playoff structures when not all drawPositions have been filled
 */
export const SCORING_POLICY = {
  scoring: {
    requireAllPositionsAssigned: false,
    stage: {
      [MAIN]: {
        stageSequence: {
          '1': {
            requireAllPositionsAssigned: true,
          },
        },
      },
    },
  },
};

export default SCORING_POLICY;
